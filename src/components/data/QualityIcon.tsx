import { AlertTriangle } from 'lucide-react';
import { useI18n } from '@/context/I18nContext';
import type { QualityIssue } from '@/types';

export function QualityIcon({ issues }: { issues: QualityIssue[] }) {
  const { t } = useI18n();
  if (!issues.length) return null;
  const text = issues.map((i) => t.quality.issues[i]).join('\n');
  return (
    <span className="group relative inline-flex" tabIndex={0} aria-label={text}>
      <AlertTriangle size={15} className="text-signal" />
      <span role="tooltip" className="pointer-events-none absolute left-full top-1/2 z-20 ml-2 hidden w-56 -translate-y-1/2 whitespace-pre-line rounded-xl bg-ink px-3 py-2 text-left text-xs font-normal leading-relaxed text-paper shadow-lg group-hover:block group-focus:block">
        {text}
      </span>
    </span>
  );
}
