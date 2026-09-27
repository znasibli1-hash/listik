import { useMemo, useState } from 'react';
import { useI18n } from '@/context/I18nContext';
import { useData } from '@/context/DataContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { DemoBadge } from '@/components/ui/DemoBadge';
import { Switch } from '@/components/ui/Field';
import { EmptyState } from '@/components/ui/EmptyState';
import { BAND_COLOR, SchoolMap, SchoolPopupCard } from '@/components/map/SchoolMap';
import { computeSchoolStats, co2Band, type Co2Band } from '@/utils/schoolStats';
import { formatNumber } from '@/utils/format';

export function MapPage() {
  const { t, lang, district } = useI18n();
  const { schools, measurements, showDemo, setShowDemo } = useData();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const stats = useMemo(() => computeSchoolStats(schools, measurements), [schools, measurements]);
  const selected = stats.find((s) => s.school.id === selectedId) ?? null;
  const unplaced = stats.filter((s) => !Number.isFinite(s.school.mapX));

  return (
    <>
      <PageHeader title={t.map.title} subtitle={t.map.subtitle} actions={<Switch checked={showDemo} onChange={setShowDemo} label={t.common.showDemo} />} />

      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0">
          <SchoolMap stats={stats} selectedId={selectedId} onSelect={setSelectedId} />
          <p className="mt-2 text-xs text-muted">{t.map.schematic}</p>
          {selected && Number.isFinite(selected.school.mapX) && (
            <div className="mt-3 sm:hidden"><SchoolPopupCard stats={selected} onClose={() => setSelectedId(null)} /></div>
          )}
        </div>

        <aside className="grid content-start gap-4">
          <section className="rounded-panel border border-line bg-surface p-5">
            <h2 className="font-semibold">{t.map.legendTitle}</h2>
            <p className="mt-3 text-sm text-muted">{t.map.legendColor}</p>
            <ul className="mt-2 grid gap-1.5 text-sm">
              {(['low', 'mid', 'high', 'none'] as Co2Band[]).map((b) => (
                <li key={b} className="flex items-center gap-2"><span className="h-3 w-3 rounded-full" style={{ background: BAND_COLOR[b] }} />{t.map.bands[b]}</li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-muted">{t.map.legendSize}</p>
            <div className="mt-2 flex items-end gap-3" aria-hidden>
              {[10, 16, 22].map((d) => <span key={d} className="rounded-full border border-muted/60" style={{ width: d, height: d }} />)}
            </div>
            {showDemo && <p className="mt-4 flex items-start gap-2 text-xs text-muted"><DemoBadge />{t.map.demoNotice}</p>}
          </section>

          <section className="rounded-panel border border-line bg-surface p-2">
            <h2 className="px-3 pb-1 pt-2 font-semibold">{t.map.listTitle}</h2>
            {stats.length === 0 ? <EmptyState title={t.map.noSchools} /> : (
              <ul className="grid">
                {stats.map((s) => {
                  const placed = Number.isFinite(s.school.mapX);
                  return (
                    <li key={s.school.id}>
                      <button disabled={!placed} onClick={() => setSelectedId(s.school.id === selectedId ? null : s.school.id)}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors disabled:cursor-default ${s.school.id === selectedId ? 'bg-leaf-soft' : 'hover:bg-sunken enabled:hover:bg-sunken'}`}>
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: BAND_COLOR[co2Band(s.avgCo2)] }} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium">{s.school.name}</span>
                          <span className="block text-xs text-muted">{district(s.school.district)}</span>
                        </span>
                        <span className="tabular font-mono text-xs text-muted">{formatNumber(s.avgCo2, lang)}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            {unplaced.length > 0 && <p className="px-3 pb-2 pt-1 text-xs text-muted">{t.map.realNoPosition}</p>}
          </section>
        </aside>
      </div>
    </>
  );
}
