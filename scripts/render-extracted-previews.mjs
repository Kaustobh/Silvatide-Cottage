import http from 'http';
import fs from 'fs';
import path from 'path';
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
  if (reqPath === '/' || reqPath === '/viewer.html') {
    filePath = path.join(process.cwd(), 'scripts', 'model-inspect-viewer.html');
  } else if (reqPath.startsWith('/node_modules')) {
    filePath = path.join(process.cwd(), reqPath);
  } else if (reqPath.startsWith('/assets-src')) {
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

server.listen(5588, async () => {
  console.log('Server on 5588...');
  try {
    const browser = await chromium.launch({ channel: 'msedge', headless: true });
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

    fs.mkdirSync('artifacts/extracted_previews', { recursive: true });

    const models = [
      'cottage-main-assembled',
      'room-living',
      'room-bedroom',
      'room-bathroom',
      'model-a-cluster-1',
      'model-a-cluster-2',
      'model-a-cluster-3'
    ];

    for (const m of models) {
      const url = `http://localhost:5588/viewer.html?model=/assets-src/extracted/${m}.glb`;
      await page.goto(url);
      await page.waitForFunction(() => window.isReady === true, { timeout: 30000 });
      await page.waitForTimeout(600);
      await page.screenshot({ path: `artifacts/extracted_previews/${m}.png` });
      console.log(`Captured ${m}.png`);
    }

    await browser.close();
  } catch (err) {
    console.error(err);
  } finally {
    server.close();
  }
});
