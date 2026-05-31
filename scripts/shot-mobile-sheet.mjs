import { chromium, devices } from '@playwright/test';
const browser = await chromium.launch();

// 手機：收合（地圖為主）
const m = await browser.newContext({ ...devices['Pixel 5'] });
const mp = await m.newPage();
await mp.goto('http://localhost:5173', { waitUntil: 'networkidle' });
await mp.waitForTimeout(1500);
await mp.screenshot({ path: 'screenshots/v2-mobile-collapsed.png' });
// 展開底部清單
await mp.getByText('附近吸菸區').click();
await mp.waitForTimeout(600);
await mp.screenshot({ path: 'screenshots/v2-mobile-expanded.png' });
await m.close();

// 桌機
const d = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const dp = await d.newPage();
await dp.goto('http://localhost:5173', { waitUntil: 'networkidle' });
await dp.waitForTimeout(1500);
await dp.screenshot({ path: 'screenshots/v2-desktop.png' });
await d.close();

await browser.close();
console.log('done');
