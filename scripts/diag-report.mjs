import { chromium, devices } from '@playwright/test';
const browser = await chromium.launch();
const ctx = await browser.newContext({
  ...devices['Pixel 5'],
  permissions: ['geolocation'],
  geolocation: { latitude: 25.0375, longitude: 121.5637 },
});
const page = await ctx.newPage();
const errs = [];
page.on('console', (m) => { if (m.type() === 'error') errs.push('[console] ' + m.text()); });
page.on('pageerror', (e) => errs.push('[pageerror] ' + e.message + '\n' + (e.stack || '')));

await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
await page.getByRole('button', { name: '回報煙味' }).click();
await page.waitForTimeout(2000);

const bodyText = (await page.locator('main').innerText().catch(() => '')).slice(0, 120);
console.log('=== main 內容前 120 字 ===');
console.log(bodyText || '(空白)');
console.log('\n=== 錯誤 ===');
console.log(errs.length ? errs.join('\n\n') : '(無)');
await page.screenshot({ path: 'screenshots/diag-report.png' });
await ctx.close();
await browser.close();
