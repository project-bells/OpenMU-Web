import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Coins,
  Clock,
  ArrowRightLeft,
  History,
  LayoutDashboard,
  User,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Wallet,
  Sparkles,
  Swords,
  ChevronRight,
} from "lucide-react";
import { useUserDashboard } from "../context/UserDashboardContext";

export default function UserLayout() {
  const {
    isAuthenticated,
    isLoading,
    username,
    availableHours,
    credits,
    wcoin,
    pendingWcoin,
    mainCharacter,
    mainCharacterObj,
    logoutPlayer,
  } = useUserDashboard();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isLoading, isAuthenticated, navigate]);

  const navItems = [
    {
      label: "แดชบอร์ด & แลกเครดิต",
      path: "/user/dashboard",
      icon: ArrowRightLeft,
      badge: "1 ชม. = 5 Cr",
      highlight: true,
    },
    {
      label: "ภาพรวมบัญชีผู้เล่น",
      path: "/user/overview",
      icon: LayoutDashboard,
    },
    {
      label: "ประวัติการทำรายการ",
      path: "/user/history",
      icon: History,
    },
    {
      label: "เติมเครดิต & บริจาค",
      path: "/user/donate",
      icon: Wallet,
      badge: "+35% Bonus",
    },
  ];

  const handleLogout = async () => {
    await logoutPlayer();
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070a13] text-sm text-slate-300">
        กำลังโหลดข้อมูลบัญชีผู้เล่น...
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-[#070a13] text-slate-100 antialiased font-sans">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Left Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/10 bg-[#090d18]/95 backdrop-blur-xl transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-18 items-center justify-between border-b border-white/10 px-6">
          <Link to="/user/exchange" className="flex items-center gap-3">
            <div className="relative grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 p-0.5 shadow-lg shadow-amber-500/20">
              <div className="grid h-full w-full place-items-center rounded-[10px] bg-[#090d18]">
                <Coins className="h-5 w-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="font-display text-sm font-black tracking-wide text-white">
                eGiS-MU <span className="text-amber-400">PLAYER</span>
              </div>
              <div className="text-[10px] font-mono text-slate-400">User Dashboard • S6E3</div>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Player Profile Snapshot */}
        <div className="p-4 border-b border-white/10 bg-white/[0.01]">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
            <div className="relative grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 font-black shadow-md">
              <User className="h-6 w-6 text-slate-950" />
              <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-[#090d18] bg-emerald-400" />
              </span>
            </div>
            <div className="truncate">
              <div className="flex items-center gap-1.5 font-bold text-white text-xs truncate">
                <span>@{username}</span>
                <span className="rounded bg-amber-400/20 px-1 py-0.2 text-[9px] font-extrabold text-amber-300">
                  VIP
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-400 truncate mt-0.5">
                <Swords className="h-3 w-3 text-amber-400 shrink-0" />
                <span className="truncate">
                  {mainCharacter !== "-" ? `${mainCharacter} (Lv.${mainCharacterObj?.lvl ?? 1})` : "ยังไม่มีตัวละคร"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5 px-3 py-3">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            เมนูสำหรับผู้เล่น
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              location.pathname === item.path ||
              (item.path === "/user/dashboard" &&
                (location.pathname === "/user" ||
                  location.pathname === "/user/exchange" ||
                  location.pathname === "/user/dashboard"));
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center justify-between rounded-xl px-3.5 py-3 text-xs font-bold transition ${
                  active
                    ? "border border-amber-400/40 bg-gradient-to-r from-amber-400/20 via-orange-500/10 to-transparent text-white shadow-sm"
                    : "text-slate-400 hover:border-white/10 hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 transition ${
                      active ? "text-amber-400" : "text-slate-400 group-hover:text-slate-200"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-[10px] font-mono font-extrabold ${
                      active
                        ? "bg-amber-400 text-slate-950"
                        : "bg-white/10 text-amber-300 group-hover:bg-amber-400/20"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-4 px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            เว็บไซต์หลัก
          </div>

          <Link
            to="/"
            className="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs text-slate-400 transition hover:bg-white/[0.04] hover:text-amber-300"
          >
            <div className="flex items-center gap-3">
              <ExternalLink className="h-4 w-4 text-amber-400" />
              <span>กลับสู่หน้าหลัก (Public Website)</span>
            </div>
            <ChevronRight className="h-3.5 w-3.5 opacity-60" />
          </Link>
        </nav>

        {/* Sidebar Footer Logout */}
        <div className="border-t border-white/10 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-bold text-slate-300 transition hover:bg-rose-500/20 hover:text-rose-300"
          >
            <LogOut className="h-4 w-4" />
            <span>ออกจากระบบ (Logout)</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar: strictly shows Username, Available Hours, Current Credits in Real-time in top-right */}
        <header className="sticky top-0 z-30 flex h-18 items-center justify-between border-b border-white/10 bg-[#090d18]/90 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-300 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
              <span className="font-semibold text-slate-300">User Dashboard</span>
              <span>/</span>
              <span className="font-bold text-amber-300">
                {navItems.find((n) => location.pathname === n.path || (n.path === "/user/exchange" && location.pathname === "/user"))?.label || "ภาพรวม"}
              </span>
            </div>
          </div>

          {/* Top-Right Real-time Bar: Username, Available Hours, Current Credits */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* 1. ชั่วโมงออนไลน์สะสม (Available Hours) */}
            <div className="flex items-center gap-1.5 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1.5 text-xs font-bold text-emerald-300 shadow-sm">
              <Clock className="h-4 w-4 shrink-0 text-emerald-400" />
              <div className="leading-tight">
                <span className="hidden md:inline text-[10px] text-emerald-200/80 mr-1 font-normal">ชั่วโมงออนไลน์:</span>
                <span className="font-mono text-xs font-extrabold">{availableHours} ชม.</span>
              </div>
            </div>

            {/* 2. เครดิตปัจจุบัน (Current Credits) */}
            <div className="flex items-center gap-1.5 rounded-xl border border-amber-400/30 bg-amber-500/10 px-2.5 py-1.5 text-xs font-bold text-amber-300 shadow-sm">
              <Coins className="h-4 w-4 shrink-0 text-amber-400" />
              <div className="leading-tight">
                <span className="hidden md:inline text-[10px] text-amber-200/80 mr-1 font-normal">เครดิตปัจจุบัน:</span>
                <span className="font-mono text-xs font-extrabold">{credits.toLocaleString()} Cr</span>
              </div>
            </div>

            {/* 3. WCoin Badge */}
            <div className="hidden lg:flex items-center gap-1.5 rounded-xl border border-purple-400/30 bg-purple-500/10 px-2.5 py-1.5 text-xs font-bold text-purple-300">
              <Sparkles className="h-3.5 w-3.5 text-purple-400" />
              <span className="font-mono text-xs">
                {wcoin.toLocaleString()} WC
                {pendingWcoin > 0 ? ` (+${pendingWcoin.toLocaleString()} Pending)` : ""}
              </span>
            </div>

            {/* 4. ชื่อ Username */}
            <div className="flex items-center gap-2 border-l border-white/10 pl-2.5 sm:pl-3">
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30 font-bold text-xs">
                {username.slice(0, 2).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-white leading-tight">@{username}</div>
                <div className="text-[10px] text-slate-400">Player Account</div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
