import { chromium, devices } from '@playwright/test';
const browser = await chromium.launch();

async function shot(ctxOpts, suffix) {
  const ctx = await browser.newContext(ctxOpts);
  const page = await ctx.newPage();
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(700);
  // 回報煙味
  await page.getByRole('button', { name: '回報煙味' }).click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `screenshots/p3-report-${suffix}.png` });
  // 吸菸規則
  await page.getByRole('button', { name: '吸菸規則' }).click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `screenshots/p4-rules-${suffix}.png` });
  await ctx.close();
}

await shot({ viewport: { width: 1280, height: 800 } }, 'desktop');
await shot({ ...devices['iPhone 13'] }, 'mobile');
await browser.close();
console.log('done');
