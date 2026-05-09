// Genera public/og-image.png (1200x630) usando Puppeteer
import puppeteer from 'puppeteer';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));
const OUT   = join(__dir, '../public/og-image.png');

const HTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1200px; height: 630px; overflow: hidden;
    background: #030B1A;
    font-family: 'Segoe UI', Arial, sans-serif;
    display: flex; align-items: center; justify-content: center;
  }
  .bg-grid {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(59,130,246,.07) 1px, transparent 1px),
      linear-gradient(90deg, rgba(59,130,246,.07) 1px, transparent 1px);
    background-size: 60px 60px;
  }
  .glow {
    position: absolute;
    width: 500px; height: 500px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(29,78,216,.35) 0%, transparent 70%);
    top: -100px; left: -100px;
  }
  .glow2 {
    position: absolute;
    width: 400px; height: 400px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(56,189,248,.2) 0%, transparent 70%);
    bottom: -80px; right: 100px;
  }
  .card {
    position: relative; z-index: 1;
    padding: 0 80px;
    display: flex; flex-direction: column; gap: 20px;
  }
  .tag {
    font-size: 14px; letter-spacing: .2em; text-transform: uppercase;
    color: #60A5FA; font-weight: 600;
  }
  h1 {
    font-size: 72px; line-height: 1.05; color: #F0F7FF;
    font-weight: 800;
  }
  h1 em { font-style: italic; color: #93C5FD; }
  .sub {
    font-size: 20px; color: rgba(240,247,255,.5);
    max-width: 560px; line-height: 1.5;
  }
  .chips {
    display: flex; gap: 10px; flex-wrap: wrap; margin-top: 8px;
  }
  .chip {
    padding: 6px 14px; border-radius: 100px;
    border: 1px solid rgba(96,165,250,.35);
    color: #93C5FD; font-size: 13px;
    background: rgba(29,78,216,.15);
  }
  .domain {
    position: absolute; bottom: 40px; right: 80px;
    font-size: 15px; color: rgba(240,247,255,.3);
    letter-spacing: .05em;
  }
  .dot {
    position: absolute; bottom: 44px; left: 80px;
    display: flex; gap: 6px;
  }
  .dot span {
    width: 8px; height: 8px; border-radius: 50%;
  }
</style>
</head>
<body>
  <div class="bg-grid"></div>
  <div class="glow"></div>
  <div class="glow2"></div>
  <div class="card">
    <div class="tag">Milano · Developer · Creative</div>
    <h1>Developer<br>&amp; <em>Creative</em><br>Technologist</h1>
    <p class="sub">iOS, web, sistemi identitari, food e-commerce. Estetica precisa e cuore kawaii.</p>
    <div class="chips">
      <span class="chip">SwiftUI</span>
      <span class="chip">Next.js</span>
      <span class="chip">Python</span>
      <span class="chip">AI Integration</span>
      <span class="chip">Shopify</span>
    </div>
  </div>
  <div class="dot">
    <span style="background:#3B82F6"></span>
    <span style="background:#60A5FA"></span>
    <span style="background:#93C5FD"></span>
    <span style="background:#BAE6FD"></span>
  </div>
  <div class="domain">claudia-portfolio-mu.vercel.app</div>
</body>
</html>`;

const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
const page    = await browser.newPage();
await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
await page.setContent(HTML, { waitUntil: 'networkidle0' });
const buf = await page.screenshot({ type: 'png' });
await browser.close();

writeFileSync(OUT, buf);
console.log('og-image.png generata:', OUT);
