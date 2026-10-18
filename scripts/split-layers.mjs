import fs from 'fs';
import path from 'path';
import { NodeIO } from '@gltf-transform/core';
import { KHRMeshQuantization, EXTMeshoptCompression } from '@gltf-transform/extensions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';

const LAYER_DEFS = [
  { name: 'layer_foundation', min: -Infinity, max: -0.2925, label: 'Stone Foundation & Plinth' },
  { name: 'layer_floors', min: -0.2925, max: -0.1900, label: 'Cedar Deck & Floor Slabs' },
  { name: 'layer_walls_interior', min: -0.1900, max: 0.1250, label: 'Walls & Living Interior' },
  { name: 'layer_upper', min: 0.1250, max: 0.2500, label: 'Upper Loft & Ceiling' },
  { name: 'layer_truss', min: 0.2500, max: 0.3800, label: 'Roof Trusses & Framing' },
  { name: 'layer_roof', min: 0.3800, max: Infinity, label: 'Standing-Seam Gabled Roof' }
];

async function splitLayers() {
  await Promise.all([MeshoptDecoder.ready, MeshoptEncoder.ready]);
  const io = new NodeIO()
    .registerExtensions([KHRMeshQuantization, EXTMeshoptCompression])
    .registerDependencies({
      'meshopt.decoder': MeshoptDecoder,
      'meshopt.encoder': MeshoptEncoder
    });

  const inputPath = 'assets-src/models/cottage exploded view.glb';
  console.log(`Loading ${inputPath}...`);
  const doc = await io.read(inputPath);
  const root = doc.getRoot();

  const originalMesh = root.listMeshes()[0];
  const originalPrim = originalMesh.listPrimitives()[0];
  const material = originalPrim.getMaterial();

  const posAttr = originalPrim.getAttribute('POSITION');
  const normAttr = originalPrim.getAttribute('NORMAL');
  const uvAttr = originalPrim.getAttribute('TEXCOORD_0');
  const indicesAttr = originalPrim.getIndices();

  const pos = posAttr.getArray();
  const norm = normAttr?.getArray();
  const uvs = uvAttr?.getArray();
  const indices = indicesAttr.getArray();
  const numTris = indices.length / 3;

  console.log(`Original model: ${numTris.toLocaleString()} triangles.`);

  // Bucket triangles into layers by centroid
  const layerTriangles = Array.from({ length: LAYER_DEFS.length }, () => []);

  for (let t = 0; t < numTris; t++) {
    const i0 = indices[t * 3];
    const i1 = indices[t * 3 + 1];
    const i2 = indices[t * 3 + 2];

    const cy = (pos[i0 * 3 + 1] + pos[i1 * 3 + 1] + pos[i2 * 3 + 1]) / 3;

    let assigned = false;
    for (let l = 0; l < LAYER_DEFS.length; l++) {
      if (cy >= LAYER_DEFS[l].min && cy < LAYER_DEFS[l].max) {
        layerTriangles[l].push(i0, i1, i2);
        assigned = true;
        break;
      }
    }
    if (!assigned) {
      console.warn(`Triangle ${t} with centroid Y=${cy} was not assigned!`);
    }
  }

  // Create new nodes and meshes
  const scene = root.listScenes()[0] || doc.createScene('Scene');
  root.listNodes().forEach(n => n.dispose());
  originalMesh.dispose();

  const layersMetadata = [];

  for (let l = 0; l < LAYER_DEFS.length; l++) {
    const def = LAYER_DEFS[l];
    const tris = layerTriangles[l];
    const triCount = tris.length / 3;
    console.log(`Layer [${l}] ${def.name.padEnd(22)}: ${triCount.toLocaleString()} triangles`);

    if (triCount === 0) continue;

    // Map old vertices to new local vertices
    const oldToNew = new Map();
    const newPos = [];
    const newNorm = [];
    const newUvs = [];
    const newIndices = [];

    let minY = Infinity, maxY = -Infinity;
    let minX = Infinity, maxX = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;

    for (let i = 0; i < tris.length; i++) {
      const oldIdx = tris[i];
      let newIdx = oldToNew.get(oldIdx);
      if (newIdx === undefined) {
        newIdx = oldToNew.size;
        oldToNew.set(oldIdx, newIdx);

        const x = pos[oldIdx * 3];
        const y = pos[oldIdx * 3 + 1];
        const z = pos[oldIdx * 3 + 2];

        newPos.push(x, y, z);
        if (norm) newNorm.push(norm[oldIdx * 3], norm[oldIdx * 3 + 1], norm[oldIdx * 3 + 2]);
        if (uvs) newUvs.push(uvs[oldIdx * 2], uvs[oldIdx * 2 + 1]);

        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        if (z < minZ) minZ = z;
        if (z > maxZ) maxZ = z;
      }
      newIndices.push(newIdx);
    }

    const mesh = doc.createMesh(def.name + '_mesh');
    const prim = doc.createPrimitive();
    prim.setMaterial(material);

    const newPosAccessor = doc.createAccessor().setType('VEC3').setArray(new Float32Array(newPos));
    prim.setAttribute('POSITION', newPosAccessor);

    if (norm) {
      const newNormAccessor = doc.createAccessor().setType('VEC3').setArray(new Float32Array(newNorm));
      prim.setAttribute('NORMAL', newNormAccessor);
    }
    if (uvs) {
      const newUvAccessor = doc.createAccessor().setType('VEC2').setArray(new Float32Array(newUvs));
      prim.setAttribute('TEXCOORD_0', newUvAccessor);
    }

    const indexType = newPos.length / 3 > 65535 ? Uint32Array : Uint16Array;
    const newIndexAccessor = doc.createAccessor().setType('SCALAR').setArray(new indexType(newIndices));
    prim.setIndices(newIndexAccessor);

    mesh.addPrimitive(prim);

    const node = doc.createNode(def.name);
    node.setMesh(mesh);
    scene.addChild(node);

    const height = maxY - minY;
    layersMetadata.push({
      index: l,
      name: def.name,
      label: def.label,
      triangles: triCount,
      bounds: {
        x: [minX, maxX],
        y: [minY, maxY],
        z: [minZ, maxZ],
        height: height
      },
      explodedY: 0, // In original coordinate system, node offset 0 is the exploded position
      originalYCenter: (minY + maxY) / 2
    });
  }

  // Calculate assembled offsets so that adjacent layers touch
  // Bottom layer (foundation) stays anchored.
  // Each subsequent layer is placed directly atop the previous layer's top.
  let currentTop = layersMetadata[0].bounds.y[1];
  layersMetadata[0].assembledY = 0;

  for (let l = 1; l < layersMetadata.length; l++) {
    const meta = layersMetadata[l];
    const originalBottom = meta.bounds.y[0];
    // Offset needed = currentTop - originalBottom
    const offset = currentTop - originalBottom;
    meta.assembledY = offset;
    currentTop = meta.bounds.y[1] + offset;
  }

  console.log('\n--- ASSEMBLED OFFSETS ---');
  for (const m of layersMetadata) {
    console.log(`${m.name.padEnd(22)}: bounds Y [${m.bounds.y[0].toFixed(3)}, ${m.bounds.y[1].toFixed(3)}], assembled offset Y: ${m.assembledY.toFixed(4)}`);
  }

  // Save intermediate split model
  fs.mkdirSync('assets-src/split', { recursive: true });
  fs.mkdirSync('public/models', { recursive: true });

  const splitPath = 'assets-src/split/cottage-split-raw.glb';
  const glbBuffer = await io.writeBinary(doc);
  fs.writeFileSync(splitPath, Buffer.from(glbBuffer));
  console.log(`\nSaved split model to ${splitPath} (${(glbBuffer.byteLength / 1024 / 1024).toFixed(2)} MB)`);

  const layersConfig = {
    layers: layersMetadata.map(m => ({
      name: m.name,
      label: m.label,
      triangles: m.triangles,
      explodedY: 0,
      assembledY: m.assembledY,
      bounds: m.bounds,
      originalCenterY: m.originalYCenter
    }))
  };

  fs.writeFileSync('public/models/layers.json', JSON.stringify(layersConfig, null, 2));
  console.log('Saved public/models/layers.json');
}

splitLayers().catch(console.error);
