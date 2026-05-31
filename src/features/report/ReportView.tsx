import { useEffect, useState } from 'react';
import MapView from '../../components/MapView';
import { useGeolocation } from '../../hooks/useGeolocation';
import { addSmellReport, fetchSmellReports } from '../../lib/data';
import { canReport, RATE_LIMIT_INFO, recordReport } from '../../lib/rateLimit';
import {
  REPORT_TYPES,
  TIME_SLOT_LABELS,
  type LatLng,
  type ReportType,
  type SmellReport,
  type TimeSlot,
} from '../../lib/types';

export default function ReportView() {
  const { center, locate } = useGeolocation();
  const [point, setPoint] = useState<LatLng | null>(null);
  const [reports, setReports] = useState<SmellReport[]>([]);
  const [reportType, setReportType] = useState<ReportType>(2);
  const [timeSlot, setTimeSlot] = useState<TimeSlot>('noon');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    locate();
  }, [locate]);

  useEffect(() => {
    fetchSmellReports().then(setReports).catch(() => setReports([]));
  }, []);

  // 預設把選取點設為地圖中心，使用者可再點地圖調整
  useEffect(() => {
    setPoint((p) => p ?? center);
  }, [center]);

  async function submit() {
    if (!point) {
      setError('請先在地圖上點選聞到煙味的地點。');
      return;
    }
    if (!canReport()) {
      setError(`回報太頻繁了，每 ${RATE_LIMIT_INFO.windowLabel} 最多 ${RATE_LIMIT_INFO.max} 筆。`);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await addSmellReport({
        lat: point.lat,
        lng: point.lng,
        report_type: reportType,
        time_slot: timeSlot,
        note: note.trim() || undefined,
      });
      recordReport();
      const updated = await fetchSmellReports();
      setReports(updated);
      setDone(true);
      setNote('');
    } catch {
      setError('送出失敗，請稍後再試。');
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
        <span className="text-4xl" aria-hidden>🙏</span>
        <h2 className="text-lg font-bold text-slate-800">感謝你的回報！</h2>
        <p className="max-w-xs text-sm text-slate-500">
          你的回報已加入煙味熱區，協助大家了解哪裡常聞到煙味。
        </p>
        <button
          onClick={() => setDone(false)}
          className="mt-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          再回報一筆
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col sm:flex-row">
      {/* 地圖（選位置 + 熱區） */}
      <div className="relative order-1 min-h-[38vh] flex-1">
        <MapView
          center={center}
          areas={[]}
          smellReports={reports}
          pickedPoint={point}
          onPick={(p) => setPoint(p)}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/40 to-transparent p-3 text-center text-xs text-white">
          紅點為大家回報的煙味熱區 · 點地圖可調整你的回報位置
        </div>
      </div>

      {/* 表單 */}
      <aside className="order-2 flex flex-col gap-4 overflow-y-auto border-t border-slate-200 p-4 sm:w-96 sm:border-l sm:border-t-0">
        <div>
          <h2 className="text-base font-bold text-slate-900">回報你聞到的煙味</h2>
          <p className="text-xs text-slate-500">幫助非吸菸者標記常有煙味的地點。</p>
        </div>

        <button
          onClick={locate}
          className="self-start rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          📍 用我目前的位置
        </button>

        {/* 回報狀況（三選一） */}
        <fieldset>
          <legend className="mb-1.5 text-sm font-medium text-slate-700">情況</legend>
          <div className="flex flex-col gap-2">
            {(Object.entries(REPORT_TYPES) as [string, string][]).map(([val, label]) => (
              <label
                key={val}
                className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${
                  reportType === Number(val)
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="reportType"
                  value={val}
                  checked={reportType === Number(val)}
                  onChange={() => setReportType(Number(val) as ReportType)}
                  className="accent-brand-600"
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        {/* 時段 */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">時段</label>
          <div className="flex flex-wrap gap-2">
            {(Object.entries(TIME_SLOT_LABELS) as [TimeSlot, string][]).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setTimeSlot(val)}
                className={`rounded-full px-3 py-1 text-sm font-medium transition ${
                  timeSlot === val
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 備註 */}
        <div>
          <label htmlFor="note" className="mb-1.5 block text-sm font-medium text-slate-700">
            補充說明（選填）
          </label>
          <textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            maxLength={200}
            placeholder="例如：騎樓下、公車站旁…"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          onClick={submit}
          disabled={submitting}
          className="rounded-xl bg-smell px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
        >
          {submitting ? '送出中…' : '送出回報'}
        </button>

        <p className="text-[11px] leading-relaxed text-slate-400">
          我們不會蒐集你的個人資料，回報僅以熱區方式呈現。每 {RATE_LIMIT_INFO.windowLabel}最多 {RATE_LIMIT_INFO.max} 筆。
        </p>
      </aside>
    </div>
  );
}
