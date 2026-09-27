import { useI18n } from '@/context/I18nContext';

function ClassBox({ tone, title, sub, plant }: { tone: 'control' | 'leaf'; title: string; sub: string; plant: boolean }) {
  const { t } = useI18n();
  const border = tone === 'leaf' ? 'border-leaf/50' : 'border-control/50';
  const dot = tone === 'leaf' ? 'bg-leaf' : 'bg-control';
  return (
    <div className="flex flex-col items-center">
      <div className={`w-full rounded-[18px] border-2 ${border} bg-surface p-5 text-center`}>
        <div className="flex items-center justify-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
          <span className="font-semibold">{title}</span>
        </div>
        <p className="mt-1 text-sm text-muted">{plant ? '🌿 ' : '∅ '}{sub}</p>
        {/* little classroom plan: desks + optional plants */}
        <div className="mx-auto mt-4 grid w-fit grid-cols-4 gap-1.5" aria-hidden>
          {Array.from({ length: 12 }).map((_, i) => <span key={i} className="h-2.5 w-4 rounded-[3px] bg-sunken" />)}
        </div>
        <div className="mt-2 flex h-4 justify-center gap-1 text-xs" aria-hidden>{plant && '🌿🌿🌿'}</div>
      </div>
      <div className="h-8 w-px bg-line" />
      <div className="rounded-full border border-line bg-sunken px-3 py-1.5 font-mono text-xs text-ink">{t.research.measure}</div>
    </div>
  );
}

export function ExperimentDiagram() {
  const { t } = useI18n();
  return (
    <div className="lab-grid rounded-panel border border-line bg-surface p-5 sm:p-8">
      <div className="grid items-start gap-6 sm:grid-cols-[1fr_auto_1fr]">
        <ClassBox tone="control" title={t.research.control} sub={t.research.controlSub} plant={false} />
        <div className="self-center text-center font-mono text-sm text-muted">vs.</div>
        <ClassBox tone="leaf" title={t.research.experimental} sub={t.research.experimentalSub} plant />
      </div>
      {/* joiner */}
      <div className="relative mx-auto hidden h-10 w-1/2 sm:block" aria-hidden>
        <div className="absolute inset-x-0 top-0 h-5 rounded-b-xl border-x border-b border-line" />
        <div className="absolute left-1/2 top-5 h-5 w-px bg-line" />
      </div>
      <div className="mx-auto mt-6 h-6 w-px bg-line sm:hidden" aria-hidden />
      <div className="mx-auto max-w-sm rounded-[18px] bg-ink px-5 py-4 text-center text-paper">
        <p className="font-semibold">{t.research.comparison}</p>
        <p className="mt-0.5 text-sm opacity-75">{t.research.comparisonSub}</p>
      </div>
    </div>
  );
}
