import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { DEMO_MEASUREMENTS, DEMO_SCHOOLS, INCLUDE_DEMO_BY_DEFAULT } from '@/data/demoData';
import { REAL_SCHOOL_POSITIONS } from '@/data/schools';
import { measurementsRepository } from '@/services/measurementsRepository';
import type { Measurement, NewMeasurement, School } from '@/types';

interface DataValue {
  /** What the UI shows: real data plus demo data when the demo toggle is on. */
  measurements: Measurement[];
  /** Real measurements only — used for Home counters and Results. */
  realMeasurements: Measurement[];
  schools: School[];
  showDemo: boolean;
  setShowDemo: (v: boolean) => void;
  addMeasurement: (m: NewMeasurement) => Promise<Measurement>;
  addMany: (m: NewMeasurement[]) => Promise<number>;
  removeMeasurement: (id: string) => Promise<void>;
  loading: boolean;
}

const DataContext = createContext<DataValue | null>(null);
const DEMO_KEY = 'listik.showDemo';

export function DataProvider({ children }: { children: ReactNode }) {
  const [realMeasurements, setReal] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDemo, setShowDemoState] = useState<boolean>(() => {
    try { const s = localStorage.getItem(DEMO_KEY); return s === null ? INCLUDE_DEMO_BY_DEFAULT : s === '1'; } catch { return INCLUDE_DEMO_BY_DEFAULT; }
  });

  useEffect(() => {
    measurementsRepository.list().then(setReal).finally(() => setLoading(false));
  }, []);

  const setShowDemo = useCallback((v: boolean) => {
    setShowDemoState(v);
    try { localStorage.setItem(DEMO_KEY, v ? '1' : '0'); } catch { /* ignore */ }
  }, []);

  const addMeasurement = useCallback(async (input: NewMeasurement) => {
    const saved = await measurementsRepository.add(input);
    setReal((r) => [...r, saved]);
    return saved;
  }, []);

  const addMany = useCallback(async (inputs: NewMeasurement[]) => {
    const saved = await measurementsRepository.addMany(inputs);
    setReal((r) => [...r, ...saved]);
    return saved.length;
  }, []);

  const removeMeasurement = useCallback(async (id: string) => {
    await measurementsRepository.remove(id);
    setReal((r) => r.filter((m) => m.id !== id));
  }, []);

  const measurements = useMemo(
    () => (showDemo ? [...DEMO_MEASUREMENTS, ...realMeasurements] : realMeasurements),
    [showDemo, realMeasurements],
  );

  const schools = useMemo<School[]>(() => {
    const real = new Map<string, School>();
    for (const m of realMeasurements) {
      if (real.has(m.schoolId)) continue;
      const pos = REAL_SCHOOL_POSITIONS[m.schoolId];
      real.set(m.schoolId, { id: m.schoolId, name: m.schoolName, district: m.district, mapX: pos?.x ?? NaN, mapY: pos?.y ?? NaN, isDemo: false });
    }
    return [...(showDemo ? DEMO_SCHOOLS : []), ...real.values()];
  }, [realMeasurements, showDemo]);

  const value = { measurements, realMeasurements, schools, showDemo, setShowDemo, addMeasurement, addMany, removeMeasurement, loading };
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside DataProvider');
  return ctx;
}
