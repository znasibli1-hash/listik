import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { Download, Plus, Upload } from 'lucide-react';
import { useI18n } from '@/context/I18nContext';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { DemoNotice } from '@/components/ui/DemoBadge';
import { Switch } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { FilterBar } from '@/components/data/FilterBar';
import { DataTable } from '@/components/data/DataTable';
import { MeasurementForm } from '@/components/data/MeasurementForm';
import { QualityPanel } from '@/components/data/QualityPanel';
import { applyFilters, EMPTY_FILTERS, sortMeasurements } from '@/utils/filters';
import { checkQuality } from '@/utils/dataQuality';
import { csvToMeasurements, measurementsToCsv } from '@/utils/csv';
import { saveCsv } from '@/services/fileDownload';
import { fill, todayIso } from '@/utils/format';
import type { Measurement, MeasurementFilters, QualityIssue, SortKey, SortState } from '@/types';

export function DataPage() {
  const { t, district } = useI18n();
  const { measurements, realMeasurements, showDemo, setShowDemo, removeMeasurement, addMany } = useData();
  const toast = useToast();
  const fileInput = useRef<HTMLInputElement>(null);

  const [filters, setFilters] = useState<MeasurementFilters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<SortState>({ key: 'date', dir: 'desc' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [onlyFlagged, setOnlyFlagged] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  const filtered = useMemo(() => applyFilters(measurements, filters, district), [measurements, filters, district]);

  const quality = useMemo(() => {
    const counts = new Map<QualityIssue, number>();
    const flaggedIds = new Set<string>();
    for (const m of filtered) {
      const issues = checkQuality(m);
      if (issues.length) flaggedIds.add(m.id);
      for (const i of issues) counts.set(i, (counts.get(i) ?? 0) + 1);
    }
    return { counts, flaggedIds };
  }, [filtered]);

  const visible = useMemo(() => {
    const base = onlyFlagged ? filtered.filter((m) => quality.flaggedIds.has(m.id)) : filtered;
    return sortMeasurements(base, sort);
  }, [filtered, onlyFlagged, quality, sort]);

  const pages = Math.max(1, Math.ceil(visible.length / pageSize));
  useEffect(() => { setPage(1); }, [filters, onlyFlagged, pageSize, showDemo]);
  useEffect(() => { if (page > pages) setPage(pages); }, [page, pages]);
  const pageRows = visible.slice((page - 1) * pageSize, page * pageSize);

  const onSort = (key: SortKey) => setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: key === 'date' ? 'desc' : 'asc' }));

  const exportCsv = async () => {
    const ok = await saveCsv(`listik-measurements-${todayIso()}.csv`, measurementsToCsv(visible));
    if (ok) toast(fill(t.data.exported, { n: visible.length }));
  };

  const importCsv = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const rows = csvToMeasurements(await file.text()).filter((r) => r.date && r.schoolName);
      if (!rows.length) throw new Error('empty');
      const n = await addMany(rows);
      toast(fill(t.data.importDone, { n }));
    } catch {
      toast(t.data.importFailed, 'warn');
    }
  };

  const onDelete = async (m: Measurement) => {
    await removeMeasurement(m.id);
    toast(t.data.deleted);
  };

  const demoInView = showDemo && measurements.some((m) => m.isDemo);

  return (
    <>
      <PageHeader title={t.data.title} subtitle={t.data.subtitle} actions={
        <>
          <Button variant="secondary" size="sm" icon={<Upload size={15} />} onClick={() => fileInput.current?.click()}>{t.data.importCsv}</Button>
          <Button variant="secondary" size="sm" icon={<Download size={15} />} onClick={exportCsv} disabled={!visible.length}>{t.data.exportCsv}</Button>
          <Button size="sm" icon={<Plus size={16} />} onClick={() => setFormOpen(true)}>{t.data.add}</Button>
          <input ref={fileInput} type="file" accept=".csv,text/csv" hidden onChange={importCsv} />
        </>
      } />

      <div className="grid gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Switch checked={showDemo} onChange={setShowDemo} label={t.common.showDemo} />
          <p className="font-mono text-xs text-muted">
            {fill(t.data.realCount, { n: realMeasurements.length })}{showDemo && ` · ${fill(t.data.demoCount, { n: measurements.length - realMeasurements.length })}`}
          </p>
        </div>
        {demoInView && <DemoNotice />}
        <FilterBar filters={filters} onChange={setFilters} withSearch idPrefix="data" />
        <QualityPanel flagged={quality.flaggedIds.size} total={filtered.length} counts={quality.counts} onlyFlagged={onlyFlagged} onOnlyFlagged={setOnlyFlagged} />
        {visible.length ? (
          <DataTable rows={pageRows} sort={sort} onSort={onSort} page={page} pageSize={pageSize} total={visible.length}
            onPage={setPage} onPageSize={setPageSize} onDelete={onDelete} />
        ) : (
          <div className="rounded-panel border border-line bg-surface">
            {measurements.length
              ? <EmptyState icon="🔍" title={t.common.noDataTitle} body={t.common.noDataBody} action={<Button variant="secondary" size="sm" onClick={() => { setFilters(EMPTY_FILTERS); setOnlyFlagged(false); }}>{t.common.clearFilters}</Button>} />
              : <EmptyState title={t.results.inProgress} body={t.form.subtitle} action={<Button size="sm" icon={<Plus size={16} />} onClick={() => setFormOpen(true)}>{t.data.add}</Button>} />}
          </div>
        )}
      </div>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={t.form.title} subtitle={t.form.subtitle} closeLabel={t.common.close}>
        <MeasurementForm onCancel={() => setFormOpen(false)} onSaved={() => {
          setFormOpen(false);
          // show the new record right away: newest first, first page
          setSort({ key: 'date', dir: 'desc' }); setFilters(EMPTY_FILTERS); setOnlyFlagged(false); setPage(1);
          toast(t.form.saved);
        }} />
      </Modal>
    </>
  );
}
