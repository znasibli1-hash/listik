import { useI18n } from '@/context/I18nContext';

export function LimitationsBlock() {
  const { t } = useI18n();
  return (
    <section className="rounded-panel border border-signal/30 bg-signal-soft p-6 sm:p-8" aria-labelledby="limits">
      <h3 id="limits" className="text-xl font-semibold tracking-[-0.02em]">{t.limitations.title}</h3>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {t.limitations.items.map((item) => (
          <li key={item} className="flex gap-3 rounded-2xl bg-surface/70 p-4 text-[15px] leading-relaxed">
            <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-signal" />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
