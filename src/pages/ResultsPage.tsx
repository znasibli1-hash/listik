import { useMemo } from 'react';
import { useI18n } from '@/context/I18nContext';
import { useData } from '@/context/DataContext';
import { PageHeader, SectionTitle } from '@/components/ui/PageHeader';
import { PROJECT } from '@/config/project';
import { Co2OverTimeChart } from '@/components/charts/Co2OverTimeChart';
import { GroupComparisonChart } from '@/components/charts/GroupComparisonChart';
import { DistrictBarChart } from '@/components/charts/DistrictBarChart';
import { byType, groupBy, meanDifference, summarize, uniqueCount, weeksSpanned, type GroupSummary } from '@/utils/stats';
import { formatNumber, formatSigned } from '@/utils/format';

function Progress({ label, value, target }: { label: string; value: number; target: number }) {
  const pct = Math.min(100, (value / target) * 100);
  return (
    <div>
      <div className="flex justify-between text-sm"><span className="text-muted">{label}</span><span className="tabular font-mono">{value} / {target}</span></div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sunken"><div className="h-full rounded-full bg-leaf transition-[width] duration-700" style={{ width: `${pct}%` }} /></div>
    </div>
  );
}

export function ResultsPage() {
  const { t, lang, district } = useI18n();
  const { realMeasurements: rows } = useData(); // Results use REAL data only — never demo
  const th = PROJECT.resultsThreshold;
  const progress = { measurements: rows.length, schools: uniqueCount(rows, (r) => r.schoolId), weeks: weeksSpanned(rows) };
  const ready = progress.measurements >= th.minMeasurements && progress.schools >= th.minSchools && progress.weeks >= th.minWeeks;

  const summary = useMemo(() => {
    const groups: [string, GroupSummary][] = [
      [t.common.experimental, summarize(byType(rows, 'experimental'))],
      [t.common.control, summarize(byType(rows, 'control'))],
    ];
    const districts = [...groupBy(rows, (r) => r.district)].map(([d, list]) => ({
      d, exp: summarize(byType(list, 'experimental')), ctrl: summarize(byType(list, 'control')), diff: meanDifference(list),
    }));
    return { groups, districts };
  }, [rows, t]);

  const interpretation = PROJECT.researcherInterpretation[lang];

  if (!ready) {
    return (
      <>
        <PageHeader title={t.results.title} />
        <div className="lab-grid grid place-items-center rounded-[28px] border border-line bg-surface px-6 py-20 text-center">
          <p className="text-4xl" aria-hidden>🌱</p>
          <h2 className="mt-4 text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">{t.results.inProgress.replace('🌱 ', '')}</h2>
          <p className="mt-2 max-w-md text-muted">{t.results.inProgressBody}</p>
          <div className="mt-10 grid w-full max-w-md gap-5 rounded-2xl border border-line bg-surface p-5 text-left">
            <p className="text-sm font-medium">{t.results.progressTitle}</p>
            <Progress label={t.results.progress.measurements} value={progress.measurements} target={th.minMeasurements} />
            <Progress label={t.results.progress.schools} value={progress.schools} target={th.minSchools} />
            <Progress label={t.results.progress.weeks} value={progress.weeks} target={th.minWeeks} />
            <p className="text-xs text-muted">{t.results.demoIgnored}</p>
          </div>
        </div>
      </>
    );
  }

  const cell = (v: number | null, d = 0) => <span className="tabular font-mono">{formatNumber(v, lang, d)}</span>;

  return (
    <>
      <PageHeader title={t.results.title} subtitle={t.results.neutralNote} />
      <div className="grid gap-10">
        <section>
          <SectionTitle>{t.results.groupTitle}</SectionTitle>
          <div className="overflow-x-auto rounded-panel border border-line bg-surface">
            <table className="w-full min-w-[520px] text-sm">
              <thead><tr className="border-b border-line text-left text-muted">
                {[t.results.table.group, t.results.table.n, t.results.table.mean, t.results.table.median, t.results.table.sd].map((h, i) => <th key={h} className={`px-4 py-3 font-medium ${i ? 'text-right' : ''}`}>{h}</th>)}
              </tr></thead>
              <tbody>
                {summary.groups.map(([name, s]) => (
                  <tr key={name} className="border-b border-line/70 last:border-0">
                    <td className="px-4 py-3 font-medium">{name}</td>
                    <td className="px-4 py-3 text-right">{cell(s.n)}</td><td className="px-4 py-3 text-right">{cell(s.mean)}</td>
                    <td className="px-4 py-3 text-right">{cell(s.median)}</td><td className="px-4 py-3 text-right">{cell(s.sd)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-muted">{t.common.descriptiveOnly}</p>
        </section>

        <div className="grid gap-4 lg:grid-cols-2">
          <Co2OverTimeChart rows={rows} demo={false} />
          <GroupComparisonChart rows={rows} demo={false} />
        </div>

        <section>
          <SectionTitle>{t.results.districtTitle}</SectionTitle>
          <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
            <div className="overflow-x-auto rounded-panel border border-line bg-surface">
              <table className="w-full min-w-[480px] text-sm">
                <thead><tr className="border-b border-line text-left text-muted">
                  <th className="px-4 py-3 font-medium">{t.results.table.district}</th>
                  <th className="px-4 py-3 text-right font-medium">{t.common.experimental}</th>
                  <th className="px-4 py-3 text-right font-medium">{t.common.control}</th>
                  <th className="px-4 py-3 text-right font-medium">{t.results.table.diff}</th>
                </tr></thead>
                <tbody>
                  {summary.districts.map((r) => (
                    <tr key={r.d} className="border-b border-line/70 last:border-0">
                      <td className="px-4 py-3 font-medium">{district(r.d)}</td>
                      <td className="px-4 py-3 text-right">{cell(r.exp.mean)} <span className="text-xs text-muted">n={r.exp.n}</span></td>
                      <td className="px-4 py-3 text-right">{cell(r.ctrl.mean)} <span className="text-xs text-muted">n={r.ctrl.n}</span></td>
                      <td className="px-4 py-3 text-right"><span className="tabular font-mono">{formatSigned(r.diff, lang)}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <DistrictBarChart rows={rows} demo={false} />
          </div>
        </section>

        <section className="rounded-panel border border-line bg-surface p-6">
          <h2 className="text-xl font-semibold tracking-[-0.02em]">{t.results.interpretationTitle}</h2>
          {interpretation
            ? <p className="mt-3 max-w-3xl whitespace-pre-line leading-relaxed">{interpretation}</p>
            : <p className="mt-3 text-muted">{t.results.interpretationEmpty}</p>}
        </section>
      </div>
    </>
  );
}
