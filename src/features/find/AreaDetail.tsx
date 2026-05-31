import { useState } from 'react';
import { formatWalk } from '../../lib/geo';
import type { SmokingArea } from '../../lib/types';
import { SourceBadge } from '../../components/Badge';

interface Props {
  area: SmokingArea;
  onClose: () => void;
}

/** 底部彈出的吸菸區詳情卡。 */
export default function AreaDetail({ area, onClose }: Props) {
  const [voted, setVoted] = useState(false);
  const navUrl = `https://www.google.com/maps/dir/?api=1&destination=${area.lat},${area.lng}`;

  return (
    <div className="absolute inset-x-0 bottom-0 z-20 rounded-t-2xl border-t border-slate-200 bg-white p-4 shadow-2xl sm:inset-x-auto sm:bottom-4 sm:left-4 sm:w-80 sm:rounded-2xl sm:border">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-bold text-slate-900">{area.name}</h3>
        <button
          onClick={onClose}
          aria-label="關閉"
          className="-mr-1 -mt-1 rounded-full p-1 text-slate-400 hover:bg-slate-100"
        >
          ✕
        </button>
      </div>

      <div className="mt-1 flex flex-wrap items-center gap-1.5">
        <SourceBadge source={area.source} />
        {typeof area.distance_m === 'number' && (
          <span className="text-xs font-medium text-brand-600">
            {formatWalk(area.distance_m)}
          </span>
        )}
      </div>

      {area.address && <p className="mt-2 text-sm text-slate-600">📍 {area.address}</p>}
      {area.note && <p className="mt-1 text-sm text-slate-500">{area.note}</p>}

      <div className="mt-3 flex gap-2">
        <a
          href={navUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 rounded-xl bg-brand-600 px-3 py-2 text-center text-sm font-medium text-white transition hover:bg-brand-700"
        >
          以 Google Maps 導航
        </a>
        <button
          onClick={() => setVoted(true)}
          disabled={voted}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          title="這個地點正確嗎？"
        >
          {voted ? '已回報 ✓' : `👍 ${area.upvotes}`}
        </button>
      </div>
    </div>
  );
}
