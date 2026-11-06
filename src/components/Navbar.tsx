import { useEffect, useState } from "react";
import { Menu, X, Download, Users, Gamepad2 } from "lucide-react";
import { NAV_KEYS } from "../data";
import { useLiveOnline } from "../hooks/hooks";
import { useI18n } from "../i18n";
import { LangDropdown, LangGrid } from "./LangSwitcher";

export default function Navbar({ onRegister }: { onRegister: () => void }) {
  const { t } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const online = useLiveOnline();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <>
      {/* top announcement */}
      <div className="fixed inset-x-0 top-0 z-[60] flex h-[28px] items-center justify-center gap-2 overflow-hidden bg-gradient-to-r from-[#5b21b6] via-[#7c3aed] to-[#5b21b6] px-4 text-center text-[11px] font-semibold tracking-[0.12em] text-white uppercase sm:text-xs">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300" />
        </span>
        <span className="truncate">{t.nav.announce}</span>
        <a href="#download" className="hidden shrink-0 underline decoration-white/60 underline-offset-2 hover:decoration-white sm:inline">{t.nav.claim}</a>
      </div>

      <header className={`fixed inset-x-0 top-[28px] z-50 transition-all duration-500 ${scrolled ? "py-2" : "py-4"}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <nav
            aria-label="Main navigation"
            className={`glass-strong flex items-center justify-between gap-3 rounded-2xl px-4 py-3 transition-all duration-500 sm:px-5 ${
              scrolled ? "shadow-[0_12px_50px_-10px_rgba(139,92,246,.45)]" : "shadow-[0_8px_30px_-12px_rgba(0,0,0,.7)]"
            }`}
          >
            <a href="#top" className="group flex shrink-0 items-center gap-3">
              <span className="relative grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#f5c451] via-[#b8860b] to-[#5b21b6] shadow-lg shadow-amber-500/20 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-6">
                <Gamepad2 className="h-5 w-5 text-white" strokeWidth={2.2} />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-[#0a0c1c] bg-emerald-400" />
                </span>
              </span>
              <span className="leading-none">
                <span className="font-display block text-lg tracking-wide text-white" style={{ fontWeight: 800 }}>
                  MU<span className="text-gradient-gold">ORIGINS</span>
                </span>
                <span className="block font-mono text-[10px] tracking-[0.3em] text-white/50">S6E3 • CLASSIC</span>
              </span>
            </a>

            <div className="hidden items-center gap-0.5 lg:flex">
              {NAV_KEYS.map((l) => (
                <a key={l.href} href={l.href} className="rounded-lg px-2.5 py-2 text-sm font-medium whitespace-nowrap text-white/70 transition hover:bg-white/5 hover:text-white">
                  {t.nav[l.key]}
                </a>
              ))}
              <div className="ml-2 hidden items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 2xl:flex">
                <Users className="h-3.5 w-3.5 text-emerald-300" />
                <span className="font-mono text-xs font-semibold whitespace-nowrap text-emerald-200 tabular-nums">
                  {online.toLocaleString(t.locale)} {t.nav.online}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden sm:block">
                <LangDropdown />
              </div>
              <a
                href="#download"
                className="btn-shine group hidden items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-white transition hover:border-white/20 hover:bg-white/10 xl:flex"
              >
                <Download className="h-4 w-4 transition group-hover:translate-y-0.5" />
                {t.nav.download}
              </a>
              <button
                onClick={onRegister}
                className="btn-shine hidden rounded-xl bg-gradient-to-r from-[#f5c451] to-[#ff8a3c] px-5 py-2.5 text-sm font-bold whitespace-nowrap text-[#1a1200] shadow-lg shadow-amber-500/25 transition hover:shadow-amber-500/45 hover:brightness-110 active:scale-[.98] md:block"
              >
                {t.nav.playFreeNow}
              </button>
              <button
                onClick={() => setOpen(!open)}
                aria-label={open ? t.nav.closeMenu : t.nav.openMenu}
                aria-expanded={open}
                className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-white lg:hidden"
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </nav>

          <div className={`overflow-hidden transition-all duration-500 lg:hidden ${open ? "mt-2 max-h-[760px] opacity-100" : "max-h-0 opacity-0"}`}>
            <div className="glass-strong max-h-[calc(100svh-120px)] overflow-y-auto rounded-2xl p-4">
              <div className="mb-3 flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                <span className="font-mono text-xs font-semibold text-emerald-200 tabular-nums">
                  {online.toLocaleString(t.locale)} {t.nav.playersOnline}
                </span>
              </div>
              <div className="grid gap-1">
                {NAV_KEYS.map((l) => (
                  <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-xl px-3 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/5 hover:text-white">
                    {t.nav[l.key]}
                  </a>
                ))}
              </div>
              <div className="mt-3 border-t border-white/8 pt-3">
                <LangGrid />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <a href="#download" onClick={() => setOpen(false)} className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white">
                  <Download className="h-4 w-4" /> {t.nav.download}
                </a>
                <button onClick={() => { setOpen(false); onRegister(); }} className="rounded-xl bg-gradient-to-r from-[#f5c451] to-[#ff8a3c] px-4 py-3 text-sm font-bold text-[#1a1200]">
                  {t.nav.playFree}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
