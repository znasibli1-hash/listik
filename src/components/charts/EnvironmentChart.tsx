import { CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, Area } from 'recharts';
import { useI18n } from '@/context/I18nContext';
import { useChartTheme } from '@/hooks/useChartTheme';
import { formatDate } from '@/utils/format';
import { environmentOverTime } from '@/utils/chartData';
import { ChartTooltip, SeriesLegend } from './ChartTooltip';
import { ChartCard } from './ChartCard';
import { useSeriesToggle } from './useSeriesToggle';
import type { Measurement } from '@/types';

export function EnvironmentChart({ rows, demo }: { rows: Measurement[]; demo: boolean }) {
  const { t, lang } = useI18n();
  const c = useChartTheme();
  const { hidden, toggle } = useSeriesToggle();
  const data = environmentOverTime(rows);
  const series = [
    { key: 'co2', label: t.dashboard.series.avgCo2, color: c.signal },
    { key: 'temperature', label: t.dashboard.series.temperature, color: c.experimental },
    { key: 'humidity', label: t.dashboard.series.humidity, color: c.humidity },
  ];
  return (
    <ChartCard title={t.dashboard.charts.environment} subtitle={t.dashboard.charts.environmentSub} demo={demo}
      legend={<SeriesLegend items={series} hidden={hidden} onToggle={toggle} />}>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 0, left: -8, bottom: 0 }}>
            <CartesianGrid stroke={c.grid} vertical={false} />
            <XAxis dataKey="date" tickFormatter={(d) => formatDate(d, lang, false)} tick={{ fill: c.axis, fontSize: 11 }} tickLine={false} axisLine={{ stroke: c.grid }} minTickGap={24} />
            <YAxis yAxisId="co2" tick={{ fill: c.axis, fontSize: 11 }} tickLine={false} axisLine={false} width={52} domain={['auto', 'auto']} />
            <YAxis yAxisId="env" orientation="right" tick={{ fill: c.axis, fontSize: 11 }} tickLine={false} axisLine={false} width={34} domain={[0, 'auto']} />
            <Tooltip content={<ChartTooltip labelFormatter={(d) => formatDate(d, lang)} units={{ co2: 'ppm', temperature: '°C', humidity: '%' }} />} cursor={{ stroke: c.grid }} />
            <Area yAxisId="co2" type="monotone" dataKey="co2" name={series[0].label} stroke={c.signal} fill={c.signal} fillOpacity={0.1} strokeWidth={2} hide={hidden.has('co2')} connectNulls animationDuration={600} />
            <Line yAxisId="env" type="monotone" dataKey="temperature" name={series[1].label} stroke={c.experimental} strokeWidth={2} dot={false} hide={hidden.has('temperature')} connectNulls animationDuration={600} />
            <Line yAxisId="env" type="monotone" dataKey="humidity" name={series[2].label} stroke={c.humidity} strokeWidth={2} dot={false} hide={hidden.has('humidity')} connectNulls strokeDasharray="4 3" animationDuration={600} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-xs text-muted">{t.dashboard.axes.co2} ← → {t.dashboard.axes.temp} / {t.dashboard.axes.humidity}</p>
    </ChartCard>
  );
}
