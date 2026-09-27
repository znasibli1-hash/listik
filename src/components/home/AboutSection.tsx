import { FlaskConical, Database, Cpu, Leaf } from 'lucide-react';
import { useI18n } from '@/context/I18nContext';
import { PROJECT } from '@/config/project';
import { SectionTitle } from '@/components/ui/PageHeader';

const ICONS = { research: FlaskConical, data: Database, technology: Cpu, environment: Leaf };

export function AboutSection() {
  const { t } = useI18n();
  const { team } = PROJECT;
  const placeholder = <span className="text-muted/80">{t.common.toBeAdded}</span>;
  return (
    <section id="about" className="mt-24">
      <SectionTitle>{t.about.title}</SectionTitle>
      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="max-w-xl text-xl leading-snug tracking-[-0.01em]">{t.about.lead}</p>
          <dl className="mt-8 grid gap-6 sm:grid-cols-2">
            {(Object.keys(ICONS) as (keyof typeof ICONS)[]).map((key) => {
              const Icon = ICONS[key];
              const [title, body] = t.about.pillars[key];
              return (
                <div key={key}>
                  <dt className="flex items-center gap-2 font-medium"><Icon size={16} className="text-leaf" />{title}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-muted">{body}</dd>
                </div>
              );
            })}
          </dl>
        </div>
        <dl className="divide-y divide-line self-start rounded-panel border border-line bg-surface text-sm">
          <div className="grid gap-1 p-5 sm:grid-cols-[180px_1fr]"><dt className="text-muted">{t.about.team}</dt><dd>{team.members.length ? team.members.join(', ') : placeholder}</dd></div>
          <div className="grid gap-1 p-5 sm:grid-cols-[180px_1fr]"><dt className="text-muted">{t.about.organization}</dt><dd>{team.organization || placeholder}</dd></div>
          <div className="grid gap-1 p-5 sm:grid-cols-[180px_1fr]"><dt className="text-muted">{t.about.contact}</dt><dd>{team.contactEmail ? <a className="text-leaf underline" href={`mailto:${team.contactEmail}`}>{team.contactEmail}</a> : placeholder}</dd></div>
        </dl>
      </div>
    </section>
  );
}
