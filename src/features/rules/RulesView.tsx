interface RuleCard {
  icon: string;
  title: string;
  points: string[];
}

const RULES: RuleCard[] = [
  {
    icon: '🚫',
    title: '哪裡禁菸？',
    points: [
      '高中職以下學校、大專校院、醫療機構、政府機關等室內外全面禁菸。',
      '室內公共及工作場所（餐廳、賣場、辦公室、車站大廳等）禁菸。',
      '三人以上共用之室內工作場所、大眾運輸工具、計程車內禁菸。',
      '酒吧、夜店自 2023/3/22 起也納入禁菸。',
    ],
  },
  {
    icon: '🪧',
    title: '室外吸菸區的規定',
    points: [
      '禁菸場所若設室外吸菸區，面積不得大於該場所室外面積的二分之一。',
      '不得設於人員必經之處（如出入口、走道）。',
      '須明顯標示，並不得有遮蔽以外的室內化設施。',
    ],
  },
  {
    icon: '🔞',
    title: '年齡與品項限制',
    points: [
      '禁止未滿 20 歲者吸菸；禁止供應菸品予未滿 20 歲者。',
      '全面禁止電子煙（類菸品）之製造、輸入、販賣與使用。',
      '加熱菸須通過健康風險評估審查、經核定後始得販售。',
    ],
  },
  {
    icon: '💰',
    title: '違規罰則',
    points: [
      '在禁菸場所吸菸：處 2,000–10,000 元罰鍰。',
      '場所負責人未禁止吸菸或未設標示：處 10,000–50,000 元罰鍰。',
      '供應菸品予未滿 20 歲者、違規販售電子煙等另有重罰。',
    ],
  },
];

const FAQ: { q: string; a: string }[] = [
  {
    q: '在路邊（人行道）可以抽菸嗎？',
    a: '一般人行道若非公告禁菸區，目前法律未全面禁止，但部分縣市公告之公園、廣場、騎樓、行人徒步區可能禁菸，且不得影響他人。建議多利用指定吸菸區。',
  },
  {
    q: '聞到二手菸可以檢舉嗎？',
    a: '若在禁菸場所看到有人吸菸，可向場所管理者反映，或撥打 1922 防疫專線轉地方衛生局檢舉。本網站的「回報煙味」可協助大家了解常有煙味的地點。',
  },
  {
    q: '電子煙合法嗎？',
    a: '不合法。自 2023/3/22 起，電子煙（類菸品）全面禁止製造、輸入、販賣、廣告與使用。',
  },
];

export default function RulesView() {
  return (
    <div className="mx-auto h-full max-w-2xl overflow-y-auto px-4 py-6">
      <header className="mb-5">
        <h2 className="text-xl font-bold text-slate-900">吸菸規則小百科</h2>
        <p className="mt-1 text-sm text-slate-500">
          依《菸害防制法》（2023/3/22 修正施行）整理重點，共建無菸友善環境。
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        {RULES.map((r) => (
          <section
            key={r.title}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <h3 className="mb-2 flex items-center gap-2 font-bold text-slate-800">
              <span className="text-xl" aria-hidden>{r.icon}</span>
              {r.title}
            </h3>
            <ul className="space-y-1.5 text-sm text-slate-600">
              {r.points.map((p, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <h3 className="mb-2 mt-6 font-bold text-slate-800">常見問答</h3>
      <div className="space-y-2">
        {FAQ.map((f) => (
          <details
            key={f.q}
            className="group rounded-xl border border-slate-200 bg-white p-3 [&_summary]:cursor-pointer"
          >
            <summary className="flex items-center justify-between text-sm font-medium text-slate-700">
              {f.q}
              <span className="text-slate-400 transition group-open:rotate-180" aria-hidden>⌄</span>
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.a}</p>
          </details>
        ))}
      </div>

      <footer className="mt-6 rounded-xl bg-slate-100 p-3 text-xs leading-relaxed text-slate-500">
        資料整理自衛生福利部國民健康署。詳情與最新公告請參考官方網站：
        <a
          href="https://www.hpa.gov.tw/Pages/List.aspx?nodeid=41"
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-600 underline"
        >
          國民健康署 · 菸害防制
        </a>
        、
        <a
          href="https://health99.hpa.gov.tw/theme/content/362"
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-600 underline"
        >
          健康九九 · 禁菸區說明
        </a>
        。本頁僅供參考，實際規定以法令及現場公告為準。
      </footer>
    </div>
  );
}
