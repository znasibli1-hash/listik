import type { ClassType, Measurement } from '@/types';

export const valuesOf = (rows: Measurement[], key: 'co2' | 'temperature' | 'humidity' | 'students') =>
  rows.map((r) => r[key]).filter((v): v is number => typeof v === 'number' && Number.isFinite(v));

export function mean(values: number[]): number | null {
  if (!values.length) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function median(values: number[]): number | null {
  if (!values.length) return null;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

export function standardDeviation(values: number[]): number | null {
  if (values.length < 2) return null;
  const m = mean(values)!;
  return Math.sqrt(values.reduce((acc, v) => acc + (v - m) ** 2, 0) / (values.length - 1));
}

export function groupBy<T, K extends string>(rows: T[], keyOf: (row: T) => K): Map<K, T[]> {
  const map = new Map<K, T[]>();
  for (const row of rows) {
    const k = keyOf(row);
    const list = map.get(k);
    if (list) list.push(row); else map.set(k, [row]);
  }
  return map;
}

export const byType = (rows: Measurement[], type: ClassType) => rows.filter((r) => r.type === type);

export function meanCo2(rows: Measurement[]) { return mean(valuesOf(rows, 'co2')); }

/** Descriptive difference of means: experimental − control. No causal meaning. */
export function meanDifference(rows: Measurement[]): number | null {
  const e = meanCo2(byType(rows, 'experimental'));
  const c = meanCo2(byType(rows, 'control'));
  return e === null || c === null ? null : e - c;
}

export const uniqueCount = <T>(rows: T[], keyOf: (r: T) => string) => new Set(rows.map(keyOf)).size;

/** Number of calendar weeks touched by the data (0 when empty). */
export function weeksSpanned(rows: Measurement[]): number {
  if (!rows.length) return 0;
  const times = rows.map((r) => new Date(r.date + 'T00:00:00Z').getTime()).filter(Number.isFinite);
  if (!times.length) return 0;
  const days = (Math.max(...times) - Math.min(...times)) / 86_400_000;
  return Math.floor(days / 7) + 1;
}

export interface GroupSummary { n: number; mean: number | null; median: number | null; sd: number | null }
export function summarize(rows: Measurement[]): GroupSummary {
  const v = valuesOf(rows, 'co2');
  return { n: v.length, mean: mean(v), median: median(v), sd: standardDeviation(v) };
}
