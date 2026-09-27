import type { Measurement, School } from '@/types';
import { meanCo2, byType } from './stats';

export interface SchoolStats {
  school: School;
  measurements: number;
  avgCo2: number | null;
  avgExperimental: number | null;
  avgControl: number | null;
  lastDate: string | null;
}

export function computeSchoolStats(schools: School[], rows: Measurement[]): SchoolStats[] {
  return schools.map((school) => {
    const list = rows.filter((r) => r.schoolId === school.id);
    const last = list.reduce<string | null>((acc, r) => { const k = `${r.date} ${r.time}`; return !acc || k > acc ? k : acc; }, null);
    return {
      school,
      measurements: list.length,
      avgCo2: meanCo2(list),
      avgExperimental: meanCo2(byType(list, 'experimental')),
      avgControl: meanCo2(byType(list, 'control')),
      lastDate: last,
    };
  });
}

export type Co2Band = 'low' | 'mid' | 'high' | 'none';
export const co2Band = (v: number | null): Co2Band => (v === null ? 'none' : v < 800 ? 'low' : v <= 1200 ? 'mid' : 'high');
