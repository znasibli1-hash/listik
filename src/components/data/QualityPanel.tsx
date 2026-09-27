import { useI18n } from '@/context/I18nContext';
import { Switch } from '@/components/ui/Field';
import { fill } from '@/utils/format';
import type { QualityIssue } from '@/types';

interface Props { flagged: number; total: number; counts: Map<QualityIssue, number>; onlyFlagged: boolean; onOnlyFlagged: (v: boolean) => void }

export function QualityPanel({ flagged, total, counts, onlyFlagged, onOnlyFlagged }: Props) {
  const { t } = useI18n();
  if (flagged === 0) {
    return <p className="rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-muted">✓ {t.quality.allClear}</p>;
  }
  return (
    <section className="rounded-2xl border border-signal/30 bg-signal-soft px-4 py-3.5" aria-labelledby="quality-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="quality-title" className="font-semibold">{t.quality.title}</h2>
          <p className="text-sm">{fill(t.quality.summary, { n: flagged, total })}</p>
        </div>
        <Switch checked={onlyFlagged} onChange={onOnlyFlagged} label={t.quality.showFlagged} />
      </div>
      <ul className="mt-3 flex flex-wrap gap-2">
        {[...counts].map(([issue, n]) => (
          <li key={issue} className="rounded-full bg-surface/80 px-3 py-1 text-xs"><span className="font-mono font-medium">{n}</span> · {t.quality.issues[issue]}</li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-muted">{t.quality.note}</p>
    </section>
  );
}
