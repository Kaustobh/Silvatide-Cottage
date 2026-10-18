import { NodeIO } from '@gltf-transform/core';
import { KHRMeshQuantization, EXTMeshoptCompression, EXTTextureWebP } from '@gltf-transform/extensions';
import { cloneDocument } from '@gltf-transform/functions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';
import fs from 'fs';
import path from 'path';

async function extractClusters() {
  await Promise.all([MeshoptDecoder.ready, MeshoptEncoder.ready]);
  const io = new NodeIO()
    .registerExtensions([KHRMeshQuantization, EXTMeshoptCompression, EXTTextureWebP])
    .registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });

  // 1. Crop Model A into its 3 clusters
  const docA = await io.read('assets-src/models/Cottage-6-Diffrent angels.glb');
  const primA = docA.getRoot().listMeshes()[0].listPrimitives()[0];
  const matA = primA.getMaterial();
  const posA = primA.getAttribute('POSITION').getArray();
  const normA = primA.getAttribute('NORMAL')?.getArray();
  const uvA = primA.getAttribute('TEXCOORD_0')?.getArray();
  const indA = primA.getIndices().getArray();

  const clustersA = [
    { name: 'model-a-cluster-1', minZ: -0.50, maxZ: -0.24 },
    { name: 'model-a-cluster-2', minZ: -0.24, maxZ: 0.15 },
    { name: 'model-a-cluster-3', minZ: 0.15, maxZ: 0.50 }
  ];

  fs.mkdirSync('assets-src/extracted', { recursive: true });

  for (const c of clustersA) {
    const docOut = cloneDocument(docA);
    const root = docOut.getRoot();
    root.listNodes().forEach(n => n.dispose());
    root.listMeshes().forEach(m => m.dispose());
    const scene = root.listScenes()[0] || docOut.createScene('Scene');

    const tris = [];
    for (let t = 0; t < indA.length / 3; t++) {
      const cz = (posA[indA[t*3]*3+2] + posA[indA[t*3+1]*3+2] + posA[indA[t*3+2]*3+2]) / 3;
      if (cz >= c.minZ && cz < c.maxZ) {
        tris.push(indA[t*3], indA[t*3+1], indA[t*3+2]);
      }
    }

    const oldToNew = new Map();
    const newPos = [], newNorm = [], newUv = [], newInd = [];
    for (const oldIdx of tris) {
      let newIdx = oldToNew.get(oldIdx);
      if (newIdx === undefined) {
        newIdx = oldToNew.size;
        oldToNew.set(oldIdx, newIdx);
        newPos.push(posA[oldIdx*3], posA[oldIdx*3+1], posA[oldIdx*3+2]);
        if (normA) newNorm.push(normA[oldIdx*3], normA[oldIdx*3+1], normA[oldIdx*3+2]);
        if (uvA) newUv.push(uvA[oldIdx*2], uvA[oldIdx*2+1]);
      }
      newInd.push(newIdx);
    }

    const mesh = docOut.createMesh(c.name);
    const prim = docOut.createPrimitive().setMaterial(docOut.getRoot().listMaterials()[0]);
    prim.setAttribute('POSITION', docOut.createAccessor().setType('VEC3').setArray(new Float32Array(newPos)));
    if (normA) prim.setAttribute('NORMAL', docOut.createAccessor().setType('VEC3').setArray(new Float32Array(newNorm)));
    if (uvA) prim.setAttribute('TEXCOORD_0', docOut.createAccessor().setType('VEC2').setArray(new Float32Array(newUv)));
    const indexType = newPos.length / 3 > 65535 ? Uint32Array : Uint16Array;
    prim.setIndices(docOut.createAccessor().setType('SCALAR').setArray(new indexType(newInd)));
    mesh.addPrimitive(prim);

    const node = docOut.createNode(c.name).setMesh(mesh);
    scene.addChild(node);

    const glb = await io.writeBinary(docOut);
    const outPath = `assets-src/extracted/${c.name}.glb`;
    fs.writeFileSync(outPath, Buffer.from(glb));
    console.log(`Saved ${outPath}: ${(glb.byteLength/1024/1024).toFixed(2)}MB (${(newInd.length/3).toLocaleString()} tris)`);
  }

  // 2. Extract central cottage & individual rooms from Model B (cottage-whole-and-individual rooms.glb)
  const docB = await io.read('assets-src/models/cottage-whole-and-individual rooms.glb');
  const primB = docB.getRoot().listMeshes()[0].listPrimitives()[0];
  const matB = primB.getMaterial();
  const posB = primB.getAttribute('POSITION').getArray();
  const normB = primB.getAttribute('NORMAL')?.getArray();
  const uvB = primB.getAttribute('TEXCOORD_0')?.getArray();
  const indB = primB.getIndices().getArray();

  // Bounding definitions for B (based on density map):
  // Center Cottage: X in [-0.22, 0.22], Z in [-0.18, 0.22]
  // Living Room: X in [-0.37, -0.22], Z in [0.20, 0.49]
  // Bedroom: X in [-0.35, -0.15], Z in [-0.49, -0.22]
  // Bathroom: X in [0.18, 0.37], Z in [-0.35, -0.10]
  // Roof / Truss: X in [-0.15, 0.15], Z in [-0.49, -0.25]
  const clustersB = [
    { name: 'cottage-main-assembled', filter: (cx, cy, cz) => cx >= -0.22 && cx <= 0.22 && cz >= -0.18 && cz <= 0.22 },
    { name: 'room-living', filter: (cx, cy, cz) => cx <= -0.18 && cz >= 0.18 },
    { name: 'room-bedroom', filter: (cx, cy, cz) => cx <= -0.12 && cz <= -0.20 },
    { name: 'room-bathroom', filter: (cx, cy, cz) => cx >= 0.15 && cz <= -0.05 }
  ];

  for (const c of clustersB) {
    const docOut = cloneDocument(docB);
    const root = docOut.getRoot();
    root.listNodes().forEach(n => n.dispose());
    root.listMeshes().forEach(m => m.dispose());
    const scene = root.listScenes()[0] || docOut.createScene('Scene');

    const tris = [];
    for (let t = 0; t < indB.length / 3; t++) {
      const cx = (posB[indB[t*3]*3] + posB[indB[t*3+1]*3] + posB[indB[t*3+2]*3]) / 3;
      const cy = (posB[indB[t*3]*3+1] + posB[indB[t*3+1]*3+1] + posB[indB[t*3+2]*3+1]) / 3;
      const cz = (posB[indB[t*3]*3+2] + posB[indB[t*3+1]*3+2] + posB[indB[t*3+2]*3+2]) / 3;

      if (c.filter(cx, cy, cz)) {
        tris.push(indB[t*3], indB[t*3+1], indB[t*3+2]);
      }
    }

    const oldToNew = new Map();
    const newPos = [], newNorm = [], newUv = [], newInd = [];
    for (const oldIdx of tris) {
      let newIdx = oldToNew.get(oldIdx);
      if (newIdx === undefined) {
        newIdx = oldToNew.size;
        oldToNew.set(oldIdx, newIdx);
        newPos.push(posB[oldIdx*3], posB[oldIdx*3+1], posB[oldIdx*3+2]);
        if (normB) newNorm.push(normB[oldIdx*3], normB[oldIdx*3+1], normB[oldIdx*3+2]);
        if (uvB) newUv.push(uvB[oldIdx*2], uvB[oldIdx*2+1]);
      }
      newInd.push(newIdx);
    }

    const mesh = docOut.createMesh(c.name);
    const prim = docOut.createPrimitive().setMaterial(docOut.getRoot().listMaterials()[0]);
    prim.setAttribute('POSITION', docOut.createAccessor().setType('VEC3').setArray(new Float32Array(newPos)));
    if (normB) prim.setAttribute('NORMAL', docOut.createAccessor().setType('VEC3').setArray(new Float32Array(newNorm)));
    if (uvB) prim.setAttribute('TEXCOORD_0', docOut.createAccessor().setType('VEC2').setArray(new Float32Array(newUv)));
    const indexType = newPos.length / 3 > 65535 ? Uint32Array : Uint16Array;
    prim.setIndices(docOut.createAccessor().setType('SCALAR').setArray(new indexType(newInd)));
    mesh.addPrimitive(prim);

    const node = docOut.createNode(c.name).setMesh(mesh);
    scene.addChild(node);

    const glb = await io.writeBinary(docOut);
    const outPath = `assets-src/extracted/${c.name}.glb`;
    fs.writeFileSync(outPath, Buffer.from(glb));
    console.log(`Saved ${outPath}: ${(glb.byteLength/1024/1024).toFixed(2)}MB (${(newInd.length/3).toLocaleString()} tris)`);
  }
}

extractClusters().catch(console.error);
