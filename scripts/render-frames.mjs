import http from 'http';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { chromium } from 'playwright';

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.wasm': 'application/wasm',
  '.glb': 'model/gltf-binary',
  '.json': 'application/json'
};

const server = http.createServer((req, res) => {
  let reqPath = decodeURIComponent(req.url.split('?')[0]);
  let filePath;
  if (reqPath === '/' || reqPath === '/renderer.html') {
    filePath = path.join(process.cwd(), 'scripts', 'frame-renderer.html');
  } else if (reqPath.startsWith('/node_modules')) {
    filePath = path.join(process.cwd(), reqPath);
  } else {
    filePath = path.join(process.cwd(), 'public', reqPath);
  }

  if (!fs.existsSync(filePath)) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  const ext = path.extname(filePath);
  res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(5599, async () => {
  console.log('Frame renderer server on port 5599...');
  try {
    const browser = await chromium.launch({ channel: 'msedge', headless: true });
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

    await page.goto('http://localhost:5599/renderer.html');
    await page.waitForFunction(() => window.isReady === true, { timeout: 30000 });

    const outDirDesktop = 'public/frames/blueprint';
    const outDirMobile = 'public/frames/blueprint/mobile';
    fs.mkdirSync(outDirDesktop, { recursive: true });
    fs.mkdirSync(outDirMobile, { recursive: true });

    const TOTAL_FRAMES = 120;
    console.log(`Rendering ${TOTAL_FRAMES} frames...`);

    let totalDesktopBytes = 0;
    let totalMobileBytes = 0;

    for (let f = 0; f < TOTAL_FRAMES; f++) {
      const progress = f / (TOTAL_FRAMES - 1);
      const dataUrl = await page.evaluate((p) => window.renderFrame(p), progress);
      const base64Data = dataUrl.replace(/^data:image\/jpeg;base64,/, '');
      const rawBuf = Buffer.from(base64Data, 'base64');

      const pad = String(f).padStart(4, '0');
      const desktopPath = path.join(outDirDesktop, `frame-${pad}.webp`);

      // Desktop: 1280x720 WebP
      const desktopBuf = await sharp(rawBuf)
        .resize(1280, 720)
        .webp({ quality: 78, effort: 4 })
        .toBuffer();
      fs.writeFileSync(desktopPath, desktopBuf);
      totalDesktopBytes += desktopBuf.length;

      // Mobile: every 2nd frame (60 frames total), 720x405 WebP
      if (f % 2 === 0) {
        const mobilePad = String(Math.floor(f / 2)).padStart(4, '0');
        const mobilePath = path.join(outDirMobile, `frame-${mobilePad}.webp`);
        const mobileBuf = await sharp(rawBuf)
          .resize(720, 405)
          .webp({ quality: 72, effort: 4 })
          .toBuffer();
        fs.writeFileSync(mobilePath, mobileBuf);
        totalMobileBytes += mobileBuf.length;
      }

      if (f % 20 === 0 || f === TOTAL_FRAMES - 1) {
        console.log(`Frame ${f}/${TOTAL_FRAMES - 1} rendered (${(progress * 100).toFixed(0)}%)`);
      }
    }

    const manifest = {
      desktop: {
        count: TOTAL_FRAMES,
        width: 1280,
        height: 720,
        sizeMB: (totalDesktopBytes / 1024 / 1024).toFixed(2),
        pattern: 'frame-%04d.webp'
      },
      mobile: {
        count: TOTAL_FRAMES / 2,
        width: 720,
        height: 405,
        sizeMB: (totalMobileBytes / 1024 / 1024).toFixed(2),
        pattern: 'mobile/frame-%04d.webp'
      },
      milestones: [
        { index: 0, label: '01. Site & Topography', copy: 'Low Scandinavian sun and ancient granite base.' },
        { index: 38, label: '02. Structural Framing', copy: 'Larch timber post-and-beam system.' },
        { index: 78, label: '03. Weather Envelope', copy: 'Standing-seam zinc roof and passive solar glazing.' },
        { index: 110, label: '04. Lived-in Retreat', copy: 'Cottage completed on the tranquil shoreline.' }
      ]
    };

    fs.writeFileSync(path.join(outDirDesktop, 'manifest.json'), JSON.stringify(manifest, null, 2));

    console.log('\n========================================');
    console.log('FRAME SEQUENCE COMPLETE');
    console.log(`Desktop: ${manifest.desktop.sizeMB} MB (Budget: <= 6.0 MB)`);
    console.log(`Mobile:  ${manifest.mobile.sizeMB} MB (Budget: <= 3.0 MB)`);
    console.log('========================================');

    await browser.close();
  } catch (err) {
    console.error('Frame render error:', err);
  } finally {
    server.close();
  }
});
