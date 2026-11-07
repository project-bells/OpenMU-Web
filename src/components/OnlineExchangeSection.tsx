import { useState, useId } from "react";
import { Coins, Sparkles, Clock, ArrowRight, ShoppingBag, CheckCircle2, ShieldCheck, Zap } from "lucide-react";
import { useI18n } from "../i18n";

export default function OnlineExchangeSection({ onRegister }: { onRegister?: () => void }) {
  const { lang } = useI18n();
  const [onlineHours, setOnlineHours] = useState<number>(24);
  const hoursSliderId = useId();

  // 1 hour = 10 Credits, 100 Credits = 50 WCoin (0.5 ratio)
  const earnedCredits = onlineHours * 10;
  const earnedWcoin = Math.floor(earnedCredits * 0.5);

  const presets = [6, 12, 24, 72, 168];

  return (
    <section id="online-rewards" className="relative scroll-mt-28 py-16 sm:py-24 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-radial from-amber-500/10 via-purple-900/10 to-transparent opacity-80 pointer-events-none" />
      <div className="absolute -top-32 right-1/4 h-96 w-96 rounded-full bg-amber-400/10 blur-[130px] pointer-events-none" />
      <div className="absolute -bottom-32 left-1/4 h-96 w-96 rounded-full bg-violet-600/15 blur-[130px] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-gradient-to-r from-amber-500/20 to-purple-600/20 px-4 py-1.5 text-xs font-bold text-amber-300 shadow-lg shadow-amber-500/10">
            <Sparkles className="h-4 w-4 text-amber-400 animate-spin-slow" />
            <span>
              {lang === "th"
                ? "ระบบออนไลน์แลกเครดิต & แลก WCoin ฟรี"
                : "PLAY-TO-EARN • ONLINE TIME TO WCOIN EXCHANGE"}
            </span>
          </div>

          <h2 className="font-display mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
            {lang === "th" ? "ออนไลน์รับ" : "STAY ONLINE & EARN"}{" "}
            <span className="text-gradient-gold">{lang === "th" ? "CREDITS แลก WCOIN" : "CREDITS → WCOIN"}</span>
          </h2>

          <p className="mt-3 text-sm text-white/70 sm:text-base leading-relaxed">
            {lang === "th"
              ? "สายฟรีอยู่สบาย! เพียงเปิดเกมออนไลน์ในเซิร์ฟเวอร์ รับ 10 เครดิตฟรีทุกชั่วโมง สะสมนำไปแลกเป็น WCoin เพื่อช้อปปิ้งไอเทมใน Web Shop และ Cash Shop ได้ 100% โดยไม่ต้องเติมเงินแม้แต่บาทเดียว"
              : "Zero Pay-to-Win! Simply stay logged in-game to earn 10 Credits every hour. Exchange your accumulated Credits directly into WCoin to purchase items in the Web Shop & in-game Cash Shop."}
          </p>
        </div>

        {/* 3-Step Flow Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-10">
          {/* Step 1 */}
          <div className="fantasy-panel gold-border relative rounded-3xl p-6 sm:p-7 group hover:border-amber-400/50 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-600/20 border border-amber-400/40 text-amber-300 shadow-md">
                <Clock className="h-6 w-6 text-amber-400" />
              </span>
              <span className="font-mono text-xs font-black text-amber-300/80 bg-amber-400/10 border border-amber-400/25 px-2.5 py-1 rounded-lg">
                STEP 01
              </span>
            </div>
            <h3 className="font-display text-lg font-bold text-white mb-2">
              {lang === "th" ? "1. ออนไลน์ในเกม (1 ชม. = 10 Credits)" : "1. Stay Online (1 Hr = 10 Credits)"}
            </h3>
            <p className="text-xs text-white/65 leading-relaxed">
              {lang === "th"
                ? "ตัวละครทุกตัวที่ออนไลน์ในเกม จะได้รับ 10 Credits อัตโนมัติทุกๆ 60 นาที ไม่จำกัดจอ เช็คชื่ออัตโนมัติไม่ต้องกดยืนยัน"
                : "Every active character in-game is automatically credited with 10 Credits per 60 minutes. Multi-client supported with zero manual claims required."}
            </p>
          </div>

          {/* Step 2 */}
          <div className="fantasy-panel gold-border relative rounded-3xl p-6 sm:p-7 group hover:border-amber-400/50 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-600/20 border border-amber-400/40 text-amber-300 shadow-md">
                <Coins className="h-6 w-6 text-amber-400" />
              </span>
              <span className="font-mono text-xs font-black text-amber-300/80 bg-amber-400/10 border border-amber-400/25 px-2.5 py-1 rounded-lg">
                STEP 02
              </span>
            </div>
            <h3 className="font-display text-lg font-bold text-white mb-2">
              {lang === "th" ? "2. สะสมเครดิตเข้าไอดี" : "2. Accumulate Credits"}
            </h3>
            <p className="text-xs text-white/65 leading-relaxed">
              {lang === "th"
                ? "เครดิตจะผูกกับบัญชีของคุณแบบถาวร เช็คยอดเครดิตสะสมได้ในเกมผ่านคำสั่ง /credits หรือเช็คผ่านหน้าเว็บพอร์ทัล"
                : "Credits are stored safely in your server account. Check your current balance at any time in-game using the /credits command or via web portal."}
            </p>
          </div>

          {/* Step 3 */}
          <div className="fantasy-panel gold-border relative rounded-3xl p-6 sm:p-7 group hover:border-amber-400/50 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-purple-400/20 to-amber-400/20 border border-amber-400/40 text-amber-300 shadow-md">
                <Zap className="h-6 w-6 text-amber-300" />
              </span>
              <span className="font-mono text-xs font-black text-amber-300/80 bg-amber-400/10 border border-amber-400/25 px-2.5 py-1 rounded-lg">
                STEP 03
              </span>
            </div>
            <h3 className="font-display text-lg font-bold text-white mb-2">
              {lang === "th" ? "3. แลกเป็น WCoin ช้อปฟรี" : "3. Exchange to WCoin"}
            </h3>
            <p className="text-xs text-white/65 leading-relaxed">
              {lang === "th"
                ? "อัตรา 100 Credits แลกได้ 50 WCoin! ใช้ซื้อของใน Web Shop และ Cash Shop ได้ทันที ไม่ต้องเติมเงินจริง"
                : "Exchange at the generous rate of 100 Credits = 50 WCoin! Spend WCoin instantly on premium items, seals, and buffs in Web Shop and Cash Shop."}
            </p>
          </div>
        </div>

        {/* Interactive Live Calculator & Exchange Card */}
        <div className="fantasy-panel gold-border relative rounded-3xl p-6 sm:p-10 shadow-[0_20px_60px_-15px_rgba(212,175,55,0.25)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Interactive Controls */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5 mb-1">
                  <Coins className="h-4 w-4" />
                  {lang === "th" ? "เครื่องคำนวณเครดิต & WCoin" : "Rewards Calculator"}
                </span>
                <h3 className="font-display text-xl sm:text-2xl font-black text-white">
                  {lang === "th" ? "คุณตั้งเป้าจะออนไลน์กี่ชั่วโมง?" : "How many hours will you stay online?"}
                </h3>
                <p className="text-xs text-white/60 mt-1">
                  {lang === "th"
                    ? "เลื่อนแถบเวลาเพื่อดูจำนวน Credits และ WCoin ที่คุณจะได้รับฟรี"
                    : "Slide or select a preset to see how many free Credits and WCoins you will accumulate."}
                </p>
              </div>

              {/* Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <label htmlFor={hoursSliderId} className="text-white/70 font-semibold cursor-pointer">
                    {lang === "th" ? "ระยะเวลาออนไลน์:" : "Online Duration:"}
                  </label>
                  <span className="font-mono text-lg font-bold text-amber-300">
                    {onlineHours} {lang === "th" ? "ชั่วโมง" : "Hours"}
                  </span>
                </div>
                <input
                  id={hoursSliderId}
                  type="range"
                  min="1"
                  max="168"
                  value={onlineHours}
                  onChange={(e) => setOnlineHours(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer h-2 bg-white/10 rounded-lg appearance-none"
                  aria-label={lang === "th" ? "ระยะเวลาออนไลน์เป็นชั่วโมง" : "Online duration in hours"}
                />
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-white/50 mr-1">{lang === "th" ? "ตัวเลือกด่วน:" : "Quick Select:"}</span>
                {presets.map((h) => (
                  <button
                    key={h}
                    onClick={() => setOnlineHours(h)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                      onlineHours === h
                        ? "bg-amber-400 text-black shadow-md shadow-amber-400/30"
                        : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10"
                    }`}
                  >
                    {h} {lang === "th" ? (h === 24 ? "ชม. (1 วัน)" : h === 168 ? "ชม. (1 สัปดาห์)" : "ชม.") : "h"}
                  </button>
                ))}
              </div>

              {/* Guarantees */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs text-white/70">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>{lang === "th" ? "ระบบนับชั่วโมงอัตโนมัติ 100%" : "100% Automated Hour Tracking"}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/70">
                  <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>{lang === "th" ? "ใช้แลกของใน Web Shop ได้จริง" : "Directly usable in Web Shop"}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Reward Summary Display & CTA */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-amber-400/30 bg-gradient-to-b from-[#131a2e] to-[#0a0f1d] p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl" />

                <div className="text-center pb-5 border-b border-white/10">
                  <span className="text-[11px] font-bold tracking-widest text-white/50 uppercase">
                    {lang === "th" ? "ผลตอบแทนที่จะได้รับ" : "ESTIMATED REWARDS"}
                  </span>
                  <div className="mt-4 flex items-center justify-around gap-2">
                    {/* Credits box */}
                    <div className="text-center">
                      <span className="font-mono text-3xl sm:text-4xl font-black text-amber-300">
                        {earnedCredits.toLocaleString()}
                      </span>
                      <span className="block text-xs font-bold text-white/60 mt-0.5">
                        {lang === "th" ? "เครดิตสะสม" : "Credits"}
                      </span>
                    </div>

                    <ArrowRight className="h-5 w-5 text-white/30 shrink-0" />

                    {/* WCoin box */}
                    <div className="text-center">
                      <span className="font-mono text-3xl sm:text-4xl font-black text-emerald-400">
                        {earnedWcoin.toLocaleString()}
                      </span>
                      <span className="block text-xs font-bold text-white/60 mt-0.5">
                        {lang === "th" ? "WCoin ฟรี" : "Free WCoin"}
                      </span>
                    </div>
                  </div>
                  <p className="mt-3 text-[11px] text-amber-200/80 font-mono">
                    {lang === "th"
                      ? "⚡ อัตราคงที่: 100 Credits = 50 WCoin (แลกขั้นต่ำ 100 Credits)"
                      : "⚡ Fixed Exchange: 100 Credits = 50 WCoin (Min 100 Credits)"}
                  </p>
                </div>

                {/* Direct Action Buttons */}
                <div className="mt-5 space-y-3">
                  {/* CRITICAL: External Link to Web Shop */}
                  <a
                    href="https://webshop.muorigins.online"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-shine flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#ffb52e] to-[#ff8a3c] py-3.5 px-4 text-center text-sm font-extrabold text-[#090d16] shadow-lg shadow-amber-500/25 transition hover:brightness-110 active:scale-[0.99]"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    <span>{lang === "th" ? "เข้าสู่ Web Shop เพื่อใช้ WCoin" : "Open Web Shop to Spend WCoin"}</span>
                    <span className="text-xs font-black">↗</span>
                  </a>

                  {onRegister && (
                    <button
                      onClick={onRegister}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 py-2.5 px-4 text-xs font-bold text-white transition hover:bg-white/10 hover:text-amber-300"
                    >
                      <span>{lang === "th" ? "ยังไม่มีไอดี? สมัครสมาชิกเริ่มสะสมเวลา" : "No account yet? Register & Start Earning"}</span>
                    </button>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 text-center">
                  <span className="text-[10px] text-white/40 font-mono">
                    {lang === "th"
                      ? "คำสั่งในเกม: พิมพ์ /credits เช็คเครดิต • /exchange แลก WCoin"
                      : "In-game commands: Type /credits to view • /exchange to convert"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
