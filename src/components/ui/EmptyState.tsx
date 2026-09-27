import type { ReactNode } from 'react';

export function EmptyState({ title, body, action, icon = '🌱' }: { title: string; body?: string; action?: ReactNode; icon?: string }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <div className="mb-3 text-3xl" aria-hidden>{icon}</div>
      <p className="font-semibold">{title}</p>
      {body && <p className="mt-1 max-w-sm text-sm text-muted">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
