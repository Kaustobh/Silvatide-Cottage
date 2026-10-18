import { NodeIO } from '@gltf-transform/core';
import { KHRMeshQuantization, EXTMeshoptCompression } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';

async function analyzeYBands() {
  await MeshoptDecoder.ready;
  const io = new NodeIO()
    .registerExtensions([KHRMeshQuantization, EXTMeshoptCompression])
    .registerDependencies({
      'meshopt.decoder': MeshoptDecoder
    });

  const doc = await io.read('assets-src/models/cottage exploded view.glb');
  const prim = doc.getRoot().listMeshes()[0].listPrimitives()[0];
  const pos = prim.getAttribute('POSITION').getArray();
  const indices = prim.getIndices().getArray();

  const numTris = indices.length / 3;
  console.log('Total triangles:', numTris);

  const yCentroids = new Float32Array(numTris);
  let minY = Infinity, maxY = -Infinity;

  for (let t = 0; t < numTris; t++) {
    const i0 = indices[t * 3] * 3;
    const i1 = indices[t * 3 + 1] * 3;
    const i2 = indices[t * 3 + 2] * 3;
    const cy = (pos[i0 + 1] + pos[i1 + 1] + pos[i2 + 1]) / 3;
    yCentroids[t] = cy;
    if (cy < minY) minY = cy;
    if (cy > maxY) maxY = cy;
  }

  console.log(`Min Y centroid: ${minY}, Max Y centroid: ${maxY}`);

  // Create histogram with 500 bins
  const BINS = 500;
  const counts = new Uint32Array(BINS);
  const step = (maxY - minY) / BINS;

  for (let t = 0; t < numTris; t++) {
    const bin = Math.min(BINS - 1, Math.floor((yCentroids[t] - minY) / step));
    counts[bin]++;
  }

  console.log('\n--- DENSITY DISTRIBUTION ACROSS Y ---');
  let inGap = false;
  let gapStart = 0;
  for (let b = 0; b < BINS; b++) {
    const yVal = minY + b * step;
    const count = counts[b];
    if (count === 0 && !inGap) {
      inGap = true;
      gapStart = yVal;
    } else if (count > 0 && inGap) {
      inGap = false;
      console.log(`Empty band: [${gapStart.toFixed(4)}, ${yVal.toFixed(4)}] (size: ${(yVal - gapStart).toFixed(4)})`);
    }
  }

  // Also print cluster ranges
  console.log('\n--- DETECTED CLUSTERS ---');
  let clusterStart = null;
  let clusterTris = 0;
  for (let b = 0; b < BINS; b++) {
    const yVal = minY + b * step;
    const count = counts[b];
    if (count > 0) {
      if (clusterStart === null) clusterStart = yVal;
      clusterTris += count;
    } else {
      if (clusterStart !== null) {
        console.log(`Cluster: [${clusterStart.toFixed(4)}, ${yVal.toFixed(4)}] (${clusterTris.toLocaleString()} tris)`);
        clusterStart = null;
        clusterTris = 0;
      }
    }
  }
  if (clusterStart !== null) {
    console.log(`Cluster: [${clusterStart.toFixed(4)}, ${maxY.toFixed(4)}] (${clusterTris.toLocaleString()} tris)`);
  }
}

analyzeYBands().catch(console.error);
