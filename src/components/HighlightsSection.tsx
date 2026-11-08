import { Swords, Coins, Trophy, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { useI18n } from "../i18n";

export default function HighlightsSection() {
  const { t } = useI18n();
  const hl = t.highlights;
  const icons = [Swords, Coins, Trophy];
  const accents = ["text-amber-300", "text-purple-300", "text-amber-400"];
  const borders = ["border-amber-400/30", "border-purple-400/30", "border-amber-400/40"];

  return (
    <section id="highlights" className="relative scroll-mt-28 py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-0 bg-radial from-amber-500/5 via-transparent to-transparent opacity-60" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs font-bold tracking-[0.2em] text-amber-300 uppercase">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{hl.badge}</span>
          </div>
          <h2 className="font-display mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl">
            {hl.h2a} <br />
            <span className="text-gradient-gold">{hl.h2b}</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/60">
            {hl.sub}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {hl.cards.map((card, i) => {
            const Icon = icons[i % icons.length];
            const accent = accents[i % accents.length];
            const border = borders[i % borders.length];
            const step = `0${i + 1}`;
            return (
              <div
                key={step}
                className="fantasy-panel gold-border relative flex flex-col justify-between rounded-3xl p-7 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.6)] transition-all duration-300 hover:translate-y-[-4px] hover:border-amber-400/50 sm:p-8"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-white/8 pb-4">
                    <span className="font-mono text-2xl font-black text-white/25">{step}</span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-bold tracking-wider text-white/70 uppercase">
                      {card.badge}
                    </span>
                  </div>

                  <div className="mt-6 flex items-center gap-3.5">
                    <span
                      className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl border ${border} bg-white/5 shadow-md`}
                    >
                      <Icon className={`h-6 w-6 ${accent}`} />
                    </span>
                    <div>
                      <h3 className="font-display text-xl leading-snug font-bold text-white">
                        {card.title}
                      </h3>
                      <p className={`mt-0.5 text-xs font-semibold ${accent}`}>{card.subtitle}</p>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-white/70">{card.description}</p>

                  <ul className="mt-6 space-y-2.5 border-t border-white/5 pt-4">
                    {card.points.map((pt, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-white/80">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 border-t border-white/8 pt-4">
                  <a
                    href="#online-rewards"
                    className="group inline-flex items-center gap-2 text-xs font-bold text-amber-300 transition-colors hover:text-amber-200"
                  >
                    <span>{hl.ctaLink}</span>
                    <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
