import { useState, useEffect, useCallback, FormEvent } from "react";
import {
  Search,
  UserCheck,
  UserX,
  RefreshCw,
  Coins,
  Gem,
  WifiOff,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";
import {
  type UserSearchItem,
  adminAdjustWallet,
  adminDisconnectPlayer,
  adminSetAccountState,
  searchUsers,
} from "../../services/dbApi";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserSearchItem[]>([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  const [adjustTarget, setAdjustTarget] = useState<UserSearchItem | null>(null);
  const [currency, setCurrency] = useState<"credits" | "wcoin">("credits");
  const [amount, setAmount] = useState("100");
  const [reason, setReason] = useState("Admin adjustment");

  const fetchList = useCallback(async (q = query, st = stateFilter) => {
    setLoading(true);
    try {
      const res = await searchUsers(q, st, 0, 50);
      setUsers(res.items);
      setTotal(res.total);
    } catch (err: any) {
      setFeedback({ ok: false, text: err?.message || "ค้นหาบัญชีไม่สำเร็จ" });
    } finally {
      setLoading(false);
    }
  }, [query, stateFilter]);

  useEffect(() => {
    fetchList("", "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    fetchList(query, stateFilter);
  };

  const handleToggleBan = async (user: UserSearchItem) => {
    const nextState = user.state === "Normal" ? "Banned" : "Normal";
    const why = nextState === "Banned" ? "Banned by GM via Admin Console" : "Unbanned by GM";
    const res = await adminSetAccountState(user.loginName, nextState, why);
    if (res.success) {
      setFeedback({ ok: true, text: `อัปเดตสถานะ @${user.loginName} เป็น ${nextState} สำเร็จ` });
      await fetchList(query, stateFilter);
    } else {
      setFeedback({ ok: false, text: res.error || "ไม่สามารถเปลี่ยนสถานะบัญชีได้" });
    }
  };

  const handleDisconnect = async (user: UserSearchItem) => {
    const res = await adminDisconnectPlayer(user.loginName);
    if (res.success) {
      setFeedback({ ok: true, text: `ส่งคำสั่งตัดการเชื่อมต่อ @${user.loginName} สำเร็จ` });
      await fetchList(query, stateFilter);
    } else {
      setFeedback({ ok: false, text: res.error || "Disconnect ไม่สำเร็จ" });
    }
  };

  const handleAdjustSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!adjustTarget) return;
    const num = parseInt(amount, 10);
    if (Number.isNaN(num) || num === 0) {
      setFeedback({ ok: false, text: "จำนวนต้องไม่เป็น 0" });
      return;
    }

    const res = await adminAdjustWallet(adjustTarget.loginName, currency, num, reason.trim() || "Admin adjustment");
    if (res.success) {
      setFeedback({ ok: true, text: `ปรับยอด ${currency} ${num > 0 ? `+${num}` : num} ให้ @${adjustTarget.loginName} สำเร็จ` });
      setAdjustTarget(null);
      await fetchList(query, stateFilter);
    } else {
      setFeedback({ ok: false, text: res.error || "ปรับยอดไม่สำเร็จ" });
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-black text-white">
            จัดการบัญชีผู้เล่น <span className="text-amber-400">({total.toLocaleString()} Accounts)</span>
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            ข้อมูลตรงจาก OpenMU GameServer + PostgreSQL Wallet (ปรับ Credits/WCoin, แบน/ปลดแบน, เตะออกจากเกม)
          </p>
        </div>
        <button
          type="button"
          onClick={() => fetchList(query, stateFilter)}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-white/10"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> รีเฟรช
        </button>
      </div>

      {feedback && (
        <div
          className={`flex items-center justify-between rounded-2xl border p-3.5 text-xs font-bold ${
            feedback.ok
              ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-200"
              : "border-rose-500/40 bg-rose-500/15 text-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.ok ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <AlertCircle className="h-4 w-4 text-rose-400" />}
            <span>{feedback.text}</span>
          </div>
          <button type="button" onClick={() => setFeedback(null)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Search Bar */}
      <form
        onSubmit={handleSearch}
        className="flex flex-wrap items-center gap-3 rounded-3xl border border-white/10 bg-[#090d18]/80 p-4"
      >
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหา Login Name, Email, ชื่อตัวละคร..."
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pr-4 pl-10 text-xs text-white placeholder-slate-500 focus:border-amber-400/60 focus:outline-none"
          />
        </div>
        <select
          value={stateFilter}
          onChange={(e) => {
            setStateFilter(e.target.value);
            fetchList(query, e.target.value);
          }}
          className="rounded-xl border border-white/10 bg-[#090d18] px-3 py-2.5 text-xs text-slate-200"
        >
          <option value="">ทุกสถานะ</option>
          <option value="Normal">Normal</option>
          <option value="Banned">Banned</option>
          <option value="TemporarilyBanned">TemporarilyBanned</option>
        </select>
        <button
          type="submit"
          className="rounded-xl bg-amber-400 px-5 py-2.5 text-xs font-extrabold text-slate-950"
        >
          ค้นหา
        </button>
      </form>

      {/* Users Table */}
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#090d18]/80 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03] text-[11px] uppercase text-slate-400">
                <th className="px-5 py-3.5">บัญชี & อีเมล</th>
                <th className="px-5 py-3.5">สถานะ</th>
                <th className="px-5 py-3.5 text-center">ออนไลน์สะสม</th>
                <th className="px-5 py-3.5 text-right">Credits</th>
                <th className="px-5 py-3.5 text-right">WCoinC</th>
                <th className="px-5 py-3.5 text-center">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    {loading ? "กำลังค้นหาข้อมูล..." : "ไม่พบข้อมูลบัญชี"}
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.loginName} className="hover:bg-white/[0.02]">
                    <td className="px-5 py-3.5">
                      <div className="font-mono font-bold text-white">@{u.loginName}</div>
                      <div className="text-[11px] text-slate-400">{u.email || "-"}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                            u.state === "Normal"
                              ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-300"
                              : "border-rose-500/40 bg-rose-500/15 text-rose-300"
                          }`}
                        >
                          {u.state}
                        </span>
                        {u.isOnline && (
                          <span className="rounded-full border border-sky-400/40 bg-sky-500/15 px-2 py-0.5 text-[10px] font-bold text-sky-300">
                            ONLINE
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-center font-mono text-slate-300">
                      {Math.floor((u.onlineTimeSeconds || 0) / 3600)} ชม.
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono font-bold text-amber-300">
                      <Coins className="mr-1 inline h-3.5 w-3.5" />
                      {u.credits.toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono font-bold text-purple-300">
                      <Gem className="mr-1 inline h-3.5 w-3.5" />
                      {u.wcoin.toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setAdjustTarget(u);
                            setCurrency("credits");
                            setAmount("100");
                            setReason("GM support adjustment");
                          }}
                          className="rounded-lg border border-amber-400/40 bg-amber-500/15 px-2.5 py-1 text-[11px] font-bold text-amber-200 hover:bg-amber-500/25"
                        >
                          ปรับยอด
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleBan(u)}
                          className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-bold ${
                            u.state === "Normal"
                              ? "border-rose-500/40 bg-rose-500/15 text-rose-200 hover:bg-rose-500/25"
                              : "border-emerald-400/40 bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25"
                          }`}
                        >
                          {u.state === "Normal" ? <UserX className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
                          {u.state === "Normal" ? "Ban" : "Unban"}
                        </button>
                        {u.isOnline && (
                          <button
                            type="button"
                            onClick={() => handleDisconnect(u)}
                            className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] text-slate-200 hover:bg-white/10"
                          >
                            <WifiOff className="h-3 w-3" /> Kick
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {adjustTarget && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <form
            onSubmit={handleAdjustSubmit}
            className="relative w-full max-w-md space-y-4 rounded-3xl border border-amber-400/40 bg-[#090d18] p-6 text-white"
          >
            <button
              type="button"
              onClick={() => setAdjustTarget(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="font-display text-lg font-black">ปรับยอด @{adjustTarget.loginName}</h3>
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
            <input
              type="number"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 font-mono text-sm text-white"
            />
            <input
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="เหตุผล (Audit Log)"
              className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-xs text-white"
            />
            <button
              type="submit"
              className="w-full rounded-xl bg-amber-400 py-2.5 text-xs font-extrabold text-slate-950"
            >
              ยืนยันการปรับยอด
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
