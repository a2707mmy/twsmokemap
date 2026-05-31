import { chromium, devices } from '@playwright/test';
const browser = await chromium.launch();
const ctx = await browser.newContext({
  ...devices['Pixel 5'],
  permissions: ['geolocation'],
  geolocation: { latitude: 25.0375, longitude: 121.5637 }, // 台北市政府
});
const page = await ctx.newPage();
await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
await page.waitForTimeout(2800);

const count = async () =>
  (await page.getByText(/畫面內吸菸區 ·/).textContent())?.replace(/\D/g, '');
const start = await count();
console.log('定位後初始（市政府, zoom16）:', start, '個');

// 把地圖拖到很遠的地方 → 視野內數量改變
await page.mouse.move(205, 430);
await page.mouse.down();
await page.mouse.move(205, 120, { steps: 10 });
await page.mouse.move(205, 60, { steps: 10 });
await page.mouse.up();
await page.waitForTimeout(1500);
const moved = await count();
console.log('拖開地圖後:', moved, '個');

// 再按定位 → 應強制平移回市政府，數量回到初始
await page.getByRole('button', { name: '定位我的位置' }).click();
await page.waitForTimeout(2000);
const back = await count();
console.log('再按定位後:', back, '個');

console.log(back === start ? '✓ 定位有把地圖移回所在位置' : '⚠ 數量未完全一致（可能仍正確，請看截圖）');
await page.screenshot({ path: 'screenshots/relocate-after.png' });
await ctx.close();
await browser.close();
