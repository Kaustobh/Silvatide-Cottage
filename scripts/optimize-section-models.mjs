import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { NodeIO } from '@gltf-transform/core';
import { KHRMeshQuantization, EXTMeshoptCompression, EXTTextureWebP } from '@gltf-transform/extensions';
import { weld, prune, dedup, reorder, quantize, meshopt, simplifyPrimitive } from '@gltf-transform/functions';
import { MeshoptDecoder, MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';

async function optimizeModel(inputPath, outputPath, { texSize = 2048, simplifyRatio = 0.5, error = 0.002 } = {}) {
  await Promise.all([MeshoptDecoder.ready, MeshoptEncoder.ready, MeshoptSimplifier.ready]);
  const io = new NodeIO()
    .registerExtensions([KHRMeshQuantization, EXTMeshoptCompression, EXTTextureWebP])
    .registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });

  console.log(`Optimizing ${inputPath} -> ${outputPath}...`);
  const doc = await io.read(inputPath);
  doc.createExtension(EXTTextureWebP).setRequired(true);

  await doc.transform(weld({ tolerance: 0.0001 }));

  let trisBefore = 0, trisAfter = 0;
  for (const mesh of doc.getRoot().listMeshes()) {
    for (const prim of mesh.listPrimitives()) {
      trisBefore += prim.getIndices().getCount() / 3;
      await simplifyPrimitive(prim, {
        simplifier: MeshoptSimplifier,
        ratio: simplifyRatio,
        error: error,
        lockBorder: true
      });
      trisAfter += prim.getIndices().getCount() / 3;
    }
  }

  // Compress & resize textures to WebP
  for (const tex of doc.getRoot().listTextures()) {
    const rawBuffer = Buffer.from(tex.getImage());
    const isNormal = (tex.getName() || '').toLowerCase().includes('normal');
    const quality = isNormal ? 92 : 85;

    const optBuffer = await sharp(rawBuffer)
      .resize(texSize, texSize, { fit: 'inside' })
      .webp({ quality, effort: 4 })
      .toBuffer();

    tex.setImage(new Uint8Array(optBuffer));
    tex.setMimeType('image/webp');
  }

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
  console.log(`✓ ${path.basename(outputPath)}: ${sizeMB} MB (${trisBefore.toLocaleString()} -> ${trisAfter.toLocaleString()} tris)`);
  return { sizeMB, trisAfter };
}

async function run() {
  const models = [
    // 1. Hero Assembled Cottage for Chapter II Studio
    { in: 'assets-src/extracted/cottage-main-assembled.glb', out: 'public/models/cottage-assembled.glb', ratio: 0.4, tex: 2048 },
    // 2. Exploded Vertical Stack for Chapter I Drawing / Blueprint
    { in: 'assets-src/extracted/model-a-cluster-3.glb', out: 'public/models/cottage-exploded.glb', ratio: 0.5, tex: 2048 },
    // 3. Room: Living Room for Chapter III Inside
    { in: 'assets-src/extracted/room-living.glb', out: 'public/models/room-living.glb', ratio: 0.6, tex: 1024 },
    // 4. Room: Bedroom for Chapter III Inside
    { in: 'assets-src/extracted/room-bedroom.glb', out: 'public/models/room-bedroom.glb', ratio: 0.6, tex: 1024 },
    // 5. Room: Bathroom for Chapter III Inside
    { in: 'assets-src/extracted/room-bathroom.glb', out: 'public/models/room-bathroom.glb', ratio: 0.6, tex: 1024 }
  ];

  for (const m of models) {
    await optimizeModel(m.in, m.out, { texSize: m.tex, simplifyRatio: m.ratio });
  }

  console.log('\nAll sectional models optimized and saved to public/models/!');
}

run().catch(console.error);
