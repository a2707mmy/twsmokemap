import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5174',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    // 用 Chromium 的行動模擬（Pixel 5），免另外下載 WebKit
    { name: 'mobile', use: { ...devices['Pixel 5'] } },
  ],
  // 專屬測試用 dev server（5174 埠）；清空金鑰 → 一律 demo 模式，
  // 測試使用內建範例資料、示意地圖，結果穩定且不連線正式環境。
  webServer: {
    command: 'npm run dev -- --port 5174',
    url: 'http://localhost:5174',
    reuseExistingServer: false,
    timeout: 60000,
    env: {
      VITE_SUPABASE_URL: '',
      VITE_SUPABASE_ANON_KEY: '',
      VITE_GOOGLE_MAPS_API_KEY: '',
    },
  },
});
