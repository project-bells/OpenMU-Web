import { useState, FormEvent } from "react";
import {
  Clock,
  Coins,
  ArrowRightLeft,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  History,
  TrendingUp,
  RefreshCw,
  Info,
} from "lucide-react";
import { useUserDashboard } from "../../context/UserDashboardContext";

export default function UserExchangePage() {
  const { availableHours, credits, redeemHours, history, resetMockData } = useUserDashboard();
  const [hoursInput, setHoursInput] = useState<string>("");
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);

  const numericHours = parseInt(hoursInput, 10);
  const isValidNumber = !isNaN(numericHours) && numericHours > 0;
  const isOverLimit = isValidNumber && numericHours > availableHours;
  const earnedCredits = isValidNumber && !isOverLimit ? numericHours * 5 : 0;

  // Disabled condition: empty, not a valid number, <= 0, or exceeds available hours
  const isButtonDisabled = !isValidNumber || isOverLimit || availableHours <= 0;

  const handleRedeem = (e: FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (isButtonDisabled) return;

    // Call Context to perform 3 actions:
    // (1) Deduct hours and add credits in main State (Topbar updates immediately)
    // (3) Prepend new history item to top of table
    const result = redeemHours(numericHours);

    if (result.success) {
      // (2) Clear input field
      setHoursInput("");
      setFeedback({
        ok: true,
        message: `แลกชั่วโมงสำเร็จ! ใช้ไป ${numericHours} ชั่วโมง ได้รับ +${numericHours * 5} เครดิตเข้าสู่บัญชีเรียบร้อยแล้ว`,
      });
    } else {
      setFeedback({
        ok: false,
        message: result.error || "เกิดข้อผิดพลาดในการแลกเครดิต",
      });
    }
  };

  const setPresetHours = (amount: number) => {
    const val = Math.min(amount, availableHours);
    if (val > 0) {
      setHoursInput(val.toString());
      setFeedback(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Subtitle */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300">
            <ArrowRightLeft className="h-3.5 w-3.5" /> ระบบแลกเครดิตออนไลน์
          </div>
          <h1 className="font-display mt-2 text-2xl font-black text-white sm:text-3xl">
            Online Time Exchange <span className="text-amber-400">(แลกเวลาออนไลน์เป็นเครดิต)</span>
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            เล่นเกมเพื่อสะสมชั่วโมงออนไลน์ อัตราแลกเปลี่ยนทางการ <strong>1 ชั่วโมง = 5 เครดิต</strong> ยุติธรรม 100% ไร้ Pay-to-Win
          </p>
        </div>

        <button
          type="button"
          onClick={resetMockData}
          title="รีเซ็ตชั่วโมงเริ่มต้น 50 ชม. และ 0 เครดิต"
          className="flex items-center gap-1.5 self-start rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          <RefreshCw className="h-3.5 w-3.5 text-amber-400" />
          <span>รีเซ็ต Mock Data (50 ชม. / 0 Cr)</span>
        </button>
      </div>

      {/* 1. Summary Cards (ชั่วโมงสะสม & เครดิตปัจจุบัน & อัตราแลกเปลี่ยน) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Card 1: Available Hours */}
        <div className="relative overflow-hidden rounded-3xl border border-emerald-400/30 bg-gradient-to-br from-emerald-500/15 via-teal-500/5 to-transparent p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-200">ชั่วโมงออนไลน์สะสม (Available)</span>
            <div className="grid h-10 w-10 place-items-center rounded-2xl border border-emerald-400/30 bg-emerald-500/20 text-emerald-300">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="font-display mt-3 text-3xl font-black text-white sm:text-4xl">
            {availableHours} <span className="text-sm font-semibold text-emerald-400">ชม.</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">พร้อมแลกเป็นเครดิตได้ทันที</p>
        </div>

        {/* Card 2: Current Credits */}
        <div className="relative overflow-hidden rounded-3xl border border-amber-400/30 bg-gradient-to-br from-amber-500/15 via-orange-500/5 to-transparent p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-200">เครดิตปัจจุบัน (Current Credits)</span>
            <div className="grid h-10 w-10 place-items-center rounded-2xl border border-amber-400/30 bg-amber-500/20 text-amber-300">
              <Coins className="h-5 w-5" />
            </div>
          </div>
          <div className="font-display mt-3 text-3xl font-black text-amber-300 sm:text-4xl">
            {credits.toLocaleString()} <span className="text-sm font-semibold text-white/60">Cr</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">ใช้แลก WCoin หรือซื้อของใน Web Shop</p>
        </div>

        {/* Card 3: Exchange Rate Rule */}
        <div className="relative overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-500/15 via-indigo-500/5 to-transparent p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-200">อัตราการแลกเครดิต (Exchange Rate)</span>
            <div className="grid h-10 w-10 place-items-center rounded-2xl border border-purple-400/30 bg-purple-500/20 text-purple-300">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="font-display mt-3 text-2xl font-black text-white sm:text-3xl">
            1 ชม. = <span className="text-gradient-gold">5 เครดิต</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">คำนวณแบบ 1:5 ทันที ไม่มีหักค่าธรรมเนียม</p>
        </div>
      </div>

      {/* 2. Redemption Form Box */}
      <div className="glass-strong gold-border-glow rounded-3xl p-6 sm:p-8">
        <form onSubmit={handleRedeem} className="space-y-4">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <Sparkles className="h-5 w-5 text-amber-400" />
            <h2 className="font-display text-base font-bold text-white sm:text-lg">
              ทำรายการแลกเครดิต (Redeem Online Hours)
            </h2>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="hours-input" className="text-xs font-bold text-slate-200">
                จำนวนชั่วโมงออนไลน์ที่ต้องการแลก (ชั่วโมง):
              </label>
              <span className="text-xs text-slate-400">
                ชั่วโมงสะสมที่มี: <strong className="text-emerald-400">{availableHours} ชม.</strong>
              </span>
            </div>

            <div className="relative">
              <Clock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="hours-input"
                type="number"
                min={1}
                max={availableHours}
                value={hoursInput}
                onChange={(e) => {
                  setHoursInput(e.target.value);
                  setFeedback(null);
                }}
                placeholder="กรอกจำนวนชั่วโมงที่ต้องการแลก (เช่น 10)"
                className={`w-full rounded-2xl border py-3.5 pr-4 pl-10 font-mono text-base font-bold text-white placeholder-slate-500 focus:outline-none transition ${
                  isOverLimit
                    ? "border-rose-500 bg-rose-500/10 focus:border-rose-400"
                    : "border-white/15 bg-white/5 focus:border-amber-400/70"
                }`}
              />
            </div>

            {/* Quick Preset Buttons */}
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-slate-400">เลือกด่วน:</span>
              {[5, 10, 20, 25].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  disabled={availableHours < amt}
                  onClick={() => setPresetHours(amt)}
                  className={`rounded-xl border px-3 py-1 text-xs font-mono font-semibold transition ${
                    numericHours === amt
                      ? "border-amber-400 bg-amber-400/20 text-amber-300"
                      : "border-white/10 bg-white/5 text-slate-300 hover:border-amber-400/40 hover:text-white disabled:opacity-40"
                  }`}
                >
                  +{amt} ชม.
                </button>
              ))}
              <button
                type="button"
                disabled={availableHours <= 0}
                onClick={() => setPresetHours(availableHours)}
                className="rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-xs font-mono font-bold text-emerald-300 transition hover:bg-emerald-500/20 disabled:opacity-40"
              >
                แลกทั้งหมด ({availableHours} ชม.)
              </button>
            </div>
          </div>

          {/* Real-time Calculation Summary Message directly below Input */}
          <div
            className={`rounded-2xl border p-4 transition ${
              isOverLimit
                ? "border-rose-500/40 bg-rose-500/10 text-rose-300"
                : isValidNumber
                ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-200"
                : "border-white/10 bg-white/[0.02] text-slate-400"
            }`}
          >
            {isOverLimit ? (
              <div className="flex items-center gap-2 text-xs font-bold">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>
                  จำนวนชั่วโมงที่ระบุ ({numericHours} ชม.) เกินกว่าชั่วโมงสะสมที่มีอยู่ ({availableHours} ชม.)
                </span>
              </div>
            ) : isValidNumber ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <Coins className="h-4 w-4 text-amber-400" />
                  <span>
                    สรุปเครดิตที่จะได้รับ: <span className="text-base text-amber-300 font-extrabold font-mono">+{earnedCredits} เครดิต</span>
                  </span>
                </div>
                <div className="text-[11px] font-mono text-emerald-300">
                  (คำนวณจาก {numericHours} ชม. × 5 เครดิต/ชม.)
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Info className="h-4 w-4 shrink-0" />
                <span>กรอกจำนวนชั่วโมงเพื่อดูผลลัพธ์เครดิตที่จะได้รับแบบ Real-time</span>
              </div>
            )}
          </div>

          {/* Action Feedback Alert */}
          {feedback && (
            <div
              className={`flex items-center gap-2 rounded-2xl border p-3.5 text-xs font-bold animate-in fade-in ${
                feedback.ok
                  ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-300"
                  : "border-rose-500/40 bg-rose-500/15 text-rose-300"
              }`}
            >
              {feedback.ok ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Submit Redeem Button (Disabled if empty or over limit) */}
          <button
            type="submit"
            disabled={isButtonDisabled}
            className="btn-shine flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#d4af37] via-[#ffb52e] to-[#ff8a3c] px-6 py-4 text-sm font-extrabold text-[#090d16] shadow-lg shadow-amber-500/25 transition hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowRightLeft className="h-4 w-4" />
            <span>ยืนยันการแลก (Redeem)</span>
          </button>
        </form>
      </div>

      {/* 3. Exchange History Table (ตารางประวัติการทำรายการ) */}
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#090d18]/70 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.02] px-6 py-4">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-amber-400" />
            <h2 className="font-display text-base font-bold text-white">
              ประวัติการทำรายการแลกเครดิต (Exchange History)
            </h2>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 font-mono text-[11px] text-slate-300">
            {history.length} รายการ
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03] text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="px-5 py-3.5">วันที่ / เวลา (DATE & TIME)</th>
                <th className="px-5 py-3.5 text-center">ชั่วโมงที่ใช้ (HOURS USED)</th>
                <th className="px-5 py-3.5 text-right">เครดิตที่ได้รับ (CREDITS EARNED)</th>
                <th className="px-5 py-3.5 text-center">สถานะ (STATUS)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-slate-500">
                    ยังไม่มีประวัติการทำรายการแลกเครดิต
                  </td>
                </tr>
              ) : (
                history.map((item) => (
                  <tr key={item.id} className="transition hover:bg-white/[0.02]">
                    {/* วันที่ / เวลา */}
                    <td className="px-5 py-3.5 font-mono text-slate-300">
                      {item.timestamp}
                    </td>

                    {/* ชั่วโมงที่ใช้ */}
                    <td className="px-5 py-3.5 text-center">
                      <span className="inline-flex items-center gap-1 rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 font-mono font-bold text-emerald-300">
                        <Clock className="h-3 w-3" />
                        {item.hoursUsed} ชม.
                      </span>
                    </td>

                    {/* เครดิตที่ได้รับ */}
                    <td className="px-5 py-3.5 text-right font-mono font-bold text-amber-300">
                      +{item.creditsReceived.toLocaleString()} Credits
                    </td>

                    {/* สถานะ */}
                    <td className="px-5 py-3.5 text-center">
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
                        <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
