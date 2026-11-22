import { useEffect, useState, FormEvent } from "react";
import {
  Coins,
  Clock,
  ArrowRightLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  History,
  Info,
  Gem,
  Crown,
  Gift,
} from "lucide-react";
import { useUserDashboard } from "../../context/UserDashboardContext";
import { claimStarterKit, getStarterKitStatus, purchaseVipMembership } from "../../services/dbApi";

function formatDuration(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  return `${h.toLocaleString()} ชม. ${m} นาที`;
}

function cleanClassName(value: string): string {
  return value.split("|")[0]?.trim() || "Unknown";
}

export default function UserExchangePage() {
  const {
    availableHours,
    availableOnlineSeconds,
    authoritativeOnlineSeconds,
    redeemedOnlineSeconds,
    credits,
    wcoin,
    pendingWcoin,
    redeemHours,
    exchangeCredits,
    redemptions,
    exchanges,
    orders,
    account,
    characters,
    refreshSummary,
  } = useUserDashboard();

  const [hoursInput, setHoursInput] = useState<string>("");
  const [redeeming, setRedeeming] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);

  const [creditsInput, setCreditsInput] = useState<string>("100");
  const [exchanging, setExchanging] = useState(false);
  const [exchangeFeedback, setExchangeFeedback] = useState<{ ok: boolean; message: string } | null>(null);
  const [buyingVip, setBuyingVip] = useState(false);
  const [vipFeedback, setVipFeedback] = useState<{ ok: boolean; message: string } | null>(null);
  const [starterCharacter, setStarterCharacter] = useState("");
  const [claimingStarter, setClaimingStarter] = useState(false);
  const [starterStatusLoading, setStarterStatusLoading] = useState(true);
  const [starterClaimed, setStarterClaimed] = useState(false);
  const [starterFeedback, setStarterFeedback] = useState<{ ok: boolean; message: string } | null>(null);
  const vipUntil = account?.vipUntil ? new Date(account.vipUntil) : null;
  const isVip = Boolean(vipUntil && vipUntil.getTime() > Date.now());

  useEffect(() => {
    let active = true;
    getStarterKitStatus()
      .then((status) => {
        if (active) setStarterClaimed(status.claimed);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setStarterStatusLoading(false);
      });
    return () => { active = false; };
  }, []);

  const numericHours = parseInt(hoursInput, 10);
  const isValidHours = !Number.isNaN(numericHours) && numericHours > 0;
  const isOverHours = isValidHours && numericHours > availableHours;
  const earnedCredits = isValidHours ? numericHours * 5 : 0;
  const isRedeemDisabled = redeeming || !hoursInput.trim() || !isValidHours || isOverHours;

  const numericCredits = parseInt(creditsInput, 10);
  const isValidCredits = !Number.isNaN(numericCredits) && numericCredits >= 2 && numericCredits % 2 === 0;
  const expectedWcoin = isValidCredits ? Math.floor((numericCredits * 50) / 100) : 0;
  const isOverCredits = !Number.isNaN(numericCredits) && numericCredits > credits;
  const isExchangeDisabled = exchanging || !isValidCredits || isOverCredits || expectedWcoin <= 0;

  const handleSetMaxHours = () => {
    setFeedback(null);
    setHoursInput(availableHours > 0 ? String(availableHours) : "");
  };

  const handleRedeemSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isRedeemDisabled) return;

    setRedeeming(true);
    setFeedback(null);
    const result = await redeemHours(numericHours);
    setRedeeming(false);

    setFeedback({ ok: result.ok, message: result.message });
    if (result.ok) {
      setHoursInput("");
    }
  };

  const handleExchangeSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isExchangeDisabled) return;

    setExchanging(true);
    setExchangeFeedback(null);
    const result = await exchangeCredits(numericCredits);
    setExchanging(false);

    setExchangeFeedback({ ok: result.ok, message: result.message });
  };

  const handleVipPurchase = async () => {
    if (buyingVip || credits < 300) return;
    setBuyingVip(true);
    setVipFeedback(null);
    const result = await purchaseVipMembership();
    setBuyingVip(false);
    if (result.success) {
      await refreshSummary();
      const expiry = result.vipUntil ? new Date(result.vipUntil).toLocaleString("th-TH") : "อีก 30 วัน";
      setVipFeedback({ ok: true, message: `ซื้อ VIP สำเร็จ! ใช้ 300 Credits — VIP ถึง ${expiry}` });
    } else {
      setVipFeedback({ ok: false, message: result.error || "ไม่สามารถซื้อ VIP ได้" });
    }
  };

  const handleStarterClaim = async () => {
    if (!starterCharacter || claimingStarter || starterClaimed) return;
    setClaimingStarter(true);
    setStarterFeedback(null);
    const result = await claimStarterKit(starterCharacter);
    setClaimingStarter(false);
    if (result.success || result.idempotent) setStarterClaimed(true);
    setStarterFeedback({
      ok: result.success,
      message: result.success
        ? "รับ Starter Kit สำเร็จ! เปิด Item Mall ในเกมแล้วนำชุดออกมาใช้ อายุ 7 วันจะเริ่มนับตอนนำออก"
        : result.error || "ไม่สามารถรับ Starter Kit ได้ หรือบัญชีนี้เคยรับแล้ว",
    });
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-black tracking-wide text-white sm:text-3xl">
            แลกเวลาออนไลน์ & <span className="text-gold-gradient">แลก WCoinC</span>
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            อัตราทางการ: <strong className="text-amber-300">1 ชม. = 5 เครดิต</strong> และ{" "}
            <strong className="text-purple-300">100 เครดิต = 50 WCoinC</strong> (ส่งตรงเข้าบัญชีเกม OpenMU)
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-slate-300">
          เวลาสะสมทั้งหมดจาก Server:{" "}
          <span className="font-mono font-bold text-emerald-300">{formatDuration(authoritativeOnlineSeconds)}</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="relative overflow-hidden rounded-3xl border border-emerald-400/30 bg-gradient-to-br from-emerald-500/15 via-[#090d18] to-[#090d18] p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              ชั่วโมงออนไลน์พร้อมแลก
            </span>
            <Clock className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="font-display mt-3 text-3xl font-black text-white">
            {availableHours.toLocaleString()} <span className="text-sm font-semibold text-emerald-300">ชม.</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            คงเหลือ {Math.floor((availableOnlineSeconds % 3600) / 60)} นาทีที่ยังไม่ครบ 1 ชม. • ใช้ไปแล้ว{" "}
            {Math.floor(redeemedOnlineSeconds / 3600)} ชม.
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-amber-400/30 bg-gradient-to-br from-amber-500/15 via-[#090d18] to-[#090d18] p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">เครดิตคงเหลือ</span>
            <Coins className="h-5 w-5 text-amber-400" />
          </div>
          <div className="font-display mt-3 text-3xl font-black text-amber-300">
            {credits.toLocaleString()} <span className="text-sm font-semibold text-amber-200/80">Cr</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">บันทึกในกระเป๋า PostgreSQL Wallet (Ledger-backed)</div>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-purple-400/30 bg-gradient-to-br from-purple-500/15 via-[#090d18] to-[#090d18] p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-300">WCoinC ในเกม</span>
            <Gem className="h-5 w-5 text-purple-400" />
          </div>
          <div className="font-display mt-3 text-3xl font-black text-purple-200">
            {wcoin.toLocaleString()} <span className="text-sm font-semibold text-purple-300">WC</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            {pendingWcoin > 0
              ? `รอรับอัตโนมัติใน Cash Shop: +${pendingWcoin.toLocaleString()} WC`
              : "พร้อมใช้งานทันทีใน Cash Shop (ปุ่ม X ในเกม)"}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-amber-400/35 bg-gradient-to-r from-amber-500/15 via-[#0b101c] to-purple-500/10 p-6 shadow-xl">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amber-400/20 text-amber-300">
              <Gift className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-display text-lg font-black text-white">Free Starter Kit — รับผ่าน Item Mall</h2>
              <p className="mt-1 text-xs leading-5 text-slate-300">
                ชุดครบเซ็ต +9 Option +16, อาวุธ +9 Option +16 + Skill และ Demon Pet • ใช้งาน 7 วัน
              </p>
              <p className="mt-1 text-[11px] font-bold text-amber-300">
                ผูกกับตัวละคร • ห้ามขาย/ตั้งร้าน • รับได้บัญชีละ 1 ครั้ง • เริ่มนับเมื่อกดนำออกจาก Item Mall
              </p>
            </div>
          </div>
          <div className="flex w-full flex-col gap-2 lg:w-[360px]">
            <select
              disabled={starterClaimed || starterStatusLoading}
              value={starterCharacter}
              onChange={(event) => {
                setStarterCharacter(event.target.value);
                setStarterFeedback(null);
              }}
              className="rounded-2xl border border-white/15 bg-[#101624] px-4 py-3 text-sm font-bold text-white focus:border-amber-400 focus:outline-none"
            >
              <option value="">เลือกตัวละครที่จะรับชุด</option>
              {characters.map((character) => (
                <option key={character.name} value={character.name}>
                  {character.name} — {cleanClassName(character.className)}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={!starterCharacter || claimingStarter || starterClaimed || starterStatusLoading}
              onClick={handleStarterClaim}
              className="btn-shine rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-3 text-sm font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {starterStatusLoading ? "กำลังตรวจสอบ..." : starterClaimed ? "รับ Starter Kit แล้ว" : claimingStarter ? "กำลังส่งเข้า Item Mall..." : "รับ Starter Kit ฟรี"}
            </button>
          </div>
        </div>
        {starterFeedback && (
          <div className={`mt-4 rounded-2xl border p-3 text-xs font-bold ${starterFeedback.ok ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-300" : "border-rose-400/40 bg-rose-500/15 text-rose-300"}`}>
            {starterFeedback.message}
          </div>
        )}
        {starterClaimed && !starterFeedback && (
          <div className="mt-4 rounded-2xl border border-emerald-400/40 bg-emerald-500/15 p-3 text-xs font-bold text-emerald-300">
            บัญชีนี้รับ Starter Kit ไปแล้ว ไม่สามารถรับซ้ำได้
          </div>
        )}
      </div>

      {/* P0-A + P0-B Forms */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* P0-A: Online Time Redeem */}
        <div className="glass-strong gold-border-glow rounded-3xl p-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/20 text-emerald-300">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-white">P0-A: แลกเวลาออนไลน์ → Credits</h2>
              <p className="text-xs text-slate-400">เรท 1 ชั่วโมง = 5 เครดิต • อิงตามจุดตรวจ (Checkpoint)</p>
            </div>
          </div>

          <form onSubmit={handleRedeemSubmit} className="mt-5 space-y-4">
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200">จำนวนชั่วโมงที่ต้องการแลก</label>
                <span className="text-[11px] font-mono text-emerald-300">แลกได้สูงสุด {availableHours} ชม.</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={hoursInput}
                  onChange={(e) => {
                    setHoursInput(e.target.value);
                    setFeedback(null);
                  }}
                  placeholder={availableHours > 0 ? `กรอก 1 - ${availableHours}` : "ยังไม่มีชั่วโมงสะสมครบ 1 ชม."}
                  className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 font-mono text-sm font-bold text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleSetMaxHours}
                  disabled={availableHours <= 0}
                  className="rounded-2xl border border-emerald-400/40 bg-emerald-400/15 px-4 py-3 text-xs font-black text-emerald-300 hover:bg-emerald-400/25 disabled:opacity-40"
                >
                  MAX
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 text-xs">
              {isOverHours ? (
                <div className="flex items-center gap-2 font-bold text-rose-300">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>เกินจำนวนชั่วโมงที่แลกได้ ({availableHours} ชม.)</span>
                </div>
              ) : isValidHours ? (
                <div className="flex items-center justify-between text-emerald-200">
                  <span>ผลลัพธ์ที่จะได้รับ:</span>
                  <span className="font-mono text-base font-black text-amber-300">+{earnedCredits.toLocaleString()} Cr</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-slate-400">
                  <Info className="h-4 w-4 shrink-0" />
                  <span>กรอกจำนวนชั่วโมงเต็มเพื่อคำนวณเครดิต</span>
                </div>
              )}
            </div>

            {feedback && (
              <div
                className={`flex items-center gap-2 rounded-2xl border p-3 text-xs font-bold ${
                  feedback.ok
                    ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-300"
                    : "border-rose-500/40 bg-rose-500/15 text-rose-300"
                }`}
              >
                {feedback.ok ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                <span>{feedback.message}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isRedeemDisabled}
              className="btn-shine flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 px-6 py-3.5 text-sm font-extrabold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Sparkles className="h-4 w-4" />
              <span>{redeeming ? "กำลังตรวจสอบเวลาและโอนเครดิต..." : "ยืนยันแลกเวลาออนไลน์"}</span>
            </button>
          </form>
        </div>

        {/* P0-B: Credits -> WCoinC */}
        <div className="glass-strong rounded-3xl border border-purple-500/30 p-6 shadow-xl">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-purple-500/20 text-purple-300">
              <ArrowRightLeft className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-white">P0-B: แลก Credits → WCoinC</h2>
              <p className="text-xs text-slate-400">เรท 100 Credits = 50 WCoinC • Two-Phase CashShop Grant</p>
            </div>
          </div>

          <form onSubmit={handleExchangeSubmit} className="mt-5 space-y-4">
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200">จำนวน Credits ที่ต้องการใช้แลก</label>
                <span className="text-[11px] font-mono text-amber-300">มีอยู่ {credits.toLocaleString()} Cr</span>
              </div>
              <input
                type="number"
                min={2}
                step={2}
                value={creditsInput}
                onChange={(e) => {
                  setCreditsInput(e.target.value);
                  setExchangeFeedback(null);
                }}
                className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 font-mono text-sm font-bold text-white focus:border-purple-400 focus:outline-none"
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {[20, 100, 200, 500, 1000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setCreditsInput(String(amt));
                      setExchangeFeedback(null);
                    }}
                    className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-xs text-slate-300 hover:border-purple-400/50 hover:text-purple-200"
                  >
                    {amt} Cr
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 text-xs">
              {isOverCredits ? (
                <div className="flex items-center gap-2 font-bold text-rose-300">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>เครดิตไม่เพียงพอ (มี {credits.toLocaleString()} Cr)</span>
                </div>
              ) : isValidCredits ? (
                <div className="flex items-center justify-between text-purple-200">
                  <span>WCoinC ที่จะส่งเข้าเกม:</span>
                  <span className="font-mono text-base font-black text-purple-300">+{expectedWcoin.toLocaleString()} WC</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-slate-400">
                  <Info className="h-4 w-4 shrink-0" />
                  <span>กรุณาระบุจำนวนคู่ (ขั้นต่ำ 2 Credits = 1 WCoinC)</span>
                </div>
              )}
            </div>

            {exchangeFeedback && (
              <div
                className={`flex items-center gap-2 rounded-2xl border p-3 text-xs font-bold ${
                  exchangeFeedback.ok
                    ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-300"
                    : "border-rose-500/40 bg-rose-500/15 text-rose-300"
                }`}
              >
                {exchangeFeedback.ok ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0" />
                )}
                <span>{exchangeFeedback.message}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isExchangeDisabled}
              className="btn-shine flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#d4af37] via-[#ffb52e] to-[#ff8a3c] px-6 py-3.5 text-sm font-extrabold text-[#090d16] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowRightLeft className="h-4 w-4" />
              <span>{exchanging ? "กำลังส่งคำสั่งเข้า OpenMU..." : "ยืนยันแลก Credits เป็น WCoinC"}</span>
            </button>
          </form>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-amber-400/40 bg-gradient-to-br from-amber-500/20 via-[#0d111d] to-[#090d18] p-6 shadow-xl shadow-amber-500/10">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amber-400/20 text-amber-300">
              <Crown className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-display text-lg font-black text-white">VIP 30 วัน</h2>
              <p className="mt-1 text-xs text-slate-300">เข้า SV3‑VIP • EXP 130x • ต่ออายุสะสมจากวันหมดอายุเดิม</p>
              <div className="mt-2 font-mono text-sm font-black text-amber-300">ราคา 300 Credits</div>
              <div className="mt-1 text-[11px] text-slate-400">
                {isVip ? `VIP ปัจจุบันถึง ${vipUntil!.toLocaleString("th-TH")}` : "สถานะปัจจุบัน: ผู้เล่นทั่วไป"}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleVipPurchase}
            disabled={buyingVip || credits < 300}
            className="btn-shine rounded-2xl bg-gradient-to-r from-amber-300 to-orange-500 px-6 py-3 text-sm font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {buyingVip ? "กำลังเปิดใช้งาน VIP..." : credits < 300 ? "Credits ไม่เพียงพอ" : "ซื้อ VIP 30 วัน"}
          </button>
        </div>
        {vipFeedback && (
          <div className={`mt-4 rounded-2xl border p-3 text-xs font-bold ${vipFeedback.ok ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-300" : "border-rose-400/40 bg-rose-500/15 text-rose-300"}`}>
            {vipFeedback.message}
          </div>
        )}
      </div>

      {/* History Tables */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#090d18]/70 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.02] px-5 py-3.5">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">ประวัติแลกเวลาออนไลน์</h3>
            </div>
            <span className="font-mono text-[11px] text-slate-400">{redemptions.length} รายการ</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-[10px] uppercase text-slate-400">
                  <th className="px-4 py-3">เวลา</th>
                  <th className="px-4 py-3 text-center">ชั่วโมง</th>
                  <th className="px-4 py-3 text-right">เครดิต</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {redemptions.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-slate-500">
                      ยังไม่มีประวัติการแลกเวลาออนไลน์
                    </td>
                  </tr>
                ) : (
                  redemptions.slice(0, 10).map((r) => (
                    <tr key={r.id}>
                      <td className="px-4 py-2.5 font-mono text-[11px] text-slate-300">
                        {new Date(r.createdAt).toLocaleString("th-TH")}
                      </td>
                      <td className="px-4 py-2.5 text-center font-mono text-emerald-300">{r.hoursRedeemed} ชม.</td>
                      <td className="px-4 py-2.5 text-right font-mono font-bold text-amber-300">
                        +{r.creditsAwarded.toLocaleString()} Cr
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#090d18]/70 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.02] px-5 py-3.5">
            <div className="flex items-center gap-2">
              <Gem className="h-4 w-4 text-purple-400" />
              <h3 className="text-sm font-bold text-white">ประวัติแลก Credits → WCoinC</h3>
            </div>
            <span className="font-mono text-[11px] text-slate-400">{exchanges.length} รายการ</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-[10px] uppercase text-slate-400">
                  <th className="px-4 py-3">เวลา</th>
                  <th className="px-4 py-3 text-right">Credits</th>
                  <th className="px-4 py-3 text-right">WCoinC</th>
                  <th className="px-4 py-3 text-center">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {exchanges.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500">
                      ยังไม่มีประวัติการแลก WCoinC
                    </td>
                  </tr>
                ) : (
                  exchanges.slice(0, 10).map((ex) => (
                    <tr key={ex.id}>
                      <td className="px-4 py-2.5 font-mono text-[11px] text-slate-300">
                        {new Date(ex.createdAt).toLocaleString("th-TH")}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-amber-300">-{ex.creditsSpent.toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-right font-mono font-bold text-purple-300">
                        +{ex.wcoinGranted.toLocaleString()}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[10px] text-slate-200">
                          {ex.status}
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

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#090d18]/70 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.02] px-5 py-3.5">
          <div className="flex items-center gap-2"><Coins className="h-4 w-4 text-amber-400" /><h3 className="text-sm font-bold text-white">ประวัติการเติม Credits</h3></div>
          <span className="font-mono text-[11px] text-slate-400">{orders.length} รายการ</span>
        </div>
        <div className="overflow-x-auto"><table className="w-full text-left text-xs">
          <thead><tr className="border-b border-white/10 text-[10px] uppercase text-slate-400">
            <th className="px-4 py-3">เวลา</th><th className="px-4 py-3">แพ็กเกจ</th><th className="px-4 py-3">ช่องทาง</th><th className="px-4 py-3 text-right">Credits</th><th className="px-4 py-3 text-center">สถานะ</th>
          </tr></thead>
          <tbody className="divide-y divide-white/5">
            {orders.length === 0 ? <tr><td colSpan={5} className="py-8 text-center text-slate-500">ยังไม่มีประวัติการเติม Credits</td></tr> : orders.slice(0, 10).map((ord) => (
              <tr key={ord.id}>
                <td className="px-4 py-2.5 font-mono text-[11px] text-slate-300">{new Date(ord.createdAt).toLocaleString("th-TH")}</td>
                <td className="px-4 py-2.5 text-slate-200">{ord.packageName || ord.packageId}</td>
                <td className="px-4 py-2.5 font-mono text-slate-400">{ord.provider}</td>
                <td className="px-4 py-2.5 text-right font-mono font-bold text-amber-300">+{ord.creditsToGrant.toLocaleString()} Cr</td>
                <td className="px-4 py-2.5 text-center font-mono text-emerald-300">{ord.status}</td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </div>
    </div>
  );
}
