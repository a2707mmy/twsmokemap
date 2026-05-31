import { chromium, devices } from '@playwright/test';
const browser = await chromium.launch();

// A) 允許定位 + 指定座標（大安森林公園附近），驗證地圖會移過去且抓到附近吸菸區
const granted = await browser.newContext({
  ...devices['Pixel 5'],
  permissions: ['geolocation'],
  geolocation: { latitude: 25.0299, longitude: 121.5354 },
});
const gp = await granted.newPage();
await gp.goto('http://localhost:5173', { waitUntil: 'networkidle' });
await gp.waitForTimeout(2500);
await gp.screenshot({ path: 'screenshots/loc-granted.png' });
await granted.close();

// B) 拒絕定位（不給權限），驗證地圖上會出現提示
const denied = await browser.newContext({ ...devices['Pixel 5'] }); // 預設無 geolocation 權限
const dp = await denied.newPage();
await dp.goto('http://localhost:5173', { waitUntil: 'networkidle' });
await dp.getByRole('button', { name: '定位我的位置' }).click();
await dp.waitForTimeout(2000);
await dp.screenshot({ path: 'screenshots/loc-denied.png' });
await denied.close();

await browser.close();
console.log('done');
