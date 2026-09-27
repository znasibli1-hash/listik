/**
 * Map positions for REAL participating schools, keyed by schoolId
 * (the id is the slug of the school name, e.g. "school-no-12").
 *
 * Coordinates are on the schematic map canvas (x 0–100, y 0–70), not GPS.
 * Leave empty until the team decides what position to publish; schools without
 * a position are listed next to the map but not drawn on it.
 */
export const REAL_SCHOOL_POSITIONS: Record<string, { x: number; y: number }> = {
  // 'school-no-12': { x: 40, y: 38 },
};
