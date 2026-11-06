import { Download, ShieldCheck, Swords, UserPlus } from "lucide-react";
import { useLiveOnline } from "../hooks/hooks";

export default function Hero({ onRegister }: { onRegister: () => void }) {
  const online = useLiveOnline();
  return (
    <section id="top" className="relative flex min-h-[82svh] items-center overflow-hidden pt-28 pb-16">
      <div className="absolute inset-0">
        <img src="/images/hero-lorencia.jpg" alt="Lorencia" className="h-full w-full object-cover" fetchPriority="high" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#090d16]/80 via-[#090d16]/65 to-[#090d16]" />
      </div>
      <div className="relative mx-auto w-full max-w-7xl px-4 text-center sm:px-6">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-black/40 px-4 py-2 text-sm text-emerald-300 backdrop-blur">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          {online.toLocaleString()} players online
        </div>
        <h1 className="font-display mx-auto mt-6 max-w-4xl text-5xl font-black tracking-tight text-white sm:text-7xl">OPENMU <span className="text-gradient-gold">SEASON 6</span></h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">Create an account, download the official client, and begin your adventure in Lorencia.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button onClick={onRegister} className="btn-shine inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#ff8a3c] px-6 py-4 font-extrabold text-[#090d16]"><UserPlus className="h-5 w-5" /> Create account</button>
          <a href="#download" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-black/30 px-6 py-4 font-bold text-white backdrop-blur hover:border-amber-400/50"><Download className="h-5 w-5" /> Download client</a>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-5 text-xs text-white/55"><span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-emerald-400" /> Secure account registration</span><span className="flex items-center gap-1.5"><Swords className="h-4 w-4 text-amber-400" /> Season 6 Episode 3</span></div>
      </div>
    </section>
  );
}
