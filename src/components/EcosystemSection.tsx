import { LogIn, MessageSquare, ShieldCheck, BookOpen, ExternalLink, HeartHandshake } from "lucide-react";
import { useI18n } from "../i18n";

export default function EcosystemSection({ onLogin }: { onLogin?: () => void }) {
  const { t } = useI18n();
  const ec = t.ecosystem;

  const icons = [LogIn, MessageSquare, ShieldCheck, BookOpen];
  const borders = [
    "border-amber-400/40",
    "border-[#5865F2]/40",
    "border-emerald-500/30",
    "border-cyan-500/30",
  ];
  const hrefs = ["#online-rewards", "https://discord.gg", "#faq", "#classes"];

  return (
    <section id="ecosystem" className="relative scroll-mt-28 py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-0 bg-radial from-amber-500/5 via-transparent to-transparent opacity-60" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs font-bold tracking-[0.2em] text-amber-300 uppercase">
            <HeartHandshake className="h-3.5 w-3.5" />
            <span>{ec.badge}</span>
          </div>
          <h2 className="font-display mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl">
            {ec.h2a} <span className="text-gradient-gold">{ec.h2b}</span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/60 sm:text-base">{ec.sub}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {ec.cards.map((card, i) => {
            const Icon = icons[i % icons.length];
            const border = borders[i % borders.length];
            const href = hrefs[i % hrefs.length];
            const isLoginCard = i === 0;
            const isExternal = i === 1;
            return (
              <div
                key={card.title}
                className={`fantasy-panel gold-border relative flex flex-col justify-between rounded-3xl p-7 transition-all duration-300 hover:translate-y-[-3px] ${
                  isLoginCard
                    ? "border-amber-400/50 bg-gradient-to-br from-amber-500/5 to-transparent shadow-[0_15px_40px_-10px_rgba(212,175,55,0.25)]"
                    : "shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-bold text-white/60 uppercase">
                      {card.badge}
                    </span>
                    <span className="font-mono text-xs text-amber-300/80">{card.subtitle}</span>
                  </div>

                  <div className="mt-5 flex items-center gap-3.5">
                    <span
                      className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl border ${border} bg-white/5 text-amber-300 shadow-md`}
                    >
                      <Icon className="h-6 w-6" />
                    </span>
                    <div>
                      <h3 className="font-display text-xl font-bold text-white">{card.title}</h3>
                    </div>
                  </div>

                  <p className="mt-4 text-xs leading-relaxed text-white/70 sm:text-sm">
                    {card.description}
                  </p>
                </div>

                <div className="mt-6 border-t border-white/8 pt-4">
                  {isLoginCard && onLogin ? (
                    <button
                      type="button"
                      onClick={onLogin}
                      className="btn-shine flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#ffb52e] to-[#ff8a3c] px-4 py-3 text-xs font-black text-[#090d16] shadow-lg shadow-amber-500/20 transition hover:brightness-110"
                    >
                      <LogIn className="h-3.5 w-3.5" />
                      <span>{card.ctaLabel}</span>
                    </button>
                  ) : (
                    <a
                      href={href}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noopener noreferrer" : undefined}
                      className="btn-shine flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-xs font-bold text-white transition hover:border-amber-400/40 hover:bg-amber-400/10 hover:text-amber-300"
                    >
                      <span>{card.ctaLabel}</span>
                      {isExternal ? (
                        <ExternalLink className="h-3.5 w-3.5" />
                      ) : (
                        <span className="text-xs">→</span>
                      )}
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 rounded-2xl border border-white/8 bg-white/[0.02] p-5 text-center text-xs text-white/50">
          <p className="flex flex-wrap items-center justify-center gap-2">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{ec.securityNotice}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
