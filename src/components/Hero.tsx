import { useEffect, useRef, useState } from "react";
import { Play, Download, ShieldCheck, ChevronDown, Swords, Zap } from "lucide-react";
import { useLiveOnline } from "../hooks/hooks";
import { useI18n } from "../i18n";
import { fetchServerStatus, RealmData } from "../services/dbApi";

/** Ambient particle canvas */
function Particles() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let w = 0, h = 0;
    const DPR = Math.min(2, window.devicePixelRatio || 1);
    const N = 90;
    const parts = Array.from({ length: N }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 2.2 + 0.4,
      s: Math.random() * 0.0006 + 0.00015,
      o: Math.random() * 0.7 + 0.15,
      hue: Math.random() > 0.5 ? 45 : 265,
      drift: Math.random() * 0.0004,
    }));
    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      w = rect?.width ?? window.innerWidth;
      h = rect?.height ?? window.innerHeight;
      canvas.width = w * DPR;
      canvas.height = h * DPR;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);
    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        p.y -= p.s;
        p.x += Math.sin(p.y * 12) * p.drift;
        if (p.y < -0.02) { p.y = 1.02; p.x = Math.random(); }
        const tw = 0.6 + 0.4 * Math.sin(Date.now() * 0.001 + p.x * 20);
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 90%, 70%, ${p.o * tw})`;
        ctx.shadowBlur = 12;
        ctx.shadowColor = `hsla(${p.hue}, 90%, 60%, .8)`;
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} className="pointer-events-none absolute inset-0" aria-hidden="true" />;
}

const getLoadColor = (pct: number) => {
  if (pct >= 80) return "#ff5a3c";
  if (pct >= 50) return "#f5c451";
  return "#38e1ff";
};

const getRoomTag = (realm: RealmData, index: number, lang: string) => {
  const n = (realm.name || "").toLowerCase();
  if (realm.pvp === false || n.includes("non-pvp") || n.includes("ไม่มี pvp") || n.includes("sub-server")) {
    return lang === "th" ? "ไม่มี PvP" : "Non-PvP";
  }
  if (n.includes("war") || n.includes("วอร์") || n.includes("siege") || index === 0) {
    return lang === "th" ? "PvP • วอร์" : "PvP • Siege";
  }
  return lang === "th" ? "ใหม่ • PvP" : "Fresh • PvP";
};

const getDisplayName = (fullName: string, fallbackIdx: number) => {
  if (!fullName) return `Origins-${fallbackIdx + 1}`;
  const match = fullName.match(/^([^(]+)/);
  return (match ? match[1].trim() : fullName) || `Origins-${fallbackIdx + 1}`;
};

export default function Hero({ onRegister }: { onRegister: () => void }) {
  const { t, lang } = useI18n();
  const h = t.hero;
  const online = useLiveOnline(4874);

  const [realms, setRealms] = useState<RealmData[]>([
    { name: "Origins-1", loadPct: 86, online: 2420, max: 2500, status: "Normal", pvp: true },
    { name: "Origins-2", loadPct: 62, online: 1680, max: 2500, status: "Normal", pvp: false },
    { name: "Origins-3", loadPct: 41, online: 792, max: 2000, status: "Normal", pvp: true },
  ]);
  const [serverState, setServerState] = useState<"online" | "offline">("online");

  useEffect(() => {
    let mounted = true;
    const loadRealms = async () => {
      try {
        const data = await fetchServerStatus();
        if (mounted && data.realms && data.realms.length > 0) {
          setRealms(data.realms);
          setServerState(data.status.toLowerCase().includes("off") ? "offline" : "online");
        }
      } catch {
        // Keep fallback
      }
    };
    loadRealms();
    const interval = setInterval(loadRealms, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <section id="top" className="noise relative flex min-h-[100svh] items-center overflow-hidden pt-[130px] pb-16">
      <div className="absolute inset-0">
        <img src="/images/hero-lorencia.jpg" alt={h.heroAlt} className="h-full w-full scale-105 object-cover object-center" fetchPriority="high" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#090d16]/85 via-[#090d16]/60 to-[#090d16]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(139,92,246,.28),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_45%_35%_at_20%_70%,rgba(212,175,55,.18),transparent_70%)]" />
        <div className="grid-bg absolute inset-0" />
      </div>

      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-aurora absolute -top-32 left-1/4 h-[420px] w-[620px] rounded-full bg-violet-600/25 blur-[120px]" />
        <div className="animate-float-slow absolute top-1/3 -right-24 h-[380px] w-[380px] rounded-full bg-amber-500/15 blur-[110px]" />
        <div className="animate-float absolute bottom-10 -left-20 h-[300px] w-[420px] rounded-full bg-cyan-500/12 blur-[110px]" />
      </div>

      <Particles />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_.85fr]">
          <div className="text-center lg:text-left">
            <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
              <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide text-white/90">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                <span className="font-mono text-emerald-300 tabular-nums">{online.toLocaleString(t.locale)} {h.online}</span>
              </span>
            </div>

            <h1 key={lang} className="hero-title font-display mt-6 text-[2.15rem] leading-[1.05] font-black tracking-tight break-words text-white sm:text-5xl xl:text-[4.2rem]">
              {h.h1a}
              <br />
              <span className="text-gradient-gold">{h.h1b}</span>
              <br />
              <span className="text-gradient-arcane">{h.h1c}</span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg lg:mx-0">
              {h.subA}<strong className="text-white">{h.subStrong}</strong>{h.subB}
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <a
                href="#register"
                onClick={onRegister}
                className="btn-shine group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#d4af37] via-[#ffb52e] to-[#ff8a3c] px-7 py-4 text-base font-extrabold text-[#090d16] shadow-[0_18px_50px_-12px_rgba(212,175,55,.6)] transition hover:scale-[1.02] hover:shadow-[0_22px_60px_-10px_rgba(212,175,55,.7)] active:scale-[.98] sm:w-auto"
              >
                <Zap className="h-5 w-5 transition group-hover:rotate-12" />
                {h.ctaRegister}
              </a>
              <a
                href="#download"
                className="glass group flex w-full items-center justify-center gap-2 rounded-2xl px-7 py-4 text-base font-bold text-white transition hover:border-white/25 hover:bg-white/10 active:scale-[.98] sm:w-auto"
              >
                <Download className="h-5 w-5 transition group-hover:translate-y-0.5" />
                {h.ctaDownload}
                <span className="rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-white/60">2.1GB</span>
              </a>
              <a
                href="https://webshop.muorigins.online"
                target="_blank"
                rel="noopener noreferrer"
                className="glass border-amber-400/40 text-amber-300 group flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-bold transition hover:bg-amber-400/10 hover:text-white sm:w-auto"
              >
                <span>Web Shop</span>
                <span className="text-xs">↗</span>
              </a>
            </div>

            <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start">
              <a href="#siege" className="group flex items-center gap-2 text-sm font-medium text-white/60 transition hover:text-white">
                <span className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-white/5 transition group-hover:border-amber-400/50 group-hover:bg-amber-400/10">
                  <Play className="h-3.5 w-3.5 fill-current" />
                </span>
                {h.trailer}
                <span className="text-white/30">2:14</span>
              </a>
              <span className="hidden h-4 w-px bg-white/15 sm:block" />
              <div className="flex items-center gap-2 text-sm text-white/60">
                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
                {h.trust}
              </div>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:mx-0 lg:justify-self-end">
            <div className="animate-float-slow absolute -inset-4 rounded-[28px] bg-gradient-to-br from-violet-600/20 via-transparent to-amber-500/20 blur-2xl" aria-hidden="true" />
            <div className="gold-border glass-strong relative overflow-hidden rounded-3xl p-6 sm:p-7">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-3 w-3">
                    <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${serverState === "online" ? "bg-emerald-400" : "bg-red-400"}`} />
                    <span className={`relative inline-flex h-3 w-3 rounded-full ${serverState === "online" ? "bg-emerald-400" : "bg-red-500"}`} />
                  </span>
                  <h2 className="font-display text-sm font-bold tracking-[0.2em] text-white">{h.status}</h2>
                </div>
                <span className={`rounded-full px-2.5 py-1 font-mono text-[11px] font-bold whitespace-nowrap ${serverState === "online" ? "bg-emerald-400/10 text-emerald-300" : "bg-red-400/10 text-red-300"}`}>
                  {serverState === "online" ? h.allOnline : (lang === "th" ? "ออฟไลน์" : "Offline")}
                </span>
              </div>

              <div className="mt-5 space-y-3 max-h-[340px] overflow-y-auto pr-1">
                {realms.map((realm, i) => {
                  const pct = Math.min(100, Math.max(0, realm.loadPct ?? (realm.max > 0 ? Math.round((realm.online / realm.max) * 100) : 0)));
                  const color = getLoadColor(pct);
                  const displayName = getDisplayName(realm.name, i);
                  const tag = getRoomTag(realm, i, lang);

                  return (
                    <div key={realm.id ?? realm.name ?? i} className="group rounded-2xl border border-white/8 bg-white/[.03] p-3.5 transition hover:border-white/15 hover:bg-white/[.06]">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Swords className="h-4 w-4 text-white/40" />
                          <span className="font-bold text-white">{displayName}</span>
                          <span className="rounded bg-white/8 px-1.5 py-0.5 text-[10px] font-semibold text-white/50">{tag}</span>
                        </div>
                        <span className="font-mono text-xs font-bold" style={{ color }}>{pct}%</span>
                      </div>
                      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white/8">
                        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}66, ${color})`, boxShadow: `0 0 12px ${color}` }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <a
                href="#register"
                onClick={onRegister}
                className="btn-shine mt-5 block w-full rounded-xl bg-gradient-to-r from-[#d4af37] via-[#ffb52e] to-[#ff8a3c] py-3 text-center text-sm font-extrabold text-[#090d16] shadow-lg shadow-amber-500/20 transition hover:brightness-110 active:scale-[.98]"
              >
                {h.ctaRegister}
              </a>

              <p className="mt-4 text-center font-mono text-[11px] text-white/35">{h.ping}</p>
            </div>
          </div>
        </div>
      </div>

      <a href="#rates" aria-label={h.scrollAria} className="absolute bottom-5 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-1 text-white/40 transition hover:text-white md:flex">
        <span className="font-mono text-[10px] tracking-[0.3em]">{h.scroll}</span>
        <ChevronDown className="h-5 w-5 animate-bounce" />
      </a>
    </section>
  );
}
