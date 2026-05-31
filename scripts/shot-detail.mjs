import { chromium, devices } from '@playwright/test';
const browser = await chromium.launch();

const d = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const dp = await d.newPage();
await dp.goto('http://localhost:5173', { waitUntil: 'networkidle' });
await dp.waitForTimeout(700);
await dp.getByText('市民廣場旁吸菸區').first().click();
await dp.waitForTimeout(500);
await dp.screenshot({ path: 'screenshots/p2-detail-desktop.png' });
await d.close();

const m = await browser.newContext({ ...devices['iPhone 13'] });
const mp = await m.newPage();
await mp.goto('http://localhost:5173', { waitUntil: 'networkidle' });
await mp.waitForTimeout(700);
await mp.getByText('市民廣場旁吸菸區').first().click();
await mp.waitForTimeout(500);
await mp.screenshot({ path: 'screenshots/p2-detail-mobile.png' });
await m.close();

await browser.close();
console.log('done');
