import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import en, { type Dict } from "./locales/en";
import th from "./locales/th";
import pt from "./locales/pt";
import bg from "./locales/bg";
import es from "./locales/es";
import ru from "./locales/ru";

export type Lang = "th" | "en" | "pt" | "es" | "ru" | "bg";

export const LANGS: { code: Lang; label: string; native: string; short: string; html: string }[] = [
  { code: "th", label: "Thai", native: "ภาษาไทย", short: "TH", html: "th" },
  { code: "en", label: "English", native: "English", short: "EN", html: "en" },
  { code: "pt", label: "Portuguese (Brazil)", native: "Português (Brasil)", short: "BR", html: "pt-BR" },
  { code: "es", label: "Spanish", native: "Español", short: "ES", html: "es" },
  { code: "ru", label: "Russian", native: "Русский", short: "RU", html: "ru" },
  { code: "bg", label: "Bulgarian", native: "Български", short: "BG", html: "bg" },
];

const DICTS: Record<Lang, Dict> = { th, en, pt, es, ru, bg };
const STORAGE_KEY = "egismu-lang";

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
