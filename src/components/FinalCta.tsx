import { useState } from "react";
import { Download, Monitor, Apple, HardDrive, CheckCircle2, Copy, ChevronRight } from "lucide-react";
import { useI18n, fmt } from "../i18n";


export default function FinalCta({ onRegister }: { onRegister: () => void }) {
  const { t } = useI18n();
  const c = t.cta;
  const STEPS = c.steps.map((s, i) => ({ n: `0${i + 1}`, ...s }));
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);

  const fakeDownload = () => {
    if (progress !== null) return;
    setProgress(0);
    const id = setInterval(() => {
      setProgress((p) => {
        if (p === null) return null;
        const next = p + Math.random() * 14;
        if (next >= 100) {
          clearInterval(id);
          return 100;
        }
        return next;
      });
    }, 220);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText("https://muorigins.gg/download/MuOrigins_S6E3_Full.exe");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* noop */ }
  };

  return (
    <section id="download" className="relative scroll-mt-28 overflow-hidden py-24 sm:py-32">
      <div className="absolute inset-0">
        <img src="/images/hero-lorencia.jpg" alt="" aria-hidden="true" className="h-full w-full object-cover opacity-25" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#05060f] via-[#0a0c1c]/85 to-[#05060f]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_50%,rgba(245,196,81,.12),transparent_70%)]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="gold-border glass-strong reveal overflow-hidden rounded-[32px] p-7 sm:p-12">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-4 py-1.5 text-xs font-bold tracking-[0.2em] text-emerald-200 uppercase">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                {c.badge}
              </span>
              <h2 className="font-display mt-5 text-3xl font-black tracking-tight text-white sm:text-5xl">
                {c.h2a} <span className="text-gradient-gold">{c.h2b}</span>
              </h2>
              <p className="mt-4 text-white/60">
                {c.sub}
              </p>

              <ol className="mt-7 space-y-3">
                {STEPS.map((s) => (
                  <li key={s.n} className="group flex items-center gap-4 rounded-2xl border border-white/8 bg-white/[.03] p-3.5 transition hover:border-amber-400/25">
                    <span className="font-display grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-amber-300 to-orange-500 text-sm font-black text-[#1a1200]">
                      {s.n}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-white">{s.t}</p>
                      <p className="text-xs text-white/50">{s.d}</p>
                    </div>
                    <ChevronRight className="ml-auto h-4 w-4 text-white/25 transition group-hover:translate-x-1 group-hover:text-amber-300" />
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#070818]/80 p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-black text-white">{c.client}</h3>
                <span className="rounded-full bg-white/8 px-2.5 py-1 font-mono text-[11px] font-bold text-white/60">v6.3.2</span>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                {[Monitor, Apple, HardDrive].map((ic, i) => ({ icon: ic, l: c.os[i] })).map((o) => (
                  <div key={o.l} className="rounded-xl border border-white/8 bg-white/[.03] px-2 py-3 text-xs font-bold text-white/70 transition hover:border-white/20 hover:text-white">
                    <o.icon className="mx-auto mb-1.5 h-4.5 w-4.5 h-5 w-5 text-white/50" />
                    {o.l}
                  </div>
                ))}
              </div>

              <button
                onClick={fakeDownload}
                className="btn-shine mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#f5c451] via-[#ffb52e] to-[#ff8a3c] px-6 py-4 text-base font-extrabold text-[#1a1200] shadow-[0_18px_50px_-12px_rgba(245,196,81,.55)] transition hover:scale-[1.01] active:scale-[.99]"
              >
                <Download className="h-5 w-5" />
                {progress === null ? c.download : progress >= 100 ? c.ready : fmt(c.downloading, { p: Math.floor(progress) })}
              </button>

              {progress !== null && (
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuenow={Math.floor(progress)} aria-valuemin={0} aria-valuemax={100}>
                  <div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-orange-500 transition-all duration-200" style={{ width: `${progress}%` }} />
                </div>
              )}

              <button
                onClick={copyLink}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 font-mono text-xs text-white/60 transition hover:border-white/20 hover:text-white"
              >
                {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? c.copied : c.copy}
              </button>

              <div className="my-5 flex items-center gap-3 text-[11px] font-bold tracking-widest text-white/35 uppercase">
                <span className="h-px flex-1 bg-white/10" /> {c.or} <span className="h-px flex-1 bg-white/10" />
              </div>

              <button
                onClick={onRegister}
                className="w-full rounded-2xl border border-violet-400/30 bg-violet-500/12 px-6 py-3.5 text-sm font-extrabold text-violet-100 transition hover:bg-violet-500/20"
              >
                {c.createFirst}
              </button>

              <div className="mt-4 space-y-1.5 text-center font-mono text-[11px] text-white/35">
                <p>{c.check1}</p>
                <p>{c.check2}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
