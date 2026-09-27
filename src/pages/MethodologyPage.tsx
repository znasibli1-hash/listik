import type { ReactNode } from 'react';
import { Check } from 'lucide-react';
import { useI18n } from '@/context/I18nContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { ExperimentDiagram } from '@/components/research/ExperimentDiagram';
import { LimitationsBlock } from '@/components/research/LimitationsBlock';

function Step({ n, id, title, children }: { n: number; id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="grid scroll-mt-24 gap-4 border-t border-line py-10 md:grid-cols-[88px_1fr]">
      <span className="font-mono text-sm text-leaf">{String(n).padStart(2, '0')}</span>
      <div className="min-w-0">
        <h2 className="mb-4 text-2xl font-semibold tracking-[-0.02em]">{title}</h2>
        {children}
      </div>
    </section>
  );
}

export function MethodologyPage() {
  const { t } = useI18n();
  const m = t.methodology;
  const steps = [
    ['objective', m.objective.title], ['hypothesis', m.hypothesis.title], ['plant', m.plant.title], ['design', m.design.title],
    ['collection', m.collection.title], ['analysis', m.analysis.title], ['limitations', m.limitations.title],
  ] as const;

  return (
    <>
      <PageHeader title={m.title} subtitle={m.subtitle} />
      <div className="grid gap-10 lg:grid-cols-[200px_1fr]">
        <nav aria-label={m.title} className="hidden lg:block">
          <ol className="sticky top-24 grid gap-1 text-sm">
            {steps.map(([id, title], i) => (
              <li key={id}><a href={`#/methodology`} onClick={(e) => { e.preventDefault(); document.getElementById(`m-${id}`)?.scrollIntoView({ behavior: 'smooth' }); }}
                className="flex gap-3 rounded-lg px-2 py-1.5 text-muted hover:bg-sunken hover:text-ink"><span className="font-mono text-xs leading-5 text-leaf">{String(i + 1).padStart(2, '0')}</span>{title}</a></li>
            ))}
          </ol>
        </nav>

        <div className="min-w-0">
          <Step n={1} id="m-objective" title={m.objective.title}>
            <p className="max-w-3xl text-[17px] leading-relaxed">{m.objective.body}</p>
          </Step>

          <Step n={2} id="m-hypothesis" title={m.hypothesis.title}>
            <p className="max-w-3xl rounded-2xl bg-leaf-soft p-5 text-[17px] leading-relaxed">{t.research.hypothesis}</p>
          </Step>

          <Step n={3} id="m-plant" title={m.plant.title}>
            <div className="grid gap-6 md:grid-cols-[1fr_1.2fr]">
              <div className="rounded-panel border border-line bg-surface p-6">
                <p className="text-2xl font-medium italic tracking-[-0.01em]">{m.plant.latin}</p>
                <p className="mt-1 text-muted">{m.plant.common}</p>
                <p className="mt-5 text-sm leading-relaxed">{m.plant.body}</p>
              </div>
              <ul className="grid content-start gap-2">
                {m.plant.criteria.map((c) => (
                  <li key={c} className="flex gap-3 rounded-2xl border border-line bg-surface p-4 text-[15px]">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-leaf text-white"><Check size={12} strokeWidth={3} /></span>{c}
                  </li>
                ))}
              </ul>
            </div>
          </Step>

          <Step n={4} id="m-design" title={m.design.title}>
            <p className="mb-6 max-w-3xl text-[17px] leading-relaxed">{m.design.body}</p>
            <ExperimentDiagram />
            <p className="mt-6 text-sm font-medium text-muted">{m.design.matchTitle}</p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {m.design.match.map((x) => <li key={x} className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm">{x}</li>)}
            </ul>
          </Step>

          <Step n={5} id="m-collection" title={m.collection.title}>
            <p className="mb-6 max-w-3xl text-[17px] leading-relaxed">{m.collection.body}</p>
            <ol className="relative grid gap-0 md:grid-cols-4">
              {m.collection.timeline.map(([title, body], i) => (
                <li key={title} className="relative flex gap-4 pb-6 md:block md:pb-0 md:pr-4">
                  {/* connector line */}
                  <span aria-hidden className={`absolute bg-line ${i < 3 ? 'left-[11px] top-6 h-full w-px md:left-6 md:top-[11px] md:h-px md:w-full' : 'hidden'}`} />
                  <span className={`relative z-10 grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 bg-paper font-mono text-[10px] ${i === 0 ? 'border-leaf text-leaf' : 'border-line text-muted'}`}>{i + 1}</span>
                  <div className="md:mt-4">
                    <p className="font-semibold">{title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Step>

          <Step n={6} id="m-analysis" title={m.analysis.title}>
            <p className="max-w-3xl text-[17px] leading-relaxed">{m.analysis.body}</p>
          </Step>

          <Step n={7} id="m-limitations" title={m.limitations.title}>
            <LimitationsBlock />
          </Step>
        </div>
      </div>
    </>
  );
}
