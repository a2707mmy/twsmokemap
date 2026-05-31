import { readFileSync } from 'node:fs';
const raw = readFileSync('screenshots/lh.json', 'utf8');
let data;
try {
  data = JSON.parse(raw);
} catch {
  // 萬一檔案含多份報告，取第一份完整 JSON
  const end = raw.indexOf('}\n{');
  data = JSON.parse(end > 0 ? raw.slice(0, end + 1) : raw);
}
const c = data.categories;
const a = data.audits;
const pct = (s) => (s == null ? 'N/A' : Math.round(s * 100));
console.log('Performance  :', pct(c.performance?.score));
console.log('Accessibility:', pct(c.accessibility?.score));
console.log('BestPractices:', pct(c['best-practices']?.score));
console.log('SEO          :', pct(c.seo?.score));
console.log('--- Core metrics ---');
console.log('FCP:', a['first-contentful-paint']?.displayValue);
console.log('LCP:', a['largest-contentful-paint']?.displayValue);
console.log('TBT:', a['total-blocking-time']?.displayValue);
console.log('CLS:', a['cumulative-layout-shift']?.displayValue);
console.log('Speed Index:', a['speed-index']?.displayValue);
