import { useState } from 'react';
import { HAS_GOOGLE_MAPS, HAS_SUPABASE } from './lib/config';
import FindView from './features/find/FindView';
import ReportView from './features/report/ReportView';
import RulesView from './features/rules/RulesView';
import ContactView from './features/contact/ContactView';

type Tab = 'find' | 'report' | 'rules' | 'contact';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'find', label: '找吸菸區', icon: '🚬' },
  { key: 'report', label: '回報煙味', icon: '💨' },
  { key: 'rules', label: '吸菸規則', icon: '📋' },
  { key: 'contact', label: '聯繫開發者', icon: '💬' },
];

export default function App() {
  const [tab, setTab] = useState<Tab>('find');

  return (
    <div className="flex h-full flex-col">
      {/* 頂部標題列 */}
      <header className="z-20 flex items-center gap-2 border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
        <span className="text-2xl" aria-hidden>
          🚬
        </span>
        <div className="leading-tight">
          <h1 className="text-base font-bold text-slate-900">台灣吸菸區地圖</h1>
          <p className="text-xs text-slate-500">找吸菸區 · 回報煙味 · 共建無菸城市</p>
        </div>

        {/* 桌機：右側分頁 */}
        <nav className="ml-auto hidden gap-1 sm:flex">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                tab === t.key
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="mr-1" aria-hidden>
                {t.icon}
              </span>
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      {/* 設定提示橫幅（金鑰未設定時） */}
      {(!HAS_GOOGLE_MAPS || !HAS_SUPABASE) && (
        <div className="bg-amber-50 px-4 py-2 text-xs text-amber-800">
          目前為 <strong>展示模式</strong>：
          {!HAS_GOOGLE_MAPS && '尚未設定 Google Maps 金鑰；'}
          {!HAS_SUPABASE && '尚未連接 Supabase（使用範例資料）。'}
          完成設定後將自動切換為正式資料。
        </div>
      )}

      {/* 內容區 */}
      <main className="relative flex-1 overflow-hidden">
        {tab === 'find' && <FindView />}
        {tab === 'report' && <ReportView />}
        {tab === 'rules' && <RulesView />}
        {tab === 'contact' && <ContactView />}
      </main>

      {/* 手機：底部導覽 */}
      <nav className="z-20 grid grid-cols-4 border-t border-slate-200 bg-white pb-safe sm:hidden">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex flex-col items-center gap-0.5 py-2 text-xs font-medium transition ${
              tab === t.key ? 'text-brand-700' : 'text-slate-500'
            }`}
          >
            <span className="text-xl" aria-hidden>
              {t.icon}
            </span>
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
