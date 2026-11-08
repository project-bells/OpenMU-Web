import { Droplet, Flame, Swords, Eye, Shield, Skull, Clock, Gift } from "lucide-react";
import { EVENTS } from "../data";
import { useI18n } from "../i18n";

const ICONS: Record<string, typeof Flame> = { Droplet, Flame, Swords, Eye, Shield, Skull };

export default function Events() {
  const { t } = useI18n();
  const ev = t.events;
  return (
    <section id="events" className="relative scroll-mt-28 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="reveal flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold tracking-[0.22em] text-cyan-200 uppercase">
              <Clock className="h-3.5 w-3.5" /> {ev.eyebrow}
            </span>
            <h2 className="font-display mt-5 text-3xl font-black tracking-tight text-white sm:text-5xl">
              {ev.title} <span className="text-gradient-arcane">{ev.titleAccent}</span>
            </h2>
            <p className="mt-4 text-white/60">{ev.sub}</p>
          </div>
          <div className="glass flex items-center gap-3 rounded-2xl px-5 py-3.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </span>
            <div className="text-sm">
              <p className="font-bold text-white">{ev.statusOpen}</p>
              <p className="text-xs text-white/50">{ev.liveNotice}</p>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ev.items.map((tx, i) => {
            const meta = EVENTS[i] || EVENTS[0];
            const Icon = ICONS[meta.icon] ?? Flame;
            return (
              <article
                key={tx.name}
                className="reveal group relative overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-br from-white/[.05] to-transparent p-6 transition-all duration-500 hover:-translate-y-1 hover:border-cyan-300/30"
                style={{ ["--reveal-delay" as string]: `${(i % 3) * 100}ms` }}
              >
                {meta.hot && (
                  <span className="absolute top-4 right-4 rounded-full bg-gradient-to-r from-red-500 to-orange-500 px-2.5 py-1 text-[10px] font-black tracking-widest text-white uppercase shadow-lg shadow-red-500/30">
                    🔥 {ev.statusOpen}
                  </span>
                )}
                <span className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/5 transition group-hover:scale-110">
                  <Icon className="h-5 w-5 text-cyan-300" />
                </span>
                <h3 className="mt-4 text-lg font-bold text-white">{tx.name}</h3>
                <p className="text-sm text-white/50">{tx.type}</p>
                <div className="mt-4 flex items-center justify-between border-t border-white/8 pt-4 text-xs">
                  <span className="font-mono font-bold text-white/70">
                    ⏱ {tx.intervalMin}m
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-amber-200">
                    <Gift className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{tx.reward}</span>
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
