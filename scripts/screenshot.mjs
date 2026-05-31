// 自動截圖：對指定 URL 產生「電腦版」與「手機版」畫面，供 UX 檢查。
// 用法：node scripts/screenshot.mjs [baseUrl] [label]
import { chromium, devices } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const baseUrl = process.argv[2] ?? 'http://localhost:5173';
const label = process.argv[3] ?? 'home';
const outDir = 'screenshots';
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();

// 電腦版 1280×800
const desktop = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const dPage = await desktop.newPage();
await dPage.goto(baseUrl, { waitUntil: 'networkidle' });
await dPage.waitForTimeout(800);
await dPage.screenshot({ path: `${outDir}/${label}-desktop.png` });
await desktop.close();

// 手機版 iPhone 13 (390×844)
const mobile = await browser.newContext({ ...devices['iPhone 13'] });
const mPage = await mobile.newPage();
await mPage.goto(baseUrl, { waitUntil: 'networkidle' });
await mPage.waitForTimeout(800);
await mPage.screenshot({ path: `${outDir}/${label}-mobile.png` });
await mobile.close();

await browser.close();
console.log(`✓ 已輸出 ${outDir}/${label}-desktop.png 與 ${outDir}/${label}-mobile.png`);
