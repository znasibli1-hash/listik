import type { Measurement } from '@/types';
import { groupBy, mean, valuesOf } from './stats';

const round = (v: number | null, d = 0) => (v === null ? null : Math.round(v * 10 ** d) / 10 ** d);
const byDate = (rows: Measurement[]) => [...groupBy(rows, (r) => r.date)].sort(([a], [b]) => a.localeCompare(b));

/** Daily mean CO₂ for each class type. */
export function co2OverTime(rows: Measurement[]) {
  return byDate(rows).map(([date, day]) => ({
    date,
    experimental: round(mean(valuesOf(day.filter((r) => r.type === 'experimental'), 'co2'))),
    control: round(mean(valuesOf(day.filter((r) => r.type === 'control'), 'co2'))),
  }));
}

export function co2ByDistrict(rows: Measurement[]) {
  return [...groupBy(rows, (r) => r.district)]
    .map(([district, list]) => ({ district, avg: round(mean(valuesOf(list, 'co2'))), n: valuesOf(list, 'co2').length }))
    .sort((a, b) => (b.avg ?? 0) - (a.avg ?? 0));
}

export function co2BySchoolAndType(rows: Measurement[]) {
  return [...groupBy(rows, (r) => r.schoolId)]
    .map(([schoolId, list]) => ({
      schoolId,
      school: list[0].schoolName,
      experimental: round(mean(valuesOf(list.filter((r) => r.type === 'experimental'), 'co2'))),
      control: round(mean(valuesOf(list.filter((r) => r.type === 'control'), 'co2'))),
    }))
    .sort((a, b) => a.school.localeCompare(b.school));
}

export function environmentOverTime(rows: Measurement[]) {
  return byDate(rows).map(([date, day]) => ({
    date,
    co2: round(mean(valuesOf(day, 'co2'))),
    temperature: round(mean(valuesOf(day, 'temperature')), 1),
    humidity: round(mean(valuesOf(day, 'humidity'))),
  }));
}

/** Histogram in 100 ppm bands; everything ≥ cap goes into the last band. */
export function co2Distribution(rows: Measurement[], step = 100, cap = 2000) {
  const values = rows.filter((r) => r.co2 !== null) as (Measurement & { co2: number })[];
  if (!values.length) return [];
  const min = Math.floor(Math.min(...values.map((v) => v.co2), cap) / step) * step;
  const bins = new Map<number, { experimental: number; control: number }>();
  for (let b = min; b <= cap; b += step) bins.set(b, { experimental: 0, control: 0 });
  for (const v of values) {
    const b = Math.min(cap, Math.floor(v.co2 / step) * step);
    const bin = bins.get(Math.max(min, b))!;
    bin[v.type]++;
  }
  return [...bins].map(([b, c]) => ({ band: b >= cap ? `${cap}+` : `${b}`, ...c }));
}
