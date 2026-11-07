import { UserPlus, Download, ShieldCheck, ShoppingBag, ExternalLink, Sparkles, CheckCircle2 } from "lucide-react";
import { useI18n } from "../i18n";

export default function FinalCta({ onRegister }: { onRegister: () => void }) {
  const { lang } = useI18n();

  return (
    <section id="join" className="relative scroll-mt-28 overflow-hidden py-24 sm:py-32">
      {/* Background Ambience */}
      <div className="absolute inset-0">
        <img
          src="/images/hero-lorencia.jpg"
          alt="Lorencia Castle at Night"
          className="h-full w-full object-cover opacity-20 scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#090d16] via-[#090d16]/85 to-[#090d16]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(212,175,55,.15),transparent_75%)]" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
        <div className="fantasy-panel gold-border relative overflow-hidden rounded-[32px] p-8 sm:p-14 text-center shadow-[0_25px_70px_-15px_rgba(212,175,55,0.25)]">
          {/* Subtle Ambient Backlights */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-96 rounded-full bg-amber-500/20 blur-[100px]" aria-hidden="true" />
          <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 h-48 w-96 rounded-full bg-purple-600/15 blur-[100px]" aria-hidden="true" />

          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs font-bold tracking-[0.2em] text-amber-300 uppercase">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{lang === "th" ? "พร้อมลุยใน 5 นาที" : "Ready in Under 5 Minutes"}</span>
          </div>

          {/* Headline */}
          <h2 className="font-display mt-5 text-3xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.1]">
            {lang === "th" ? "บัลลังก์แห่งลอเรนเซีย" : "YOUR THRONE IN LORENCIA"} <br />
            <span className="text-gradient-gold">
              {lang === "th" ? "กำลังรอนักรบเช่นคุณ" : "IS WAITING."}
            </span>
          </h2>

          {/* Subtitle */}
          <p className="mx-auto mt-5 max-w-2xl text-base text-white/70 sm:text-lg leading-relaxed">
            {lang === "th"
              ? "เข้าร่วมคอมมูนิตี้ MU Online Season 6 Episode 3 ที่แท้จริงที่สุด ไร้การรีเซ็ตเซิร์ฟเวอร์ ไร้ Pay-to-Win และสงครามปราสาทสุดยิ่งใหญ่ทุกสัปดาห์"
              : "Join the most authentic Season 6 Episode 3 private server. Zero wipes, zero pay-to-win, and a vibrant weekly guild war community."}
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onRegister}
              className="btn-shine flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#d4af37] via-[#ffb52e] to-[#ff8a3c] px-8 py-4 text-base font-black text-[#090d16] shadow-[0_15px_40px_-8px_rgba(212,175,55,0.6)] transition hover:brightness-110 active:scale-[0.98] cursor-pointer"
            >
              <UserPlus className="h-5 w-5" />
              <span>{lang === "th" ? "สมัครไอดีฟรี" : "CREATE FREE ACCOUNT"}</span>
            </button>

            <a
              href="#download"
              className="flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-2xl border border-white/15 bg-white/5 px-8 py-4 text-base font-bold text-white transition hover:border-amber-400/40 hover:bg-amber-400/10 hover:text-amber-300 active:scale-[0.98]"
            >
              <Download className="h-5 w-5" />
              <span>{lang === "th" ? "ดาวน์โหลดเกม (2.1 GB)" : "DOWNLOAD CLIENT (2.1 GB)"}</span>
            </a>

            <a
              href="https://webshop.muorigins.online"
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border border-amber-400/40 bg-amber-400/10 px-6 py-4 text-sm font-bold text-amber-300 transition hover:bg-amber-400/20"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>{lang === "th" ? "เว็บช็อป" : "Web Shop"}</span>
              <ExternalLink className="h-3.5 w-3.5 opacity-70" />
            </a>
          </div>

          {/* Trust Guarantees */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-5 text-xs text-white/50 border-t border-white/8 pt-8">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <CheckCircle2 className="h-4 w-4" />
              VirusTotal Clean (0/72)
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-amber-400" />
              {lang === "th" ? "ไม่มีเทพทรู 100%" : "No Pay-to-Win Gear"}
            </span>
            <span>•</span>
            <span>Windows 7, 8, 10, 11 Compatible</span>
            <span>•</span>
            <span>{lang === "th" ? "เปิดใช้งานไอดีทันที" : "Instant Account Activation"}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
