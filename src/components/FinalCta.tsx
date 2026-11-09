import { UserPlus, Download, ShieldCheck, LogIn, Sparkles, CheckCircle2 } from "lucide-react";
import { useI18n } from "../i18n";

export default function FinalCta({
  onRegister,
  onLogin,
}: {
  onRegister: () => void;
  onLogin: () => void;
}) {
  const { t } = useI18n();
  const c = t.cta;

  return (
    <section id="join" className="relative scroll-mt-28 overflow-hidden py-24 sm:py-32">
      <div className="absolute inset-0">
        <img
          src="/images/hero-lorencia.jpg"
          alt="Lorencia Castle at Night"
          className="h-full w-full scale-105 object-cover opacity-20"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#090d16] via-[#090d16]/85 to-[#090d16]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(212,175,55,.15),transparent_75%)]" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
        <div className="fantasy-panel gold-border relative overflow-hidden rounded-[32px] p-8 text-center shadow-[0_25px_70px_-15px_rgba(212,175,55,0.25)] sm:p-14">
          <div
            className="absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-amber-500/20 blur-[100px]"
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-purple-600/15 blur-[100px]"
            aria-hidden="true"
          />

          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs font-bold tracking-[0.2em] text-amber-300 uppercase">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{c.badge}</span>
          </div>

          <h2 className="font-display mt-5 text-3xl leading-[1.1] font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
            {c.h2a} <br />
            <span className="text-gradient-gold">{c.h2b}</span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">
            {c.sub}
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              onClick={onRegister}
              className="btn-shine flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#d4af37] via-[#ffb52e] to-[#ff8a3c] px-8 py-4 text-base font-black text-[#090d16] shadow-[0_15px_40px_-8px_rgba(212,175,55,0.6)] transition hover:brightness-110 active:scale-[0.98] sm:w-auto"
            >
              <UserPlus className="h-5 w-5" />
              <span>{c.createFirst}</span>
            </button>

            <a
              href="#download"
              className="flex w-full items-center justify-center gap-2.5 rounded-2xl border border-white/15 bg-white/5 px-8 py-4 text-base font-bold text-white transition hover:border-amber-400/40 hover:bg-amber-400/10 hover:text-amber-300 active:scale-[0.98] sm:w-auto"
            >
              <Download className="h-5 w-5" />
              <span>{c.download}</span>
            </a>

            <button
              type="button"
              onClick={onLogin}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-amber-400/40 bg-amber-400/10 px-6 py-4 text-sm font-bold text-amber-300 transition hover:bg-amber-400/20 hover:text-white sm:w-auto"
            >
              <LogIn className="h-4 w-4" />
              <span>{c.loginBtn}</span>
            </button>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-5 border-t border-white/8 pt-8 text-xs text-white/50">
            <span className="flex items-center gap-1.5 font-medium text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              {c.check1}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-amber-400" />
              {c.check2}
            </span>
            <span>•</span>
            <span>{c.check3}</span>
            <span>•</span>
            <span>{c.check4}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
