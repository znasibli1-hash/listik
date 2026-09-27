import { ArrowRight } from 'lucide-react';
import { useI18n } from '@/context/I18nContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { ExperimentDiagram } from '@/components/research/ExperimentDiagram';
import { LimitationsBlock } from '@/components/research/LimitationsBlock';

function Row({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-4 border-t border-line py-10 md:grid-cols-[240px_1fr] md:gap-10">
      <h2 className="text-lg font-semibold tracking-[-0.01em]">{title}</h2>
      <div className="max-w-3xl">{children}</div>
    </section>
  );
}

export function ResearchPage() {
  const { t } = useI18n();
  return (
    <>
      <PageHeader title={t.research.title} subtitle={t.research.intro} />

      <Row title={t.research.whyTitle}>
        {t.research.whyBody.map((p) => <p key={p} className="mb-4 text-[17px] leading-relaxed">{p}</p>)}
        <p className="mt-6 border-l-2 border-signal pl-4 text-[15px] leading-relaxed text-muted">{t.research.whyCaution}</p>
      </Row>

      <Row title={t.research.questionTitle}>
        <p className="text-2xl font-medium leading-snug tracking-[-0.02em] sm:text-3xl">{t.research.question}</p>
      </Row>

      <Row title={t.research.goalTitle}>
        <p className="text-[17px] leading-relaxed">{t.research.goal}</p>
      </Row>

      <Row title={t.research.hypothesisTitle}>
        <p className="rounded-2xl bg-leaf-soft p-5 text-[17px] leading-relaxed">{t.research.hypothesis}</p>
      </Row>

      <section className="border-t border-line py-10">
        <h2 className="mb-6 text-lg font-semibold tracking-[-0.01em]">{t.research.designTitle}</h2>
        <ExperimentDiagram />
      </section>

      <Row title={t.research.variablesTitle}>
        <ul className="flex flex-wrap gap-2">
          {t.research.variables.map((v, i) => (
            <li key={v} className={`rounded-full border px-3.5 py-1.5 text-sm ${i === 0 ? 'border-leaf bg-leaf-soft font-medium' : 'border-line bg-surface'}`}>{v}</li>
          ))}
        </ul>
        <a href="#/methodology" className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-leaf hover:underline">
          {t.research.methodologyLink}<ArrowRight size={14} />
        </a>
      </Row>

      <div className="mt-6"><LimitationsBlock /></div>
    </>
  );
}
