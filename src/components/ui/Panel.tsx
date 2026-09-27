import type { HTMLAttributes, ReactNode } from 'react';

/** Main content surface. `grid` adds a faint measurement-paper texture. */
export function Panel({ children, className = '', grid = false, ...rest }: { children: ReactNode; grid?: boolean } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`rounded-panel border border-line bg-surface ${grid ? 'lab-grid' : ''} ${className}`} {...rest}>
      {children}
    </div>
  );
}
