import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import en, { type Dict } from "./locales/en";
import th from "./locales/th";

export type Lang = "th" | "en";

export const LANGS: { code: Lang; label: string; native: string; short: string; html: string }[] = [
  { code: "th", label: "Thai", native: "ภาษาไทย", short: "TH", html: "th" },
  { code: "en", label: "English", native: "English", short: "EN", html: "en" },
];

const DICTS: Record<Lang, Dict> = { th, en };
const STORAGE_KEY = "muorigins-lang";

function detect(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as Lang | null;
    if (saved && saved in DICTS) return saved;
  } catch { /* ignore */ }
  const nav = (typeof navigator !== "undefined" ? navigator.language : "en").toLowerCase();
  const prefix = nav.slice(0, 2) as Lang;
  return prefix in DICTS ? prefix : "en";
}

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: Dict };
const I18nContext = createContext<Ctx>({ lang: "en", setLang: () => {}, t: en });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detect);
  const t = DICTS[lang];

  const setLang = (l: Lang) => {
    setLangState(l);
    try { localStorage.setItem(STORAGE_KEY, l); } catch { /* ignore */ }
  };

  useEffect(() => {
    const meta = LANGS.find((l) => l.code === lang)!;
    document.documentElement.lang = meta.html;
    document.title = t.meta.title;
  }, [lang, t]);

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);

/** Simple {token} interpolation */
export const fmt = (s: string, vars: Record<string, string | number>) =>
  s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
