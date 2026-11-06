import { useEffect, useRef, useState } from "react";
import { Globe, Check, ChevronDown } from "lucide-react";
import { LANGS, useI18n } from "../i18n";

export function LangDropdown() {
  const { lang, setLang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LANGS.find((l) => l.code === lang)!;

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${t.nav.language}: ${current.native}`}
        className={`flex h-10 items-center gap-1.5 rounded-xl border px-3 text-sm font-bold transition ${
          open ? "border-amber-400/40 bg-amber-400/10 text-amber-200" : "border-white/10 bg-white/5 text-white/80 hover:border-white/20 hover:text-white"
        }`}
      >
        <Globe className="h-4 w-4" />
        <span className="font-mono text-xs">{current.short}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>

      <div
        role="listbox"
        aria-label={t.nav.language}
        className={`glass-strong absolute right-0 top-[calc(100%+10px)] z-50 w-64 origin-top-right overflow-hidden rounded-2xl p-1.5 shadow-[0_24px_60px_-12px_rgba(0,0,0,.8)] transition-all duration-200 ${
          open ? "pointer-events-auto scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
        }`}
      >
        <p className="px-3 pt-2 pb-1.5 text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase">{t.nav.language}</p>
        {LANGS.map((l) => {
          const active = l.code === lang;
          return (
            <button
              key={l.code}
              role="option"
              aria-selected={active}
              lang={l.html}
              onClick={() => { setLang(l.code); setOpen(false); }}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                active ? "bg-gradient-to-r from-amber-400/15 to-transparent text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className={`grid h-7 w-9 shrink-0 place-items-center rounded-lg font-mono text-[11px] font-bold ${active ? "bg-amber-400 text-[#1a1200]" : "bg-white/8 text-white/60"}`}>
                {l.short}
              </span>
              <span className="flex-1 leading-tight">
                <span className="block font-semibold">{l.native}</span>
                {l.native !== l.label && <span className="block text-[11px] text-white/40">{l.label}</span>}
              </span>
              {active && <Check className="h-4 w-4 text-amber-300" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function LangGrid({ onPick }: { onPick?: () => void }) {
  const { lang, setLang, t } = useI18n();
  return (
    <div>
      <p className="mb-2 flex items-center gap-1.5 px-1 text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase">
        <Globe className="h-3.5 w-3.5" /> {t.nav.language}
      </p>
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
        {LANGS.map((l) => {
          const active = l.code === lang;
          return (
            <button
              key={l.code}
              lang={l.html}
              aria-pressed={active}
              onClick={() => { setLang(l.code); onPick?.(); }}
              className={`flex items-center gap-2 rounded-xl border px-2.5 py-2 text-left text-xs font-semibold transition ${
                active ? "border-amber-400/40 bg-amber-400/12 text-amber-100" : "border-white/8 bg-white/[.03] text-white/70 hover:text-white"
              }`}
            >
              <span className={`rounded-md px-1.5 py-0.5 font-mono text-[10px] font-bold ${active ? "bg-amber-400 text-[#1a1200]" : "bg-white/10 text-white/60"}`}>{l.short}</span>
              <span className="truncate">{l.native}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
