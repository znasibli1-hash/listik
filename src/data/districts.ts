/**
 * Baku districts used in the study. Positions are for the SCHEMATIC map only
 * (a 100 × 70 drawing canvas) — they are not geographic coordinates.
 */
export interface DistrictInfo { id: string; labelX: number; labelY: number; radius: number }

export const DISTRICTS: DistrictInfo[] = [
  { id: 'binagadi', labelX: 26, labelY: 14, radius: 13 },
  { id: 'narimanov', labelX: 52, labelY: 24, radius: 10 },
  { id: 'nasimi', labelX: 43, labelY: 36, radius: 8 },
  { id: 'yasamal', labelX: 27, labelY: 40, radius: 10 },
  { id: 'sabail', labelX: 43, labelY: 50, radius: 8 },
  { id: 'khatai', labelX: 66, labelY: 40, radius: 12 },
];

export const DISTRICT_IDS = DISTRICTS.map((d) => d.id);
