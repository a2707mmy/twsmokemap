/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
    // Playwright E2E 測試放在 tests/e2e，交由 Playwright 執行，不納入 Vitest
    exclude: ['node_modules', 'dist', 'tests/e2e/**'],
    // 強制清空金鑰 → 測試一律走 demo 模式，絕不連線正式 Supabase（避免污染資料）
    env: {
      VITE_SUPABASE_URL: '',
      VITE_SUPABASE_ANON_KEY: '',
      VITE_GOOGLE_MAPS_API_KEY: '',
    },
  },
});
