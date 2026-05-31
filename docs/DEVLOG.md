# 開發紀錄報告 DEVLOG

> 記錄每個階段的進度、決策、遇到的困難與解法。收尾時彙整成完整的開發歷程報告。

格式：
```
## YYYY-MM-DD｜階段 Px
- 完成：...
- 決策：為何選 A 不選 B
- 困難 & 解法：問題 → 排查 → 解決
- 待辦／風險：...
```

---

## 2026-05-31｜P0 專案啟動與骨架

- **完成**：
  - 完成需求釐清與計畫書（[docs/計畫書.md](計畫書.md)）。與使用者確認四大決策：Google Maps、Supabase、Vercel、台北市試點先行。
  - 建立 Vite + React + TS + Tailwind 專案骨架，含響應式外殼（頂部標題列 + 桌機分頁 / 手機底部導覽）與三分頁切換（找吸菸區 / 回報煙味 / 吸菸規則）。
  - 建立資料層抽象 [src/lib/data.ts](../src/lib/data.ts)：可串 Supabase RPC，未設定金鑰時自動 fallback 到內建台北範例資料（**展示模式**），讓網站在接後端前即可執行與截圖。
  - 完成型別（[types.ts](../src/lib/types.ts)）、設定（[config.ts](../src/lib/config.ts)）、地理距離工具（[geo.ts](../src/lib/geo.ts)）。
- **決策**：
  - 煙味回報依使用者要求，由「強度 1–3」改為三選一描述性用詞（我看到有人在抽菸／聞到濃烈煙味／聞到些微煙味），欄位命名 `report_type`。
  - 採「展示模式」設計：金鑰未設定也能跑，降低串接前的驗證門檻、利於及早給使用者看畫面。
  - 地圖套件選 `@vis.gl/react-google-maps`（Google 官方維護，比舊的 `@react-google-maps/api` 更新）。
- **困難 & 解法**：
  - （待補：安裝套件、跑 dev、截圖過程中的問題）
- **待辦／風險**：
  - P1：Supabase schema / PostGIS / RLS / 台北開放資料匯入腳本。
  - 風險：Google Maps 金鑰需綁信用卡，使用者需手動完成；已在計畫書提供防爆量設定教學。

---

## 2026-05-31｜P1–P5 後端、三大功能、測試

- **完成**：
  - **P1 後端**：Supabase schema（PostGIS、`smoking_areas`/`smell_reports`、`nearby_smoking_areas` RPC、`upvote` 函式）、RLS 權限、台北市開放資料匯入腳本 [scripts/import-taipei.ts](../scripts/import-taipei.ts)。
  - **P2 找吸菸區**：自動定位、半徑/篩選、附近清單（依距離排序）、地圖標記、詳情卡（導航 + 投票）。`MapView` 支援 Google Maps 與無金鑰示意地圖。
  - **P3 回報煙味**：地圖選位 + 煙味熱區、三選一描述性情況、時段、備註、送出、成功畫面、前端速率限制。
  - **P4 吸菸規則**：法規重點 4 卡片 + 常見問答 + 官方來源連結。
  - **P5 測試**：Vitest 單元 11/11 通過（geo、rateLimit、demo 資料層）；Playwright E2E 10/10 通過（桌機 + 行動）。各功能電腦/手機版截圖留存於 `screenshots/`。
- **決策**：
  - E2E 行動測試改用 Chromium 的 Pixel 5 模擬，避免額外下載 WebStreaming/WebKit 瀏覽器（省空間、加快 CI）。
  - 完整 Lighthouse 效能測試依計畫於部署後對正式網址執行；建置產物極小（JS 47KB gzip），預期分數佳。
- **困難 & 解法**：
  - `tsc -b` 與 `noEmit` 衝突 → build 指令改為 `tsc --noEmit && vite build`。
  - 匯入腳本需 Node 型別 → 安裝 `@types/node`。
  - dev server 背景啟動因日誌目錄不存在而失敗 → 先建立 `screenshots/` 目錄。
  - Playwright 行動專案預設用 WebKit（未安裝）而失敗 → 改 Pixel 5（Chromium）。
- **待辦／風險**：
  - P6：`vercel.json`、部署指南、推上 GitHub（需使用者帳號）、部署後跑 Lighthouse。
  - 使用者待辦：申請 Google Maps 金鑰、建立 Supabase 專案並執行 SQL、跑匯入腳本。

## 2026-05-31｜P6 部署設定與 GitHub 上架

- **完成**：
  - `vercel.json`（Vite 框架、SPA rewrite）與 [部署指南.md](部署指南.md)（金鑰→資料庫→GitHub→Vercel→驗證五步驟）。
  - 建立公開 GitHub repo 並推送：<https://github.com/a2707mmy/twsmokemap>。
- **待辦（使用者帳號相關，需親自操作）**：
  1. 申請 Google Maps 金鑰並設 referrer 限制 + 預算警示。
  2. 建立 Supabase 專案、執行 `schema.sql` 與 `policies.sql`、跑 `npm run import:taipei`。
  3. 於 Vercel 匯入 repo、設定環境變數、Deploy。
  4. 部署後對正式網址跑 Lighthouse，回填效能數據。

---

## 開發歷程總結與踩雷清單

| 困難 | 解法 |
|------|------|
| 台灣無全國統一吸菸區開放資料 | 採「台北市開放資料 + 全台眾包」雙軌，台北試點先行 |
| Google 2025/3 計費改制（取消 $200 抵用金） | 改用每月免費額度，並教學設定 referrer 限制與預算警示防爆量 |
| 尚無金鑰也要能展示／截圖 | 設計「展示模式」：無金鑰時用內建範例資料 + 示意地圖 fallback |
| 眾包資料造假風險 | 眾包標「待驗證」、RLS 僅允許新增 pending、煙味改熱區彙總、前端速率限制 |
| `tsc -b` 與 `noEmit` 衝突 | build 改 `tsc --noEmit && vite build` |
| Playwright 行動測試需 WebKit | 改用 Chromium 的 Pixel 5 模擬，省下載 |

**成果**：響應式網站、三大功能齊備、單元 + E2E 測試全綠、文件完整、已上架 GitHub。預期金鑰與帳號就緒後即可一鍵部署上線。

---

## 2026-05-31｜上線後使用者回饋調整（第二輪）

- **定位（我的位置）**：高精度失敗自動以低精度重試、錯誤訊息更明確；新增 `MapController` 讓定位更新時地圖會平移到使用者位置；手機浮動定位鈕移到右上角避開縮放控制，並把定位狀態做成地圖上的提示。
- **地圖簡化**：移除衛星/地形（`mapTypeControl`）、街景、全螢幕控制。
- **改為「依地圖視野顯示」**：移除固定「搜尋範圍」設定，改為顯示目前地圖可視範圍內的所有吸菸點（縮放/拖曳即時更新）。新增 `fetchAllAreas`（重用 nearby RPC 大半徑）、`Bounds` 型別、`MapView.onBoundsChange`（`onIdle` 讀 `getBounds`）。已驗證：預設縮放 17 個、縮到全台北 201 個。
- **測試改為 hermetic（重要）**：發現 `.env` 存在後，`npm run test`/E2E 會連到正式 Supabase，甚至 insert 測試列。修正：
  - Vitest 在 `vite.config.ts` 用 `test.env` 清空金鑰 → 一律 demo 模式。
  - Playwright 改在 5174 埠啟動專屬 demo-mode server（`reuseExistingServer:false` + 清空金鑰 env），E2E 點地圖標記（桌機/手機皆可見）而非清單項目。
  - 清掉先前測試誤插入的 2 筆 pending 測試列（`scripts/cleanup-test-rows.mjs`）。
- 單元 11/11、E2E 10/10 全綠。

### 修正：點定位後地圖不平移
- 原因：`MapController` 用「中心座標變了才平移」，若使用者拖開地圖後再按定位、而瀏覽器回傳相同的快取座標，會被判定為「沒變」而不平移。
- 解法：`useGeolocation` 每次成功定位遞增 `locateTick`，`MapView.recenterKey` 以此為訊號，每次定位都強制 `panTo` + `setZoom(16)`（即使座標相同）。`ReportView` 同步：「用我目前的位置」會把回報點移到使用者位置。
- 已用 Playwright 驗證：定位 12 個 → 拖開 4 個 → 再定位回到 12 個。
- 附帶釐清：改用「依視野顯示」不會增加 Google Maps 流量（計費以地圖載入次數計，縮放/拖曳不計費；資料來自 Supabase 且改為一次抓取）。

### 修正：點「回報煙味」整頁空白
- 原因：`fetchSmellReports` 用 `select('*')` 取回，但座標存在 PostGIS `location` 欄位、沒有 lat/lng → `AdvancedMarker` 收到 `lat: undefined` 丟出 `InvalidValueError`，React 無 error boundary 整棵卸載 → 空白。demo 範例有 lat/lng 故只在線上真實資料出現。
- 解法：新增 `all_smell_reports()` RPC（st_y/st_x 轉 lat/lng），`fetchSmellReports` 改用它；並在 `MapView` 加 `hasValidCoords` 防呆，座標無效就跳過標記（即使資料異常也不再崩潰）。RPC 未建立時錯誤被 catch → 回報頁仍正常、只是暫無熱區。

### 介面精簡（使用者回饋）
- 移除「全部/戶外/室內」種類篩選與「只看官方」篩選（含清單的室內/戶外標籤），介面更乾淨。
- 距離改以**步行時間**呈現（`formatWalk`，約 80 公尺/分鐘；超過約 45 分鐘改顯示公里）。
- 地圖標記配色維持：官方=青藍、使用者回報=橘色（保留來源徽章）。
- 清掉測試誤插入的 2 筆煙味回報，資料庫回到乾淨狀態（201 吸菸區 / 0 回報）。

---

## 2026-05-31｜上線前補強：資料匯入與 SEO

- **資料匯入**：使用者用新版 Supabase 金鑰遇到 `permission denied for table` →
  原因是新版 publishable/secret 金鑰角色未自動取得資料表 GRANT。
  解法：(1) import 腳本改為產生 `supabase/seed-taipei.sql` 種子檔，直接在 SQL Editor 執行匯入（201 筆）；
  (2) schema.sql 補上明確 GRANT。已驗證前端 anon 金鑰讀取、附近搜尋 RPC 正常（台北市府 2km 內 35 筆）。
- **SEO（基本包，為了讓一般民眾搜尋得到）**：
  - 釐清：Vercel（CSR SPA）部署不傷 SEO，但純前端渲染對非 Google 爬蟲與社群分享預覽不友善。
  - 加入 `robots.txt`、`sitemap.xml`、Open Graph / Twitter Card、JSON-LD（WebApplication）、`<noscript>` 靜態內容、強化 meta。
  - 用 Playwright 渲染產生社群分享縮圖 `public/og-image.png`（1200×630）。
  - 待使用者部署後：把正式網址更新進 canonical/OG/sitemap，並到 Google Search Console 提交網站與 sitemap。

---

## 2026-05-31｜正式上線與線上除錯

- **已上線**：<https://twsmokemap.vercel.app/>（Vercel）。正式網址正好等於先前 hardcode 的網址，canonical/OG/sitemap 無需更動。
- **線上才出現的兩個問題與解法**：
  1. Google 地圖載入失敗 → API 金鑰未把正式網域加進 HTTP 參照網址限制 → 補上 `https://twsmokemap.vercel.app/*`。
  2. 吸菸區 0 筆 → Vercel 的 `VITE_SUPABASE_URL` 值被重複貼成三段，請求網址變成 `...supabase.cohttps//...`，`ERR_NAME_NOT_RESOLVED` → 重設為單一網址並 Redeploy。
  - 除錯關鍵：寫 `scripts/diag-prod.mjs` 用 Playwright 攔截線上 console 錯誤與失敗請求，一眼看出被打壞的網址。
- **Lighthouse（桌機）**：Performance 88 / Accessibility 94 / Best Practices 96 / **SEO 100**；LCP 2.0s、CLS 0、TBT 0ms。核心 Web Vitals 全達標。
- **專案狀態：已完整上線、可供一般民眾使用。** 後續加值：地圖延遲載入推效能上 90+、Google Search Console 提交、自訂網域。
