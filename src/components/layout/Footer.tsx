import { useI18n } from '@/context/I18nContext';
import { hrefFor } from '@/hooks/useHashRoute';
import type { RouteId } from '@/types';
import { Logo } from './Logo';

const LINKS: RouteId[] = ['research', 'data', 'dashboard', 'methodology'];

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <Logo />
          <p className="mt-2 text-sm text-muted">{t.footer.tagline}</p>
        </div>
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {LINKS.map((id) => <li key={id}><a className="text-muted hover:text-ink" href={hrefFor(id)}>{t.nav[id]}</a></li>)}
        </ul>
        <p className="font-mono text-xs text-muted md:col-span-2">{t.footer.rights}</p>
      </div>
    </footer>
  );
}
