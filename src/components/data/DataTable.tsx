import { useState } from 'react';
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { useI18n } from '@/context/I18nContext';
import { DemoBadge } from '@/components/ui/DemoBadge';
import { QualityIcon } from './QualityIcon';
import { formatDate, formatNumber, fill } from '@/utils/format';
import { checkQuality } from '@/utils/dataQuality';
import type { Measurement, SortKey, SortState } from '@/types';

type ColumnKey = SortKey | 'ventilation' | 'notes';
interface Column { key: ColumnKey; sortable: boolean; numeric?: boolean; className?: string }
const COLUMNS: Column[] = [
  { key: 'date', sortable: true },
  { key: 'schoolName', sortable: true },
  { key: 'district', sortable: true },
  { key: 'className', sortable: true },
  { key: 'type', sortable: true },
  { key: 'students', sortable: true, numeric: true },
  { key: 'plants', sortable: true, numeric: true },
  { key: 'co2', sortable: true, numeric: true },
  { key: 'temperature', sortable: true, numeric: true },
  { key: 'humidity', sortable: true, numeric: true },
  { key: 'ventilation', sortable: false },
  { key: 'notes', sortable: false, className: 'min-w-[180px]' },
];

function TypePill({ type }: { type: Measurement['type'] }) {
  const { t } = useI18n();
  const leaf = type === 'experimental';
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${leaf ? 'bg-leaf-soft text-ink' : 'bg-sunken text-ink'}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${leaf ? 'bg-leaf' : 'bg-control'}`} />
      {leaf ? t.common.experimental : t.common.control}
    </span>
  );
}

interface Props {
  rows: Measurement[];
  sort: SortState;
  onSort: (key: SortKey) => void;
  page: number;
  pageSize: number;
  total: number;
  onPage: (p: number) => void;
  onPageSize: (n: number) => void;
  onDelete: (m: Measurement) => void;
}

export function DataTable({ rows, sort, onSort, page, pageSize, total, onPage, onPageSize, onDelete }: Props) {
  const { t, lang, district } = useI18n();
  // two-step delete without window.confirm (blocked in some embedded viewers)
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const askDelete = (m: Measurement) => { if (confirmId === m.id) { setConfirmId(null); onDelete(m); } else setConfirmId(m.id); };
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);

  const cell = (m: Measurement, key: ColumnKey) => {
    switch (key) {
      case 'date': return <span className="whitespace-nowrap">{formatDate(m.date, lang)} <span className="text-muted">{m.time}</span></span>;
      case 'schoolName': return <span className="flex items-center gap-1.5 whitespace-nowrap">{m.schoolName}{m.isDemo && <DemoBadge />}</span>;
      case 'district': return district(m.district);
      case 'type': return <TypePill type={m.type} />;
      case 'co2': return <span className="font-mono font-medium">{formatNumber(m.co2, lang)}</span>;
      case 'temperature': return formatNumber(m.temperature, lang, 1);
      case 'humidity': return formatNumber(m.humidity, lang);
      case 'ventilation': return t.data.ventilationShort[m.ventilation];
      case 'notes': return <span className="line-clamp-2 text-muted">{m.notes}</span>;
      default: { const v = m[key]; return v === null || v === '' ? '—' : String(v); }
    }
  };

  return (
    <div className="overflow-hidden rounded-panel border border-line bg-surface">
      {/* desktop / tablet: real table with horizontal scroll */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[1080px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-line bg-sunken/60 text-left">
              <th className="w-8 px-3 py-3" aria-label="Quality" />
              {COLUMNS.map((c) => {
                const active = sort.key === c.key;
                const label = t.data.columns[c.key];
                return (
                  <th key={c.key} scope="col" aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined}
                    className={`px-3 py-3 font-medium text-muted ${c.numeric ? 'text-right' : ''} ${c.className ?? ''}`}>
                    {c.sortable ? (
                      <button onClick={() => onSort(c.key as SortKey)} className={`inline-flex items-center gap-1 whitespace-nowrap hover:text-ink ${active ? 'text-ink' : ''}`}>
                        {label}
                        {active ? (sort.dir === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />) : <span className="w-[13px]" />}
                      </button>
                    ) : <span className="whitespace-nowrap">{label}</span>}
                  </th>
                );
              })}
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {rows.map((m) => (
              <tr key={m.id} className="group border-b border-line/70 last:border-0 hover:bg-leaf-soft/40">
                <td className="px-3 py-2.5"><QualityIcon issues={checkQuality(m)} /></td>
                {COLUMNS.map((c) => (
                  <td key={c.key} className={`px-3 py-2.5 ${c.numeric ? 'tabular text-right' : ''} ${c.className ?? ''}`}>{cell(m, c.key)}</td>
                ))}
                <td className="px-2">
                  {!m.isDemo && (confirmId === m.id ? (
                    <button onClick={() => askDelete(m)} onBlur={() => setConfirmId(null)} autoFocus className="whitespace-nowrap rounded-full bg-danger px-2.5 py-1 text-xs font-medium text-white">{t.common.delete}?</button>
                  ) : (
                    <button onClick={() => askDelete(m)} aria-label={t.common.delete} className="grid h-8 w-8 place-items-center rounded-full text-muted opacity-0 hover:bg-sunken hover:text-danger focus:opacity-100 group-hover:opacity-100">
                      <Trash2 size={15} />
                    </button>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* mobile: cards */}
      <ul className="divide-y divide-line md:hidden">
        {rows.map((m) => {
          const issues = checkQuality(m);
          return (
            <li key={m.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 truncate font-medium">{m.schoolName}{m.isDemo && <DemoBadge />}</p>
                  <p className="text-sm text-muted">{district(m.district)} · {m.className} · {formatDate(m.date, lang)} {m.time}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-xl font-medium tabular">{formatNumber(m.co2, lang)}</p>
                  <p className="text-xs text-muted">ppm</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                <TypePill type={m.type} />
                <span><span className="text-muted">{t.data.columns.students}: </span>{m.students ?? '—'}</span>
                <span><span className="text-muted">🌿 </span>{m.plants ?? '—'}</span>
                <span>{formatNumber(m.temperature, lang, 1)} °C</span>
                <span>{formatNumber(m.humidity, lang)} %</span>
                <span><span className="text-muted">{t.data.columns.ventilation}: </span>{t.data.ventilationShort[m.ventilation]}</span>
              </div>
              {m.notes && <p className="mt-2 text-sm text-muted">{m.notes}</p>}
              {(issues.length > 0 || !m.isDemo) && (
                <div className="mt-2 flex items-center justify-between">
                  {issues.length > 0 ? <p className="flex items-center gap-1.5 text-xs text-signal"><QualityIcon issues={issues} />{issues.map((i) => t.quality.issues[i]).join('; ')}</p> : <span />}
                  {!m.isDemo && <button onClick={() => askDelete(m)} className={`inline-flex items-center gap-1 text-xs ${confirmId === m.id ? 'rounded-full bg-danger px-2 py-0.5 text-white' : 'text-muted hover:text-danger'}`}><Trash2 size={13} />{t.common.delete}{confirmId === m.id && '?'}</button>}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {/* pagination */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3 text-sm">
        <div className="flex items-center gap-2 text-muted">
          <label htmlFor="page-size">{t.data.rowsPerPage}</label>
          <select id="page-size" value={pageSize} onChange={(e) => onPageSize(Number(e.target.value))} className="field h-8 w-auto py-0 pr-2">
            {[10, 25, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
          <span className="tabular ml-2">{fill(t.data.showing, { from, to, total })}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="tabular mr-2 text-muted">{fill(t.data.page, { page, pages })}</span>
          <button disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label={t.data.prev} className="grid h-8 w-8 place-items-center rounded-full border border-line hover:border-leaf disabled:opacity-40"><ChevronLeft size={16} /></button>
          <button disabled={page >= pages} onClick={() => onPage(page + 1)} aria-label={t.data.next} className="grid h-8 w-8 place-items-center rounded-full border border-line hover:border-leaf disabled:opacity-40"><ChevronRight size={16} /></button>
        </div>
      </div>
    </div>
  );
}
