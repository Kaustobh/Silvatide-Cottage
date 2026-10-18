import { chromium } from 'playwright';
import http from 'http';
import fs from 'fs';
import path from 'path';

// Render side-by-side or separate views of all 3 GLB models in 3d assets
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
  if (reqPath === '/' || reqPath === '/viewer.html') {
    filePath = path.join(process.cwd(), 'scripts', 'model-inspect-viewer.html');
  } else if (reqPath.startsWith('/node_modules')) {
    filePath = path.join(process.cwd(), reqPath);
  } else if (reqPath.startsWith('/3d assets')) {
    filePath = path.join(process.cwd(), reqPath);
  } else {
    filePath = path.join(process.cwd(), 'public', reqPath);
  }

  if (!fs.existsSync(filePath)) {
    res.writeHead(404);
    res.end('Not found: ' + filePath);
    return;
  }

  const ext = path.extname(filePath);
  res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(5577, async () => {
  console.log('Model inspect server running on 5577...');
  try {
    const browser = await chromium.launch({ channel: 'msedge', headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    page.on('console', msg => console.log('BROWSER:', msg.text()));
    page.on('pageerror', err => console.error('PAGE ERROR:', err.message));

    fs.mkdirSync('artifacts/model_comparison', { recursive: true });

    const models = [
      { file: '/3d assets/cottage-whole-and-individual rooms.glb', name: 'model-b-whole-rooms' },
      { file: '/3d assets/Cottage-6-Diffrent angels.glb', name: 'model-a-6-angles' },
      { file: '/3d assets/cottage exploded view.glb', name: 'model-c-exploded' }
    ];

    for (const m of models) {
      console.log(`Loading ${m.file}...`);
      await page.goto(`http://localhost:5577/viewer.html?model=${encodeURIComponent(m.file)}`);
      await page.waitForFunction(() => window.isReady === true, { timeout: 45000 });
      await page.waitForTimeout(1000);
      await page.screenshot({ path: `artifacts/model_comparison/${m.name}-front.png` });
      
      // Top down view
      await page.evaluate(() => window.setTopView());
      await page.waitForTimeout(800);
      await page.screenshot({ path: `artifacts/model_comparison/${m.name}-top.png` });

      // Side view
      await page.evaluate(() => window.setSideView());
      await page.waitForTimeout(800);
      await page.screenshot({ path: `artifacts/model_comparison/${m.name}-side.png` });
      console.log(`Saved screenshots for ${m.name}`);
    }

    await browser.close();
  } catch (err) {
    console.error('Inspect error:', err);
  } finally {
    server.close();
  }
});
