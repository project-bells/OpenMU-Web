import { useState, useMemo, FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Coins,
  Gem,
  Swords,
  Activity,
  ArrowUpRight,
  Clock,
  Sparkles,
  PlusCircle,
  Search,
  CheckCircle2,
  X,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { useUserDashboard, ManagedUser } from "../../context/UserDashboardContext";

export default function AdminDashboardPage() {
  const { user } = useAdminAuth();
  const { players, addCreditsToUser, auditLogs, resetAllMockData } = useUserDashboard();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");

  // Modal State for "เพิ่มเครดิต (Add Credit)"
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  const [creditAmount, setCreditAmount] = useState<string>("500");
  const [adminNote, setAdminNote] = useState<string>("รางวัล GM Event ประจำสัปดาห์");
  const [modalOpen, setModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dynamic KPI calculations from shared players state
  const totalRegistered = 28400 + players.length;
  const totalCredits = useMemo(
    () => players.reduce((sum, p) => sum + p.credits, 840000),
    [players]
  );
  const totalWcoin = useMemo(
    () => players.reduce((sum, p) => sum + p.wcoin, 390000),
    [players]
  );

  // Filtered players list
  const filteredPlayers = useMemo(() => {
    return players.filter((p) => {
      const matchSearch =
        p.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.characters.toLowerCase().includes(searchTerm.toLowerCase());
      const matchRole = roleFilter === "ALL" || p.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [players, searchTerm, roleFilter]);

  const handleOpenCreditModal = (target: ManagedUser) => {
    setSelectedUser(target);
    setCreditAmount("500");
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
  };

  const handleConfirmAddCredit = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    const amount = parseInt(creditAmount, 10);
    if (isNaN(amount) || amount <= 0) return;

    // Requirement 3: เมื่อกดยืนยัน (Submit) ตัวเลขเครดิตของผู้เล่นคนนั้นในตารางต้องบวกเพิ่มขึ้นทันทีแบบ Real-time
    const res = addCreditsToUser(selectedUser.id, amount, adminNote);

    if (res.success) {
      setToastMessage(
        `เพิ่ม +${amount.toLocaleString()} เครดิต ให้ @${selectedUser.username} สำเร็จ! ยอดรวมใหม่คือ ${res.newCredits.toLocaleString()} Credits`
      );
      setTimeout(() => setToastMessage(null), 5000);
      handleCloseModal();
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 rounded-2xl border border-emerald-400/50 bg-[#09151e]/95 p-4 text-xs font-bold text-emerald-300 shadow-2xl backdrop-blur-md animate-in slide-in-from-top-4">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 rounded-lg p-1 text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-400/30 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent p-6 sm:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl"
        />
        <div className="relative z-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300">
              <Sparkles className="h-3.5 w-3.5" /> GM Console • Interactive State Mode
            </div>
            <h1 className="font-display mt-2 text-2xl font-black text-white sm:text-3xl">
              ศูนย์จัดการผู้ดูแลระบบ, <span className="text-gradient-gold">{user?.name || "Admin GM"}</span>
            </h1>
            <p className="mt-1 text-xs text-slate-300 sm:text-sm">
              จัดการผู้เล่นและเพิ่มเครดิตแบบ Real-time เชื่อมต่อ State กลางกับแดชบอร์ดผู้เล่นทันที
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={resetAllMockData}
              title="รีเซ็ต State กลับสู่ค่าเริ่มต้น"
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              <RefreshCw className="h-3.5 w-3.5 text-amber-400" />
              <span>รีเซ็ต Mock Data</span>
            </button>
            <Link
              to="/admin/users"
              className="btn-shine flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#ffb52e] to-[#ff8a3c] px-4 py-2 text-xs font-extrabold text-[#090d16] shadow-lg shadow-amber-500/20 transition hover:brightness-110"
            >
              <Users className="h-4 w-4" />
              <span>เปิด Full Data Grid</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid (Dynamic Real-time) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Players Count */}
        <div className="rounded-2xl border border-blue-500/30 bg-blue-500/5 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">ผู้เล่นลงทะเบียนทั้งหมด</span>
            <div className="grid h-9 w-9 place-items-center rounded-xl border border-blue-500/30 bg-blue-500/20 text-blue-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="font-display mt-3 text-2xl font-black text-white sm:text-3xl">
            {totalRegistered.toLocaleString()}
          </div>
          <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
            <span className="font-mono text-emerald-400">+{players.length} บัญชีใน State กลาง</span>
          </div>
        </div>

        {/* Card 2: Online Players */}
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">ผู้เล่นออนไลน์ขณะนี้</span>
            <div className="grid h-9 w-9 place-items-center rounded-xl border border-emerald-500/30 bg-emerald-500/20 text-emerald-400">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="font-display mt-3 text-2xl font-black text-white sm:text-3xl">
            4,892 <span className="text-xs font-semibold text-emerald-400 font-sans">Active</span>
          </div>
          <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
            <span className="font-mono text-emerald-400">1 Hr = 5 Credits</span>
          </div>
        </div>

        {/* Card 3: Total Credits (Updates in Real-Time) */}
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">เครดิตสะสมในระบบ</span>
            <div className="grid h-9 w-9 place-items-center rounded-xl border border-amber-500/30 bg-amber-500/20 text-amber-400">
              <Coins className="h-4 w-4" />
            </div>
          </div>
          <div className="font-display mt-3 text-2xl font-black text-amber-300 sm:text-3xl">
            {totalCredits.toLocaleString()} <span className="text-xs font-sans text-white/50">Cr</span>
          </div>
          <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
            <span className="font-mono text-amber-400">Real-time Dynamic State</span>
          </div>
        </div>

        {/* Card 4: Total WCoin */}
        <div className="rounded-2xl border border-purple-500/30 bg-purple-500/5 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">WCoin ในระบบเศรษฐกิจ</span>
            <div className="grid h-9 w-9 place-items-center rounded-xl border border-purple-500/30 bg-purple-500/20 text-purple-400">
              <Gem className="h-4 w-4" />
            </div>
          </div>
          <div className="font-display mt-3 text-2xl font-black text-purple-300 sm:text-3xl">
            {totalWcoin.toLocaleString()} <span className="text-xs font-sans text-white/50">WC</span>
          </div>
          <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
            <span className="font-mono text-purple-400">100 Cr = 50 WC</span>
          </div>
        </div>
      </div>

      {/* Requirement 3: Interactive User Management Table in /admin/dashboard */}
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#090d18]/80 shadow-2xl backdrop-blur-md">
        {/* Table Header & Controls */}
        <div className="flex flex-col gap-4 border-b border-white/10 bg-white/[0.02] p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-amber-400" />
              <h2 className="font-display text-lg font-bold text-white">
                จัดการผู้เล่น (User Management Table)
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              รายชื่อผู้เล่นในระบบ OpenMU • คลิกปุ่ม <strong className="text-amber-300">"เพิ่มเครดิต (Add Credit)"</strong> เพื่อทดสอบการอัปเดต State แบบ Real-time ทันที
            </p>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[220px]">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหาชื่อ, ตัวละคร, อีเมล..."
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pr-3 pl-8 text-xs text-white placeholder-slate-500 focus:border-amber-400/60 focus:outline-none"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-xl border border-white/10 bg-[#090d18] px-3 py-2 text-xs font-semibold text-slate-300 focus:border-amber-400/60 focus:outline-none"
            >
              <option value="ALL">สถานะ Role: ทั้งหมด</option>
              <option value="VIP">VIP</option>
              <option value="Player">Player</option>
              <option value="Admin GM">Admin GM</option>
            </select>
          </div>
        </div>

        {/* User Management Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03] text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="px-5 py-3.5">ผู้เล่น (PLAYER / USER)</th>
                <th className="px-5 py-3.5">ตัวละครหลัก (CHARACTER)</th>
                <th className="px-5 py-3.5 text-center">ชม. ออนไลน์สะสม</th>
                <th className="px-5 py-3.5 text-right">
                  <span className="inline-flex items-center gap-1 text-amber-300">
                    <Coins className="h-3.5 w-3.5" /> เครดิตปัจจุบัน (CREDITS)
                  </span>
                </th>
                <th className="px-5 py-3.5 text-center">สถานะ</th>
                <th className="px-5 py-3.5 text-center font-bold text-amber-400">
                  การจัดการ (ACTION)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredPlayers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    ไม่พบข้อมูลผู้เล่นที่ตรงกับคำค้นหา
                  </td>
                </tr>
              ) : (
                filteredPlayers.map((player) => (
                  <tr
                    key={player.id}
                    className="transition hover:bg-white/[0.03] group"
                  >
                    {/* 1. Player Info */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 font-bold text-amber-300 border border-amber-400/30 text-xs">
                          {player.username.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="truncate">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-white text-xs">
                              @{player.username}
                            </span>
                            <span
                              className={`rounded px-1.5 py-0.5 text-[9px] font-black ${
                                player.role === "Admin GM"
                                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                                  : player.role === "VIP"
                                  ? "bg-amber-400/20 text-amber-300 border border-amber-400/40"
                                  : "bg-white/10 text-slate-300"
                              }`}
                            >
                              {player.role}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 truncate mt-0.5">
                            {player.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 2. Main Character */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Swords className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                        <div>
                          <div className="font-bold text-slate-200">
                            {player.characters}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {player.characterClass}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 3. Online Hours */}
                    <td className="px-5 py-4 text-center">
                      <span className="inline-flex items-center gap-1 rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 font-mono font-bold text-emerald-300 text-xs">
                        <Clock className="h-3 w-3" />
                        {player.availableHours} ชม.
                      </span>
                    </td>

                    {/* 4. Current Credits (Interactive Real-time) */}
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400/30 bg-amber-500/15 px-3 py-1 font-mono font-black text-amber-300 text-sm shadow-sm transition group-hover:scale-105">
                        <Coins className="h-4 w-4 text-amber-400" />
                        <span>{player.credits.toLocaleString()} Cr</span>
                      </div>
                    </td>

                    {/* 5. Status */}
                    <td className="px-5 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          player.status === "Active"
                            ? "border border-emerald-400/40 bg-emerald-500/15 text-emerald-300"
                            : "border border-rose-500/40 bg-rose-500/15 text-rose-300"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            player.status === "Active"
                              ? "bg-emerald-400 animate-pulse"
                              : "bg-rose-400"
                          }`}
                        />
                        {player.status}
                      </span>
                    </td>

                    {/* 6. Action Button: เพิ่มเครดิต (Add Credit) */}
                    <td className="px-5 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleOpenCreditModal(player)}
                        className="btn-shine inline-flex items-center gap-1.5 rounded-xl border border-amber-400/50 bg-gradient-to-r from-amber-500/25 via-amber-400/20 to-orange-500/25 px-3 py-1.5 text-xs font-extrabold text-amber-300 shadow-sm transition hover:border-amber-400 hover:text-white hover:brightness-110 active:scale-95"
                      >
                        <PlusCircle className="h-3.5 w-3.5 text-amber-400" />
                        <span>เพิ่มเครดิต (Add Credit)</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent GM Action Audit Logs & System Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Audit Logs */}
        <div className="rounded-3xl border border-white/10 bg-[#090d18]/80 p-6 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">
                ประวัติการดำเนินการระบบ & การให้เครดิต (GM Audit Logs)
              </h3>
            </div>
            <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-mono text-emerald-300 border border-emerald-400/30">
              Live State
            </span>
          </div>

          <div className="mt-4 space-y-2.5">
            {auditLogs.slice(0, 6).map((log) => (
              <div
                key={log.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="rounded bg-amber-400/20 px-2 py-0.5 font-bold text-amber-300 text-[10px]">
                    {log.action}
                  </span>
                  <span className="font-mono font-bold text-white">
                    @{log.target}
                  </span>
                  <span className="text-slate-400 text-[11px] truncate">
                    {log.details}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                  <span>ผู้ทำรายการ: {log.admin}</span>
                  <span>•</span>
                  <span>{log.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick GM Shortcuts Card */}
        <div className="rounded-3xl border border-purple-500/30 bg-purple-950/15 p-6 backdrop-blur-sm">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-purple-500/20 text-purple-300">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-sm font-bold text-white">
                ข้อมูลเศรษฐกิจเซิร์ฟเวอร์
              </h3>
              <p className="text-[11px] text-slate-400">อัตราหมุนเวียน Credits</p>
            </div>
          </div>

          <div className="mt-4 space-y-3 text-xs">
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3.5">
              <div className="text-[11px] text-slate-400">อัตราแลกเปลี่ยนเวลาออนไลน์</div>
              <div className="font-display mt-1 text-base font-black text-amber-300">
                1 ชั่วโมง = 5 เครดิต
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">ทำงานแบบ Real-time ทันที</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3.5">
              <div className="text-[11px] text-slate-400">บัญชีทดสอบในระบบ</div>
              <div className="font-mono mt-1 text-xs text-emerald-300">
                5 Players + 1 Admin GM
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                lorencia_pro, magic_wizard, elf_archer, etc.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Requirement 3: Interactive Modal สำหรับให้ GM เพิ่มเครดิต */}
      {modalOpen && selectedUser && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
        >
          <div className="relative w-full max-w-md rounded-3xl border border-amber-400/40 bg-[#090d18] p-6 text-white shadow-2xl gold-border-glow">
            {/* Close Button */}
            <button
              type="button"
              onClick={handleCloseModal}
              className="absolute top-4 right-4 rounded-xl p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-400/40">
                <Coins className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <h3 className="font-display text-lg font-black text-white">
                  เพิ่มเครดิตให้ผู้เล่น <span className="text-amber-400">(Add Credit)</span>
                </h3>
                <p className="text-xs text-slate-400">GM Console Interactive Balance Grant</p>
              </div>
            </div>

            {/* Target Player Information */}
            <div className="my-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">ผู้เล่นเป้าหมาย:</span>
                <span className="font-mono font-bold text-white">@{selectedUser.username}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">ตัวละคร:</span>
                <span className="font-bold text-amber-300">{selectedUser.characters}</span>
              </div>
              <div className="flex items-center justify-between border-t border-white/10 pt-2">
                <span className="text-slate-400">เครดิตปัจจุบันก่อนเพิ่ม:</span>
                <span className="font-mono font-extrabold text-amber-400">
                  {selectedUser.credits.toLocaleString()} Credits
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleConfirmAddCredit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-200">
                  จำนวนเครดิตที่ต้องการเพิ่ม (+Credits):
                </label>
                <div className="relative">
                  <Coins className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-amber-400" />
                  <input
                    required
                    type="number"
                    min="1"
                    step="1"
                    value={creditAmount}
                    onChange={(e) => setCreditAmount(e.target.value)}
                    placeholder="กรอกจำนวนเครดิต เช่น 500"
                    className="w-full rounded-2xl border border-white/15 bg-white/5 py-3 pr-4 pl-10 font-mono text-base font-bold text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                  />
                </div>

                {/* Preset Amount Chips */}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {[100, 500, 1000, 2500, 5000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setCreditAmount(amt.toString())}
                      className={`rounded-xl border px-2.5 py-1 text-xs font-mono font-bold transition ${
                        creditAmount === amt.toString()
                          ? "border-amber-400 bg-amber-400/25 text-amber-300"
                          : "border-white/10 bg-white/5 text-slate-300 hover:border-amber-400/40 hover:text-white"
                      }`}
                    >
                      +{amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Real-time Calculation Preview */}
              {(() => {
                const numericAdd = parseInt(creditAmount, 10);
                const isValid = !isNaN(numericAdd) && numericAdd > 0;
                const newTotal = isValid ? selectedUser.credits + numericAdd : selectedUser.credits;
                return (
                  <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-3 text-xs">
                    <div className="flex items-center justify-between text-emerald-200">
                      <span className="flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" /> ยอดเครดิตใหม่หลังยืนยัน:
                      </span>
                      <span className="font-mono text-base font-black text-amber-300">
                        {newTotal.toLocaleString()} Cr
                      </span>
                    </div>
                    <div className="mt-0.5 text-[10px] text-slate-400 text-right font-mono">
                      ({selectedUser.credits.toLocaleString()} + {isValid ? numericAdd.toLocaleString() : 0})
                    </div>
                  </div>
                );
              })()}

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-300">
                  หมายเหตุ / เหตุผลการให้ (GM Note):
                </label>
                <input
                  type="text"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="ระบุเหตุผล เช่น รางวัลกิจกรรม, ชดเชย, ปรับปรุงระบบ"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-3 text-xs text-white focus:border-amber-400/60 focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 rounded-2xl border border-white/10 bg-white/5 py-3 text-xs font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="btn-shine flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#d4af37] via-[#ffb52e] to-[#ff8a3c] py-3 text-xs font-extrabold text-[#090d16] shadow-lg shadow-amber-500/30 transition hover:brightness-110 active:scale-95"
                >
                  <Coins className="h-4 w-4" />
                  <span>ยืนยันการเพิ่มเครดิต</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
