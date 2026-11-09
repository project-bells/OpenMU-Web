import { useMemo } from "react";
import { Castle, Crown, Timer, Users, Coins, Flag } from "lucide-react";
import { useCountdown, getNextSiege } from "../hooks/hooks";
import { useI18n } from "../i18n";

export default function Siege({ onRegister }: { onRegister: () => void }) {
  const { t } = useI18n();
  const g = t.siege;
  const target = useMemo(() => getNextSiege(), []);
  const { days, hours, minutes, seconds } = useCountdown(target);

  const units = [
    { v: days, l: g.units[0] || "Days" },
    { v: hours, l: g.units[1] || "Hours" },
    { v: minutes, l: g.units[2] || "Mins" },
    { v: seconds, l: g.units[3] || "Secs" },
  ];

  const icons = [Coins, Crown, Flag];

  return (
    <section id="siege" className="relative scroll-mt-28 overflow-hidden py-24 sm:py-32">
      <div className="absolute inset-0">
        <img
          src="/images/castle-siege.jpg"
          alt={g.alt}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-[#05060f]/82" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#05060f] via-transparent to-[#05060f]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="reveal">
            <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold tracking-[0.22em] text-red-200 uppercase">
              <Castle className="h-3.5 w-3.5" /> {g.badge}
            </span>
            <h2 className="font-display mt-5 text-3xl font-black tracking-tight text-white sm:text-5xl">
              {g.h2a}
              <br />
              <span className="text-gradient-gold">{g.h2b}</span>
            </h2>
            <p className="mt-4 max-w-lg leading-relaxed text-white/65">
              {g.subA}
              <strong className="font-semibold text-white">{g.subStrong}</strong>
              {g.subB}
            </p>

            <div className="mt-6 grid max-w-lg grid-cols-1 gap-3 sm:grid-cols-3">
              {g.perks.map((p, idx) => {
                const Icon = icons[idx % icons.length];
                return (
                  <div
                    key={`${p.t}-${idx}`}
                    className="glass rounded-2xl p-3.5 text-center transition hover:border-amber-400/30"
                  >
                    <Icon className="mx-auto h-5 w-5 text-amber-300" />
                    <p className="mt-2 text-xs font-bold text-white sm:text-sm">{p.t}</p>
                    <p className="mt-1 text-[11px] text-white/50">{p.d}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-white/55">
              <Users className="h-4 w-4 text-emerald-400" />
              <span>{g.owners}</span>
              <span className="font-bold text-white">VENDETTA</span>
              <span className="rounded-full bg-amber-400/15 px-2.5 py-0.5 text-[11px] font-bold text-amber-200">
                {g.reign}
              </span>
            </div>
          </div>

          {/* Countdown Card */}
          <div
            className="reveal mx-auto w-full max-w-md"
            style={{ ["--reveal-delay" as string]: "140ms" }}
          >
            <div className="gold-border glass-strong relative overflow-hidden rounded-[28px] p-7 text-center sm:p-9">
              <div
                className="absolute -top-24 left-1/2 h-48 w-72 -translate-x-1/2 rounded-full bg-red-600/25 blur-[80px]"
                aria-hidden="true"
              />
              <p className="flex items-center justify-center gap-2 font-mono text-[11px] font-bold tracking-[0.25em] text-white/60 uppercase">
                <Timer className="h-4 w-4 text-red-300" /> {g.next}
              </p>
              <div className="mt-5 grid grid-cols-4 gap-2.5 sm:gap-3">
                {units.map((u, idx) => (
                  <div
                    key={`${u.l}-${idx}`}
                    className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-white/[.02] px-2 py-4"
                  >
                    <p className="font-display text-2xl font-black text-white tabular-nums sm:text-4xl">
                      {String(u.v).padStart(2, "0")}
                    </p>
                    <p className="mt-1 text-[10px] font-bold tracking-[0.15em] text-white/45 uppercase">
                      {u.l}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-2xl border border-white/10 bg-white/[.04] p-3.5 text-center">
                <p className="text-xs font-medium text-amber-200/90">{g.signup}</p>
              </div>
              <button
                onClick={onRegister}
                className="btn-shine mt-5 w-full rounded-2xl bg-gradient-to-r from-red-500 via-orange-500 to-amber-400 px-6 py-4 text-base font-extrabold text-white shadow-[0_18px_50px_-12px_rgba(255,90,60,.6)] transition hover:scale-[1.02] active:scale-[.98]"
              >
                {g.cta}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
