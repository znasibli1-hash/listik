import type { Language } from '@/types';

/** Replace {key} placeholders: fill('{n} rows', { n: 3 }) → '3 rows' */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => (key in vars ? String(vars[key]) : `{${key}}`));
}

const locale = (lang: Language) => (lang === 'ru' ? 'ru-RU' : 'en-GB');

export function formatNumber(value: number | null | undefined, lang: Language, digits = 0): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return value.toLocaleString(locale(lang), { maximumFractionDigits: digits, minimumFractionDigits: digits });
}

export function formatSigned(value: number | null, lang: Language, digits = 0): string {
  if (value === null || Number.isNaN(value)) return '—';
  const s = formatNumber(Math.abs(value), lang, digits);
  return value > 0 ? `+${s}` : value < 0 ? `−${s}` : s;
}

/** YYYY-MM-DD → "7 Sep 2026" / "7 сент. 2026" (parsed as UTC to avoid timezone shifts) */
export function formatDate(iso: string, lang: Language, withYear = true): string {
  if (!iso) return '—';
  const d = new Date(iso + 'T00:00:00Z');
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(locale(lang), { day: 'numeric', month: 'short', ...(withYear ? { year: 'numeric' } : {}), timeZone: 'UTC' });
}

export function todayIso(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function nowTime(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function slugify(text: string): string {
  return text.trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '') || 'school';
}
