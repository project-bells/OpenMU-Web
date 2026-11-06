import { Gamepad2, MessageCircle, Play, Video, AtSign, ShieldCheck, Heart } from "lucide-react";
import { useI18n } from "../i18n";

export default function Footer({ onRegister }: { onRegister: () => void }) {
  const { t } = useI18n();
  const ft = t.footer;
  return (
    <footer className="relative border-t border-white/8 bg-[#03040c]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <a href="#top" className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#f5c451] via-[#b8860b] to-[#5b21b6]">
                <Gamepad2 className="h-5 w-5 text-white" />
              </span>
              <span className="leading-none">
                <span className="font-display block text-lg font-extrabold tracking-wide text-white">
                  MU<span className="text-gradient-gold">ORIGINS</span>
                </span>
                <span className="block text-[10px] font-mono tracking-[0.3em] text-white/50">S6E3 • CLASSIC</span>
              </span>
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/50">
              {ft.tagline}
            </p>
            <div className="mt-5 flex gap-2">
              {[
                { icon: MessageCircle, label: ft.social[0], primary: true },
                { icon: Play, label: ft.social[1] },
                { icon: Video, label: ft.social[2] },
                { icon: AtSign, label: ft.social[3] },
              ].map((s) => (
                <a
                  key={s.label}
                  href="#top"
                  aria-label={s.label}
                  title={s.label}
                  className={`grid h-10 w-10 place-items-center rounded-xl border transition hover:-translate-y-0.5 ${
                    s.primary
                      ? "border-transparent bg-[#5865F2] text-white shadow-lg shadow-indigo-500/30 hover:brightness-110"
                      : "border-white/10 bg-white/5 text-white/60 hover:border-white/25 hover:text-white"
                  }`}
                >
                  <s.icon className="h-4.5 w-4.5 h-5 w-5" />
                </a>
              ))}
            </div>
            <button
              onClick={onRegister}
              className="btn-shine mt-5 rounded-xl bg-gradient-to-r from-[#f5c451] to-[#ff8a3c] px-6 py-3 text-sm font-extrabold text-[#1a1200] transition hover:brightness-110"
            >
              {ft.start}
            </button>
          </div>

          {ft.cols.map((col) => (
            <nav key={col.h} aria-label={col.h}>
              <h3 className="text-xs font-black tracking-[0.25em] text-white/40 uppercase">{col.h}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href={col.links.indexOf(l) < 2 ? "#download" : "#top"} className="text-sm text-white/60 transition hover:text-amber-300">{l}</a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/8 pt-8 text-xs text-white/35 sm:flex-row">
          <p>{ft.copyright}</p>
          <p className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400/70" /> {ft.uptime}
            <span className="mx-1 text-white/15">•</span>
            {ft.madeA} <Heart className="h-3.5 w-3.5 fill-red-500/70 text-red-500/70" /> {ft.madeB}
          </p>
        </div>
      </div>
    </footer>
  );
}
