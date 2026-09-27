import type { ReactNode } from 'react';

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <header className="flex flex-col gap-5 pb-8 pt-10 sm:pt-14 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl animate-rise">
        <h1 className="text-[2.1rem] font-semibold leading-[1.08] tracking-[-0.03em] sm:text-5xl">{title}</h1>
        {subtitle && <p className="mt-3 text-[17px] leading-relaxed text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

export function SectionTitle({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="mb-5 flex items-baseline justify-between gap-4">
      <h2 className="text-2xl font-semibold tracking-[-0.02em]">{children}</h2>
      {aside}
    </div>
  );
}
