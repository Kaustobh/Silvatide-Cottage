import { NodeIO } from '@gltf-transform/core';
import { KHRMeshQuantization, EXTMeshoptCompression } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';

async function inspectClusters() {
  await MeshoptDecoder.ready;
  const io = new NodeIO()
    .registerExtensions([KHRMeshQuantization, EXTMeshoptCompression])
    .registerDependencies({ 'meshopt.decoder': MeshoptDecoder });

  const doc = await io.read('assets-src/models/cottage-whole-and-individual rooms.glb');
  const prim = doc.getRoot().listMeshes()[0].listPrimitives()[0];
  const pos = prim.getAttribute('POSITION').getArray();
  const indices = prim.getIndices().getArray();
  const numTris = indices.length / 3;

  console.log('Total triangles in cottage-whole-and-individual rooms.glb:', numTris);

  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;

  for (let i = 0; i < pos.length; i += 3) {
    const x = pos[i], y = pos[i+1], z = pos[i+2];
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
    if (z < minZ) minZ = z; if (z > maxZ) maxZ = z;
  }

  console.log(`Overall Bounds X: [${minX.toFixed(3)}, ${maxX.toFixed(3)}]`);
  console.log(`Overall Bounds Y: [${minY.toFixed(3)}, ${maxY.toFixed(3)}]`);
  console.log(`Overall Bounds Z: [${minZ.toFixed(3)}, ${maxZ.toFixed(3)}]`);

  // Let's grid in X and Z to find isolated clusters (connected components or spatial bins)
  const BINS = 30;
  const grid = Array.from({ length: BINS }, () => new Uint32Array(BINS));
  const stepX = (maxX - minX) / BINS;
  const stepZ = (maxZ - minZ) / BINS;

  for (let t = 0; t < numTris; t++) {
    const i0 = indices[t * 3] * 3;
    const i1 = indices[t * 3 + 1] * 3;
    const i2 = indices[t * 3 + 2] * 3;
    const cx = (pos[i0] + pos[i1] + pos[i2]) / 3;
    const cz = (pos[i0 + 2] + pos[i1 + 2] + pos[i2 + 2]) / 3;

    const bx = Math.min(BINS - 1, Math.max(0, Math.floor((cx - minX) / stepX)));
    const bz = Math.min(BINS - 1, Math.max(0, Math.floor((cz - minZ) / stepZ)));
    grid[bx][bz]++;
  }

  console.log('\n--- 2D DENSITY MAP (X horizontal, Z vertical) ---');
  for (let bz = 0; bz < BINS; bz++) {
    let row = '';
    for (let bx = 0; bx < BINS; bx++) {
      const c = grid[bx][bz];
      if (c === 0) row += '·';
      else if (c < 500) row += '.';
      else if (c < 5000) row += '+';
      else row += '#';
    }
    console.log(row);
  }
}

inspectClusters().catch(console.error);
