import http from 'http';
import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

// 1. Simple static server to serve model and html
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.wasm': 'application/wasm',
  '.glb': 'model/gltf-binary',
  '.json': 'application/json'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  let filePath;
  if (reqPath === '/' || reqPath === '/viewer.html') {
    filePath = path.join(process.cwd(), 'scripts', 'split-viewer.html');
  } else if (reqPath.startsWith('/node_modules')) {
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

server.listen(5566, async () => {
  console.log('Split verification server running on port 5566...');
  
  try {
    const browser = await chromium.launch({ channel: 'msedge', headless: true });
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    page.on('console', msg => console.log('BROWSER:', msg.text()));
    page.on('pageerror', err => console.error('PAGE ERROR:', err.message));

    await page.goto('http://localhost:5566/viewer.html');
    await page.waitForFunction(() => window.isReady === true, { timeout: 30000 });

    fs.mkdirSync('artifacts/screenshots', { recursive: true });

    // 1. Capture Exploded View
    await page.evaluate(() => window.setExploded(1));
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'artifacts/screenshots/split-exploded.png' });
    console.log('Saved artifacts/screenshots/split-exploded.png');

    // 2. Capture Assembled View
    await page.evaluate(() => window.setExploded(0));
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'artifacts/screenshots/split-assembled.png' });
    console.log('Saved artifacts/screenshots/split-assembled.png');

    // 3. Side View (profile view showing contacts)
    await page.evaluate(() => window.setSideView());
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'artifacts/screenshots/split-side-assembled.png' });
    console.log('Saved artifacts/screenshots/split-side-assembled.png');

    await browser.close();
  } catch (err) {
    console.error('Render error:', err);
  } finally {
    server.close();
  }
});
