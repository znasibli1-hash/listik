import { useRef, useState } from 'react';
import { Minus, Plus, RotateCcw, X } from 'lucide-react';
import { useI18n } from '@/context/I18nContext';
import { DISTRICTS } from '@/data/districts';
import { DemoBadge } from '@/components/ui/DemoBadge';
import { co2Band, type Co2Band, type SchoolStats } from '@/utils/schoolStats';
import { formatDate, formatNumber } from '@/utils/format';

const VB_W = 100, VB_H = 70;
export const BAND_COLOR: Record<Co2Band, string> = {
  low: 'rgb(var(--leaf))', mid: 'rgb(var(--signal))', high: 'rgb(var(--danger))', none: 'rgb(var(--muted))',
};
/** Invented, simplified shoreline — only there to orient the viewer. */
const COAST = 'M0,0 H100 V47 C94,48 90,53 84,52 C78,51 74,55 68,55 C62,55 58,52 53,55 C49,58 45,60 40,59 C34,58 30,61 24,60 C17,59 12,62 6,60 L0,59 Z';

interface View { k: number; x: number; y: number }
const HOME: View = { k: 1, x: 0, y: 0 };

export function SchoolMap({ stats, selectedId, onSelect }: { stats: SchoolStats[]; selectedId: string | null; onSelect: (id: string | null) => void }) {
  const { t, district } = useI18n();
  const [view, setView] = useState<View>(HOME);
  const drag = useRef<{ px: number; py: number; view: View; moved: boolean } | null>(null);
  const box = useRef<HTMLDivElement>(null);

  const placed = stats.filter((s) => Number.isFinite(s.school.mapX) && Number.isFinite(s.school.mapY));
  const maxN = Math.max(1, ...placed.map((s) => s.measurements));
  const radius = (n: number) => 0.8 + Math.sqrt(n / maxN) * 1.1;
  const selected = placed.find((s) => s.school.id === selectedId) ?? null;

  const zoom = (factor: number) => setView((v) => {
    const k = Math.min(4, Math.max(1, v.k * factor));
    // zoom around the centre of the canvas
    const cx = VB_W / 2, cy = VB_H / 2;
    const x = cx - ((cx - v.x) / v.k) * k, y = cy - ((cy - v.y) / v.k) * k;
    return clamp({ k, x, y });
  });
  const clamp = (v: View): View => ({ k: v.k, x: Math.min(0, Math.max(VB_W - VB_W * v.k, v.x)), y: Math.min(0, Math.max(VB_H - VB_H * v.k, v.y)) });

  const onPointerDown = (e: React.PointerEvent) => {
    if (view.k === 1) return;
    drag.current = { px: e.clientX, py: e.clientY, view, moved: false };
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current; if (!d || !box.current) return;
    const rect = box.current.getBoundingClientRect();
    const dx = ((e.clientX - d.px) / rect.width) * VB_W, dy = ((e.clientY - d.py) / rect.height) * VB_H;
    if (Math.abs(dx) + Math.abs(dy) > 0.5) d.moved = true;
    setView(clamp({ k: d.view.k, x: d.view.x + dx, y: d.view.y + dy }));
  };
  const onPointerUp = () => { drag.current = null; };

  // popup position in % of the map box
  const pos = selected && { left: ((view.x + selected.school.mapX * view.k) / VB_W) * 100, top: ((view.y + selected.school.mapY * view.k) / VB_H) * 100 };
  const flip = pos && pos.top < 45;

  const ctrlBtn = 'grid h-9 w-9 place-items-center rounded-full border border-line bg-surface/95 text-ink shadow-sm hover:border-leaf';

  return (
    <div ref={box} className="relative overflow-hidden rounded-panel border border-line bg-[rgb(var(--sunken))]" style={{ aspectRatio: `${VB_W} / ${VB_H}` }}>
      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className={`absolute inset-0 h-full w-full touch-none ${view.k > 1 ? 'cursor-grab active:cursor-grabbing' : ''}`}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
        onClick={(e) => { if (e.target === e.currentTarget) onSelect(null); }} role="img" aria-label={t.map.schematic}>
        <defs>
          <pattern id="sea" width="3" height="3" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r=".25" fill="rgb(var(--muted))" opacity=".35" /></pattern>
        </defs>
        <rect width={VB_W} height={VB_H} fill="url(#sea)" onClick={() => onSelect(null)} />
        <g transform={`translate(${view.x} ${view.y}) scale(${view.k})`} style={{ transition: drag.current ? 'none' : 'transform .3s ease' }}>
          <path d={COAST} fill="rgb(var(--surface))" stroke="rgb(var(--line))" strokeWidth={0.4 / view.k} onClick={() => onSelect(null)} />
          <text x="60" y="65" fontSize="2.2" fill="rgb(var(--muted))" textAnchor="middle" fontStyle="italic">{t.map.caspian}</text>
          <text x="46" y="62.4" fontSize="1.5" fill="rgb(var(--muted))" textAnchor="middle" opacity=".8">{t.map.bay}</text>
          {DISTRICTS.map((d) => (
            <g key={d.id} pointerEvents="none">
              <circle cx={d.labelX} cy={d.labelY} r={d.radius} fill="rgb(var(--leaf))" opacity=".05" stroke="rgb(var(--leaf))" strokeOpacity=".18" strokeWidth={0.25 / view.k} strokeDasharray={`${1 / view.k} ${0.8 / view.k}`} />
              <text x={d.labelX} y={d.labelY - d.radius + 3} fontSize={1.7 / Math.sqrt(view.k)} fill="rgb(var(--muted))" textAnchor="middle" fontWeight="500">{district(d.id)}</text>
            </g>
          ))}
          {placed.map((s) => {
            const r = radius(s.measurements) / Math.sqrt(view.k);
            const active = s.school.id === selectedId;
            const color = BAND_COLOR[co2Band(s.avgCo2)];
            return (
              <g key={s.school.id} role="button" tabIndex={0} aria-label={s.school.name} className="cursor-pointer focus:outline-none"
                onClick={(e) => { e.stopPropagation(); onSelect(active ? null : s.school.id); }}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(s.school.id); } }}>
                {active && <circle cx={s.school.mapX} cy={s.school.mapY} r={r + 1.6 / view.k} fill="none" stroke={color} strokeWidth={0.4 / view.k} />}
                <circle cx={s.school.mapX} cy={s.school.mapY} r={r} fill={color} fillOpacity={0.85} stroke="rgb(var(--surface))" strokeWidth={0.5 / view.k} />
                <circle cx={s.school.mapX} cy={s.school.mapY} r={r + 2.5 / view.k} fill="transparent" />
              </g>
            );
          })}
        </g>
      </svg>

      {/* demo stamp */}
      <div className="pointer-events-none absolute bottom-3 left-3 mr-14 flex items-center gap-2 rounded-full bg-surface/90 px-2.5 py-1 text-[11px] font-medium text-ink shadow-sm sm:text-xs">
        <DemoBadge />{t.map.demoNotice}
      </div>

      {/* zoom controls */}
      <div className="absolute right-3 top-3 grid gap-1.5">
        <button className={ctrlBtn} onClick={() => zoom(1.5)} aria-label={t.map.zoomIn}><Plus size={16} /></button>
        <button className={ctrlBtn} onClick={() => zoom(1 / 1.5)} aria-label={t.map.zoomOut}><Minus size={16} /></button>
        <button className={ctrlBtn} onClick={() => setView(HOME)} aria-label={t.map.reset}><RotateCcw size={14} /></button>
      </div>

      {/* popup anchored to the marker (tablet/desktop). Phones get the same card below the map. */}
      {selected && pos && (
        <div className={`absolute z-10 hidden w-[300px] -translate-x-1/2 sm:block ${flip ? 'translate-y-4' : '-translate-y-[calc(100%+16px)]'}`}
          style={{ left: `${Math.min(76, Math.max(24, pos.left))}%`, top: `${pos.top}%` }}>
          <SchoolPopupCard stats={selected} onClose={() => onSelect(null)} />
        </div>
      )}
    </div>
  );
}

export function SchoolPopupCard({ stats, onClose }: { stats: SchoolStats; onClose: () => void }) {
  const { t, lang, district } = useI18n();
  const { school } = stats;
  return (
    <div className="animate-rise rounded-2xl border border-line bg-surface p-4 text-sm shadow-xl">
      <div className="mb-2 flex items-start justify-between gap-3">
        <p className="flex items-center gap-1.5 font-semibold">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: BAND_COLOR[co2Band(stats.avgCo2)] }} />
          {school.name}{school.isDemo && <DemoBadge />}
        </p>
        <button onClick={onClose} aria-label={t.common.close} className="-mr-1 -mt-1 grid h-7 w-7 place-items-center rounded-full text-muted hover:bg-sunken"><X size={15} /></button>
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 [&>dd]:whitespace-nowrap">
        <dt className="text-muted">{t.map.popup.district}</dt><dd className="text-right">{district(school.district)}</dd>
        <dt className="text-muted">{t.map.popup.measurements}</dt><dd className="tabular text-right font-mono">{stats.measurements}</dd>
        <dt className="text-muted">{t.map.popup.avgCo2}</dt><dd className="tabular text-right font-mono">{formatNumber(stats.avgCo2, lang)} ppm</dd>
        <dt className="text-muted">{t.map.popup.expCtrl}</dt><dd className="tabular text-right font-mono">{formatNumber(stats.avgExperimental, lang)} / {formatNumber(stats.avgControl, lang)}</dd>
        <dt className="text-muted">{t.map.popup.lastMeasurement}</dt><dd className="text-right">{stats.lastDate ? `${formatDate(stats.lastDate.slice(0, 10), lang)} ${stats.lastDate.slice(11)}` : '—'}</dd>
      </dl>
    </div>
  );
}
