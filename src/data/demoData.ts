/**
 * ⚠ DEMO DATA — generated for interface demonstration only.
 *
 * - School names are placeholders ("Demo school A"), not real schools.
 * - Map positions are schematic, not real school locations.
 * - CO₂ values come from ONE random model used for BOTH class types, so any
 *   difference between experimental and control classes here is pure noise.
 *   Nothing in this file is a research result.
 *
 * To remove demo data: turn off "Show demo data" in the interface, or set
 * INCLUDE_DEMO_BY_DEFAULT = false. Real data enters through
 * src/services/measurementsRepository.ts (form, CSV/JSON import or a backend).
 */
import type { ClassType, Measurement, School } from '@/types';

export const INCLUDE_DEMO_BY_DEFAULT = true;

export const DEMO_SCHOOLS: School[] = [
  { id: 'demo-a', name: 'Demo school A', district: 'binagadi', mapX: 24, mapY: 20, isDemo: true },
  { id: 'demo-b', name: 'Demo school B', district: 'narimanov', mapX: 55, mapY: 28, isDemo: true },
  { id: 'demo-c', name: 'Demo school C', district: 'nasimi', mapX: 41, mapY: 38, isDemo: true },
  { id: 'demo-d', name: 'Demo school D', district: 'yasamal', mapX: 29, mapY: 44, isDemo: true },
  { id: 'demo-e', name: 'Demo school E', district: 'sabail', mapX: 46, mapY: 50, isDemo: true },
  { id: 'demo-f', name: 'Demo school F', district: 'khatai', mapX: 68, mapY: 43, isDemo: true },
];

/** Small deterministic PRNG so the demo looks the same on every load. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function schoolDays(startIso: string, weeks: number): string[] {
  const days: string[] = [];
  const start = new Date(startIso + 'T00:00:00Z'); // UTC avoids timezone date shifts
  for (let i = 0; i < weeks * 7; i++) {
    const d = new Date(start); d.setUTCDate(start.getUTCDate() + i);
    const wd = d.getUTCDay();
    if (wd !== 0 && wd !== 6) days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function generateDemoMeasurements(): Measurement[] {
  const rand = mulberry32(2026);
  const round = (v: number, step = 1) => Math.round(v / step) * step;
  const days = schoolDays('2026-08-31', 4);
  const times = ['09:10', '11:40', '13:20'];
  const out: Measurement[] = [];
  let n = 0;

  for (const school of DEMO_SCHOOLS) {
    const schoolOffset = (rand() - 0.5) * 160; // arbitrary noise per demo school
    const classes: Record<ClassType, string> = { experimental: `${7 + Math.floor(rand() * 3)}A`, control: `${7 + Math.floor(rand() * 3)}B` };
    for (const date of days) {
      for (const type of ['experimental', 'control'] as ClassType[]) {
        const time = times[Math.floor(rand() * times.length)];
        const students = 18 + Math.floor(rand() * 11);
        const ventilated = rand() < 0.45;
        // Same model for both types → no built-in "plant effect".
        const co2 = 520 + students * 24 + (ventilated ? -120 : 180) + schoolOffset + (rand() - 0.5) * 260;
        out.push({
          id: `demo-${++n}`,
          date, time,
          schoolId: school.id, schoolName: school.name, district: school.district,
          className: classes[type], type,
          students,
          plants: type === 'experimental' ? 6 : 0,
          co2: round(co2, 5),
          temperature: round(20 + rand() * 5, 0.1),
          humidity: round(34 + rand() * 20),
          ventilation: ventilated ? 'yes' : 'no',
          notes: '',
          isDemo: true,
          createdAt: `${date}T${time}:00`,
        });
      }
    }
  }

  // A few intentionally flawed records so the data-quality check has something to show.
  const flaw = (i: number, patch: Partial<Measurement>) => Object.assign(out[i], patch);
  flaw(7, { humidity: null, notes: 'Demo: humidity sensor not read' });
  flaw(33, { students: 0, notes: 'Demo: class count not entered' });
  flaw(58, { co2: 7400, notes: 'Demo: sensor placed near a person' });
  flaw(91, { temperature: null });
  flaw(142, { plants: 0, notes: 'Demo: plants moved for cleaning' });
  return out;
}

export const DEMO_MEASUREMENTS: Measurement[] = generateDemoMeasurements();
