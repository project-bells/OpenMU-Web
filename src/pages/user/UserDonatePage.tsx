import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  QrCode,
  CheckCircle2,
  AlertTriangle,
  Wallet,
  CreditCard,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  FlaskConical,
} from "lucide-react";
import {
  type TopupOrderRecord,
  type TopupPackage,
  type TopupProvidersInfo,
  capturePaypalTopupOrder,
  confirmSandboxTopupOrder,
  createTopupOrder,
  fetchTopupCatalog,
} from "../../services/dbApi";
import { useUserDashboard } from "../../context/UserDashboardContext";

type ProviderId = "promptpay_manual" | "paypal" | "dev_sandbox";

export default function UserDonatePage() {
  const { username, orders, refreshSummary } = useUserDashboard();
  const [searchParams, setSearchParams] = useSearchParams();

  const [packages, setPackages] = useState<TopupPackage[]>([]);
  const [providers, setProviders] = useState<TopupProvidersInfo>({
    promptpayManual: { enabled: false },
    paypal: { enabled: false },
    webhookHmac: { enabled: false },
    devSandbox: { enabled: false },
  });

  const [selectedPkgId, setSelectedPkgId] = useState<string>("");
  const [selectedProvider, setSelectedProvider] = useState<ProviderId>("promptpay_manual");
  const [activeOrder, setActiveOrder] = useState<TopupOrderRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    let mounted = true;
    fetchTopupCatalog()
      .then((cat) => {
        if (!mounted) return;
        setPackages(Array.isArray(cat.packages) ? cat.packages : []);
        setSelectedPkgId((current) => current || cat.packages?.[0]?.id || "");
        if (cat.providers) {
          setProviders(cat.providers);
        }
      })
      .catch(() => setPackages([]));
    return () => {
      mounted = false;
    };
  }, []);

  // Auto-handle PayPal return redirect (?paypal_order=... or ?paypalCaptureOrderId=...)
  useEffect(() => {
    const orderId = searchParams.get("paypal_order") || searchParams.get("paypalCaptureOrderId");
    const cancelled = searchParams.get("paypal_cancelled") || searchParams.get("paypalCancelled");
    if (cancelled) {
      setFeedback({ ok: false, text: "รายการ PayPal ถูกยกเลิกโดยผู้ใช้" });
      setSearchParams({}, { replace: true });
      return;
    }
    if (!orderId) return;

    let active = true;
    setLoading(true);
    capturePaypalTopupOrder(orderId)
      .then(async (res) => {
        if (!active) return;
        if (res.success && res.order) {
          setActiveOrder(res.order);
          setFeedback({
            ok: true,
            text: `ยืนยัน PayPal สำเร็จ! ได้รับ +${res.order.creditsToGrant.toLocaleString()} Credits` +
              (res.order.wcoinToGrant > 0 ? ` และ +${res.order.wcoinToGrant.toLocaleString()} WCoinC` : ""),
          });
          await refreshSummary();
        } else {
          setFeedback({ ok: false, text: res.error || "ไม่สามารถยืนยันการชำระเงิน PayPal ได้" });
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
          setSearchParams({}, { replace: true });
        }
      });

    return () => {
      active = false;
    };
  }, [searchParams, setSearchParams, refreshSummary]);

  const currentPkg = packages.find((p) => p.id === selectedPkgId) || packages[0];

  const handleCopy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(key);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      // Clipboard blocked in non-HTTPS test context
    }
  };

  const handleCreateOrder = async () => {
    if (!currentPkg) return;
    setLoading(true);
    setFeedback(null);
    const res = await createTopupOrder(currentPkg.id, selectedProvider);
    setLoading(false);

    if (res.success && res.order) {
      setActiveOrder(res.order);
      await refreshSummary();
      if (selectedProvider === "paypal" && res.order.paymentUrl) {
        setFeedback({
          ok: true,
          text: "สร้างคำสั่งซื้อ PayPal สำเร็จ กดปุ่มไปยังหน้าชำระเงิน PayPal หรือรอการ Redirect",
        });
      } else {
        setFeedback({
          ok: true,
          text: `สร้างคำสั่งซื้อ ${res.order.id} สำเร็จ สถานะ: ${res.order.status}`,
        });
      }
    } else {
      setFeedback({ ok: false, text: res.error || "ไม่สามารถสร้างคำสั่งซื้อได้" });
    }
  };

  const handleSandboxConfirm = async (orderId: string) => {
    setLoading(true);
    setFeedback(null);
    const res = await confirmSandboxTopupOrder(orderId);
    setLoading(false);
    if (res.success && res.order) {
      setActiveOrder(res.order);
      await refreshSummary();
      setFeedback({
        ok: true,
        text: `เติมเงิน Sandbox สำเร็จ! +${res.order.creditsToGrant.toLocaleString()} Credits เข้ากระเป๋าแล้ว`,
      });
    } else {
      setFeedback({ ok: false, text: res.error || "Sandbox confirmation failed" });
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-black text-white sm:text-3xl">
            เติมเครดิต & <span className="text-gold-gradient">Payment Checkout</span>
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            ราคาและโบนัสคำนวณฝั่งเซิร์ฟเวอร์แบบ Idempotent (รหัสบัญชี:{" "}
            <strong className="text-amber-300">@{username}</strong>)
          </p>
        </div>
        <button
          type="button"
          onClick={() => refreshSummary()}
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10"
        >
          <RefreshCw className="h-3.5 w-3.5" /> รีเฟรชสถานะออเดอร์
        </button>
      </div>

      {/* Packages */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {packages.map((pkg) => {
          const isSelected = pkg.id === selectedPkgId;
          const totalCr = pkg.totalCredits ?? (pkg.credits ?? pkg.baseCredits ?? 0) + pkg.bonusCredits;
          return (
            <button
              key={pkg.id}
              type="button"
              onClick={() => setSelectedPkgId(pkg.id)}
              className={`relative flex flex-col justify-between rounded-3xl border p-5 text-left transition ${
                isSelected
                  ? "border-amber-400 bg-amber-500/15 shadow-xl shadow-amber-500/10 ring-1 ring-amber-400/50"
                  : "border-white/10 bg-[#090d18]/80 hover:border-amber-400/40"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-white">{pkg.name}</span>
                  {pkg.badge && (
                    <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[9px] font-black text-slate-950">
                      {pkg.badge}
                    </span>
                  )}
                </div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="font-display text-2xl font-black text-amber-300">
                    ฿{pkg.priceThb.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-400">THB</span>
                </div>
                <div className="mt-2 font-mono text-xs text-white">
                  <strong>{totalCr.toLocaleString()} Credits</strong>
                  {pkg.bonusWcoin > 0 && (
                    <span className="ml-1.5 text-purple-300">(+{pkg.bonusWcoin} WCoinC)</span>
                  )}
                </div>
                <p className="mt-1.5 text-[11px] text-slate-400">{pkg.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Checkout Form */}
      <div className="glass-strong gold-border-glow rounded-3xl p-6 space-y-5">
        <div>
          <label className="mb-2 block text-xs font-bold text-slate-200">เลือกช่องทางชำระเงินจริง (Payment Provider):</label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => setSelectedProvider("promptpay_manual")}
              className={`flex items-center gap-3 rounded-2xl border p-3.5 text-left transition ${
                selectedProvider === "promptpay_manual"
                  ? "border-sky-400 bg-sky-500/15 text-sky-200"
                  : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              <QrCode className="h-5 w-5 text-sky-400 shrink-0" />
              <div>
                <div className="text-xs font-bold">PromptPay QR</div>
                <div className="text-[10px] text-slate-400">
                  {providers.promptpayManual.enabled ? "พร้อมเพย์ EMVCo" : "ต้องตั้ง PROMPTPAY_TARGET ในเซิร์ฟเวอร์"}
                </div>
              </div>
            </button>

            <button
              type="button"
              disabled={!providers.paypal.enabled}
              onClick={() => setSelectedProvider("paypal")}
              className={`flex items-center gap-3 rounded-2xl border p-3.5 text-left transition disabled:opacity-40 ${
                selectedProvider === "paypal"
                  ? "border-amber-400 bg-amber-500/15 text-amber-200"
                  : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              <CreditCard className="h-5 w-5 text-amber-400 shrink-0" />
              <div>
                <div className="text-xs font-bold">PayPal Checkout</div>
                <div className="text-[10px] text-slate-400">
                  {providers.paypal.enabled ? `เปิดใช้งาน (${providers.paypal.mode || "sandbox"})` : "ไม่ได้ตั้งค่าใน Environment"}
                </div>
              </div>
            </button>

            {providers.devSandbox.enabled && (
              <button
                type="button"
                onClick={() => setSelectedProvider("dev_sandbox")}
                className={`flex items-center gap-3 rounded-2xl border p-3.5 text-left transition ${
                  selectedProvider === "dev_sandbox"
                    ? "border-emerald-400 bg-emerald-500/15 text-emerald-200"
                    : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                <FlaskConical className="h-5 w-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold">Dev Sandbox</div>
                  <div className="text-[10px] text-slate-400">ทดสอบ Flow เฉพาะ Non-Prod</div>
                </div>
              </button>
            )}
          </div>
        </div>

        {feedback && (
          <div
            className={`flex items-center gap-2 rounded-2xl border p-3.5 text-xs font-bold ${
              feedback.ok
                ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-200"
                : "border-rose-500/40 bg-rose-500/15 text-rose-200"
            }`}
          >
            {feedback.ok ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertTriangle className="h-4 w-4 shrink-0" />}
            <span>{feedback.text}</span>
          </div>
        )}

        <button
          type="button"
          disabled={loading || !currentPkg}
          onClick={handleCreateOrder}
          className="btn-shine flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 py-3.5 text-xs font-extrabold text-slate-950 shadow-lg shadow-amber-500/25 transition hover:brightness-110 disabled:opacity-50"
        >
          <Wallet className="h-4 w-4" />
          <span>
            {loading
              ? "กำลังสร้างคำสั่งซื้อ..."
              : `สร้างคำสั่งซื้อ ${currentPkg?.name} (฿${currentPkg?.priceThb.toLocaleString()})`}
          </span>
        </button>

        {/* Active Order Panel */}
        {activeOrder && (
          <div className="rounded-2xl border border-white/15 bg-[#090d18]/90 p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs font-bold text-white">
                คำสั่งซื้อ <span className="font-mono text-amber-300">{activeOrder.id}</span>
              </div>
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-0.5 font-mono text-[11px] font-bold text-emerald-300">
                {activeOrder.status}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-2 text-xs text-slate-300 sm:grid-cols-3">
              <div>ยอดชำระ: <strong className="font-mono text-white">฿{activeOrder.amountThb.toLocaleString()}</strong></div>
              <div>Credits: <strong className="font-mono text-amber-300">+{activeOrder.creditsToGrant.toLocaleString()}</strong></div>
              <div>WCoinC: <strong className="font-mono text-purple-300">+{activeOrder.wcoinToGrant.toLocaleString()}</strong></div>
            </div>

            {activeOrder.qrPayload && activeOrder.status === "PENDING_PAYMENT" && (
              <div className="rounded-xl border border-sky-400/30 bg-sky-500/10 p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-sky-200">
                  <span>PromptPay EMVCo Payload (โอนตามยอด ฿{activeOrder.amountThb.toLocaleString()} เป๊ะ):</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(activeOrder.id, activeOrder.qrPayload || "")}
                    className="inline-flex items-center gap-1 rounded-lg border border-sky-400/40 bg-sky-500/20 px-2.5 py-1 text-[11px]"
                  >
                    {copiedId === activeOrder.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {copiedId === activeOrder.id ? "คัดลอกแล้ว" : "คัดลอก Payload"}
                  </button>
                </div>
                <div className="break-all rounded-lg bg-black/40 p-2 font-mono text-[11px] text-slate-200">
                  {activeOrder.qrPayload}
                </div>
                <p className="text-[11px] text-slate-400">
                  เมื่อโอนเงินเสร็จ ระบบจะอัปเดตผ่าน Webhook อัตโนมัติ หรือให้ GM กดยืนยันออเดอร์ใน Admin Console
                </p>
              </div>
            )}

            {activeOrder.paymentUrl && activeOrder.status === "PENDING_PAYMENT" && (
              <a
                href={activeOrder.paymentUrl}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2 text-xs font-extrabold text-slate-950 hover:brightness-110"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                ดำเนินการชำระเงินผ่าน PayPal Checkout
              </a>
            )}

            {activeOrder.provider === "dev_sandbox" &&
              providers.devSandbox.enabled &&
              activeOrder.status === "PENDING_PAYMENT" && (
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleSandboxConfirm(activeOrder.id)}
                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/40 bg-emerald-500/20 px-4 py-2 text-xs font-bold text-emerald-200 hover:bg-emerald-500/30"
                >
                  <FlaskConical className="h-3.5 w-3.5" />
                  ยืนยัน Sandbox Order (Dev Only)
                </button>
              )}
          </div>
        )}
      </div>

      {/* Order History Table */}
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#090d18]/75 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 className="text-sm font-bold text-white">ประวัติคำสั่งซื้อเติมเงินของฉัน</h2>
          <span className="font-mono text-xs text-slate-400">{orders.length} รายการ</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-[10px] uppercase text-slate-400">
                <th className="px-5 py-3">Order ID</th>
                <th className="px-5 py-3">แพ็กเกจ / ช่องทาง</th>
                <th className="px-5 py-3 text-right">ราคา (THB)</th>
                <th className="px-5 py-3 text-right">ได้รับ</th>
                <th className="px-5 py-3 text-center">สถานะ</th>
                <th className="px-5 py-3 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500">
                    ยังไม่มีรายการเติมเงิน
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-white/[0.02]">
                    <td className="px-5 py-3 font-mono text-[11px] text-white">{ord.id}</td>
                    <td className="px-5 py-3">
                      <div className="font-bold text-slate-200">{ord.packageName || ord.packageId}</div>
                      <div className="font-mono text-[10px] text-slate-400">{ord.provider}</div>
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-white">฿{ord.amountThb.toLocaleString()}</td>
                    <td className="px-5 py-3 text-right font-mono">
                      <div className="text-amber-300">+{ord.creditsToGrant.toLocaleString()} Cr</div>
                      {ord.wcoinToGrant > 0 && (
                        <div className="text-[10px] text-purple-300">+{ord.wcoinToGrant.toLocaleString()} WC</div>
                      )}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span
                        className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-bold ${
                          ord.status === "FULFILLED"
                            ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-300"
                            : ord.status === "PENDING_PAYMENT"
                            ? "border-amber-400/40 bg-amber-500/15 text-amber-300"
                            : "border-white/15 bg-white/5 text-slate-300"
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      {ord.status === "PENDING_PAYMENT" && (
                        <button
                          type="button"
                          onClick={() => setActiveOrder(ord)}
                          className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] text-slate-200 hover:bg-white/10"
                        >
                          ดูรายละเอียด
                        </button>
                      )}
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
