import { ShoppingBag, MessageSquare, Scale, BookOpen, ExternalLink, ShieldCheck, HeartHandshake } from "lucide-react";

export default function EcosystemSection() {
  const ecosystemCards = [
    {
      title: "Official Web Shop",
      subtitle: "webshop.muorigins.online",
      description:
        "Browse cosmetic armors, visual wings, pets, and quality-of-life account conveniences. 100% fair economy guarantee: zero pay-to-win items, zero stat-boosting wings, and zero exclusive power gear.",
      icon: ShoppingBag,
      href: "https://webshop.muorigins.online",
      isExternal: true,
      ctaLabel: "Visit Official Web Shop",
      accent: "from-amber-500/20 to-orange-500/10",
      border: "border-amber-400/40",
      badge: "External Portal",
      highlight: true,
    },
    {
      title: "Discord Community Hub",
      subtitle: "12,400+ Active Veterans",
      description:
        "Connect with players, recruit for Castle Siege guilds, access live marketplace price checks, and get direct 24/7 GM ticket support with an average response time of under 60 seconds.",
      icon: MessageSquare,
      href: "https://discord.gg",
      isExternal: true,
      ctaLabel: "Join Discord Server",
      accent: "from-[#5865F2]/20 to-purple-600/10",
      border: "border-[#5865F2]/40",
      badge: "Community & Support",
      highlight: false,
    },
    {
      title: "Fair Play & Server Rules",
      subtitle: "Zero-Tolerance Anti-Cheat",
      description:
        "Read our server constitution covering automated macros, speedhacks, multi-boxing restrictions, and trade integrity. Our server-side prober actively validates packet invariants to protect your grind.",
      icon: Scale,
      href: "#faq",
      isExternal: false,
      ctaLabel: "Review Server Rules",
      accent: "from-emerald-500/20 to-teal-600/10",
      border: "border-emerald-500/30",
      badge: "Integrity Policy",
      highlight: false,
    },
    {
      title: "Class & Siege Codex",
      subtitle: "S6E3 Gameplay Guides",
      description:
        "Comprehensive build calculators, PvP duel combos, 3rd Class Quest walk-throughs, Master Skill Tree optimizations, and tactics for the weekly Loren Deep Castle Siege war.",
      icon: BookOpen,
      href: "#classes",
      isExternal: false,
      ctaLabel: "Explore Class Guides",
      accent: "from-cyan-500/20 to-blue-600/10",
      border: "border-cyan-500/30",
      badge: "Knowledge Base",
      highlight: false,
    },
  ];

  return (
    <section id="ecosystem" className="relative scroll-mt-28 py-20 sm:py-28">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-radial from-amber-500/5 via-transparent to-transparent opacity-60 pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs font-bold tracking-[0.2em] text-amber-300 uppercase">
            <HeartHandshake className="h-3.5 w-3.5" />
            <span>Community & Resources</span>
          </div>
          <h2 className="font-display mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl">
            THE MUORIGINS <span className="text-gradient-gold">ECOSYSTEM</span>
          </h2>
          <p className="mt-4 text-sm text-white/60 sm:text-base leading-relaxed">
            Everything you need outside the game client—from our transparent Web Shop to our vibrant 12,400+ Discord community and comprehensive game guides.
          </p>
        </div>

        {/* 4 Ecosystem Cards Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {ecosystemCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className={`fantasy-panel gold-border relative flex flex-col justify-between rounded-3xl p-7 transition-all duration-300 hover:translate-y-[-3px] ${
                  card.highlight
                    ? "border-amber-400/50 shadow-[0_15px_40px_-10px_rgba(212,175,55,0.25)] bg-gradient-to-br from-amber-500/5 to-transparent"
                    : "shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]"
                }`}
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between">
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-bold text-white/60 uppercase">
                      {card.badge}
                    </span>
                    <span className="font-mono text-xs text-white/40">
                      {card.subtitle}
                    </span>
                  </div>

                  {/* Title & Icon */}
                  <div className="mt-5 flex items-center gap-3.5">
                    <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl border ${card.border} bg-white/5 text-amber-300 shadow-md`}>
                      <Icon className="h-6 w-6" />
                    </span>
                    <div>
                      <h3 className="font-display text-xl font-bold text-white">
                        {card.title}
                      </h3>
                      <p className="text-xs text-amber-300 font-mono mt-0.5">
                        {card.isExternal ? card.href.replace("https://", "") : "In-Portal Resource"}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="mt-4 text-xs sm:text-sm text-white/70 leading-relaxed">
                    {card.description}
                  </p>
                </div>

                {/* Card Action */}
                <div className="mt-6 pt-4 border-t border-white/8">
                  <a
                    href={card.href}
                    target={card.isExternal ? "_blank" : undefined}
                    rel={card.isExternal ? "noopener noreferrer" : undefined}
                    className={`btn-shine flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-bold transition ${
                      card.highlight
                        ? "bg-gradient-to-r from-[#d4af37] via-[#ffb52e] to-[#ff8a3c] text-[#090d16] font-black shadow-lg shadow-amber-500/20 hover:brightness-110"
                        : "border border-white/15 bg-white/5 text-white hover:border-amber-400/40 hover:bg-amber-400/10 hover:text-amber-300"
                    }`}
                  >
                    <span>{card.ctaLabel}</span>
                    {card.isExternal ? (
                      <ExternalLink className="h-3.5 w-3.5" />
                    ) : (
                      <span className="text-xs">→</span>
                    )}
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Security & Open Policy Footer Notice */}
        <div className="mt-10 rounded-2xl border border-white/8 bg-white/[0.02] p-5 text-center text-xs text-white/50">
          <p className="flex flex-wrap items-center justify-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>
              All external services (Web Shop, Discord, Guides) operate under strict MuOrigins encryption and SSL safety protocols.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
