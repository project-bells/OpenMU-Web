import { useState, useEffect } from "react";
import { Star, Quote, ChevronLeft, ChevronRight, BadgeCheck } from "lucide-react";
import { TESTIMONIALS } from "../data";
import { useI18n, fmt } from "../i18n";

export default function Testimonials() {
  const { t } = useI18n();
  const tm = t.testimonials;
  const [page, setPage] = useState(0);
  const perView = 3;
  const pages = Math.ceil(TESTIMONIALS.length / perView);

  useEffect(() => {
    const id = setInterval(() => setPage((p) => (p + 1) % pages), 6000);
    return () => clearInterval(id);
  }, [pages]);

  const visible = TESTIMONIALS.map((x, i) => ({ ...x, ...tm.items[i] })).slice(page * perView, page * perView + perView);

  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0b0d22] to-transparent" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="reveal mx-auto max-w-3xl text-center">
          <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold tracking-[0.22em] text-amber-200 uppercase">
            <Star className="h-3.5 w-3.5 fill-amber-300 text-amber-300" /> {tm.badge}
          </span>
          <h2 className="font-display mt-5 text-3xl font-black tracking-tight text-white sm:text-5xl">
            {tm.h2a} <span className="text-gradient-gold">{tm.h2b}</span>
          </h2>
          <div className="mt-4 flex items-center justify-center gap-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-amber-300 text-amber-300" />
            ))}
            <span className="ml-2 text-sm text-white/50">{tm.topRated}</span>
          </div>
        </div>

        <div className="reveal mt-10 grid gap-4 md:grid-cols-3" key={`${page}-${t.locale}`}>
          {visible.map((t, i) => (
            <figure
              key={t.name}
              className="glass group relative overflow-hidden rounded-3xl p-6 transition-all duration-500 hover:-translate-y-1 hover:border-amber-400/25 sm:p-7"
              style={{ animation: `fadeSlide .6s ${i * 0.12}s cubic-bezier(.22,1,.36,1) both` }}
            >
              <Quote className="absolute top-5 right-6 h-8 w-8 text-white/8 transition group-hover:text-amber-400/15" />
              <div className="flex gap-1">
                {Array.from({ length: t.stars }).map((_, s) => (
                  <Star key={s} className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
                ))}
              </div>
              <blockquote className="mt-4 text-[15px] leading-relaxed text-white/75">“{t.quote}”</blockquote>
              <figcaption className="mt-5 flex items-center gap-3 border-t border-white/8 pt-5">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-amber-500 text-sm font-black text-white">
                  {t.avatar}
                </span>
                <div>
                  <p className="flex items-center gap-1.5 text-sm font-bold text-white">
                    {t.name} <BadgeCheck className="h-4 w-4 text-cyan-300" />
                  </p>
                  <p className="text-xs text-white/50">{t.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            onClick={() => setPage((p) => (p - 1 + pages) % pages)}
            aria-label={tm.prev}
            className="grid h-11 w-11 place-items-center rounded-full border border-white/12 bg-white/5 text-white transition hover:border-amber-400/40 hover:bg-amber-400/10"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex gap-2">
            {Array.from({ length: pages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                aria-label={fmt(tm.goto, { n: i + 1 })}
                className={`h-2 rounded-full transition-all duration-300 ${i === page ? "w-8 bg-amber-400" : "w-2 bg-white/20 hover:bg-white/40"}`}
              />
            ))}
          </div>
          <button
            onClick={() => setPage((p) => (p + 1) % pages)}
            aria-label={tm.next}
            className="grid h-11 w-11 place-items-center rounded-full border border-white/12 bg-white/5 text-white transition hover:border-amber-400/40 hover:bg-amber-400/10"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
      <style>{`@keyframes fadeSlide { from { opacity: 0; transform: translateY(24px) } to { opacity: 1; transform: translateY(0) } }`}</style>
    </section>
  );
}
