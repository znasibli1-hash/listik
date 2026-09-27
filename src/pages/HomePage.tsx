import { ArrowDown } from 'lucide-react';
import { useI18n } from '@/context/I18nContext';
import { useData } from '@/context/DataContext';
import { LinkButton } from '@/components/ui/Button';
import { SectionTitle } from '@/components/ui/PageHeader';
import { PlantDataViz } from '@/components/home/PlantDataViz';
import { StatCard } from '@/components/home/StatCard';
import { ResearchTracker, StatusChip } from '@/components/home/ResearchStatus';
import { AboutSection } from '@/components/home/AboutSection';
import { uniqueCount, weeksSpanned } from '@/utils/stats';

export function HomePage() {
  const { t, lang } = useI18n();
  const { realMeasurements } = useData();

  const stats = [
    { label: t.home.stats.schools, value: uniqueCount(realMeasurements, (m) => m.schoolId) },
    { label: t.home.stats.measurements, value: realMeasurements.length },
    { label: t.home.stats.districts, value: uniqueCount(realMeasurements, (m) => m.district) },
    { label: t.home.stats.weeks, value: weeksSpanned(realMeasurements) },
  ];

  return (
    <>
      <section className="grid items-center gap-12 pb-16 pt-10 sm:pt-16 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        <div className="animate-rise">
          <StatusChip />
          <h1 className="mt-6 text-[2.25rem] font-semibold leading-[1.04] tracking-[-0.04em] sm:text-5xl xl:text-[3.9rem]">
            {t.home.title}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">{t.home.subtitle}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton href="#/research">{t.home.ctaResearch}</LinkButton>
            <LinkButton href="#/data" variant="secondary">{t.home.ctaData}</LinkButton>
          </div>
        </div>
        <div className="animate-rise [animation-delay:120ms]">
          <PlantDataViz />
        </div>
      </section>

      <section aria-labelledby="glance">
        <SectionTitle aside={<span className="hidden text-sm text-muted sm:block">{t.home.glanceNote}</span>}>
          <span id="glance">{t.home.glanceTitle}</span>
        </SectionTitle>
        <div className="grid rounded-panel border border-line bg-surface px-5 sm:grid-cols-2 sm:px-0 lg:grid-cols-4">
          {stats.map((s) => <StatCard key={s.label} label={s.label} value={s.value} lang={lang} />)}
        </div>
        <p className="mt-3 text-sm text-muted sm:hidden">{t.home.glanceNote}</p>
      </section>

      <section className="mt-16" aria-labelledby="tracker">
        <SectionTitle><span id="tracker">{t.home.trackerTitle}</span></SectionTitle>
        <ResearchTracker />
      </section>

      <section className="mt-24 grid gap-8 border-t border-line pt-12 md:grid-cols-[220px_1fr]">
        <p className="text-sm text-muted">{t.home.questionLead}</p>
        <div className="max-w-3xl">
          <p className="text-2xl font-medium leading-snug tracking-[-0.02em] sm:text-[1.9rem]">{t.research.question}</p>
          <p className="mt-5 leading-relaxed text-muted">{t.home.questionBody}</p>
          <a href="#/methodology" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-leaf hover:underline">
            {t.research.methodologyLink}<ArrowDown size={14} className="-rotate-90" />
          </a>
        </div>
      </section>

      <AboutSection />
    </>
  );
}
