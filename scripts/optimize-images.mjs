import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const IMAGES = [
  {
    slug: 'lake-dusk-dock',
    source: 'assets-src/images/lake-dusk-dock.png',
    alt: 'Silvatide Cottage at dusk with dock, canoe and still water reflections',
    cropWatermark: false // #1 is low-res original without Gemini watermark
  },
  {
    slug: 'firepit-night-close',
    source: 'assets-src/images/firepit-night-close.png',
    alt: 'Lakeside concrete firepit with glowing flame under twilight and starry night',
    cropWatermark: true
  },
  {
    slug: 'dawn-mist-lake',
    source: 'assets-src/images/dawn-mist-lake.png',
    alt: 'Misty dawn over the tranquil Finnish lake with Silvatide Cottage in the distance',
    cropWatermark: true
  },
  {
    slug: 'forest-entrance-night',
    source: 'assets-src/images/forest-entrance-night.png',
    alt: 'Cottage entrance path and pine forest illuminated by warm exterior sconces at night',
    cropWatermark: true
  },
  {
    slug: 'forest-entrance-day',
    source: 'assets-src/images/forest-entrance-day.png',
    alt: 'Stone walkway leading through Nordic pine forest to the cottage entrance in crisp daylight',
    cropWatermark: true
  },
  {
    slug: 'fog-shore-corner',
    source: 'assets-src/images/fog-shore-corner.png',
    alt: 'Misty lakeside shoreline with water reeds and the gabled timber facade of the retreat',
    cropWatermark: true
  },
  {
    slug: 'front-elevation-day',
    source: 'assets-src/images/front-elevation-day.png',
    alt: 'Architectural front elevation of Silvatide Cottage showing charred wood cladding, clerestory dormer and chimney',
    cropWatermark: true
  },
  {
    slug: 'bedroom',
    source: 'assets-src/images/bedroom.png',
    alt: 'Minimalist pine wood-panelled bedroom with floor-to-ceiling forest view and warm sconce',
    cropWatermark: true
  },
  {
    slug: 'bathroom',
    source: 'assets-src/images/bathroom.png',
    alt: 'Nordic stone and timber bathroom with illuminated circular mirror and glass walk-in shower',
    cropWatermark: true
  },
  {
    slug: 'deck-morning-gold',
    source: 'assets-src/images/deck-morning-gold.png',
    alt: 'Cantilevered cedar deck with morning coffee and glass balustrade looking over golden sunrise mist',
    cropWatermark: true
  },
  {
    slug: 'deck-night-firepit',
    source: 'assets-src/images/deck-night-firepit.png',
    alt: 'Night on the timber deck with roaring firepit, glass balustrade and starlit sky',
    cropWatermark: true
  },
  {
    slug: 'kitchen',
    source: 'assets-src/images/kitchen.png',
    alt: 'Minimalist Scandinavian kitchen featuring oak cabinetry, solid island and panoramic water window',
    cropWatermark: true
  },
  {
    slug: 'living-fireplace',
    source: 'assets-src/images/living-fireplace.png',
    alt: 'Living pavilion with built-in stone fireplace, linen sofa and uninterrupted lake views',
    cropWatermark: true
  }
];

const TARGET_WIDTHS = [640, 960, 1440, 2200];
const OUT_DIR = 'public/images/optimized';

async function processImage(item) {
  console.log(`\nProcessing [${item.slug}] from ${item.source}...`);
  if (!fs.existsSync(item.source)) {
    console.error(`Source not found: ${item.source}`);
    return null;
  }

  let img = sharp(item.source);
  const meta = await img.metadata();

  // Crop watermark if requested (crop 5% from right and bottom)
  let basePipeline = sharp(item.source);
  let effectiveWidth = meta.width;
  let effectiveHeight = meta.height;

  if (item.cropWatermark) {
    const cropW = Math.floor(meta.width * 0.95);
    const cropH = Math.floor(meta.height * 0.95);
    basePipeline = basePipeline.extract({ left: 0, top: 0, width: cropW, height: cropH });
    effectiveWidth = cropW;
    effectiveHeight = cropH;
  }

  const croppedBuffer = await basePipeline.toBuffer();

  // Compute dominant color
  const stats = await sharp(croppedBuffer).stats();
  const dominant = {
    r: Math.round(stats.channels[0].mean),
    g: Math.round(stats.channels[1].mean),
    b: Math.round(stats.channels[2].mean),
    hex: `#${Math.round(stats.channels[0].mean).toString(16).padStart(2, '0')}${Math.round(stats.channels[1].mean).toString(16).padStart(2, '0')}${Math.round(stats.channels[2].mean).toString(16).padStart(2, '0')}`
  };

  // Generate tiny blurred placeholder (base64 data URI)
  const tinyBuffer = await sharp(croppedBuffer)
    .resize(32)
    .webp({ quality: 20 })
    .toBuffer();
  const placeholder = `data:image/webp;base64,${tinyBuffer.toString('base64')}`;

  const formats = { avif: {}, webp: {} };
  const applicableWidths = TARGET_WIDTHS.filter(w => w <= effectiveWidth + 100);
  if (applicableWidths.length === 0 || applicableWidths[applicableWidths.length - 1] < effectiveWidth) {
    applicableWidths.push(effectiveWidth);
  }

  for (const w of applicableWidths) {
    const avifName = `${item.slug}-${w}.avif`;
    const webpName = `${item.slug}-${w}.webp`;

    const avifOut = path.join(OUT_DIR, avifName);
    const webpOut = path.join(OUT_DIR, webpName);

    await sharp(croppedBuffer)
      .resize(w)
      .avif({ quality: 80, effort: 4 })
      .toFile(avifOut);

    await sharp(croppedBuffer)
      .resize(w)
      .webp({ quality: 85, effort: 4 })
      .toFile(webpOut);

    const avifSize = (fs.statSync(avifOut).size / 1024).toFixed(0);
    const webpSize = (fs.statSync(webpOut).size / 1024).toFixed(0);

    formats.avif[w] = { file: avifName, sizeKB: parseInt(avifSize) };
    formats.webp[w] = { file: webpName, sizeKB: parseInt(webpSize) };
  }

  const largestAvif = formats.avif[applicableWidths[applicableWidths.length - 1]];
  console.log(` - Dominant: ${dominant.hex}, 2200w AVIF: ${largestAvif?.sizeKB}KB (Budget: <= 250KB)`);

  return {
    slug: item.slug,
    alt: item.alt,
    width: effectiveWidth,
    height: effectiveHeight,
    aspectRatio: (effectiveWidth / effectiveHeight).toFixed(3),
    dominant: dominant,
    placeholder: placeholder,
    formats: formats
  };
}

async function run() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.mkdirSync('src/data', { recursive: true });

  const manifest = {};
  for (const item of IMAGES) {
    const res = await processImage(item);
    if (res) manifest[item.slug] = res;
  }

  fs.writeFileSync('src/data/images.json', JSON.stringify(manifest, null, 2));
  fs.writeFileSync('public/images/optimized/manifest.json', JSON.stringify(manifest, null, 2));

  console.log('\n========================================');
  console.log('IMAGE OPTIMIZATION COMPLETE');
  console.log('Output dir: public/images/optimized/');
  console.log('Manifest written to: src/data/images.json');
  console.log('========================================');
}

run().catch(console.error);
