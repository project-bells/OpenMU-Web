import { Zap, Gem, ShieldCheck, Swords, Flame, Radar, ArrowRight, Activity } from "lucide-react";
import { SERVERS } from "../data";
import { useLiveOnline } from "../hooks/hooks";
import { useI18n } from "../i18n";

export default function Features() {
  const { t } = useI18n();
  const f = t.features;
  const online = useLiveOnline();

  const icons = [Zap, Gem, ShieldCheck, Swords, Flame, Radar];
  const values = ["50x", "30%", "0 P2W", "S6E3", "SUN", "100%"];

  return (
    <section id="rates" className="relative scroll-mt-28 py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-0 left-1/2 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-violet-700/12 blur-[130px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="reveal mx-auto max-w-3xl text-center">
          <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold tracking-[0.22em] text-amber-200 uppercase">
            <Activity className="h-3.5 w-3.5" /> {f.badge}
          </span>
          <h2 className="font-display mt-5 text-3xl font-black tracking-tight text-white sm:text-5xl">
            {f.h2a}
            <br />
            <span className="text-gradient-gold">{f.h2b}</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/60">{f.sub}</p>
        </div>

        {/* Server Quick Rates Strip */}
        <div
          className="reveal mt-10 overflow-hidden rounded-2xl border border-emerald-400/15 bg-emerald-400/[.04]"
          style={{ ["--reveal-delay" as string]: "120ms" }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 sm:px-7">
            <div className="flex items-center gap-3">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </span>
              <span className="text-sm font-semibold text-white">
                <span className="font-mono text-emerald-300 tabular-nums">
                  {online.toLocaleString()}
                </span>{" "}
                {f.liveNow}
              </span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px] text-white/50">
              {SERVERS.map((s) => (
                <span
                  key={s}
                  className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 sm:inline-flex"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> {s}
                </span>
              ))}
              <span className="text-emerald-300/80">● {f.uptime}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {f.items.map((item, i) => {
            const Icon = icons[i % icons.length];
            const val = values[i % values.length];
            return (
              <article
                key={i}
                className="reveal group relative overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-b from-white/[.06] to-white/[.015] p-6 transition-all duration-500 hover:-translate-y-1.5 hover:border-amber-400/30 hover:shadow-[0_24px_60px_-16px_rgba(245,196,81,.25)] sm:p-7"
                style={{ ["--reveal-delay" as string]: `${(i % 3) * 110}ms` }}
              >
                <div
                  className="absolute -top-20 -right-20 h-44 w-44 rounded-full bg-amber-400/0 blur-3xl transition-all duration-500 group-hover:bg-amber-400/15"
                  aria-hidden="true"
                />
                <div className="flex items-start justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-gradient-to-br from-white/12 to-white/3 shadow-inner transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                    <Icon className="h-5 w-5 text-amber-300" />
                  </span>
                  <span className="font-display text-2xl font-black text-white/15 transition group-hover:text-amber-300/40">
                    {val}
                  </span>
                </div>
                <p className="mt-5 inline-block rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold tracking-[0.15em] text-amber-200/80 uppercase">
                  {item.tag}
                </p>
                <h3 className="mt-2.5 text-lg font-bold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{item.desc}</p>
              </article>
            );
          })}
        </div>

        <div className="reveal mt-8 text-center">
          <a
            href="#classes"
            className="group inline-flex items-center gap-2 text-sm font-bold text-amber-300 transition hover:text-amber-200"
          >
            {f.more}
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </section>
  );
}
