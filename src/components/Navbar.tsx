import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Download, LogIn, UserPlus, Trophy, Swords, HelpCircle, ArrowRightLeft } from "lucide-react";
import { useLiveOnline } from "../hooks/hooks";
import { LangDropdown, LangGrid } from "./LangSwitcher";
import { useI18n } from "../i18n";

export default function Navbar({
  onRegister,
  onLogin: _onLogin,
}: {
  onRegister: () => void;
  onLogin?: () => void;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const online = useLiveOnline();
  const { t } = useI18n();
  const n = t.nav;

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="fixed inset-x-0 top-0 z-[60] flex h-[28px] items-center justify-center gap-2 overflow-hidden bg-gradient-to-r from-[#5b21b6] via-[#7c3aed] to-[#d4af37] px-4 text-center text-[11px] font-semibold tracking-[0.12em] text-white uppercase sm:text-xs">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-300 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-300" />
        </span>
        <span className="truncate">{n.announce}</span>
        <Link
          to="/login"
          className="hidden shrink-0 items-center gap-1 font-bold underline decoration-amber-300/80 underline-offset-2 hover:text-amber-200 sm:inline-flex"
        >
          <LogIn className="h-3 w-3" />
          <span>{n.login}</span>
        </Link>
      </div>

      <header
        className={`fixed inset-x-0 top-[28px] z-50 transition-all duration-500 ${
          scrolled ? "py-2" : "py-3.5"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <nav
            aria-label="Main navigation"
            className={`fantasy-panel flex items-center justify-between gap-4 rounded-2xl px-4 py-3 transition-all duration-500 sm:px-5 ${
              scrolled
                ? "border-amber-400/30 shadow-[0_12px_40px_-10px_rgba(212,175,55,0.25)]"
                : "shadow-[0_8px_30px_-12px_rgba(0,0,0,0.8)]"
            }`}
          >
            {/* Logo: eGiS-MU with glowing emblem */}
            <a href="#top" className="group flex shrink-0 items-center gap-3">
              <span className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-xl shadow-lg shadow-amber-500/30 transition-transform duration-300 group-hover:scale-105">
                <img
                  src="/images/logo.png"
                  alt="eGiS-MU Logo"
                  className="h-full w-full object-cover"
                />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-[#090d16] bg-emerald-400" />
                </span>
              </span>
              <span className="leading-tight">
                <span
                  className="font-display block text-base tracking-wide text-white drop-shadow-[0_0_12px_rgba(212,175,55,0.4)] sm:text-lg"
                  style={{ fontWeight: 800 }}
                >
                  eGiS-<span className="text-gradient-gold">MU</span>
                </span>
                <span className="block font-mono text-[9px] tracking-[0.2em] text-white/50 sm:text-[10px]">
                  S6E3 • 50x
                </span>
              </span>
            </a>

            {/* Nav Menu: Home, Rates, Register, Ranking, Download, Classes, and Login */}
            <div className="hidden items-center gap-1 lg:flex">
              <a
                href="#top"
                className="rounded-lg px-3 py-2 text-sm font-semibold whitespace-nowrap text-white/80 transition hover:bg-white/5 hover:text-white"
              >
                {n.home}
              </a>
              <a
                href="#rates"
                className="rounded-lg px-3 py-2 text-sm font-semibold whitespace-nowrap text-white/80 transition hover:bg-white/5 hover:text-white"
              >
                {n.rates}
              </a>
              <a
                href="#register"
                className="rounded-lg px-3 py-2 text-sm font-semibold whitespace-nowrap text-white/80 transition hover:bg-white/5 hover:text-white"
              >
                {n.register}
              </a>
              <a
                href="#ranking"
                className="rounded-lg px-3 py-2 text-sm font-semibold whitespace-nowrap text-white/80 transition hover:bg-white/5 hover:text-white"
              >
                {n.ranking}
              </a>
              <a
                href="#download"
                className="rounded-lg px-3 py-2 text-sm font-semibold whitespace-nowrap text-white/80 transition hover:bg-white/5 hover:text-white"
              >
                {n.download}
              </a>
              <a
                href="#classes"
                className="rounded-lg px-3 py-2 text-sm font-semibold whitespace-nowrap text-white/80 transition hover:bg-white/5 hover:text-white"
              >
                {n.classes}
              </a>

              {/* Login Button (links to /login) */}
              <Link
                to="/login"
                className="btn-shine relative ml-1 flex items-center gap-1.5 rounded-xl border border-amber-400/40 bg-gradient-to-r from-amber-500/20 via-amber-400/15 to-purple-600/20 px-3.5 py-2 text-sm font-bold whitespace-nowrap text-amber-300 shadow-[0_0_15px_-3px_rgba(212,175,55,0.3)] transition hover:border-amber-400 hover:text-white hover:brightness-110"
              >
                <LogIn className="h-4 w-4 text-amber-400" />
                <span>{n.login}</span>
              </Link>

              {/* Player / User Dashboard Portal Link */}
              <Link
                to="/user/dashboard"
                className="flex items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-500/15 px-3 py-2 text-xs font-bold whitespace-nowrap text-cyan-300 transition hover:border-cyan-400 hover:bg-cyan-500/25 hover:text-white"
                title="ผู้เล่น: แลกเครดิตออนไลน์ 1 ชม. = 5 เครดิต"
              >
                <ArrowRightLeft className="h-3.5 w-3.5 text-cyan-400" />
                <span>Dashboard ผู้เล่น</span>
              </Link>
            </div>

            {/* Right Zone: Lang, Register CTA, Mobile Menu Toggle */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:block">
                <LangDropdown />
              </div>

              <button
                onClick={onRegister}
                className="btn-shine hidden items-center gap-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#ff8a3c] px-4 py-2.5 text-xs font-black whitespace-nowrap text-[#090d16] shadow-lg shadow-amber-500/25 transition hover:brightness-110 active:scale-[.98] sm:flex sm:text-sm"
              >
                <UserPlus className="h-4 w-4" />
                <span>{n.createAccount}</span>
              </button>

              <button
                onClick={() => setOpen(!open)}
                aria-label={open ? n.closeMenu : n.openMenu}
                aria-expanded={open}
                className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-white lg:hidden"
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </nav>

          {/* Mobile Drawer */}
          <div
            className={`overflow-hidden transition-all duration-500 lg:hidden ${
              open ? "mt-2 max-h-[760px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="fantasy-panel gold-border max-h-[calc(100svh-120px)] overflow-y-auto rounded-2xl p-4 shadow-2xl">
              <div className="mb-3 flex items-center justify-between rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs">
                <span className="flex items-center gap-2 font-mono font-semibold text-emerald-200">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                  {online.toLocaleString()} {n.playersOnline}
                </span>
                <span className="font-mono text-[10px] text-white/50">UTC+7</span>
              </div>

              <div className="grid gap-1">
                <a
                  href="#rates"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/5 hover:text-white"
                >
                  <Swords className="h-4 w-4 text-amber-400" />
                  <span>{n.serverRatesFormula}</span>
                </a>
                <a
                  href="#register"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/5 hover:text-white"
                >
                  <UserPlus className="h-4 w-4 text-amber-400" />
                  <span>{n.registerAccount}</span>
                </a>
                <a
                  href="#ranking"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/5 hover:text-white"
                >
                  <Trophy className="h-4 w-4 text-amber-400" />
                  <span>{n.serverRankings}</span>
                </a>
                <a
                  href="#download"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/5 hover:text-white"
                >
                  <Download className="h-4 w-4 text-amber-400" />
                  <span>{n.downloadGameClient}</span>
                </a>
                <a
                  href="#classes"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/5 hover:text-white"
                >
                  <Swords className="h-4 w-4 text-amber-400" />
                  <span>{n.characterClasses}</span>
                </a>
                <a
                  href="#faq"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/5 hover:text-white"
                >
                  <HelpCircle className="h-4 w-4 text-amber-400" />
                  <span>{n.faq}</span>
                </a>

                {/* Mobile Login Button */}
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="mt-1 flex w-full items-center justify-between rounded-xl border border-amber-400/40 bg-gradient-to-r from-amber-500/20 to-purple-600/20 px-3.5 py-3 text-sm font-bold text-amber-300 transition hover:bg-amber-400/25"
                >
                  <span className="flex items-center gap-2">
                    <LogIn className="h-4 w-4 text-amber-400" />
                    <span>{n.accountLogin}</span>
                  </span>
                  <span className="font-mono text-xs text-amber-200/80">เข้าสู่ระบบ</span>
                </Link>

                {/* Mobile User Dashboard Link */}
                <Link
                  to="/user/dashboard"
                  onClick={() => setOpen(false)}
                  className="mt-2 flex w-full items-center justify-between rounded-xl border border-cyan-500/40 bg-cyan-500/15 px-3.5 py-2.5 text-xs font-bold text-cyan-300 transition hover:bg-cyan-500/25 hover:text-white"
                >
                  <span className="flex items-center gap-2">
                    <ArrowRightLeft className="h-4 w-4 text-cyan-400" />
                    <span>Dashboard ผู้เล่น (แลกเครดิต)</span>
                  </span>
                  <span className="rounded bg-cyan-500/30 px-1.5 py-0.5 text-[9px] text-cyan-200 font-mono">
                    1 Hr = 5 Cr
                  </span>
                </Link>
              </div>

              <div className="mt-3 border-t border-white/8 pt-3">
                <LangGrid />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <a
                  href="#download"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-bold text-white"
                >
                  <Download className="h-4 w-4" />
                  <span>{n.download}</span>
                </a>
                <button
                  onClick={() => {
                    setOpen(false);
                    onRegister();
                  }}
                  className="rounded-xl bg-gradient-to-r from-[#d4af37] to-[#ff8a3c] px-4 py-3 text-xs font-black text-[#090d16]"
                >
                  {n.playFreeNow}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
