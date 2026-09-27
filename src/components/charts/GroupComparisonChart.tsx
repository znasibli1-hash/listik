import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useI18n } from '@/context/I18nContext';
import { useChartTheme } from '@/hooks/useChartTheme';
import { co2BySchoolAndType } from '@/utils/chartData';
import { ChartTooltip, SeriesLegend } from './ChartTooltip';
import { ChartCard } from './ChartCard';
import { useSeriesToggle } from './useSeriesToggle';
import type { Measurement } from '@/types';

const shorten = (s: string) => (s.length > 12 ? `${s.slice(0, 11)}…` : s);

export function GroupComparisonChart({ rows, demo }: { rows: Measurement[]; demo: boolean }) {
  const { t } = useI18n();
  const c = useChartTheme();
  const { hidden, toggle } = useSeriesToggle();
  const data = co2BySchoolAndType(rows).map((d) => ({ ...d, short: shorten(d.school.replace(/^Demo school /, '')) }));
  const series = [
    { key: 'experimental', label: t.common.experimental, color: c.experimental },
    { key: 'control', label: t.common.control, color: c.control },
  ];
  return (
    <ChartCard title={t.dashboard.charts.groups} subtitle={t.dashboard.charts.groupsSub} demo={demo}
      legend={<SeriesLegend items={series} hidden={hidden} onToggle={toggle} />}>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }} barGap={3} barCategoryGap="22%">
            <CartesianGrid stroke={c.grid} vertical={false} />
            <XAxis dataKey="short" tick={{ fill: c.axis, fontSize: 11 }} tickLine={false} axisLine={{ stroke: c.grid }} interval={0} />
            <YAxis tick={{ fill: c.axis, fontSize: 11 }} tickLine={false} axisLine={false} width={52} />
            <Tooltip content={<ChartTooltip labelFormatter={(s) => data.find((d) => d.short === s)?.school ?? s} units={{ experimental: 'ppm', control: 'ppm' }} />} cursor={{ fill: c.grid, opacity: 0.5 }} />
            {series.map((s) => <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color} radius={[5, 5, 0, 0]} hide={hidden.has(s.key)} animationDuration={600} />)}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
