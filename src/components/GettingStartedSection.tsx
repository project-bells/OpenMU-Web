import { UserPlus, Download, Trophy, ArrowRight, ShieldCheck, Gamepad2 } from "lucide-react";

export default function GettingStartedSection({ onRegister }: { onRegister: () => void }) {
  const steps = [
    {
      number: "1",
      badge: "30 Seconds",
      title: "Create Free Account",
      description:
        "No credit card, no waiting. Instant activation connected directly to the OpenMU database. Choose your username, password, and character deletion code.",
      actionLabel: "Register Account Now",
      href: "#register",
      icon: UserPlus,
      highlight: true,
      onClick: onRegister,
    },
    {
      number: "2",
      badge: "2.1 GB Client",
      title: "Download Game Client",
      description:
        "Fast cloud mirrors via Mega and MediaFire. Clean installer with auto-patcher and built-in MHP GameGuard anti-cheat protection. 100% VirusTotal verified.",
      actionLabel: "Get Full Client",
      href: "#download",
      icon: Download,
      highlight: false,
    },
    {
      number: "3",
      badge: "Instant Action",
      title: "Spawn in Lorencia & Rise",
      description:
        "Select from 7 iconic classes, team up with veteran party members, farm Blood Castle, and claim your glory on the live Server Rankings Hall of Fame.",
      actionLabel: "View Live Rankings",
      href: "#ranking",
      icon: Trophy,
      highlight: false,
    },
  ];

  return (
    <section id="getting-started" className="relative scroll-mt-28 py-20 sm:py-28">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-radial from-purple-900/10 via-transparent to-transparent opacity-50 pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs font-bold tracking-[0.2em] text-amber-300 uppercase">
            <Gamepad2 className="h-3.5 w-3.5" />
            <span>Fast Onboarding</span>
          </div>
          <h2 className="font-display mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl">
            FROM ZERO TO LORENCIA <br />
            <span className="text-gradient-gold">IN UNDER 5 MINUTES</span>
          </h2>
          <p className="mt-4 text-sm text-white/60 sm:text-base leading-relaxed">
            Follow three simple steps to start your journey. No paywalls, no complex launchers—just pure classic MMORPG action.
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className={`fantasy-panel gold-border relative flex flex-col justify-between rounded-3xl p-7 transition-all duration-300 hover:translate-y-[-4px] ${
                  step.highlight
                    ? "border-amber-400/50 shadow-[0_15px_40px_-10px_rgba(212,175,55,0.25)]"
                    : "shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]"
                }`}
              >
                <div>
                  {/* Step Header */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-3xl font-black text-amber-300">
                      0{step.number}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-bold text-white/60 uppercase">
                      {step.badge}
                    </span>
                  </div>

                  {/* Icon & Title */}
                  <div className="mt-5 flex items-center gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-300">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="font-display text-lg font-bold text-white">
                      {step.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="mt-3 text-xs sm:text-sm text-white/70 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Action Button */}
                <div className="mt-6 pt-4 border-t border-white/8">
                  {step.onClick ? (
                    <button
                      onClick={step.onClick}
                      className="btn-shine flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#ffb52e] to-[#ff8a3c] px-4 py-3 text-xs font-black text-[#090d16] shadow-md shadow-amber-500/20 transition hover:brightness-110 active:scale-[0.98]"
                    >
                      <span>{step.actionLabel}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    <a
                      href={step.href}
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

        {/* Security / Trust Strip */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-white/50 border-t border-white/8 pt-8">
          <span className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>MHP GameGuard Anti-Cheat Protected</span>
          </span>
          <span>•</span>
          <span>Auto-Updating Patch Launcher</span>
          <span>•</span>
          <span>Windows 7, 8, 10, 11 64-bit Fully Supported</span>
        </div>
      </div>
    </section>
  );
}
