const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.html') return 'text/html; charset=utf-8';
  if (ext === '.css') return 'text/css; charset=utf-8';
  if (ext === '.js') return 'text/javascript; charset=utf-8';
  if (ext === '.json') return 'application/json; charset=utf-8';
  if (ext === '.svg') return 'image/svg+xml';
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.ico') return 'image/x-icon';
  if (ext === '.woff2') return 'font/woff2';
  return 'application/octet-stream';
}

function createStaticServer(rootDir) {
  return http.createServer((req, res) => {
    const reqPath = decodeURIComponent((req.url || '/').split('?')[0]);
    const safePath = path.normalize(reqPath).replace(/^\.{1,2}(\/|\\|$)+/, '');
    const candidate = safePath === '/' ? '/index.html' : safePath;
    const absolutePath = path.join(rootDir, candidate);

    if (!absolutePath.startsWith(rootDir)) {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Forbidden');
      return;
    }

    fs.readFile(absolutePath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Not found');
        return;
      }

      res.writeHead(200, { 'Content-Type': contentType(absolutePath) });
      res.end(data);
    });
  });
}

async function runSmokeTest() {
  const publicDir = path.join(process.cwd(), 'public');
  const server = createStaticServer(publicDir);

  await new Promise((resolve) => {
    server.listen(0, '127.0.0.1', resolve);
  });

  const address = server.address();
  const url = `http://127.0.0.1:${address.port}/index.html`;

  const errors = [];
  const warnings = [];
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox']
    });

    const page = await browser.newPage();

    page.on('pageerror', (err) => {
      errors.push(`pageerror: ${err.message}`);
    });

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(`console error: ${msg.text()}`);
      }
    });

    page.on('requestfailed', (req) => {
      errors.push(`request failed: ${req.url()} (${req.failure()?.errorText || 'unknown error'})`);
    });

    page.on('response', (res) => {
      if (res.status() >= 400) {
        const failedUrl = res.url();
        if (failedUrl.endsWith('/favicon.ico') && res.status() === 404) {
          warnings.push(`favicon mancante: ${failedUrl}`);
          return;
        }
        errors.push(`http ${res.status()}: ${failedUrl}`);
      }
    });

    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

    const title = await page.title();
    const linkCount = await page.$$eval('a', (nodes) => nodes.length);

    if (!title || !title.trim()) {
      errors.push('title vuoto');
    }

    if (linkCount === 0) {
      errors.push('nessun link trovato nella pagina');
    }

    if (errors.length > 0) {
      console.error('SMOKE TEST FAIL');
      errors.forEach((e) => console.error(`- ${e}`));
      if (warnings.length > 0) {
        console.error('WARNINGS');
        warnings.forEach((w) => console.error(`- ${w}`));
      }
      process.exitCode = 1;
      return;
    }

    console.log('SMOKE TEST PASS');
    console.log(`url: ${url}`);
    console.log(`title: ${title}`);
    console.log(`links: ${linkCount}`);
    if (warnings.length > 0) {
      console.log('WARNINGS');
      warnings.forEach((w) => console.log(`- ${w}`));
    }
  } finally {
    if (browser) {
      await browser.close();
    }
    await new Promise((resolve) => server.close(resolve));
  }
}

runSmokeTest().catch((err) => {
  console.error('SMOKE TEST FAIL');
  console.error(err);
  process.exit(1);
});
