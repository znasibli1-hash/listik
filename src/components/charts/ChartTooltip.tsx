import type { TooltipProps } from 'recharts';
import { useI18n } from '@/context/I18nContext';
import { formatNumber } from '@/utils/format';

interface Props extends TooltipProps<number, string> { labelFormatter?: (label: string) => string; units?: Record<string, string> }

/** Shared tooltip look for every chart. */
export function ChartTooltip({ active, payload, label, labelFormatter, units = {} }: Props) {
  const { lang } = useI18n();
  if (!active || !payload?.length) return null;
  return (
    <div className="min-w-[150px] rounded-xl border border-line bg-surface px-3 py-2.5 text-xs shadow-lg">
      <p className="mb-1.5 font-medium text-ink">{labelFormatter ? labelFormatter(String(label)) : label}</p>
      <ul className="grid gap-1">
        {payload.map((p) => (
          <li key={String(p.dataKey)} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-muted"><span className="h-2 w-2 rounded-full" style={{ background: p.color }} />{p.name}</span>
            <span className="font-mono font-medium text-ink">{formatNumber(p.value as number, lang, String(p.dataKey) === 'temperature' ? 1 : 0)} {units[String(p.dataKey)] ?? ''}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Small inline legend that doubles as a series toggle. */
export function SeriesLegend({ items, hidden, onToggle }: { items: { key: string; label: string; color: string }[]; hidden: Set<string>; onToggle: (key: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((i) => (
        <button key={i.key} onClick={() => onToggle(i.key)} aria-pressed={!hidden.has(i.key)}
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-opacity ${hidden.has(i.key) ? 'border-line opacity-45' : 'border-line bg-sunken/60'}`}>
          <span className="h-2 w-2 rounded-full" style={{ background: i.color }} />{i.label}
        </button>
      ))}
    </div>
  );
}
