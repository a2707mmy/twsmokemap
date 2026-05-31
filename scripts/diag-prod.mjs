import { chromium } from '@playwright/test';
const browser = await chromium.launch();
const page = await browser.newPage();

const logs = [];
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') logs.push(`[${m.type()}] ${m.text()}`); });
page.on('requestfailed', (r) => logs.push(`[reqfail] ${r.url()} :: ${r.failure()?.errorText}`));
const bad = [];
page.on('response', (r) => { if (r.status() >= 400) bad.push(`[${r.status()}] ${r.url()}`); });

await page.goto('https://twsmokemap.vercel.app/', { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);

console.log('=== 4xx/5xx 回應 ===');
console.log(bad.length ? bad.join('\n') : '(無)');
console.log('\n=== console 錯誤/警告 ===');
console.log(logs.length ? logs.slice(0, 20).join('\n') : '(無)');

await browser.close();
