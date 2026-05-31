// 產生社群分享縮圖 public/og-image.png（1200×630），用 Chromium 渲染 HTML。
import { chromium } from '@playwright/test';

const html = `<!doctype html><html><head><meta charset="utf-8">
<style>
  * { margin:0; box-sizing:border-box; }
  body {
    width:1200px; height:630px; display:flex; flex-direction:column;
    justify-content:center; padding:80px;
    font-family:"Noto Sans TC","Microsoft JhengHei",sans-serif;
    background:linear-gradient(135deg,#0b7575 0%,#095e5e 100%); color:#fff;
  }
  .badge { font-size:120px; }
  h1 { font-size:88px; font-weight:700; margin-top:24px; letter-spacing:2px; }
  p { font-size:40px; font-weight:500; margin-top:24px; color:#d6ecec; }
  .tags { margin-top:40px; display:flex; gap:16px; }
  .tag { background:rgba(255,255,255,.15); padding:12px 28px; border-radius:999px; font-size:32px; }
</style></head>
<body>
  <div class="badge">🚬🗺️</div>
  <h1>台灣吸菸區地圖</h1>
  <p>找吸菸區 · 回報煙味 · 共建無菸城市</p>
  <div class="tags">
    <span class="tag">找附近吸菸區</span>
    <span class="tag">回報煙味熱區</span>
    <span class="tag">菸害防制規則</span>
  </div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html, { waitUntil: 'networkidle' });
await page.waitForTimeout(400);
await page.screenshot({ path: 'public/og-image.png' });
await browser.close();
console.log('✓ 已產生 public/og-image.png (1200x630)');
