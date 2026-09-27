import type { Measurement, MeasurementFilters, SortState } from '@/types';

export const EMPTY_FILTERS: MeasurementFilters = { search: '', district: '', schoolId: '', type: '', dateFrom: '', dateTo: '' };

export const hasActiveFilters = (f: MeasurementFilters) =>
  Object.values(f).some((v) => v !== '');

export function applyFilters(rows: Measurement[], f: MeasurementFilters, districtLabel?: (id: string) => string): Measurement[] {
  const q = f.search.trim().toLowerCase();
  return rows.filter((r) => {
    if (f.district && r.district !== f.district) return false;
    if (f.schoolId && r.schoolId !== f.schoolId) return false;
    if (f.type && r.type !== f.type) return false;
    if (f.dateFrom && r.date < f.dateFrom) return false;
    if (f.dateTo && r.date > f.dateTo) return false;
    if (q) {
      const hay = [r.schoolName, r.className, r.notes, r.district, districtLabel?.(r.district) ?? '', r.date].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function sortMeasurements(rows: Measurement[], sort: SortState): Measurement[] {
  const dir = sort.dir === 'asc' ? 1 : -1;
  return [...rows].sort((a, b) => {
    const av = a[sort.key];
    const bv = b[sort.key];
    // empty values always go last
    if (av === null || av === '') return 1;
    if (bv === null || bv === '') return -1;
    let cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv));
    if (cmp === 0 && sort.key === 'date') cmp = a.time.localeCompare(b.time);
    return cmp * dir;
  });
}
