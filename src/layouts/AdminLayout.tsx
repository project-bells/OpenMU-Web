import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Users,
  LayoutDashboard,
  ShieldAlert,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthContext";
import { fetchServerStatus } from "../services/dbApi";

export default function AdminLayout() {
  const { user, logout } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [onlineCount, setOnlineCount] = useState<number>(0);
  const [serverOnline, setServerOnline] = useState<boolean>(false);

  useEffect(() => {
    let active = true;
    const load = () => {
      fetchServerStatus().then((status) => {
        if (!active) return;
        setOnlineCount(status.totalOnline ?? 0);
        setServerOnline(status.status === "online");
      });
    };
    load();
    const timer = setInterval(load, 30000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  const navItems = [
    {
      label: "Dashboard ภาพรวม",
      path: "/admin/dashboard",
      icon: LayoutDashboard,
      badge: "Real-time",
    },
    {
      label: "User Management (จัดการผู้เล่น)",
      path: "/admin/users",
      icon: Users,
      badge: "Data Grid",
      highlight: true,
    },
  ];

  const currentNav = navItems.find((n) => location.pathname === n.path || location.pathname.startsWith(`${n.path}/`)) || navItems[0];

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
        {/* Sidebar Brand Header */}
        <div className="flex h-18 items-center justify-between border-b border-white/10 px-6">
          <Link to="/admin/dashboard" className="flex items-center gap-3">
            <div className="relative grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-amber-400 to-rose-600 p-0.5 shadow-lg shadow-amber-500/20">
              <div className="grid h-full w-full place-items-center rounded-[10px] bg-[#090d18]">
                <ShieldAlert className="h-5 w-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="font-display text-sm font-black tracking-wide text-white">
                eGiS-MU <span className="text-amber-400">GM PANEL</span>
              </div>
              <div className="text-[10px] font-mono text-slate-400">Season 6 Episode 3</div>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Server Status Pill */}
        <div className="px-5 py-3">
          <div className="flex items-center justify-between rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-3.5 py-2.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className={`font-bold ${serverOnline ? "text-emerald-300" : "text-slate-300"}`}>
                OpenMU Server • {serverOnline ? "ONLINE" : "OFFLINE"}
              </span>
            </div>
            <span className="font-mono text-[11px] text-emerald-200">{onlineCount.toLocaleString()} คน</span>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 space-y-1.5 px-3 py-2">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Navigation Menu
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path || (item.path !== "/admin/dashboard" && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center justify-between rounded-xl px-3.5 py-3 text-xs font-bold transition ${
                  active
                    ? "border border-amber-400/40 bg-gradient-to-r from-amber-400/20 via-amber-500/10 to-transparent text-white shadow-sm"
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
                        : "bg-white/10 text-slate-400 group-hover:text-slate-200"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-4 px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            External Links
          </div>

          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs text-slate-400 transition hover:bg-white/[0.04] hover:text-amber-300"
          >
            <div className="flex items-center gap-3">
              <ExternalLink className="h-4 w-4 text-amber-400" />
              <span>เปิดหน้าเว็บหลัก (Landing Page)</span>
            </div>
            <ChevronRight className="h-3.5 w-3.5 opacity-60" />
          </Link>
        </nav>

        {/* Sidebar Footer User Info */}
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-3">
            <div className="flex items-center gap-2.5 truncate">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 font-black text-slate-950">
                GM
              </div>
              <div className="truncate">
                <div className="truncate text-xs font-bold text-white">{user?.username || "Admin GM"}</div>
                <div className="flex items-center gap-1 text-[10px] text-amber-300">
                  <Sparkles className="h-2.5 w-2.5" />
                  <span>{user?.role || "Administrator"}</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="ออกจากระบบ Admin"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/10 text-slate-400 transition hover:bg-rose-500/20 hover:text-rose-300"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area with Topbar */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-18 items-center justify-between border-b border-white/10 bg-[#090d18]/90 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-300 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
              <span className="font-semibold text-slate-200">Admin Console</span>
              <span>/</span>
              <span className="font-bold text-amber-300">{currentNav.label}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="hidden sm:flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-amber-400/40 hover:text-white"
            >
              <ExternalLink className="h-3.5 w-3.5 text-amber-400" />
              <span>Public Portal</span>
            </Link>

            <div className="flex items-center gap-2 border-l border-white/10 pl-3">
              <div className="text-right hidden md:block">
                <div className="text-xs font-bold text-white">{user?.username}</div>
                <div className="text-[10px] text-emerald-400">Active GM Session</div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-bold text-rose-300 transition hover:bg-rose-500/20"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
