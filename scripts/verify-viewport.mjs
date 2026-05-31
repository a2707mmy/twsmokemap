import { chromium, devices } from '@playwright/test';
const browser = await chromium.launch();
const ctx = await browser.newContext({
  ...devices['Pixel 5'],
  permissions: ['geolocation'],
  geolocation: { latitude: 25.0375, longitude: 121.5637 },
});
const page = await ctx.newPage();
await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);

const countText = async () => (await page.getByText(/畫面內吸菸區 ·/).textContent())?.trim();
console.log('預設縮放：', await countText());
await page.screenshot({ path: 'screenshots/vp-default.png' });

// 縮小地圖（看更大範圍）→ 點位應變多。用滑鼠滾輪在地圖中央縮放。
await page.mouse.move(205, 430);
for (let i = 0; i < 4; i++) {
  await page.mouse.wheel(0, 600); // 向下滾 = 縮小
  await page.waitForTimeout(800);
}
await page.waitForTimeout(1500);
console.log('縮小後：', await countText());
await page.screenshot({ path: 'screenshots/vp-zoomout.png' });

await ctx.close();
await browser.close();
console.log('done');
