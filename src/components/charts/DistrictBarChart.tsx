import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useI18n } from '@/context/I18nContext';
import { useChartTheme } from '@/hooks/useChartTheme';
import { co2ByDistrict } from '@/utils/chartData';
import { ChartTooltip } from './ChartTooltip';
import { ChartCard } from './ChartCard';
import type { Measurement } from '@/types';

export function DistrictBarChart({ rows, demo }: { rows: Measurement[]; demo: boolean }) {
  const { t, district } = useI18n();
  const c = useChartTheme();
  const data = co2ByDistrict(rows).map((d) => ({ ...d, label: district(d.district) }));
  return (
    <ChartCard title={t.dashboard.charts.byDistrict} subtitle={t.dashboard.charts.byDistrictSub} demo={demo}>
      <div style={{ height: Math.max(180, data.length * 42 + 30) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }} barCategoryGap={10}>
            <CartesianGrid stroke={c.grid} horizontal={false} />
            <XAxis type="number" tick={{ fill: c.axis, fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis type="category" dataKey="label" tick={{ fill: c.ink, fontSize: 12 }} tickLine={false} axisLine={false} width={92} />
            <Tooltip content={<ChartTooltip units={{ avg: 'ppm' }} />} cursor={{ fill: c.grid, opacity: 0.5 }} />
            <Bar dataKey="avg" name={t.dashboard.kpis.avgCo2} fill={c.signal} radius={[0, 6, 6, 0]} animationDuration={600} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
