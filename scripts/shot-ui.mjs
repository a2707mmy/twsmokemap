import { chromium, devices } from '@playwright/test';
const browser = await chromium.launch();

// 桌機側欄（顯示步行時間、無篩選）
const d = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  permissions: ['geolocation'],
  geolocation: { latitude: 25.0375, longitude: 121.5637 },
});
const dp = await d.newPage();
await dp.goto('http://localhost:5173', { waitUntil: 'networkidle' });
await dp.waitForTimeout(2500);
await dp.screenshot({ path: 'screenshots/ui-desktop.png' });
await d.close();

// 手機展開清單
const m = await browser.newContext({
  ...devices['Pixel 5'],
  permissions: ['geolocation'],
  geolocation: { latitude: 25.0375, longitude: 121.5637 },
});
const mp = await m.newPage();
await mp.goto('http://localhost:5173', { waitUntil: 'networkidle' });
await mp.waitForTimeout(2500);
await mp.getByText(/畫面內吸菸區/).click();
await mp.waitForTimeout(600);
await mp.screenshot({ path: 'screenshots/ui-mobile.png' });
await m.close();

await browser.close();
console.log('done');
