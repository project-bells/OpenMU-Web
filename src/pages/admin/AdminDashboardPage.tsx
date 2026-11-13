import { useState, useEffect, useCallback, FormEvent } from "react";
import {
  Users,
  Coins,
  Gem,
  Activity,
  PlusCircle,
  Search,
  Clock,
  CheckCircle2,
  X,
  RefreshCw,
  AlertCircle,
  Check,
  Wallet,
} from "lucide-react";
import { useAdminAuth } from "../../context/AdminAuthContext";
import {
  type AdminAuditLogEntry,
  type TopupOrderRecord,
  type UserSearchItem,
  adminAdjustWallet,
  adminConfirmTopupOrder,
  fetchAdminAuditLogs,
  fetchAdminTopupOrders,
  fetchServerStatus,
  searchUsers,
} from "../../services/dbApi";

export default function AdminDashboardPage() {
  const { user: adminUser } = useAdminAuth();

  const [onlinePlayers, setOnlinePlayers] = useState(0);
  const [serverOnline, setServerOnline] = useState(false);
  const [users, setUsers] = useState<UserSearchItem[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [orders, setOrders] = useState<TopupOrderRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLogEntry[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ ok: boolean; text: string } | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserSearchItem | null>(null);
  const [currency, setCurrency] = useState<"credits" | "wcoin">("credits");
  const [adjustAmount, setAdjustAmount] = useState<string>("500");
  const [adminNote, setAdminNote] = useState("GM Event / Support Adjustment");
  const [submitting, setSubmitting] = useState(false);

  const loadAll = useCallback(async (q = searchTerm, st = stateFilter) => {
    setLoading(true);
    try {
      const [statusRes, usersRes, ordersRes, logsRes] = await Promise.all([
        fetchServerStatus(),
        searchUsers(q, st, 0, 50),
        fetchAdminTopupOrders(""),
        fetchAdminAuditLogs(30),
      ]);
      setOnlinePlayers(statusRes.totalOnline ?? 0);
      setServerOnline(statusRes.status === "online");
      setUsers(usersRes.items);
      setTotalUsers(usersRes.total);
      setOrders(ordersRes);
      setAuditLogs(logsRes);
    } catch (err: any) {
      setToast({ ok: false, text: err?.message || "โหลดข้อมูล Admin Dashboard ไม่สำเร็จ" });
    } finally {
      setLoading(false);
    }
  }, [searchTerm, stateFilter]);

  useEffect(() => {
    loadAll("", "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    loadAll(searchTerm, stateFilter);
  };

  const handleOpenCreditModal = (player: UserSearchItem) => {
    setSelectedUser(player);
    setCurrency("credits");
    setAdjustAmount("500");
    setAdminNote("GM Event / Support Adjustment");
    setModalOpen(true);
  };

  const handleConfirmAdjust = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    const numeric = parseInt(adjustAmount, 10);
    if (Number.isNaN(numeric) || numeric === 0) {
      setToast({ ok: false, text: "กรุณาระบุจำนวนมากกว่าหรือน้อยกว่า 0 (ไม่เท่ากับ 0)" });
      return;
    }

    setSubmitting(true);
    const res = await adminAdjustWallet(
      selectedUser.loginName,
      currency,
      numeric,
      adminNote.trim() || "GM Adjustment"
    );
    setSubmitting(false);

    if (res.success) {
      setModalOpen(false);
      setToast({
        ok: true,
        text: `ปรับยอด ${currency.toUpperCase()} (${numeric > 0 ? `+${numeric}` : numeric}) ให้ @${selectedUser.loginName} สำเร็จ`,
      });
      await loadAll(searchTerm, stateFilter);
    } else {
      setToast({ ok: false, text: res.error || "ปรับยอดไม่สำเร็จ" });
    }
  };

  const handleConfirmOrder = async (order: TopupOrderRecord) => {
    const res = await adminConfirmTopupOrder(order.id);
    if (res.success) {
      setToast({
        ok: true,
        text: `ยืนยันออเดอร์ ${order.id} และเติมเงินให้ @${order.loginName} สำเร็จแล้ว`,
      });
      await loadAll(searchTerm, stateFilter);
    } else {
      setToast({ ok: false, text: res.error || "ยืนยันออเดอร์ไม่สำเร็จ" });
    }
  };

  const pendingOrders = orders.filter((o) => o.status === "PENDING_PAYMENT" || o.status === "PAID");
  const totalCreditsShown = users.reduce((s, u) => s + (u.credits || 0), 0);
  const totalWcoinShown = users.reduce((s, u) => s + (u.wcoin || 0), 0);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-black tracking-wide text-white sm:text-3xl">
            ADMIN GM <span className="text-gold-gradient">CONTROL PANEL</span>
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            จัดการบัญชีผู้เล่น กระเป๋าเงิน และยืนยันรายการเติมเงินจากฐานข้อมูลจริง • ผู้ดูแล:{" "}
            <span className="font-bold text-amber-300">@{adminUser?.username}</span>
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadAll(searchTerm, stateFilter)}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold text-slate-200 transition hover:bg-white/10 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>รีเฟรชข้อมูลจริง</span>
        </button>
      </div>

      {toast && (
        <div
          className={`flex items-center justify-between rounded-2xl border p-4 text-xs font-bold ${
            toast.ok
              ? "border-emerald-400/50 bg-emerald-500/15 text-emerald-200"
              : "border-rose-400/50 bg-rose-500/15 text-rose-200"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {toast.ok ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <AlertCircle className="h-4 w-4 text-rose-400" />}
            <span>{toast.text}</span>
          </div>
          <button type="button" onClick={() => setToast(null)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-3xl border border-emerald-400/30 bg-[#090d18]/90 p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-emerald-300">
            <span className="font-bold uppercase">Online Players</span>
            <Activity className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="font-display mt-3 text-2xl font-black text-white sm:text-3xl">
            {onlinePlayers.toLocaleString()} <span className="text-xs text-slate-400">ออนไลน์</span>
          </div>
          <div className="mt-1.5 text-[11px] text-slate-400">
            สถานะ GameServer: {serverOnline ? "Online" : "Offline / Starting"}
          </div>
        </div>

        <div className="rounded-3xl border border-amber-400/30 bg-[#090d18]/90 p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-amber-300">
            <span className="font-bold uppercase">Credits (หน้านี้)</span>
            <Coins className="h-4 w-4 text-amber-400" />
          </div>
          <div className="font-display mt-3 text-2xl font-black text-amber-300 sm:text-3xl">
            {totalCreditsShown.toLocaleString()} <span className="text-xs text-white/50">Cr</span>
          </div>
          <div className="mt-1.5 text-[11px] text-slate-400">บัญชีที่ค้นพบทั้งหมด: {totalUsers.toLocaleString()} บัญชี</div>
        </div>

        <div className="rounded-3xl border border-purple-400/30 bg-[#090d18]/90 p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-purple-300">
            <span className="font-bold uppercase">WCoinC (หน้านี้)</span>
            <Gem className="h-4 w-4 text-purple-400" />
          </div>
          <div className="font-display mt-3 text-2xl font-black text-purple-300 sm:text-3xl">
            {totalWcoinShown.toLocaleString()} <span className="text-xs text-white/50">WC</span>
          </div>
          <div className="mt-1.5 text-[11px] text-slate-400 font-mono">100 Cr = 50 WCoinC</div>
        </div>

        <div className="rounded-3xl border border-sky-400/30 bg-[#090d18]/90 p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-sky-300">
            <span className="font-bold uppercase">Pending Top-Ups</span>
            <Wallet className="h-4 w-4 text-sky-400" />
          </div>
          <div className="font-display mt-3 text-2xl font-black text-white sm:text-3xl">
            {pendingOrders.length.toLocaleString()} <span className="text-xs text-slate-400">ออเดอร์</span>
          </div>
          <div className="mt-1.5 text-[11px] text-slate-400">รายการรอดำเนินการ / รอยืนยัน</div>
        </div>
      </div>

      {/* Pending Top-Up Orders */}
      {pendingOrders.length > 0 && (
        <div className="overflow-hidden rounded-3xl border border-sky-400/30 bg-[#090d18]/80 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 bg-sky-500/10 px-6 py-4">
            <h2 className="text-sm font-bold text-white">รายการเติมเงินรอดำเนินการ (Manual / PromptPay Confirmation)</h2>
            <span className="font-mono text-xs text-sky-300">{pendingOrders.length} ออเดอร์</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-[10px] uppercase text-slate-400">
                  <th className="px-5 py-3">Order ID</th>
                  <th className="px-5 py-3">ผู้เล่น</th>
                  <th className="px-5 py-3">ช่องทาง</th>
                  <th className="px-5 py-3 text-right">ยอด THB</th>
                  <th className="px-5 py-3 text-right">Credits / WCoin</th>
                  <th className="px-5 py-3 text-center">ยืนยัน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {pendingOrders.map((ord) => (
                  <tr key={ord.id}>
                    <td className="px-5 py-3 font-mono text-[11px] text-white">{ord.id}</td>
                    <td className="px-5 py-3 font-mono font-bold text-amber-300">@{ord.loginName}</td>
                    <td className="px-5 py-3 font-mono text-slate-300">{ord.provider}</td>
                    <td className="px-5 py-3 text-right font-mono text-white">฿{ord.amountThb.toLocaleString()}</td>
                    <td className="px-5 py-3 text-right font-mono text-emerald-300">
                      +{ord.creditsToGrant.toLocaleString()} Cr / +{ord.wcoinToGrant.toLocaleString()} WC
                    </td>
                    <td className="px-5 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleConfirmOrder(ord)}
                        className="inline-flex items-center gap-1 rounded-xl bg-emerald-400 px-3 py-1.5 text-xs font-extrabold text-slate-950 hover:brightness-110"
                      >
                        <Check className="h-3.5 w-3.5" /> ยืนยันยอดเข้า
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Management Table */}
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#090d18]/80 shadow-2xl">
        <div className="flex flex-col gap-4 border-b border-white/10 bg-white/[0.02] p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-amber-400" />
              <h2 className="font-display text-lg font-bold text-white">จัดการผู้เล่นและยอดเงิน (Live Server Accounts)</h2>
            </div>
            <p className="mt-1 text-xs text-slate-400">ค้นหาบัญชีจริงจาก OpenMU + ปรับยอด Credits / WCoinC แบบ Idempotent</p>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[200px]">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหา Login Name, Email..."
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pr-3 pl-8 text-xs text-white placeholder-slate-500 focus:border-amber-400/60 focus:outline-none"
              />
            </div>

            <select
              value={stateFilter}
              onChange={(e) => {
                setStateFilter(e.target.value);
                loadAll(searchTerm, e.target.value);
              }}
              className="rounded-xl border border-white/10 bg-[#090d18] px-3 py-2 text-xs text-slate-300"
            >
              <option value="">สถานะ: ทั้งหมด</option>
              <option value="Normal">Normal</option>
              <option value="Banned">Banned</option>
              <option value="TemporarilyBanned">TemporarilyBanned</option>
            </select>

            <button
              type="submit"
              className="rounded-xl bg-amber-400 px-3.5 py-2 text-xs font-extrabold text-slate-950"
            >
              ค้นหา
            </button>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03] text-[11px] font-bold uppercase text-slate-400">
                <th className="px-5 py-3.5">บัญชี (LOGIN)</th>
                <th className="px-5 py-3.5">สถานะในเกม</th>
                <th className="px-5 py-3.5 text-center">เวลาออนไลน์สะสม</th>
                <th className="px-5 py-3.5 text-right text-amber-300">Credits</th>
                <th className="px-5 py-3.5 text-right text-purple-300">WCoinC</th>
                <th className="px-5 py-3.5 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500">
                    {loading ? "กำลังโหลดข้อมูล..." : "ไม่พบบัญชีผู้เล่น"}
                  </td>
                </tr>
              ) : (
                users.map((player) => (
                  <tr key={player.loginName} className="hover:bg-white/[0.03]">
                    <td className="px-5 py-3.5">
                      <div className="font-mono font-bold text-white">@{player.loginName}</div>
                      <div className="text-[11px] text-slate-400">{player.email || "-"}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                          player.state === "Normal"
                            ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-300"
                            : "border-rose-500/40 bg-rose-500/15 text-rose-300"
                        }`}
                      >
                        {player.state} {player.isOnline ? "• INGAME" : ""}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center font-mono text-slate-300">
                      {Math.floor((player.onlineTimeSeconds || 0) / 3600)} ชม.
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono font-bold text-amber-300">
                      {player.credits.toLocaleString()} Cr
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono font-bold text-purple-300">
                      {player.wcoin.toLocaleString()} WC
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleOpenCreditModal(player)}
                        className="inline-flex items-center gap-1 rounded-xl border border-amber-400/40 bg-amber-500/15 px-3 py-1.5 text-xs font-bold text-amber-200 hover:bg-amber-500/25"
                      >
                        <PlusCircle className="h-3.5 w-3.5" /> ปรับยอดเงิน
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="rounded-3xl border border-white/10 bg-[#090d18]/80 p-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">GM Security & Financial Audit Logs (PostgreSQL)</h3>
          </div>
          <span className="font-mono text-[11px] text-slate-400">{auditLogs.length} รายการล่าสุด</span>
        </div>

        <div className="mt-4 space-y-2">
          {auditLogs.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500">ยังไม่มีบันทึก Audit Log</div>
          ) : (
            auditLogs.slice(0, 12).map((log) => (
              <div
                key={log.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-amber-400/20 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-300">
                    {log.action}
                  </span>
                  {log.targetLogin && <span className="font-mono font-bold text-white">@{log.targetLogin}</span>}
                  <span className="text-slate-300">{log.details}</span>
                </div>
                <div className="font-mono text-[10px] text-slate-500">
                  by {log.actorLogin} • {new Date(log.createdAt).toLocaleString("th-TH")}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Wallet Adjust Modal */}
      {modalOpen && selectedUser && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative w-full max-w-md rounded-3xl border border-amber-400/40 bg-[#090d18] p-6 text-white shadow-2xl">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 rounded-xl p-1.5 text-slate-400 hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="font-display text-lg font-black">
              ปรับยอดบัญชี <span className="text-amber-300">@{selectedUser.loginName}</span>
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Credits ปัจจุบัน: {selectedUser.credits.toLocaleString()} Cr • WCoinC: {selectedUser.wcoin.toLocaleString()} WC
            </p>

            <form onSubmit={handleConfirmAdjust} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {(["credits", "wcoin"] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCurrency(c)}
                    className={`rounded-xl border py-2 text-xs font-bold uppercase ${
                      currency === c
                        ? "border-amber-400 bg-amber-400/20 text-amber-200"
                        : "border-white/10 bg-white/5 text-slate-300"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-300">
                  จำนวนที่ต้องการปรับ (บวกเพื่อเพิ่ม / ลบเพื่อหัก):
                </label>
                <input
                  type="number"
                  required
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 font-mono text-sm text-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-300">เหตุผล (บันทึกลง Audit Log):</label>
                <input
                  type="text"
                  required
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-xs text-white"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 rounded-xl border border-white/15 bg-white/5 py-2.5 text-xs font-bold text-slate-300"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-xl bg-amber-400 py-2.5 text-xs font-extrabold text-slate-950 disabled:opacity-50"
                >
                  {submitting ? "กำลังบันทึก..." : "ยืนยันปรับยอด"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
