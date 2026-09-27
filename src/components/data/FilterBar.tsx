import { SlidersHorizontal, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useI18n } from '@/context/I18nContext';
import { useData } from '@/context/DataContext';
import { SelectField, InputField } from '@/components/ui/Field';
import { hasActiveFilters, EMPTY_FILTERS } from '@/utils/filters';
import type { MeasurementFilters } from '@/types';

interface Props { filters: MeasurementFilters; onChange: (f: MeasurementFilters) => void; withSearch?: boolean; idPrefix: string }

/** Shared filter controls for the Data table and the Dashboard. */
export function FilterBar({ filters, onChange, withSearch = false, idPrefix }: Props) {
  const { t, district } = useI18n();
  const { measurements } = useData();
  const [open, setOpen] = useState(false); // phones: filters collapsed by default
  const active = Object.entries(filters).filter(([k, v]) => k !== 'search' && v !== '').length;
  const set = <K extends keyof MeasurementFilters>(key: K, value: MeasurementFilters[K]) => {
    const next = { ...filters, [key]: value };
    // a school outside the chosen district would give an empty result — reset it
    if (key === 'district' && value && filters.schoolId && !measurements.some((m) => m.schoolId === filters.schoolId && m.district === value)) next.schoolId = '';
    onChange(next);
  };

  const districts = useMemo(() => [...new Set(measurements.map((m) => m.district))].sort((a, b) => district(a).localeCompare(district(b))), [measurements, district]);
  const schools = useMemo(() => {
    const map = new Map<string, string>();
    for (const m of measurements) if (!filters.district || m.district === filters.district) map.set(m.schoolId, m.schoolName);
    return [...map].sort((a, b) => a[1].localeCompare(b[1]));
  }, [measurements, filters.district]);

  const searchBox = (suffix: string) => withSearch && (
    <div>
      <label htmlFor={`${idPrefix}-search${suffix}`} className="mb-1.5 block text-[13px] font-medium text-muted">{t.data.searchLabel}</label>
      <div className="relative">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input id={`${idPrefix}-search${suffix}`} type="search" value={filters.search} onChange={(e) => set('search', e.target.value)}
          placeholder={t.data.search} className="field h-10 pl-9" />
      </div>
    </div>
  );

  return (
    <div className="rounded-panel border border-line bg-surface p-4">
      {/* phones: search stays visible, the rest folds away */}
      <div className="grid gap-3 md:hidden">
        {searchBox('-m')}
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open}
          className="flex w-full items-center justify-between rounded-[10px] py-1 text-sm font-medium">
          <span className="flex items-center gap-2"><SlidersHorizontal size={16} />{t.common.filters}{active > 0 && <span className="rounded-full bg-leaf px-1.5 text-xs text-white">{active}</span>}</span>
          <span className="text-lg leading-none text-muted">{open ? '−' : '+'}</span>
        </button>
      </div>
      <div className={`${open ? 'mt-3 grid' : 'hidden'} grid-cols-2 gap-3 md:mt-0 md:grid ${withSearch ? 'md:grid-cols-3 xl:grid-cols-[1.6fr_1fr_1fr_1fr_1fr_1fr]' : 'md:grid-cols-3 xl:grid-cols-5'}`}>
        {withSearch && <div className="hidden md:block md:col-span-3 xl:col-span-1">{searchBox('')}</div>}
        <SelectField id={`${idPrefix}-district`} label={t.data.district} value={filters.district} onChange={(e) => set('district', e.target.value)}>
          <option value="">{t.common.all}</option>
          {districts.map((d) => <option key={d} value={d}>{district(d)}</option>)}
        </SelectField>
        <SelectField id={`${idPrefix}-school`} label={t.data.school} value={filters.schoolId} onChange={(e) => set('schoolId', e.target.value)}>
          <option value="">{t.common.all}</option>
          {schools.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
        </SelectField>
        <SelectField id={`${idPrefix}-type`} label={t.data.type} value={filters.type} onChange={(e) => set('type', e.target.value as MeasurementFilters['type'])}>
          <option value="">{t.common.all}</option>
          <option value="experimental">{t.common.experimental}</option>
          <option value="control">{t.common.control}</option>
        </SelectField>
        <InputField id={`${idPrefix}-from`} label={t.data.from} type="date" value={filters.dateFrom} max={filters.dateTo || undefined} onChange={(e) => set('dateFrom', e.target.value)} />
        <InputField id={`${idPrefix}-to`} label={t.data.to} type="date" value={filters.dateTo} min={filters.dateFrom || undefined} onChange={(e) => set('dateTo', e.target.value)} />
      </div>
      {hasActiveFilters(filters) && (
        <button onClick={() => onChange(EMPTY_FILTERS)} className="mt-3 inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
          <X size={14} />{t.common.clearFilters}
        </button>
      )}
    </div>
  );
}
