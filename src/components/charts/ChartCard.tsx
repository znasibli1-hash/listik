import type { ReactNode } from 'react';
import { DemoBadge } from '@/components/ui/DemoBadge';

export function ChartCard({ title, subtitle, children, demo, className = '', legend }: { title: string; subtitle?: string; children: ReactNode; demo?: boolean; className?: string; legend?: ReactNode }) {
  return (
    <section className={`flex min-w-0 flex-col rounded-panel border border-line bg-surface p-5 ${className}`}>
      <header className="mb-4 flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div>
          <h3 className="flex items-center gap-2 font-semibold tracking-[-0.01em]">{title}{demo && <DemoBadge />}</h3>
          {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
        </div>
        {legend}
      </header>
      <div className="min-h-0 flex-1">{children}</div>
    </section>
  );
}
