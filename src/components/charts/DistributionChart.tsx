import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useI18n } from '@/context/I18nContext';
import { useChartTheme } from '@/hooks/useChartTheme';
import { co2Distribution } from '@/utils/chartData';
import { ChartTooltip, SeriesLegend } from './ChartTooltip';
import { ChartCard } from './ChartCard';
import { useSeriesToggle } from './useSeriesToggle';
import type { Measurement } from '@/types';

export function DistributionChart({ rows, demo }: { rows: Measurement[]; demo: boolean }) {
  const { t } = useI18n();
  const c = useChartTheme();
  const { hidden, toggle } = useSeriesToggle();
  const data = co2Distribution(rows);
  const series = [
    { key: 'experimental', label: t.common.experimental, color: c.experimental },
    { key: 'control', label: t.common.control, color: c.control },
  ];
  return (
    <ChartCard title={t.dashboard.charts.distribution} subtitle={t.dashboard.charts.distributionSub} demo={demo}
      legend={<SeriesLegend items={series} hidden={hidden} onToggle={toggle} />}>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }} barCategoryGap={1}>
            <CartesianGrid stroke={c.grid} vertical={false} />
            <XAxis dataKey="band" tick={{ fill: c.axis, fontSize: 11 }} tickLine={false} axisLine={{ stroke: c.grid }} minTickGap={12} />
            <YAxis allowDecimals={false} tick={{ fill: c.axis, fontSize: 11 }} tickLine={false} axisLine={false} width={44} />
            <Tooltip content={<ChartTooltip labelFormatter={(b) => `${b} ppm`} />} cursor={{ fill: c.grid, opacity: 0.5 }} />
            {series.map((s) => <Bar key={s.key} dataKey={s.key} name={s.label} stackId="d" fill={s.color} fillOpacity={0.85} hide={hidden.has(s.key)} animationDuration={600} />)}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
