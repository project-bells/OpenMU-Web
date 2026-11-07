import { Download, HardDrive, ShieldCheck, Monitor, AlertTriangle } from "lucide-react";
import { SYSTEM_SPECS } from "../data";
import { useI18n } from "../i18n";

export default function DownloadSection() {
  const { lang } = useI18n();

  return (
    <section id="download" className="relative scroll-mt-28 py-16 sm:py-24">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-radial from-amber-500/5 via-transparent to-transparent opacity-60 pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3.5 py-1 text-xs font-semibold text-amber-300">
            <Download className="h-3.5 w-3.5" />
            <span>{lang === "th" ? "ดาวน์โหลดตัวเกม S6E3 แท้" : "Official Game Client S6E3"}</span>
          </div>
          <h2 className="font-display mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
            {lang === "th" ? "ดาวน์โหลด" : "DOWNLOAD"}{" "}
            <span className="text-gradient-gold">{lang === "th" ? "ตัวเกม" : "CLIENT"}</span>
          </h2>
          <p className="mt-2 text-sm text-white/60 sm:text-base">
            {lang === "th"
              ? "ตัวเกมสมบูรณ์แบบ พร้อมตัวอัปเดตอัตโนมัติ และระบบป้องกันโปร Origins GameGuard"
              : "Clean client, auto-updating launcher, built-in anti-cheat guard. Ready to play in under 5 minutes."}
          </p>
        </div>

        {/* Primary Download Feature Card with Mega + MediaFire */}
        <div className="fantasy-panel gold-border relative mb-14 overflow-hidden rounded-3xl p-6 sm:p-10 shadow-[0_20px_60px_-15px_rgba(212,175,55,0.2)]">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-amber-500/10 blur-[90px]" aria-hidden="true" />
          
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="max-w-xl">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-amber-400/20 border border-amber-400/40 px-2.5 py-0.5 font-mono text-xs font-bold text-amber-300">
                  VERSION 1.04D • S6E3
                </span>
                <span className="rounded-md bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-xs font-semibold text-emerald-300">
                  FULL GAME CLIENT
                </span>
              </div>
              <h3 className="font-display mt-3 text-2xl font-black text-white sm:text-3xl">
                {lang === "th" ? "ดาวน์โหลดตัวเกมเต็ม Full Client (2.1 GB)" : "Download Full Game Client (2.1 GB)"}
              </h3>
              <p className="mt-2 text-sm text-white/70 leading-relaxed">
                {lang === "th"
                  ? "ตัวเกม Season 6 Episode 3 ของแท้สมบูรณ์แบบ เสียงคลาสสิกครบ ภาพ HD รองรับจอ Widescreen และมีระบบกันโปร Origins GameGuard ในตัว เลือกช่องทางดาวน์โหลดด้านขวา:"
                  : "Complete Season 6 Episode 3 client. Includes authentic sound packs, HD textures, widescreen support, and built-in Origins GameGuard. Choose your preferred download mirror below:"}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-mono text-white/60">
                <span className="flex items-center gap-1.5">
                  <HardDrive className="h-4 w-4 text-amber-400" />
                  {lang === "th" ? "ขนาดไฟล์:" : "File Size:"} <strong className="text-white">2.1 GB</strong>
                </span>
                <span>•</span>
                <span>{lang === "th" ? "อัปเดต: พฤศจิกายน 2026" : "Updated: November 2026"}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <ShieldCheck className="h-4 w-4" />
                  VirusTotal Clean (0/72)
                </span>
              </div>
            </div>

            {/* 2 Primary Download Options: Mega + MediaFire */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 min-w-[280px]">
              {/* 1. Mega.nz */}
              <a
                href="https://mega.nz"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-shine flex items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-[#d4af37] via-[#ffb52e] to-[#ff8a3c] px-6 py-4 text-sm font-black text-[#090d16] shadow-[0_12px_35px_-8px_rgba(212,175,55,0.45)] transition hover:brightness-110 active:scale-[0.98]"
              >
                <div className="flex items-center gap-2.5">
                  <Download className="h-5 w-5" />
                  <span className="text-left leading-tight">
                    <span className="block text-xs font-semibold opacity-75">{lang === "th" ? "ช่องทางที่ 1" : "OPTION 1"}</span>
                    <span className="text-sm font-extrabold">{lang === "th" ? "ดาวน์โหลด MEGA" : "DOWNLOAD MEGA"}</span>
                  </span>
                </div>
                <span className="rounded bg-black/20 px-2 py-1 text-xs font-mono font-bold text-white">2.1 GB</span>
              </a>

              {/* 2. Mediafire */}
              <a
                href="https://www.mediafire.com"
                target="_blank"
                rel="noopener noreferrer"
                className="glass flex items-center justify-between gap-3 rounded-2xl border-white/20 bg-white/5 px-6 py-4 text-sm font-bold text-white transition hover:border-amber-400/50 hover:bg-amber-400/10 hover:text-amber-200 active:scale-[0.98]"
              >
                <div className="flex items-center gap-2.5">
                  <Download className="h-5 w-5 text-amber-400" />
                  <span className="text-left leading-tight">
                    <span className="block text-[11px] font-semibold text-white/50">{lang === "th" ? "ช่องทางที่ 2" : "OPTION 2"}</span>
                    <span className="text-sm font-extrabold">{lang === "th" ? "ดาวน์โหลด MEDIAFIRE" : "DOWNLOAD MEDIAFIRE"}</span>
                  </span>
                </div>
                <span className="rounded bg-white/10 px-2 py-1 text-xs font-mono text-white/70">2.1 GB</span>
              </a>
              
              <div className="text-center text-[11px] text-white/40 pt-1">
                {lang === "th" ? "คลาวด์ความเร็วสูง • รองรับการดาวน์โหลดต่อ (Resume)" : "Fast Cloud Mirrors • Direct Resume Supported"}
              </div>
            </div>
          </div>
        </div>

        {/* Technical Requirements Table (Min vs Recommended) */}
        <div className="fantasy-panel gold-border mb-14 overflow-hidden rounded-3xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
            <div>
              <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
                <Monitor className="h-5 w-5 text-amber-400" />
                <span>{lang === "th" ? "สเปกคอมพิวเตอร์ที่ต้องการ" : "Technical System Requirements"}</span>
              </h3>
              <p className="text-xs text-white/60 mt-1">
                {lang === "th"
                  ? "ปรับแต่งการทำงานลื่นไหล 60 FPS บนคอมพิวเตอร์ทุกรุ่น ทั้งโน้ตบุ๊กทั่วไปและเครื่องเล่นเกมระดับสูง"
                  : "Optimized for low resource usage. Seamless 60 FPS on both legacy hardware and modern gaming rigs."}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-xs font-semibold uppercase tracking-wider text-white/50">
                  <th scope="col" className="py-3 px-4">{lang === "th" ? "อุปกรณ์" : "Hardware Component"}</th>
                  <th scope="col" className="py-3 px-4 text-white/70">{lang === "th" ? "สเปกขั้นต่ำ" : "Minimum Requirements"}</th>
                  <th scope="col" className="py-3 px-4 text-amber-300 font-bold">{lang === "th" ? "สเปกที่แนะนำ" : "Recommended Requirements"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium">
                {SYSTEM_SPECS.map((spec) => (
                  <tr key={spec.component} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 font-semibold text-white/80 whitespace-nowrap">
                      {spec.component}
                    </td>
                    <td className="py-3 px-4 text-white/60">
                      {spec.minimum}
                    </td>
                    <td className="py-3 px-4 text-white font-semibold">
                      {spec.recommended}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3-Step Setup Guide & Antivirus Notice */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Step 1 */}
          <div className="fantasy-panel gold-border rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-amber-400/15 border border-amber-400/30 font-mono text-sm font-black text-amber-300">
                1
              </span>
              <h4 className="font-display font-bold text-white">
                {lang === "th" ? "ดาวน์โหลด & แตกไฟล์" : "Download & Extract"}
              </h4>
            </div>
            <p className="mt-3 text-xs text-white/60 leading-relaxed">
              {lang === "th"
                ? "ดาวน์โหลดไฟล์ติดตั้งขนาด 2.1 GB จาก Mega หรือ Mediafire จากนั้นแตกไฟล์ ZIP ไปยังไดรฟ์ที่ต้องการ (เช่น D:\\Games\\MuOrigins)"
                : "Download the 2.1 GB archive from Mega or MediaFire. Extract the entire ZIP folder to your preferred local drive (e.g. D:\\Games\\MuOrigins)."}
            </p>
          </div>

          {/* Step 2 */}
          <div className="fantasy-panel gold-border rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-amber-400/15 border border-amber-400/30 font-mono text-sm font-black text-amber-300">
                2
              </span>
              <h4 className="font-display font-bold text-white">
                {lang === "th" ? "เปิด Launcher.exe" : "Run Launcher.exe"}
              </h4>
            </div>
            <p className="mt-3 text-xs text-white/60 leading-relaxed">
              {lang === "th"
                ? "คลิกขวาที่ Launcher.exe แล้วเลือก Run as Administrator ตัวเกมจะตรวจสอบความสมบูรณ์และอัปเดตแพตช์ล่าสุดให้อัตโนมัติ"
                : "Launch Launcher.exe as Administrator. It will automatically verify files and download any minor updates or patches in seconds."}
            </p>
          </div>

          {/* Step 3 */}
          <div className="fantasy-panel gold-border rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-amber-400/15 border border-amber-400/30 font-mono text-sm font-black text-amber-300">
                3
              </span>
              <h4 className="font-display font-bold text-white">
                {lang === "th" ? "เข้าสู่โลก Lorencia" : "Login & Enter World"}
              </h4>
            </div>
            <p className="mt-3 text-xs text-white/60 leading-relaxed">
              {lang === "th"
                ? "กรอกไอดีและรหัสผ่านที่คุณสมัครสมาชิกไว้ เลือกเซิร์ฟเวอร์ แล้วออกผจญภัยในตำนานแห่ง MU ได้ทันที!"
                : "Enter the username and password you created in the Registration Module. Choose your server and begin your adventure in Lorencia!"}
            </p>
          </div>
        </div>

        {/* Antivirus Whitelist Notice */}
        <div className="fantasy-panel mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
            <div className="text-xs text-white/70 leading-relaxed">
              <strong className="text-white block font-bold mb-1">
                {lang === "th" ? "ข้อแนะนำเรื่อง Antivirus / Windows Defender:" : "Antivirus & Windows Defender False Positive Notice:"}
              </strong>
              {lang === "th"
                ? "เนื่องจากตัวเกมมีระบบป้องกันการแก้ไขหน่วยความจำ (Origins GameGuard) โปรแกรม Antivirus บางตัวอาจเข้าใจผิดว่าเป็นภัยคุกคาม (False Positive) ทีมงานขอรับรองว่าไฟล์ตัวเกมปลอดภัย 100% ปราศจากไวรัส หากพบปัญหาเกมไม่รัน กรุณาเพิ่มโฟลเดอร์เกมเข้าในข้อยกเว้น (Exclusion/Whitelist)"
                : "Due to our proprietary Anti-Cheat protection (Origins GameGuard / Main.exe packer) designed to prevent memory injection and speedhacks, some antivirus scanners may report a false positive. We guarantee our game files are 100% clean, virus-free, and safe. Please add the MuOrigins game folder to your Antivirus Exclusions list if the game fails to launch."}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
