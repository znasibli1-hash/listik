import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { translations, type Dictionary } from '@/i18n/translations';
import type { Language } from '@/types';

interface I18nValue { lang: Language; t: Dictionary; setLang: (l: Language) => void; district: (id: string) => string }
const I18nContext = createContext<I18nValue | null>(null);
const KEY = 'listik.lang';

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    try { return (localStorage.getItem(KEY) as Language) === 'en' ? 'en' : 'ru'; } catch { return 'ru'; }
  });
  const setLang = useCallback((l: Language) => {
    setLangState(l);
    try { localStorage.setItem(KEY, l); } catch { /* ignore */ }
  }, []);
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);

  const value = useMemo<I18nValue>(() => {
    const t = translations[lang];
    return { lang, t, setLang, district: (id) => t.districts[id] ?? id };
  }, [lang, setLang]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
  return ctx;
}
