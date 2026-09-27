export type ClassType = 'experimental' | 'control';
export type Ventilation = 'yes' | 'no' | 'unknown';
export type Language = 'ru' | 'en';

/** One CO₂ reading in one classroom at one moment. */
export interface Measurement {
  id: string;
  /** ISO date, YYYY-MM-DD */
  date: string;
  /** HH:mm, local school time */
  time: string;
  schoolId: string;
  schoolName: string;
  district: string;
  /** Classroom label, e.g. "7A" or "Room 204" */
  className: string;
  type: ClassType;
  students: number | null;
  plants: number | null;
  co2: number | null;
  temperature: number | null;
  humidity: number | null;
  /** Was the room ventilated during the previous hour? */
  ventilation: Ventilation;
  notes: string;
  /** true = generated demonstration record, never a real reading */
  isDemo: boolean;
  createdAt: string;
}

export type NewMeasurement = Omit<Measurement, 'id' | 'createdAt' | 'isDemo'>;

export interface School {
  id: string;
  name: string;
  district: string;
  /** Position on the schematic map, 0–100 in both axes. NOT real geo coordinates. */
  mapX: number;
  mapY: number;
  isDemo: boolean;
}

export interface MeasurementFilters {
  search: string;
  district: string; // '' = all
  schoolId: string; // '' = all
  type: '' | ClassType;
  dateFrom: string;
  dateTo: string;
}

export type SortKey = keyof Pick<
  Measurement,
  'date' | 'schoolName' | 'district' | 'className' | 'type' | 'students' | 'plants' | 'co2' | 'temperature' | 'humidity'
>;
export interface SortState { key: SortKey; dir: 'asc' | 'desc' }

export type QualityIssue =
  | 'missingCo2' | 'missingTemperature' | 'missingHumidity' | 'zeroStudents' | 'missingStudents'
  | 'co2OutOfRange' | 'temperatureOutOfRange' | 'humidityOutOfRange'
  | 'plantsInControl' | 'noPlantsInExperimental';

export type RouteId = 'home' | 'research' | 'data' | 'dashboard' | 'map' | 'methodology' | 'results';

export type ResearchStage = 'done' | 'active' | 'pending';
