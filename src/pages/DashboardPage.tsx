import { useMemo, useState } from 'react';
import { useI18n } from '@/context/I18nContext';
import { useData } from '@/context/DataContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { DemoNotice } from '@/components/ui/DemoBadge';
import { Switch } from '@/components/ui/Field';
import { EmptyState } from '@/components/ui/EmptyState';
import { LinkButton } from '@/components/ui/Button';
import { FilterBar } from '@/components/data/FilterBar';
import { KpiCard } from '@/components/charts/KpiCard';
import { Co2OverTimeChart } from '@/components/charts/Co2OverTimeChart';
import { DistrictBarChart } from '@/components/charts/DistrictBarChart';
import { GroupComparisonChart } from '@/components/charts/GroupComparisonChart';
import { EnvironmentChart } from '@/components/charts/EnvironmentChart';
import { DistributionChart } from '@/components/charts/DistributionChart';
import { applyFilters, EMPTY_FILTERS } from '@/utils/filters';
import { byType, meanCo2, meanDifference, uniqueCount } from '@/utils/stats';
import { formatNumber, formatSigned } from '@/utils/format';
import type { MeasurementFilters } from '@/types';

export function DashboardPage() {
  const { t, lang, district } = useI18n();
  const { measurements, showDemo, setShowDemo } = useData();
  const [filters, setFilters] = useState<MeasurementFilters>(EMPTY_FILTERS);

  const rows = useMemo(() => applyFilters(measurements, filters, district), [measurements, filters, district]);
  const demo = rows.some((r) => r.isDemo);

  const kpi = useMemo(() => ({
    avg: meanCo2(rows),
    exp: meanCo2(byType(rows, 'experimental')),
    ctrl: meanCo2(byType(rows, 'control')),
    diff: meanDifference(rows),
    n: rows.length,
    schools: uniqueCount(rows, (r) => r.schoolId),
  }), [rows]);

  return (
    <>
      <PageHeader title={t.dashboard.title} subtitle={t.dashboard.subtitle}
        actions={<Switch checked={showDemo} onChange={setShowDemo} label={t.common.showDemo} />} />

      <div className="grid gap-4">
        {demo && <DemoNotice />}
        <FilterBar filters={filters} onChange={setFilters} idPrefix="dash" />

        {rows.length === 0 ? (
          <div className="rounded-panel border border-line bg-surface">
            {measurements.length
              ? <EmptyState icon="🔍" title={t.common.noDataTitle} body={t.common.noDataBody} />
              : <EmptyState title={t.results.inProgress} body={t.results.inProgressBody} action={<LinkButton size="sm" href="#/data">{t.data.add}</LinkButton>} />}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
              <KpiCard label={t.dashboard.kpis.avgCo2} value={formatNumber(kpi.avg, lang)} unit="ppm" demo={demo} />
              <KpiCard label={t.dashboard.kpis.expVsCtrl} demo={demo}>
                <div className="tabular grid gap-1.5 text-sm">
                  <p className="flex items-center justify-between gap-2"><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-leaf" />{t.common.experimental}</span><span className="font-mono font-medium">{formatNumber(kpi.exp, lang)}</span></p>
                  <p className="flex items-center justify-between gap-2"><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-control" />{t.common.control}</span><span className="font-mono font-medium">{formatNumber(kpi.ctrl, lang)}</span></p>
                </div>
              </KpiCard>
              <KpiCard label={t.dashboard.kpis.avgDiff} value={formatSigned(kpi.diff, lang)} unit="ppm" hint={t.dashboard.kpis.avgDiffHint} demo={demo} />
              <KpiCard label={t.dashboard.kpis.measurements} value={formatNumber(kpi.n, lang)} />
              <KpiCard label={t.dashboard.kpis.schools} value={formatNumber(kpi.schools, lang)} />
            </div>
            <p className="text-xs text-muted">{t.common.descriptiveOnly}</p>

            <div className="grid gap-4 xl:grid-cols-3">
              <div className="min-w-0 xl:col-span-2 [&>section]:h-full"><Co2OverTimeChart rows={rows} demo={demo} /></div>
              <DistrictBarChart rows={rows} demo={demo} />
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <GroupComparisonChart rows={rows} demo={demo} />
              <DistributionChart rows={rows} demo={demo} />
            </div>
            <EnvironmentChart rows={rows} demo={demo} />
          </>
        )}
      </div>
    </>
  );
}
