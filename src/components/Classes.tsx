import { useState } from "react";
import { Sword, Sparkles, Heart, Crown, Flame, Moon, Zap, ChevronRight, Gauge } from "lucide-react";
import { CLASSES } from "../data";
import { useI18n, fmt } from "../i18n";

const ICONS: Record<string, typeof Sword> = { Sword, Sparkles, Heart, Crown, Flame, Moon, Zap };

export default function Classes({ onRegister }: { onRegister: () => void }) {
  const { t } = useI18n();
  const c = t.classes;
  const [active, setActive] = useState(CLASSES[0].id);
  const cls = CLASSES.find((c) => c.id === active)!;
  const Icon = ICONS[cls.icon] ?? Sword;
  const tx = c.items[cls.id];

  return (
    <section id="classes" className="relative scroll-mt-28 overflow-hidden py-24 sm:py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0c1c] to-transparent" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-1/4 -left-32 h-[420px] w-[420px] rounded-full bg-violet-700/15 blur-[130px]" />
        <div className="absolute -right-32 bottom-1/4 h-[420px] w-[420px] rounded-full bg-amber-500/10 blur-[130px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="reveal mx-auto max-w-3xl text-center">
          <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold tracking-[0.22em] text-violet-200 uppercase">
            <Sword className="h-3.5 w-3.5" /> {c.badge}
          </span>
          <h2 className="font-display mt-5 text-3xl font-black tracking-tight text-white sm:text-5xl">
            {c.h2a} <span className="text-gradient-arcane">{c.h2b}</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/60">
            {c.sub}
          </p>
        </div>

        {/* tabs */}
        <div className="reveal mt-10 flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="tablist" aria-label={c.tablist}>
          {CLASSES.map((k) => {
            const isActive = k.id === active;
            return (
              <button
                key={k.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActive(k.id)}
                className={`flex shrink-0 items-center gap-2.5 rounded-2xl border px-3.5 py-2.5 text-sm font-bold whitespace-nowrap transition-all duration-300 ${
                  isActive
                    ? "border-amber-400 bg-gradient-to-r from-[#f5c451] to-[#ff8a3c] text-[#1a1200] shadow-lg shadow-amber-500/30 scale-105"
                    : "border-white/10 bg-white/[.04] text-white/70 hover:border-white/20 hover:text-white"
                }`}
              >
                <img
                  src={k.image}
                  alt={k.name}
                  className="h-6 w-6 rounded-lg object-cover object-top border border-black/30 shadow-sm"
                />
                <span>{k.name}</span>
              </button>
            );
          })}
        </div>

        {/* showcase */}
        <div className="reveal mt-6 grid overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-[#10132e] to-[#070818] lg:grid-cols-[.95fr_1.05fr]" style={{ ["--reveal-delay" as string]: "120ms" }}>
          {/* image */}
          <div className="relative min-h-[380px] overflow-hidden sm:min-h-[480px] lg:min-h-[580px] bg-[#050711]">
            <img
              key={cls.id}
              src={cls.image}
              alt={`${cls.name} — ${cls.title}`}
              className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-700"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070818] via-transparent to-transparent opacity-90" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#070818]/60 max-lg:bg-gradient-to-t" />
            <div className="absolute inset-0 mix-blend-overlay opacity-30" style={{ background: `linear-gradient(160deg, ${cls.color}55, transparent 60%)` }} />
            <div className="absolute bottom-5 left-5 flex items-center gap-2 z-10">
              <span className="glass rounded-full px-3.5 py-1.5 text-xs font-bold text-white shadow-md">⚔ {tx.role}</span>
            </div>
            <div
              className="absolute top-5 left-5 rounded-full px-3.5 py-1.5 font-mono text-[11px] font-bold tracking-widest uppercase z-10 shadow-md backdrop-blur-md"
              style={{ background: `${cls.color}22`, color: cls.color, border: `1px solid ${cls.color}66` }}
            >
              {cls.title}
            </div>
          </div>

          {/* details */}
          <div className="relative p-6 sm:p-10" key={`d-${cls.id}`}>
            <div className="flex items-center gap-4">
              <span
                className="grid h-14 w-14 place-items-center rounded-2xl shadow-lg transition-all"
                style={{ background: `linear-gradient(135deg, ${cls.color}, ${cls.color}88)`, boxShadow: `0 12px 32px -8px ${cls.color}66` }}
              >
                <Icon className="h-6 w-6 text-white" />
              </span>
              <div>
                <h3 className="font-display text-2xl font-black text-white sm:text-3xl">{cls.name}</h3>
                <p className="text-sm font-medium" style={{ color: cls.color }}>{tx.difficulty}</p>
              </div>
            </div>

            <p className="mt-5 leading-relaxed text-white/70">{tx.desc}</p>

            {/* stats */}
            <div className="mt-6 space-y-3">
              {Object.entries(cls.stats).map(([k, v], i) => (
                <div key={k} className="flex items-center gap-3">
                  <span className="w-10 font-mono text-[11px] font-bold text-white/45">{k}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/8">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${v}%`,
                        background: `linear-gradient(90deg, ${cls.color}77, ${cls.color})`,
                        boxShadow: `0 0 10px ${cls.color}`,
                        animation: `grow .8s ${i * 0.08}s cubic-bezier(.22,1,.36,1) both`,
                      }}
                    />
                  </div>
                  <span className="w-8 text-right font-mono text-xs font-bold text-white/70 tabular-nums">{v}</span>
                </div>
              ))}
            </div>

            {/* skills */}
            <div className="mt-6 flex flex-wrap gap-2">
              {cls.skills.map((s) => (
                <span key={s} className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-bold text-white/80 transition hover:border-white/25 hover:text-white">
                  ✨ {s}
                </span>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={onRegister}
                className="btn-shine group flex flex-1 items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-extrabold text-[#1a1200] transition hover:brightness-110 active:scale-[.98]"
                style={{ background: `linear-gradient(100deg, #ffe9a8, ${cls.color} 140%)` }}
              >
                <Gauge className="h-4 w-4" />
                {fmt(c.play, { name: cls.name })}
              </button>
              <a href="#download" className="flex items-center justify-center gap-1.5 rounded-2xl border border-white/12 bg-white/5 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/10">
                {c.builds} <ChevronRight className="h-4 w-4" />
              </a>
            </div>
            <style>{`@keyframes grow { from { width: 0 } }`}</style>
          </div>
        </div>

        <p className="reveal mt-6 text-center text-xs text-white/35">
          {c.note}
        </p>
      </div>
    </section>
  );
}
