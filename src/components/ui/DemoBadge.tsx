import { useI18n } from '@/context/I18nContext';

export function DemoBadge({ className = '' }: { className?: string }) {
  const { t } = useI18n();
  return (
    <span className={`inline-flex items-center rounded-md border border-signal/40 bg-signal-soft px-1.5 py-0.5 font-mono text-[10px] font-medium leading-none text-signal ${className}`}>
      {t.common.demo}
    </span>
  );
}

/** Full-width notice shown wherever demo records are on screen. */
export function DemoNotice({ extra }: { extra?: string }) {
  const { t } = useI18n();
  return (
    <div role="note" className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl border border-signal/30 bg-signal-soft px-4 py-2.5 text-sm text-ink">
      <DemoBadge />
      <span className="font-medium">{t.common.demoWarning}</span>
      {extra && <span className="text-muted">{extra}</span>}
    </div>
  );
}
