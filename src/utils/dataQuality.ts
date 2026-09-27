import type { Measurement, QualityIssue } from '@/types';

/**
 * Plausibility limits for classroom readings. Records outside them are FLAGGED,
 * never removed or edited — the researcher decides what to do.
 */
export const QUALITY_LIMITS = {
  co2: { min: 350, max: 5000 },
  temperature: { min: 10, max: 35 },
  humidity: { min: 10, max: 90 },
} as const;

type Checkable = Pick<Measurement, 'co2' | 'temperature' | 'humidity' | 'students' | 'plants' | 'type'>;

export function checkQuality(m: Checkable): QualityIssue[] {
  const issues: QualityIssue[] = [];
  const out = (v: number, r: { min: number; max: number }) => v < r.min || v > r.max;

  if (m.co2 === null) issues.push('missingCo2');
  else if (out(m.co2, QUALITY_LIMITS.co2)) issues.push('co2OutOfRange');

  if (m.temperature === null) issues.push('missingTemperature');
  else if (out(m.temperature, QUALITY_LIMITS.temperature)) issues.push('temperatureOutOfRange');

  if (m.humidity === null) issues.push('missingHumidity');
  else if (out(m.humidity, QUALITY_LIMITS.humidity)) issues.push('humidityOutOfRange');

  if (m.students === null) issues.push('missingStudents');
  else if (m.students === 0) issues.push('zeroStudents');

  if (m.type === 'control' && (m.plants ?? 0) > 0) issues.push('plantsInControl');
  if (m.type === 'experimental' && (m.plants ?? 0) === 0) issues.push('noPlantsInExperimental');

  return issues;
}
