import { Swords, ShieldAlert, Trophy, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";

export default function HighlightsSection() {
  const highlights = [
    {
      step: "01",
      badge: "Pure S6E3 Rates",
      title: "Authentic Season 6 Episode 3 Formula",
      subtitle: "50x EXP • 30% Excellent Drop • Original Balance",
      description:
        "Tuned faithfully to the classic 2005 GMO formula. Fast enough to respect your adult schedule, yet deep enough that every reset, jewel, and Master Skill Tree upgrade feels genuinely earned. No custom wings with +50,000 stats. Pure nostalgia, refined for competitive longevity.",
      points: [
        "Reset at Level 400 with stat retention",
        "Classic drop tables for Kanturu, Raklion & Vulcanus",
        "Original 7 classes with verified duel formulas",
      ],
      icon: Swords,
      glow: "from-amber-500/20 to-orange-500/5",
      accent: "text-amber-300",
      border: "border-amber-400/30",
    },
    {
      step: "02",
      badge: "Fair Play Economy",
      title: "100% Player-Driven, Zero Pay-to-Win",
      subtitle: "Best Gear Drops In-Game • Farmable WCoins",
      description:
        "Best-in-slot equipment (+15 Exc, 380lvl weapons, Socket gear) drops strictly through in-game gameplay, Blood Castle runs, and Kundun boss raids. Our cash shop offers only vanity cosmetics and minor quality-of-life perks. Free-to-play warriors compete on equal footing with the top tier.",
      points: [
        "Zero pay-to-max gear or paid stat packs",
        "Active Lorencia market with hundreds of player shops",
        "WCoins earnable via hourly dungeons and events",
      ],
      icon: ShieldAlert,
      glow: "from-purple-500/20 to-violet-500/5",
      accent: "text-purple-300",
      border: "border-purple-400/30",
    },
    {
      step: "03",
      badge: "Guild Glory",
      title: "Legendary Weekly Castle Siege",
      subtitle: "Sundays at 20:00 UTC+7 • 300+ Active Combatants",
      description:
        "The pinnacle of MMORPG guild warfare. Over 300 coordinated warriors clash across the three gates of Loren Deep. The victorious alliance captures the throne, gains exclusive access to the Land of Trials, collects real marketplace taxes, and plants their banner above Lorencia.",
      points: [
        "Dedicated server hosting with zero siege lag",
        "Real server market tax dividends for the Lord's guild",
        "Lord's Mix creation and exclusive crest recognition",
      ],
      icon: Trophy,
      glow: "from-amber-500/20 to-amber-600/5",
      accent: "text-amber-400",
      border: "border-amber-400/40",
    },
  ];

  return (
    <section id="highlights" className="relative scroll-mt-28 py-20 sm:py-28">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 bg-radial from-amber-500/5 via-transparent to-transparent opacity-60 pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs font-bold tracking-[0.2em] text-amber-300 uppercase">
            <Sparkles className="h-3.5 w-3.5" />
            <span>The Three Pillars of MuOrigins</span>
          </div>
          <h2 className="font-display mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl">
            BUILT FOR VETERANS. <br />
            <span className="text-gradient-gold">RESPECTED BY WARRIORS.</span>
          </h2>
          <p className="mt-4 text-base text-white/60 leading-relaxed max-w-2xl mx-auto">
            We stripped away the pay-to-win corruption and artificial bloat of modern private servers. What remains is the pure, authentic MU Online Season 6 Episode 3 experience you fell in love with.
          </p>
        </div>

        {/* 3 Key Highlights Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {highlights.map((h) => {
            const Icon = h.icon;
            return (
              <div
                key={h.step}
                className="fantasy-panel gold-border relative flex flex-col justify-between rounded-3xl p-7 sm:p-8 transition-all duration-300 hover:translate-y-[-4px] hover:border-amber-400/50 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.6)]"
              >
                <div>
                  {/* Top Bar with Number & Badge */}
                  <div className="flex items-center justify-between pb-4 border-b border-white/8">
                    <span className="font-mono text-2xl font-black text-white/25">
                      {h.step}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white/70">
                      {h.badge}
                    </span>
                  </div>

                  {/* Icon & Title */}
                  <div className="mt-6 flex items-center gap-3.5">
                    <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl border ${h.border} bg-white/5 shadow-md`}>
                      <Icon className={`h-6 w-6 ${h.accent}`} />
                    </span>
                    <div>
                      <h3 className="font-display text-xl font-bold text-white leading-snug">
                        {h.title}
                      </h3>
                      <p className={`text-xs font-semibold mt-0.5 ${h.accent}`}>
                        {h.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="mt-4 text-sm text-white/70 leading-relaxed">
                    {h.description}
                  </p>

                  {/* Bullet Points */}
                  <ul className="mt-6 space-y-2.5 pt-4 border-t border-white/5">
                    {h.points.map((pt, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-white/80">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card Footer Link */}
                <div className="mt-8 pt-4 border-t border-white/8">
                  <a
                    href="#register"
                    className="group inline-flex items-center gap-2 text-xs font-bold text-amber-300 hover:text-amber-200 transition-colors"
                  >
                    <span>Join the Realm</span>
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
