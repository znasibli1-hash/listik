import type { ReactNode } from 'react';
import { DemoBadge } from '@/components/ui/DemoBadge';

export function KpiCard({ label, value, unit, hint, demo, children }: { label: string; value?: ReactNode; unit?: string; hint?: string; demo?: boolean; children?: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col justify-between gap-4 rounded-[18px] border border-line bg-surface p-4">
      <p className="flex items-center gap-1.5 text-sm text-muted">{label}{demo && <DemoBadge />}</p>
      {children ?? (
        <p className="tabular flex items-baseline gap-1.5">
          <span className="font-mono text-[1.9rem] font-medium leading-none tracking-[-0.03em]">{value}</span>
          {unit && <span className="text-sm text-muted">{unit}</span>}
        </p>
      )}
      {hint && <p className="-mt-2 text-xs text-muted">{hint}</p>}
    </div>
  );
}
