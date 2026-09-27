import { useCountUp } from '@/hooks/useCountUp';

export function StatCard({ label, value, lang }: { label: string; value: number; lang: string }) {
  const shown = useCountUp(value);
  return (
    <div className="flex flex-col justify-between gap-6 border-line py-5 sm:px-6 [&:not(:first-child)]:border-t sm:[&:not(:first-child)]:border-l sm:[&:not(:first-child)]:border-t-0">
      <span className="text-sm text-muted">{label}</span>
      <span className="tabular font-mono text-5xl font-medium tracking-[-0.04em] text-ink">
        {Math.round(shown).toLocaleString(lang === 'ru' ? 'ru-RU' : 'en-GB')}
      </span>
    </div>
  );
}
