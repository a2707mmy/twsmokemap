import { chromium, devices } from '@playwright/test';
const browser = await chromium.launch();

// 桌機：點清單第一個吸菸點 → 標記變紅 + 詳情卡（走路導航）
const d = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  permissions: ['geolocation'],
  geolocation: { latitude: 25.0375, longitude: 121.5637 },
});
const dp = await d.newPage();
await dp.goto('http://localhost:5173', { waitUntil: 'networkidle' });
await dp.waitForTimeout(2500);
// 點側欄第一個項目
await dp.locator('aside button').filter({ hasText: '步行' }).first().click();
await dp.waitForTimeout(1200);
await dp.screenshot({ path: 'screenshots/refine-selected.png' });
await d.close();

// 手機：聯繫開發者頁
const m = await browser.newContext({ ...devices['Pixel 5'] });
const mp = await m.newPage();
await mp.goto('http://localhost:5173', { waitUntil: 'networkidle' });
await mp.waitForTimeout(1200);
await mp.getByRole('button', { name: '聯繫開發者' }).click();
await mp.waitForTimeout(500);
await mp.screenshot({ path: 'screenshots/refine-contact.png' });
await m.close();

await browser.close();
console.log('done');
