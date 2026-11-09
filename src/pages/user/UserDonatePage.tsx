import { useState } from "react";
import {
  Wallet,
  QrCode,
  CreditCard,
  Sparkles,
  Coins,
  Gem,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { TOPUP_PACKAGES, topupDonate } from "../../services/dbApi";
import { useUserDashboard } from "../../context/UserDashboardContext";

export default function UserDonatePage() {
  const { username } = useUserDashboard();
  const [selectedChannel, setSelectedChannel] = useState<"truemoney" | "paypal" | "credit_card">("truemoney");
  const [selectedPackageId, setSelectedPackageId] = useState<string>("tier-300");
  const [accountOrPhone, setAccountOrPhone] = useState<string>("089-123-4567");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string; txnId?: string } | null>(null);

  const handleDonate = async () => {
    setLoading(true);
    setFeedback(null);
    const res = await topupDonate(username, selectedPackageId, selectedChannel, accountOrPhone);
    setLoading(false);

    if (res.success) {
      setFeedback({
        ok: true,
        message: `เติมเงินสำเร็จ! ได้รับ +${res.addedCredits} Credits และ +${res.addedWcoin} WCoin เข้าสู่บัญชีเรียบร้อยแล้ว`,
        txnId: res.txnId,
      });
    } else {
      setFeedback({
        ok: false,
        message: res.error || "เกิดข้อผิดพลาดในการเติมเงิน",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300">
          <Wallet className="h-3.5 w-3.5" /> บริจาคสนับสนุนเซิร์ฟเวอร์
        </div>
        <h1 className="font-display mt-2 text-2xl font-black text-white sm:text-3xl">
          เติมเครดิต & บริจาคสนับสนุน (Top-up & Donate)
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          สนับสนุนค่าเครื่องเซิร์ฟเวอร์ รับเครดิตและ WCoin พร้อมโปรโมชั่นโบนัสพิเศษ สอดคล้องเท่าเทียมกันทุกช่องทาง
        </p>
      </div>

      {/* Harmonization Callout */}
      <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-200">
        <Sparkles className="h-4 w-4 shrink-0 text-emerald-400" />
        <span>โปรโมชั่นโบนัสแถมฟรีเท่ากัน 100% ทุกช่องทาง (TrueMoney Wallet, PayPal, บัตรเครดิต)</span>
      </div>

      {/* 1. Channel Selector */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => setSelectedChannel("truemoney")}
          className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-center transition ${
            selectedChannel === "truemoney"
              ? "border-amber-400 bg-amber-400/20 shadow-md ring-1 ring-amber-400/50"
              : "border-white/10 bg-white/[0.03] hover:border-white/20"
          }`}
        >
          <QrCode className="h-6 w-6 mb-1 text-orange-400" />
          <span className="text-sm font-bold text-white">TrueMoney / QR</span>
          <span className="text-[11px] text-slate-400 mt-0.5">THB ฿ • ค่าธรรมเนียม 0%</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedChannel("paypal")}
          className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-center transition ${
            selectedChannel === "paypal"
              ? "border-amber-400 bg-amber-400/20 shadow-md ring-1 ring-amber-400/50"
              : "border-white/10 bg-white/[0.03] hover:border-white/20"
          }`}
        >
          <Wallet className="h-6 w-6 mb-1 text-sky-400" />
          <span className="text-sm font-bold text-white">PayPal Express</span>
          <span className="text-[11px] text-slate-400 mt-0.5">USD $ • สากลทั่วโลก</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedChannel("credit_card")}
          className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-center transition ${
            selectedChannel === "credit_card"
              ? "border-amber-400 bg-amber-400/20 shadow-md ring-1 ring-amber-400/50"
              : "border-white/10 bg-white/[0.03] hover:border-white/20"
          }`}
        >
          <CreditCard className="h-6 w-6 mb-1 text-purple-400" />
          <span className="text-sm font-bold text-white">บัตรเครดิต / เดบิต</span>
          <span className="text-[11px] text-slate-400 mt-0.5">Visa / Mastercard / JCB</span>
        </button>
      </div>

      {/* 2. Package Selector */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-200">เลือกแพ็กเกจเติมเงิน (Package Tiers):</label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TOPUP_PACKAGES.map((pkg) => {
            const isSelected = selectedPackageId === pkg.id;
            return (
              <div
                key={pkg.id}
                onClick={() => setSelectedPackageId(pkg.id)}
                className={`relative cursor-pointer rounded-2xl border p-4 transition ${
                  isSelected
                    ? "border-amber-400 bg-amber-400/15 shadow-md ring-1 ring-amber-400/50"
                    : "border-white/10 bg-white/[0.03] hover:border-amber-400/40"
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-2.5 right-4 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-2.5 py-0.5 text-[9px] font-black uppercase text-slate-950 shadow-sm">
                    ★ แนะนำ (POPULAR)
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">{pkg.name}</span>
                  <span className="rounded bg-amber-400/20 px-2 py-0.5 text-[10px] font-extrabold text-amber-300">
                    {pkg.tag}
                  </span>
                </div>

                <div className="font-display mt-2 text-2xl font-black text-white">
                  {selectedChannel === "paypal" ? `$${pkg.priceUsd.toFixed(2)}` : `฿${pkg.priceThb.toLocaleString()}`}
                  <span className="ml-1 text-xs text-slate-400 font-normal">
                    {selectedChannel === "paypal" ? `(~฿${pkg.priceThb})` : `($${pkg.priceUsd.toFixed(2)})`}
                  </span>
                </div>

                <div className="mt-3 space-y-1 text-xs border-t border-white/10 pt-2.5">
                  <div className="flex items-center justify-between text-amber-300 font-bold">
                    <span className="flex items-center gap-1 font-normal text-slate-300">
                      <Coins className="h-3.5 w-3.5 text-amber-400" /> เครดิตรวม:
                    </span>
                    <span>+{pkg.totalCredits.toLocaleString()} Credits</span>
                  </div>
                  <div className="flex items-center justify-between text-purple-300 font-bold">
                    <span className="flex items-center gap-1 font-normal text-slate-300">
                      <Gem className="h-3.5 w-3.5 text-purple-400" /> WCoin รวม:
                    </span>
                    <span>+{pkg.totalWcoin.toLocaleString()} WC</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Payment Details & Submit */}
      <div className="glass-strong rounded-3xl p-6 space-y-4">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-300">
            {selectedChannel === "truemoney"
              ? "เบอร์ TrueMoney Wallet / พร้อมเพย์"
              : selectedChannel === "paypal"
              ? "อีเมล PayPal ของคุณ"
              : "หมายเลขบัตรเครดิต (จำลอง)"}
          </label>
          <input
            type="text"
            value={accountOrPhone}
            onChange={(e) => setAccountOrPhone(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 py-3 px-3.5 text-xs text-white focus:border-amber-400/60 focus:outline-none"
          />
        </div>

        {feedback && (
          <div
            className={`flex flex-col gap-1 rounded-2xl border p-4 text-xs font-bold ${
              feedback.ok
                ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-300"
                : "border-rose-500/40 bg-rose-500/15 text-rose-300"
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.ok ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
              )}
              <span>{feedback.message}</span>
            </div>
            {feedback.txnId && (
              <div className="mt-1 font-mono text-[11px] text-emerald-200/80">
                รหัสรายการ: {feedback.txnId}
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          disabled={loading}
          onClick={handleDonate}
          className="btn-shine flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 py-3.5 text-xs font-extrabold text-slate-950 shadow-lg shadow-amber-500/25 transition hover:brightness-110 disabled:opacity-50"
        >
          <Wallet className="h-4 w-4" />
          <span>{loading ? "กำลังทำรายการ…" : "ยืนยันการเติมเงิน"}</span>
        </button>
      </div>
    </div>
  );
}
