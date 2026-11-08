import { useState, useId } from "react";
import {
  Coins,
  Sparkles,
  Clock,
  ArrowRight,
  LogIn,
  CheckCircle2,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { useI18n } from "../i18n";

export default function OnlineExchangeSection({
  onRegister,
  onLogin,
}: {
  onRegister?: () => void;
  onLogin?: () => void;
}) {
  const { t } = useI18n();
  const ox = t.onlineExchange;
  const [onlineHours, setOnlineHours] = useState<number>(20);
  const hoursSliderId = useId();

  // 1 hour = 5 Credits, 100 Credits = 50 WCoin (0.5 ratio)
  const CREDITS_PER_HOUR = 5;
  const earnedCredits = onlineHours * CREDITS_PER_HOUR;
  const exchangeableBlocks = Math.floor(earnedCredits / 100);
  const earnedWcoin = exchangeableBlocks * 50;

  const presets = [4, 10, 20, 24, 168];

  return (
    <section id="online-rewards" className="relative scroll-mt-28 overflow-hidden py-16 sm:py-24">
      {/* Background Glow */}
      <div className="pointer-events-none absolute inset-0 bg-radial from-amber-500/10 via-purple-900/10 to-transparent opacity-80" />
      <div className="pointer-events-none absolute -top-32 right-1/4 h-96 w-96 rounded-full bg-amber-400/10 blur-[130px]" />
      <div className="pointer-events-none absolute -bottom-32 left-1/4 h-96 w-96 rounded-full bg-violet-600/15 blur-[130px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-gradient-to-r from-amber-500/20 to-purple-600/20 px-4 py-1.5 text-xs font-bold text-amber-300 shadow-lg shadow-amber-500/10 uppercase">
            <Sparkles className="h-4 w-4 animate-spin-slow text-amber-400" />
            <span>{ox.badge}</span>
          </div>

          <h2 className="font-display mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
            {ox.h2a} <span className="text-gradient-gold">{ox.h2b}</span>
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-white/70 sm:text-base">{ox.sub}</p>
        </div>

        {/* 3-Step Formula Cards */}
        <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Step 1: 1 Hr = 5 Credits */}
          <div className="fantasy-panel gold-border group relative rounded-3xl p-6 transition-all duration-300 hover:border-amber-400/50 sm:p-7">
            <div className="mb-4 flex items-center justify-between">
              <span className="grid h-12 w-12 place-items-center rounded-2xl border border-amber-400/40 bg-gradient-to-br from-amber-400/20 to-amber-600/20 text-amber-300 shadow-md">
                <Clock className="h-6 w-6 text-amber-400" />
              </span>
              <span className="rounded-lg border border-amber-400/25 bg-amber-400/10 px-2.5 py-1 font-mono text-xs font-black text-amber-300/90">
                1 HR = 5 CR
              </span>
            </div>
            <h3 className="font-display mb-2 text-lg font-black text-white sm:text-xl">
              {ox.step1Title}
            </h3>
            <p className="text-xs leading-relaxed text-white/65 sm:text-sm">{ox.step1Desc}</p>
          </div>

          {/* Step 2: Accumulate Credits */}
          <div className="fantasy-panel gold-border group relative rounded-3xl p-6 transition-all duration-300 hover:border-amber-400/50 sm:p-7">
            <div className="mb-4 flex items-center justify-between">
              <span className="grid h-12 w-12 place-items-center rounded-2xl border border-amber-400/40 bg-gradient-to-br from-purple-400/20 to-amber-400/20 text-amber-300 shadow-md">
                <Coins className="h-6 w-6 text-amber-300" />
              </span>
              <span className="rounded-lg border border-amber-400/25 bg-amber-400/10 px-2.5 py-1 font-mono text-xs font-black text-amber-300/90">
                AUTO SAVE
              </span>
            </div>
            <h3 className="font-display mb-2 text-lg font-black text-white sm:text-xl">
              {ox.step2Title}
            </h3>
            <p className="text-xs leading-relaxed text-white/65 sm:text-sm">{ox.step2Desc}</p>
          </div>

          {/* Step 3: 100 Credits = 50 WCoin */}
          <div className="fantasy-panel gold-border group relative rounded-3xl p-6 transition-all duration-300 hover:border-amber-400/50 sm:p-7">
            <div className="mb-4 flex items-center justify-between">
              <span className="grid h-12 w-12 place-items-center rounded-2xl border border-amber-400/40 bg-gradient-to-br from-emerald-400/20 to-amber-400/20 text-amber-300 shadow-md">
                <Zap className="h-6 w-6 text-amber-300" />
              </span>
              <span className="rounded-lg border border-amber-400/25 bg-amber-400/10 px-2.5 py-1 font-mono text-xs font-black text-amber-300/90">
                100 CR = 50 WC
              </span>
            </div>
            <h3 className="font-display mb-2 text-lg font-black text-white sm:text-xl">
              {ox.step3Title}
            </h3>
            <p className="text-xs leading-relaxed text-white/65 sm:text-sm">{ox.step3Desc}</p>
          </div>
        </div>

        {/* Interactive Live Calculator & Login Exchange Card */}
        <div className="fantasy-panel gold-border relative rounded-3xl p-6 shadow-[0_20px_60px_-15px_rgba(212,175,55,0.25)] sm:p-10">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            {/* Left Column: Online Hours Calculator (1 Hr = 5 Credits) */}
            <div className="space-y-6 lg:col-span-7">
              <div>
                <span className="mb-1 flex items-center gap-1.5 text-xs font-bold tracking-wider text-amber-300 uppercase">
                  <Coins className="h-4 w-4" />
                  {ox.calcBadge}
                </span>
                <h3 className="font-display text-xl font-black text-white sm:text-2xl">
                  {ox.calcTitle}
                </h3>
                <p className="mt-1 text-xs text-white/60">{ox.calcSub}</p>
              </div>

              {/* Slider (1 to 168 hrs) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <label htmlFor={hoursSliderId} className="cursor-pointer font-semibold text-white/80">
                    {ox.durationLabel}
                  </label>
                  <span className="font-mono text-lg font-bold text-amber-300">
                    {onlineHours} {ox.hoursUnit}
                  </span>
                </div>
                <input
                  id={hoursSliderId}
                  type="range"
                  min="1"
                  max="168"
                  value={onlineHours}
                  onChange={(e) => setOnlineHours(Number(e.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-amber-400"
                  aria-label={ox.durationLabel}
                />
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="mr-1 text-xs font-medium text-white/50">{ox.quickSelect}</span>
                {presets.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setOnlineHours(h)}
                    className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                      onlineHours === h
                        ? "bg-amber-400 text-black shadow-md shadow-amber-400/30"
                        : "border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {h === 24 ? `24${ox.dayPreset}` : h === 168 ? `168${ox.weekPreset}` : `${h}${ox.hourShort}`}
                  </button>
                ))}
              </div>

              {/* Guarantees */}
              <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
                <div className="flex items-center gap-2.5 rounded-xl border border-white/8 bg-white/[0.03] px-3.5 py-2.5 text-xs text-white/80">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span>{ox.guarantee1}</span>
                </div>
                <div className="flex items-center gap-2.5 rounded-xl border border-white/8 bg-white/[0.03] px-3.5 py-2.5 text-xs text-white/80">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-amber-400" />
                  <span>{ox.guarantee2}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Reward Summary & Login CTA */}
            <div className="lg:col-span-5">
              <div className="relative overflow-hidden rounded-2xl border border-amber-400/30 bg-gradient-to-b from-[#131a2e] to-[#0a0f1d] p-6 shadow-xl">
                <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-amber-400/10 blur-2xl" />

                <div className="text-center">
                  <span className="font-mono text-xs font-bold tracking-widest text-white/50 uppercase">
                    {ox.estRewards} ({onlineHours} {ox.hoursUnit})
                  </span>

                  <div className="mt-4 grid grid-cols-2 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <div>
                      <div className="font-display text-2xl font-black text-amber-300 sm:text-3xl">
                        {earnedCredits.toLocaleString()}
                      </div>
                      <div className="mt-1 text-xs font-medium text-white/60">{ox.creditsLabel}</div>
                    </div>

                    <div className="border-l border-white/10 pl-3">
                      <div className="font-display text-2xl font-black text-emerald-400 sm:text-3xl">
                        {earnedWcoin.toLocaleString()}
                      </div>
                      <div className="mt-1 text-xs font-medium text-emerald-300/80">
                        {ox.freeWcoinLabel}
                      </div>
                    </div>
                  </div>

                  <p className="mt-3 text-[11px] text-white/50">{ox.rateNote}</p>
                </div>

                {/* Action Buttons: Account Login (replaces WebShop) & Register */}
                <div className="mt-6 flex flex-col gap-3">
                  {onLogin && (
                    <button
                      type="button"
                      onClick={onLogin}
                      className="btn-shine flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#ffb52e] to-[#ff8a3c] px-5 py-3.5 text-sm font-black text-[#090d16] shadow-lg shadow-amber-500/25 transition hover:brightness-110"
                    >
                      <LogIn className="h-4 w-4" />
                      <span>{ox.loginCta}</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  )}

                  {onRegister && (
                    <button
                      type="button"
                      onClick={onRegister}
                      className="w-full rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-xs font-bold text-white transition hover:bg-white/10 hover:text-amber-300"
                    >
                      {ox.registerCta}
                    </button>
                  )}
                </div>

                <div className="mt-4 text-center font-mono text-[11px] text-white/40">
                  {ox.cmdNote}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
