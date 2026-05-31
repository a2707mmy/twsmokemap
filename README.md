# 台灣吸菸區地圖 TWsmokemap 🚬🗺️

一個響應式公益網站（電腦＋手機皆可用），協助推動「無菸城市」：

1. **找吸菸區** — 吸菸者快速找到附近合法／實際的吸菸區。
2. **回報煙味** — 非吸菸者標記常聞到煙味的地點，形成熱區。
3. **宣導規則** — 簡明說明台灣菸害防制法的禁菸／吸菸規定。

> 詳細規劃見 [docs/計畫書.md](docs/計畫書.md)，開發歷程見 [docs/DEVLOG.md](docs/DEVLOG.md)。

## 技術堆疊

React 18 + Vite + TypeScript · Tailwind CSS · Google Maps（`@vis.gl/react-google-maps`）· Supabase（Postgres + PostGIS）· 部署於 Vercel。

## 本機開發

```bash
# 1. 安裝相依套件
npm install

# 2. 設定環境變數（可先不填，會以「展示模式」用範例資料執行）
cp .env.example .env   # Windows PowerShell: Copy-Item .env.example .env
#   填入 VITE_GOOGLE_MAPS_API_KEY / VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY

# 3. 啟動開發伺服器
npm run dev            # http://localhost:5173
```

> **展示模式**：未設定金鑰時，網站會使用內建台北市範例資料執行，方便檢視畫面與操作。

## 常用指令

| 指令 | 說明 |
|------|------|
| `npm run dev` | 啟動開發伺服器 |
| `npm run build` | 正式建置 |
| `npm run preview` | 預覽建置結果 |
| `npm run test` | 單元／元件測試（Vitest） |
| `npm run test:e2e` | 端對端測試（Playwright） |
| `npm run import:taipei` | 匯入台北市指定吸菸區開放資料到 Supabase |

## 金鑰申請

- **Google Maps API Key**：見 [docs/計畫書.md](docs/計畫書.md) 第八節（含防止意外扣款的設定）。
- **Supabase**：建立免費專案後，於 `supabase/` 資料夾執行 SQL 建立資料表與權限。

## 授權

本專案為公益用途，歡迎貢獻。資料來源：[臺北市指定吸菸區（政府資料開放平臺）](https://data.gov.tw/dataset/177504)。
