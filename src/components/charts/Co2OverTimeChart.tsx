import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useI18n } from '@/context/I18nContext';
import { useChartTheme } from '@/hooks/useChartTheme';
import { formatDate } from '@/utils/format';
import { co2OverTime } from '@/utils/chartData';
import { ChartTooltip, SeriesLegend } from './ChartTooltip';
import { ChartCard } from './ChartCard';
import { useSeriesToggle } from './useSeriesToggle';
import type { Measurement } from '@/types';

export function Co2OverTimeChart({ rows, demo }: { rows: Measurement[]; demo: boolean }) {
  const { t, lang } = useI18n();
  const c = useChartTheme();
  const { hidden, toggle } = useSeriesToggle();
  const data = co2OverTime(rows);
  const series = [
    { key: 'experimental', label: t.common.experimental, color: c.experimental },
    { key: 'control', label: t.common.control, color: c.control },
  ];
  return (
    <ChartCard title={t.dashboard.charts.overTime} subtitle={t.dashboard.charts.overTimeSub} demo={demo}
      legend={<SeriesLegend items={series} hidden={hidden} onToggle={toggle} />}>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
            <CartesianGrid stroke={c.grid} vertical={false} />
            <XAxis dataKey="date" tickFormatter={(d) => formatDate(d, lang, false)} tick={{ fill: c.axis, fontSize: 11 }} tickLine={false} axisLine={{ stroke: c.grid }} minTickGap={24} />
            <YAxis tick={{ fill: c.axis, fontSize: 11 }} tickLine={false} axisLine={false} width={52} domain={['auto', 'auto']} />
            <Tooltip content={<ChartTooltip labelFormatter={(d) => formatDate(d, lang)} units={{ experimental: 'ppm', control: 'ppm' }} />} cursor={{ stroke: c.grid }} />
            {series.map((s) => (
              <Line key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={s.color} strokeWidth={2.2} dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }} hide={hidden.has(s.key)} connectNulls animationDuration={600}
                strokeDasharray={s.key === 'control' ? '5 4' : undefined} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
