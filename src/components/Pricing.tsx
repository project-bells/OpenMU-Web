import { Check, X, ShieldCheck, Sparkles } from "lucide-react";
import { PRICING } from "../data";
import { useI18n } from "../i18n";

export default function Pricing({ onRegister }: { onRegister: () => void }) {
  const { t } = useI18n();
  const pr = t.pricing;
  const plans = PRICING.map((p, i) => ({ ...p, ...pr.plans[i] }));
  return (
    <section id="vip" className="relative scroll-mt-28 py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-1/3 left-1/2 h-[420px] w-[760px] -translate-x-1/2 rounded-full bg-amber-500/8 blur-[130px]" />
      </div>
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="reveal mx-auto max-w-3xl text-center">
          <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold tracking-[0.22em] text-emerald-200 uppercase">
            <ShieldCheck className="h-3.5 w-3.5" /> {pr.badge}
          </span>
          <h2 className="font-display mt-5 text-3xl font-black tracking-tight text-white sm:text-5xl">
            {pr.h2a} <span className="text-gradient-gold">{pr.h2b}</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/60">
            {pr.sub}
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3 md:items-stretch">
          {plans.map((p, i) => (
            <article
              key={i}
              className={`reveal relative flex flex-col overflow-hidden rounded-[26px] p-7 transition-all duration-500 hover:-translate-y-2 sm:p-8 ${
                p.highlight
                  ? "gold-border bg-gradient-to-b from-[#221a08] via-[#141021] to-[#0a0c1c] shadow-[0_30px_80px_-20px_rgba(245,196,81,.35)] md:scale-[1.05]"
                  : "border border-white/10 bg-white/[.03]"
              }`}
              style={{ ["--reveal-delay" as string]: `${i * 120}ms` }}
            >
              {p.highlight && p.badge && (
                <>
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-300 via-orange-400 to-amber-300" />
                  <span className="absolute top-5 right-5 rounded-full bg-gradient-to-r from-amber-300 to-orange-400 px-3 py-1 text-[10px] font-black tracking-widest text-[#1a1200]">
                    {p.badge}
                  </span>
                </>
              )}
              <h3 className={`text-sm font-black tracking-[0.2em] uppercase ${p.highlight ? "text-amber-300" : "text-white/60"}`}>
                {p.name}
              </h3>
              <p className="mt-3">
                <span className={`font-display text-4xl font-black sm:text-5xl ${p.highlight ? "text-gradient-gold" : "text-white"}`}>{p.price}</span>
                <span className="ml-1 text-sm text-white/45">{p.period}</span>
              </p>
              <p className="mt-2 text-sm text-white/55">{p.desc}</p>
              <ul className="mt-6 flex-1 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-white/80">
                    <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${p.highlight ? "bg-amber-400/20 text-amber-300" : "bg-emerald-400/15 text-emerald-300"}`}>
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    {f}
                  </li>
                ))}
                {p.missing.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-white/30">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/5 text-white/25">
                      <X className="h-3 w-3" strokeWidth={3} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={onRegister}
                className={`btn-shine mt-7 w-full rounded-2xl px-6 py-3.5 text-sm font-extrabold transition active:scale-[.98] ${
                  p.highlight
                    ? "bg-gradient-to-r from-[#f5c451] to-[#ff8a3c] text-[#1a1200] shadow-lg shadow-amber-500/30 hover:brightness-110"
                    : "border border-white/12 bg-white/5 text-white hover:border-white/25 hover:bg-white/10"
                }`}
              >
                {p.cta}
              </button>
            </article>
          ))}
        </div>

        <div className="reveal mt-8 flex flex-col items-center justify-center gap-2 text-center text-xs text-white/40 sm:flex-row sm:gap-6">
          <span className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-amber-300/60" /> {pr.note1}</span>
          <span className="hidden h-3 w-px bg-white/15 sm:block" />
          <span>{pr.note2}</span>
        </div>
      </div>
    </section>
  );
}
