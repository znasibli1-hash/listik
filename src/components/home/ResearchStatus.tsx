import { Check } from 'lucide-react';
import { useI18n } from '@/context/I18nContext';
import { PROJECT } from '@/config/project';
import type { ResearchStage } from '@/types';

export function StatusChip() {
  const { t } = useI18n();
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-leaf/30 bg-leaf-soft px-3 py-1 font-mono text-[11px] font-medium tracking-wide text-ink">
      <span className="h-2 w-2 animate-pulseDot rounded-full bg-leaf" />
      {t.home.status}
    </span>
  );
}

const ORDER = ['planning', 'collection', 'analysis', 'results'] as const;

export function ResearchTracker() {
  const { t } = useI18n();
  return (
    <ol className="grid gap-px overflow-hidden rounded-panel border border-line bg-line sm:grid-cols-4">
      {ORDER.map((key, i) => {
        const state: ResearchStage = PROJECT.stages[key];
        return (
          <li key={key} className={`flex items-center gap-3 p-5 sm:flex-col sm:items-start ${state === 'active' ? 'bg-leaf-soft' : 'bg-surface'}`}>
            <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border font-mono text-xs ${
              state === 'done' ? 'border-leaf bg-leaf text-white' : state === 'active' ? 'border-leaf text-leaf' : 'border-line text-muted'}`}>
              {state === 'done' ? <Check size={15} strokeWidth={2.5} /> : state === 'active' ? <span className="h-2 w-2 animate-pulseDot rounded-full bg-leaf" /> : i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-medium">{t.home.stages[key]}</p>
              <p className={`text-sm ${state === 'active' ? 'text-leaf' : 'text-muted'}`}>{t.home.stageState[state]}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
