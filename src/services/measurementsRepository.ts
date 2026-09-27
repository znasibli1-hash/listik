/**
 * Data access layer. The rest of the app talks ONLY to `measurementsRepository`,
 * so switching from localStorage to a real backend means replacing this file.
 *
 * ─── BACKEND HOOK ───────────────────────────────────────────────────────────
 * Implement `MeasurementsRepository` with fetch() calls, e.g.:
 *   list:   GET    /api/measurements
 *   add:    POST   /api/measurements
 *   remove: DELETE /api/measurements/:id
 * and export it instead of `localRepository` at the bottom of this file.
 * ────────────────────────────────────────────────────────────────────────────
 */
import type { Measurement, NewMeasurement } from '@/types';
import { slugify } from '@/utils/format';

export interface MeasurementsRepository {
  /** Real (non-demo) measurements only. Demo data lives in data/demoData.ts. */
  list(): Promise<Measurement[]>;
  add(input: NewMeasurement): Promise<Measurement>;
  addMany(inputs: NewMeasurement[]): Promise<Measurement[]>;
  remove(id: string): Promise<void>;
}

const STORAGE_KEY = 'listik.measurements.v1';

function readStore(): Measurement[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as Measurement[]) : [];
  } catch {
    return [];
  }
}

function writeStore(rows: Measurement[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(rows)); } catch { /* storage full or blocked: keep in memory */ }
}

const newId = () => (crypto?.randomUUID ? crypto.randomUUID() : `m-${Date.now()}-${Math.random().toString(36).slice(2)}`);

function toMeasurement(input: NewMeasurement): Measurement {
  return {
    ...input,
    schoolId: input.schoolId || slugify(input.schoolName),
    schoolName: input.schoolName.trim(),
    className: input.className.trim(),
    notes: input.notes.trim(),
    id: newId(),
    isDemo: false,
    createdAt: new Date().toISOString(),
  };
}

let memory: Measurement[] | null = null;
const current = () => (memory ??= readStore());

const localRepository: MeasurementsRepository = {
  async list() { return [...current()]; },
  async add(input) {
    const m = toMeasurement(input);
    memory = [...current(), m]; writeStore(memory);
    return m;
  },
  async addMany(inputs) {
    const created = inputs.map(toMeasurement);
    memory = [...current(), ...created]; writeStore(memory);
    return created;
  },
  async remove(id) {
    memory = current().filter((m) => m.id !== id); writeStore(memory);
  },
};

export const measurementsRepository: MeasurementsRepository = localRepository;
