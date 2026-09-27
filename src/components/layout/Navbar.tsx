import { useEffect, useState } from 'react';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { useI18n } from '@/context/I18nContext';
import { useTheme } from '@/context/ThemeContext';
import { ROUTES, hrefFor } from '@/hooks/useHashRoute';
import type { RouteId } from '@/types';
import { Logo } from './Logo';

function LangSwitch() {
  const { lang, setLang, t } = useI18n();
  return (
    <div role="group" aria-label={t.meta.switchTo} className="flex rounded-full border border-line p-0.5 font-mono text-xs">
      {(['ru', 'en'] as const).map((l) => (
        <button key={l} onClick={() => setLang(l)} aria-pressed={lang === l}
          className={`rounded-full px-2.5 py-1 uppercase transition-colors ${lang === l ? 'bg-ink text-paper' : 'text-muted hover:text-ink'}`}>
          {l}
        </button>
      ))}
    </div>
  );
}

function ThemeSwitch() {
  const { theme, toggle } = useTheme();
  const { t } = useI18n();
  const label = theme === 'dark' ? t.common.lightTheme : t.common.darkTheme;
  return (
    <button onClick={toggle} aria-label={label} title={label}
      className="grid h-8 w-8 place-items-center rounded-full border border-line text-muted transition-colors hover:text-ink">
      {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}

export function Navbar({ route }: { route: RouteId }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => { setOpen(false); }, [route]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`sticky z-40 transition-colors ${scrolled || open ? 'border-b border-line bg-paper/85 backdrop-blur-md' : 'border-b border-transparent'}`}
      style={{ top: 'env(safe-area-inset-top, 0px)' }}>
      <nav className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-5 sm:px-8" aria-label="Main">
        <Logo />
        <ul className="ml-4 hidden items-center gap-0.5 lg:flex">
          {ROUTES.map((id) => (
            <li key={id}>
              <a href={hrefFor(id)} aria-current={route === id ? 'page' : undefined}
                className={`relative rounded-full px-3 py-1.5 text-[14px] transition-colors ${route === id ? 'bg-leaf-soft font-medium text-ink' : 'text-muted hover:text-ink'}`}>
                {t.nav[id]}
              </a>
            </li>
          ))}
        </ul>
        <div className="ml-auto flex items-center gap-2">
          <LangSwitch />
          <ThemeSwitch />
          <button className="grid h-9 w-9 place-items-center rounded-full text-ink lg:hidden" onClick={() => setOpen((o) => !o)}
            aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? t.nav.closeMenu : t.nav.openMenu}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>
      {open && (
        <div id="mobile-menu" className="border-t border-line px-5 pb-5 pt-2 lg:hidden">
          <ul className="grid gap-0.5">
            {ROUTES.map((id, i) => (
              <li key={id} className="animate-rise" style={{ animationDelay: `${i * 25}ms` }}>
                <a href={hrefFor(id)} aria-current={route === id ? 'page' : undefined}
                  className={`flex items-center justify-between rounded-xl px-3 py-3 text-[17px] ${route === id ? 'bg-leaf-soft font-medium' : 'text-ink'}`}>
                  {t.nav[id]}
                  {route === id && <span className="h-1.5 w-1.5 rounded-full bg-leaf" />}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
