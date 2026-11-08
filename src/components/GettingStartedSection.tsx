import { UserPlus, Download, Trophy, ArrowRight, ShieldCheck, Gamepad2 } from "lucide-react";
import { useI18n } from "../i18n";

export default function GettingStartedSection({ onRegister }: { onRegister: () => void }) {
  const { t } = useI18n();
  const gs = t.gettingStarted;

  const icons = [UserPlus, Download, Trophy];
  const hrefs = ["#register", "#download", "#ranking"];

  return (
    <section id="getting-started" className="relative scroll-mt-28 py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-0 bg-radial from-purple-900/10 via-transparent to-transparent opacity-50" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs font-bold tracking-[0.2em] text-amber-300 uppercase">
            <Gamepad2 className="h-3.5 w-3.5" />
            <span>{gs.badge}</span>
          </div>
          <h2 className="font-display mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl">
            {gs.h2a} <br />
            <span className="text-gradient-gold">{gs.h2b}</span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/60 sm:text-base">{gs.sub}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {gs.steps.map((step, i) => {
            const Icon = icons[i % icons.length];
            const href = hrefs[i % hrefs.length];
            const highlight = i === 0;
            const num = String(i + 1);
            return (
              <div
                key={num}
                className={`fantasy-panel gold-border relative flex flex-col justify-between rounded-3xl p-7 transition-all duration-300 hover:translate-y-[-4px] ${
                  highlight
                    ? "border-amber-400/50 shadow-[0_15px_40px_-10px_rgba(212,175,55,0.25)]"
                    : "shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-3xl font-black text-amber-300">0{num}</span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-bold text-white/60 uppercase">
                      {step.badge}
                    </span>
                  </div>

                  <div className="mt-5 flex items-center gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-amber-400/30 bg-amber-400/15 text-amber-300">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="font-display text-lg font-bold text-white">{step.title}</h3>
                  </div>

                  <p className="mt-3 text-xs leading-relaxed text-white/70 sm:text-sm">
                    {step.description}
                  </p>
                </div>

                <div className="mt-6 border-t border-white/8 pt-4">
                  {highlight ? (
                    <button
                      onClick={onRegister}
                      className="btn-shine flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#ffb52e] to-[#ff8a3c] px-4 py-3 text-xs font-black text-[#090d16] shadow-md shadow-amber-500/20 transition hover:brightness-110 active:scale-[0.98]"
                    >
                      <span>{step.actionLabel}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    <a
                      href={href}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-xs font-bold text-white transition hover:border-amber-400/40 hover:bg-amber-400/10 hover:text-amber-300"
                    >
                      <span>{step.actionLabel}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 border-t border-white/8 pt-8 text-xs text-white/50">
          <span className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>{gs.trust1}</span>
          </span>
          <span>•</span>
          <span>{gs.trust2}</span>
          <span>•</span>
          <span>{gs.trust3}</span>
        </div>
      </div>
    </section>
  );
}
