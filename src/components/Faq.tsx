import { useState } from "react";
import { Plus, MessageCircle, HelpCircle } from "lucide-react";
import { useI18n } from "../i18n";

export default function Faq() {
  const { t } = useI18n();
  const fq = t.faq;
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative scroll-mt-28 py-24 sm:py-32">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="reveal mx-auto max-w-2xl text-center">
          <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold tracking-[0.22em] text-violet-200 uppercase">
            <HelpCircle className="h-3.5 w-3.5" /> {fq.eyebrow}
          </span>
          <h2 className="font-display mt-5 text-3xl font-black tracking-tight text-white sm:text-5xl">
            {fq.title} <span className="text-gradient-arcane">{fq.titleAccent}</span>
          </h2>
          <p className="mt-3 text-sm text-white/60 sm:text-base">{fq.sub}</p>
        </div>

        <div className="mt-10 space-y-3">
          {fq.items.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                className={`reveal overflow-hidden rounded-2xl border transition-all duration-300 ${
                  isOpen
                    ? "border-amber-400/30 bg-white/[.05]"
                    : "border-white/8 bg-white/[.02] hover:border-white/15"
                }`}
                style={{ ["--reveal-delay" as string]: `${Math.min(i, 4) * 60}ms` }}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4.5 text-left sm:px-6 sm:py-5"
                >
                  <span
                    className={`text-[15px] font-bold sm:text-base ${
                      isOpen ? "text-white" : "text-white/85"
                    }`}
                  >
                    {f.q}
                  </span>
                  <span
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-all duration-300 ${
                      isOpen
                        ? "rotate-45 border-amber-400/40 bg-amber-400/15 text-amber-300"
                        : "border-white/10 bg-white/5 text-white/60"
                    }`}
                  >
                    <Plus className="h-4 w-4" strokeWidth={2.5} />
                  </span>
                </button>
                <div
                  className={`grid transition-all duration-400 ease-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                  style={{ transitionDuration: "400ms" }}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm leading-relaxed text-white/65 sm:px-6 sm:text-[15px]">
                      {f.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="reveal mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-violet-400/20 bg-violet-500/8 px-6 py-5 sm:flex-row">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#5865F2] text-white shadow-lg shadow-indigo-500/30">
              <MessageCircle className="h-5 w-5" />
            </span>
            <div className="text-sm">
              <p className="font-bold text-white">{t.ecosystem.card2Title}</p>
              <p className="text-white/55">{t.ecosystem.card2Desc}</p>
            </div>
          </div>
          <a
            href="https://discord.gg"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-shine w-full shrink-0 rounded-xl bg-[#5865F2] px-6 py-3 text-center text-sm font-extrabold text-white shadow-lg shadow-indigo-500/30 transition hover:brightness-110 sm:w-auto"
          >
            {t.ecosystem.card2Cta}
          </a>
        </div>
      </div>
    </section>
  );
}
