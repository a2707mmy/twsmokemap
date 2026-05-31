import { useState } from 'react';
import { addFeedback } from '../../lib/data';

// 簡易防灌水：每小時最多 3 則
const KEY = 'twsmokemap_feedback_times';
const WINDOW_MS = 60 * 60 * 1000;
const MAX = 3;
function canSend(): boolean {
  try {
    const t = JSON.parse(localStorage.getItem(KEY) ?? '[]') as number[];
    return t.filter((x) => Date.now() - x < WINDOW_MS).length < MAX;
  } catch {
    return true;
  }
}
function recordSend() {
  try {
    const t = (JSON.parse(localStorage.getItem(KEY) ?? '[]') as number[]).filter(
      (x) => Date.now() - x < WINDOW_MS,
    );
    t.push(Date.now());
    localStorage.setItem(KEY, JSON.stringify(t));
  } catch {
    /* ignore */
  }
}

export default function ContactView() {
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!message.trim()) {
      setError('請先輸入你想說的話。');
      return;
    }
    if (!canSend()) {
      setError('訊息送出太頻繁了，請稍後再試（每小時最多 3 則）。');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await addFeedback({ message: message.trim(), contact: contact.trim() || undefined });
      recordSend();
      setDone(true);
    } catch {
      setError('送出失敗，請稍後再試。');
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
        <span className="text-4xl" aria-hidden>💌</span>
        <h2 className="text-lg font-bold text-slate-800">感謝你的訊息！</h2>
        <p className="max-w-xs text-sm text-slate-500">
          我們已收到你的意見，會作為改善網站的參考。
        </p>
        <button
          onClick={() => {
            setDone(false);
            setMessage('');
            setContact('');
          }}
          className="mt-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          再留一則
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto h-full max-w-xl overflow-y-auto px-4 py-6">
      <header className="mb-5">
        <h2 className="text-xl font-bold text-slate-900">聯繫開發者</h2>
        <p className="mt-1 text-sm text-slate-500">
          有任何問題、建議，或想回報吸菸點 / 網站狀況，都歡迎留言給我們。
        </p>
      </header>

      <div className="space-y-4">
        <div>
          <label htmlFor="msg" className="mb-1.5 block text-sm font-medium text-slate-700">
            你想說的話 <span className="text-red-500">*</span>
          </label>
          <textarea
            id="msg"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            maxLength={1000}
            placeholder="例如：某個吸菸點位置不對、希望增加的功能、使用上遇到的問題…"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          <p className="mt-1 text-right text-xs text-slate-400">{message.length}/1000</p>
        </div>

        <div>
          <label htmlFor="contact" className="mb-1.5 block text-sm font-medium text-slate-700">
            聯絡方式（選填）
          </label>
          <input
            id="contact"
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            maxLength={120}
            placeholder="Email 或其他方式，方便我們回覆你（可不填）"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          onClick={submit}
          disabled={submitting}
          className="w-full rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
        >
          {submitting ? '送出中…' : '送出訊息'}
        </button>

        <p className="text-[11px] leading-relaxed text-slate-400">
          我們不會公開你的訊息與聯絡方式，僅作為改善網站之用。
        </p>

        <p className="mt-2 rounded-xl bg-slate-50 px-3 py-2.5 text-xs leading-relaxed text-slate-500">
          這個網站是出於興趣用政府開放資料製作，非常樂於接受建議，但不要害我惹上麻煩 🙏
        </p>
      </div>
    </div>
  );
}
