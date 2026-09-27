import type { ClassType, Measurement, NewMeasurement, Ventilation } from '@/types';

/** Column order for export AND import. Keep them in sync. */
export const CSV_COLUMNS = [
  'date', 'time', 'schoolId', 'schoolName', 'district', 'className', 'type', 'students', 'plants',
  'co2', 'temperature', 'humidity', 'ventilation', 'notes', 'isDemo',
] as const;

const escape = (value: unknown) => {
  const s = value === null || value === undefined ? '' : String(value);
  return /[",\n\r;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function measurementsToCsv(rows: Measurement[]): string {
  const lines = [CSV_COLUMNS.join(',')];
  for (const r of rows) lines.push(CSV_COLUMNS.map((c) => escape(r[c])).join(','));
  return lines.join('\r\n');
}

/** Minimal RFC-4180 parser (quotes, escaped quotes, commas/newlines inside quotes). */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = []; let cell = ''; let quoted = false;
  const src = text.replace(/^\uFEFF/, '');
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"' && src[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && src[i + 1] === '\n') i++;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else cell += ch;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ''));
}

const num = (s: string | undefined) => {
  if (s === undefined || s.trim() === '') return null;
  const n = Number(s.replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};

/** Turn an exported CSV back into measurements. Throws if required columns are missing. */
export function csvToMeasurements(text: string): NewMeasurement[] {
  const [header, ...body] = parseCsv(text);
  if (!header) throw new Error('empty');
  const idx = (name: string) => header.findIndex((h) => h.trim() === name);
  for (const required of ['date', 'schoolName', 'district', 'type', 'co2']) if (idx(required) < 0) throw new Error(`missing ${required}`);
  const get = (row: string[], name: string) => { const i = idx(name); return i >= 0 ? row[i]?.trim() ?? '' : ''; };

  return body.map((row) => {
    const type = get(row, 'type') === 'control' ? 'control' : 'experimental';
    const vent = get(row, 'ventilation');
    return {
      date: get(row, 'date'),
      time: get(row, 'time') || '00:00',
      schoolId: get(row, 'schoolId'),
      schoolName: get(row, 'schoolName'),
      district: get(row, 'district'),
      className: get(row, 'className'),
      type: type as ClassType,
      students: num(get(row, 'students')),
      plants: num(get(row, 'plants')),
      co2: num(get(row, 'co2')),
      temperature: num(get(row, 'temperature')),
      humidity: num(get(row, 'humidity')),
      ventilation: (vent === 'yes' || vent === 'no' ? vent : 'unknown') as Ventilation,
      notes: get(row, 'notes'),
    };
  });
}

/**
 * Hand a text file to the viewer. Uses a normal download link; when the page
 * runs inside the hosted Claude artifact viewer, `saveFile` from the runtime is
 * preferred (see services/fileDownload.ts).
 */
export function downloadText(filename: string, text: string, mime = 'text/csv;charset=utf-8') {
  const blob = new Blob(['\uFEFF' + text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
