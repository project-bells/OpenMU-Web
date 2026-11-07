import { useEffect, useState } from "react";
import { Menu, X, Download, Gamepad2, ShoppingBag, ExternalLink, UserPlus, Trophy, Home, Swords } from "lucide-react";
import { useLiveOnline } from "../hooks/hooks";
import { LangDropdown, LangGrid } from "./LangSwitcher";
import { useI18n } from "../i18n";

export default function Navbar({ onRegister }: { onRegister: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const online = useLiveOnline();
  const { lang } = useI18n();

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
        <span className="truncate">
          {lang === "th"
            ? "⚡ ระบบออนไลน์แลกเครดิต & แลก WCoin ฟรีเปิดแล้ว! (1 ชม. = 10 Credits) • ป้องกันโปร 100%"
            : "⚡ Online Time Rewards Active (1 Hr = 10 Credits → WCoin) • 100% Fair Play"}
        </span>
        <a
          href="https://webshop.muorigins.online"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden shrink-0 items-center gap-1 font-bold underline decoration-amber-300/80 underline-offset-2 hover:text-amber-200 sm:inline-flex"
        >
          <span>{lang === "th" ? "เว็บช็อปออนไลน์" : "Web Shop Online"}</span>
          <ExternalLink className="h-2.5 w-2.5" />
        </a>
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
                ? "shadow-[0_12px_40px_-10px_rgba(212,175,55,0.25)] border-amber-400/30"
                : "shadow-[0_8px_30px_-12px_rgba(0,0,0,0.8)]"
            }`}
          >
            {/* Logo: MU Origins with glowing text/emblem */}
            <a href="#top" className="group flex shrink-0 items-center gap-3">
              <span className="relative grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#d4af37] via-[#997b1a] to-[#5b21b6] shadow-lg shadow-amber-500/30 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
                <Gamepad2 className="h-5 w-5 text-white" strokeWidth={2.2} />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-[#090d16] bg-emerald-400" />
                </span>
              </span>
              <span className="leading-tight">
                <span
                  className="font-display block text-base sm:text-lg tracking-wide text-white drop-shadow-[0_0_12px_rgba(212,175,55,0.4)]"
                  style={{ fontWeight: 800 }}
                >
                  MU <span className="text-gradient-gold">ORIGINS</span>
                </span>
                <span className="block font-mono text-[9px] sm:text-[10px] tracking-[0.25em] text-white/50">
                  SEASON 6 EPISODE 3
                </span>
              </span>
            </a>

            {/* Nav Menu: Home, Register, Rates, Ranking, Download, Classes, and "Web Shop" */}
            <div className="hidden items-center gap-1 lg:flex">
              <a
                href="#top"
                className="rounded-lg px-3 py-2 text-sm font-semibold whitespace-nowrap text-white/80 transition hover:bg-white/5 hover:text-white"
              >
                {lang === "th" ? "หน้าแรก" : "Home"}
              </a>
              <a
                href="#register"
                className="rounded-lg px-3 py-2 text-sm font-semibold whitespace-nowrap text-white/80 transition hover:bg-white/5 hover:text-white"
              >
                {lang === "th" ? "สมัครสมาชิก" : "Register"}
              </a>
              <a
                href="#rates"
                className="rounded-lg px-3 py-2 text-sm font-semibold whitespace-nowrap text-white/80 transition hover:bg-white/5 hover:text-white"
              >
                {lang === "th" ? "เรทเซิร์ฟเวอร์" : "Rates"}
              </a>
              <a
                href="#ranking"
                className="rounded-lg px-3 py-2 text-sm font-semibold whitespace-nowrap text-white/80 transition hover:bg-white/5 hover:text-white"
              >
                {lang === "th" ? "จัดอันดับ" : "Ranking"}
              </a>
              <a
                href="#download"
                className="rounded-lg px-3 py-2 text-sm font-semibold whitespace-nowrap text-white/80 transition hover:bg-white/5 hover:text-white"
              >
                {lang === "th" ? "ดาวน์โหลด" : "Download"}
              </a>
              <a
                href="#classes"
                className="rounded-lg px-3 py-2 text-sm font-semibold whitespace-nowrap text-white/80 transition hover:bg-white/5 hover:text-white"
              >
                {lang === "th" ? "สายอาชีพ" : "Classes"}
              </a>

              {/* CRITICAL REQUIREMENT: Web Shop external link */}
              <a
                href="https://webshop.muorigins.online"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-shine relative ml-1 flex items-center gap-1.5 rounded-xl border border-amber-400/40 bg-gradient-to-r from-amber-500/20 via-amber-400/15 to-purple-600/20 px-3.5 py-2 text-sm font-bold whitespace-nowrap text-amber-300 shadow-[0_0_15px_-3px_rgba(212,175,55,0.3)] transition hover:border-amber-400 hover:text-white hover:brightness-110"
              >
                <ShoppingBag className="h-4 w-4 text-amber-400" />
                <span>{lang === "th" ? "เว็บช็อป" : "Web Shop"}</span>
                <ExternalLink className="h-3 w-3 opacity-70 ml-0.5" />
              </a>
            </div>

            {/* Right Zone: Lang, Register CTA, Mobile Menu Toggle */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:block">
                <LangDropdown />
              </div>

              <button
                onClick={onRegister}
                className="btn-shine hidden sm:flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#ff8a3c] px-4 py-2.5 text-xs sm:text-sm font-black whitespace-nowrap text-[#090d16] shadow-lg shadow-amber-500/25 transition hover:brightness-110 active:scale-[.98]"
              >
                <UserPlus className="h-4 w-4" />
                <span>{lang === "th" ? "สมัครไอดีฟรี" : "Create Account"}</span>
              </button>

              <button
                onClick={() => setOpen(!open)}
                aria-label={open ? "Close menu" : "Open menu"}
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
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  {online.toLocaleString()} Warriors Online
                </span>
                <span className="text-[10px] text-white/50 font-mono">UTC+7</span>
              </div>

              <div className="grid gap-1">
                <a
                  href="#top"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/5 hover:text-white"
                >
                  <Home className="h-4 w-4 text-amber-400" />
                  <span>{lang === "th" ? "หน้าแรก" : "Home"}</span>
                </a>
                <a
                  href="#register"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/5 hover:text-white"
                >
                  <UserPlus className="h-4 w-4 text-amber-400" />
                  <span>{lang === "th" ? "สมัครสมาชิกไอดี" : "Register Account"}</span>
                </a>
                <a
                  href="#rates"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/5 hover:text-white"
                >
                  <span>{lang === "th" ? "เรทเซิร์ฟเวอร์ (EXP & Drop Rates)" : "Server Rates & Formula"}</span>
                </a>
                <a
                  href="#ranking"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/5 hover:text-white"
                >
                  <Trophy className="h-4 w-4 text-amber-400" />
                  <span>{lang === "th" ? "จัดอันดับฮีโร่ / กิลด์" : "Server Rankings"}</span>
                </a>
                <a
                  href="#download"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/5 hover:text-white"
                >
                  <Download className="h-4 w-4 text-amber-400" />
                  <span>{lang === "th" ? "ดาวน์โหลดตัวเกม (Mega & MediaFire)" : "Download Game Client"}</span>
                </a>
                <a
                  href="#classes"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/5 hover:text-white"
                >
                  <Swords className="h-4 w-4 text-amber-400" />
                  <span>{lang === "th" ? "สายอาชีพทั้ง 7" : "Character Classes"}</span>
                </a>

                {/* CRITICAL: Mobile Web Shop Link */}
                <a
                  href="https://webshop.muorigins.online"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between rounded-xl border border-amber-400/40 bg-gradient-to-r from-amber-500/20 to-purple-600/20 px-3.5 py-3 text-sm font-bold text-amber-300 transition hover:bg-amber-400/25 mt-1"
                >
                  <span className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-amber-400" />
                    <span>{lang === "th" ? "เว็บช็อป (Web Shop)" : "Web Shop (Online)"}</span>
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                </a>
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
                  <span>{lang === "th" ? "ดาวน์โหลด" : "Download"}</span>
                </a>
                <button
                  onClick={() => {
                    setOpen(false);
                    onRegister();
                  }}
                  className="rounded-xl bg-gradient-to-r from-[#d4af37] to-[#ff8a3c] px-4 py-3 text-xs font-black text-[#090d16]"
                >
                  {lang === "th" ? "สมัครไอดี" : "Register"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
