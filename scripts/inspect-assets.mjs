import fs from 'fs';
import path from 'path';
import { NodeIO } from '@gltf-transform/core';
import { KHRMeshQuantization, EXTMeshoptCompression } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';

async function inspectModels() {
  await MeshoptDecoder.ready;
  const io = new NodeIO()
    .registerExtensions([KHRMeshQuantization, EXTMeshoptCompression])
    .registerDependencies({
      'meshopt.decoder': MeshoptDecoder
    });

  const modelDir = 'assets-src/models';
  const files = fs.readdirSync(modelDir).filter(f => f.endsWith('.glb'));

  for (const f of files) {
    const fullPath = path.join(modelDir, f);
    console.log(`\n=== Inspecting ${f} ===`);
    const doc = await io.read(fullPath);
    const root = doc.getRoot();
    
    let totalTris = 0;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;
    let minX = Infinity, maxX = -Infinity;

    for (const mesh of root.listMeshes()) {
      for (const prim of mesh.listPrimitives()) {
        const indices = prim.getIndices();
        const pos = prim.getAttribute('POSITION');
        if (indices) {
          totalTris += indices.getCount() / 3;
        } else if (pos) {
          totalTris += pos.getCount() / 3;
        }
        if (pos) {
          const arr = pos.getArray();
          for (let i = 0; i < arr.length; i += 3) {
            const x = arr[i], y = arr[i+1], z = arr[i+2];
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
            if (z < minZ) minZ = z;
            if (z > maxZ) maxZ = z;
          }
        }
      }
    }

    console.log(`Triangles: ${totalTris.toLocaleString()}`);
    console.log(`Bounds X: [${minX.toFixed(3)}, ${maxX.toFixed(3)}]`);
    console.log(`Bounds Y: [${minY.toFixed(3)}, ${maxY.toFixed(3)}]`);
    console.log(`Bounds Z: [${minZ.toFixed(3)}, ${maxZ.toFixed(3)}]`);
    console.log(`Textures: ${root.listTextures().length}`);
    for (const tex of root.listTextures()) {
      console.log(` - Texture: ${tex.getName() || 'unnamed'} (${tex.getMimeType()}, ${tex.getImage()?.length} bytes)`);
    }
  }
}

inspectModels().catch(console.error);
