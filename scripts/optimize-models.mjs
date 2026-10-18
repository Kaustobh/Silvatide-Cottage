import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { NodeIO } from '@gltf-transform/core';
import { 
  KHRMeshQuantization, 
  EXTMeshoptCompression, 
  EXTTextureWebP 
} from '@gltf-transform/extensions';
import { 
  weld, 
  prune, 
  dedup, 
  reorder, 
  quantize, 
  meshopt, 
  simplifyPrimitive 
} from '@gltf-transform/functions';
import { MeshoptDecoder, MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';

async function optimizeModelVariant({ inputPath, outputPath, isMobile }) {
  console.log(`\n========================================`);
  console.log(`Optimizing for ${isMobile ? 'MOBILE' : 'DESKTOP'} -> ${outputPath}`);
  console.log(`========================================`);

  await Promise.all([
    MeshoptDecoder.ready, 
    MeshoptEncoder.ready, 
    MeshoptSimplifier.ready
  ]);

  const io = new NodeIO()
    .registerExtensions([KHRMeshQuantization, EXTMeshoptCompression, EXTTextureWebP])
    .registerDependencies({
      'meshopt.decoder': MeshoptDecoder,
      'meshopt.encoder': MeshoptEncoder
    });

  const doc = await io.read(inputPath);
  doc.createExtension(EXTTextureWebP).setRequired(true);

  // Set double-sided on all materials to prevent hollow backfaces
  for (const mat of doc.getRoot().listMaterials()) {
    mat.setDoubleSided(true);
  }

  // 1. Run weld first to eliminate co-located vertices
  console.log('Running weld...');
  await doc.transform(weld({ tolerance: 0.0001 }));

  // 2. Simplify per layer
  console.log('Simplifying per layer...');
  const ratios = isMobile ? {
    layer_foundation: 0.05,
    layer_floors: 0.10,
    layer_walls_interior: 0.12,
    layer_upper: 0.08,
    layer_truss: 0.08,
    layer_roof: 0.05
  } : {
    layer_foundation: 0.10,
    layer_floors: 0.20,
    layer_walls_interior: 0.22,
    layer_upper: 0.20,
    layer_truss: 0.20,
    layer_roof: 0.10
  };

  let totalTrisAfter = 0;
  for (const node of doc.getRoot().listNodes()) {
    const name = node.getName();
    const mesh = node.getMesh();
    if (!mesh) continue;

    const ratio = ratios[name] || (isMobile ? 0.08 : 0.16);
    for (const prim of mesh.listPrimitives()) {
      const beforeTris = prim.getIndices().getCount() / 3;
      await simplifyPrimitive(prim, {
        simplifier: MeshoptSimplifier,
        ratio: ratio,
        error: isMobile ? 0.003 : 0.0015,
        lockBorder: true
      });
      const afterTris = prim.getIndices().getCount() / 3;
      totalTrisAfter += afterTris;
      console.log(` - ${name.padEnd(22)}: ${beforeTris.toLocaleString()} -> ${afterTris.toLocaleString()} tris (ratio: ${(afterTris/beforeTris).toFixed(2)})`);
    }
  }
  console.log(`Total triangles after simplification: ${totalTrisAfter.toLocaleString()}`);

  // 3. Process & Resize textures
  const texSize = isMobile ? 1024 : 2048;
  console.log(`Resizing textures to ${texSize}x${texSize} WebP...`);

  for (const tex of doc.getRoot().listTextures()) {
    const rawBuffer = Buffer.from(tex.getImage());
    const isNormal = (tex.getName() || '').toLowerCase().includes('normal');
    const quality = isNormal ? 92 : 85;

    const optimizedBuffer = await sharp(rawBuffer)
      .resize(texSize, texSize, { fit: 'inside' })
      .webp({ quality, effort: 5 })
      .toBuffer();

    tex.setImage(new Uint8Array(optimizedBuffer));
    tex.setMimeType('image/webp');
    console.log(` - Texture ${tex.getName()}: ${(rawBuffer.length / 1024).toFixed(0)}KB -> ${(optimizedBuffer.length / 1024).toFixed(0)}KB (WebP q${quality})`);
  }

  // 4. Prune, dedup, quantize, reorder & meshopt-compress
  console.log('Optimizing buffers with meshopt & quantization...');
  await doc.transform(
    prune(),
    dedup(),
    reorder({ encoder: MeshoptEncoder }),
    quantize(),
    meshopt({ encoder: MeshoptEncoder, level: 'high' })
  );

  const glb = await io.writeBinary(doc);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, Buffer.from(glb));

  const sizeMB = (glb.byteLength / 1024 / 1024).toFixed(2);
  console.log(`✓ Generated ${outputPath}: ${sizeMB} MB (${totalTrisAfter.toLocaleString()} tris)`);
  return { sizeMB, totalTris: totalTrisAfter };
}

async function run() {
  const input = 'assets-src/split/cottage-split-raw.glb';
  const desktopOut = 'public/models/cottage-split-layers.glb';
  const mobileOut = 'public/models/cottage-mobile.glb';

  const desktopStats = await optimizeModelVariant({ inputPath: input, outputPath: desktopOut, isMobile: false });
  // Also copy to cottage.glb for legacy compatibility
  fs.copyFileSync(desktopOut, 'public/models/cottage.glb');
  const mobileStats = await optimizeModelVariant({ inputPath: input, outputPath: mobileOut, isMobile: true });

  console.log('\n========================================');
  console.log('FINAL MODEL OPTIMIZATION SUMMARY');
  console.log('========================================');
  console.log(`Desktop: ${desktopStats.sizeMB} MB (Budget: <= 4.5 MB) -> ${parseFloat(desktopStats.sizeMB) <= 4.5 ? 'PASS ✓' : 'EXCEEDED ✗'}`);
  console.log(`Mobile:  ${mobileStats.sizeMB} MB (Budget: <= 2.5 MB) -> ${parseFloat(mobileStats.sizeMB) <= 2.5 ? 'PASS ✓' : 'EXCEEDED ✗'}`);
}

run().catch(console.error);
