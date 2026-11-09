import { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  LogIn,
  User,
  Lock,
  ArrowLeft,
  Sparkles,
  ShieldAlert,
  Swords,
  Coins,
  Clock,
  ArrowRight,
} from "lucide-react";
import { useUserDashboard } from "../../context/UserDashboardContext";

export default function UserLoginPage() {
  const { loginPlayer, players } = useUserDashboard();
  const navigate = useNavigate();

  const [username, setUsername] = useState("lorencia_pro");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Filter out admin to show only player accounts for quick test
  const playerAccounts = players.filter((p) => p.role !== "Admin GM");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = loginPlayer(username, password);
    setLoading(false);

    if (result.success) {
      // Requirement: เมื่อกด Submit ให้ Redirect ไปที่หน้า /user/dashboard
      navigate("/user/dashboard", { replace: true });
    } else {
      setError(result.error || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
    }
  };

  const handleQuickLogin = (uname: string) => {
    setUsername(uname);
    const result = loginPlayer(uname);
    if (result.success) {
      navigate("/user/dashboard", { replace: true });
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070a12] p-4 text-white font-sans antialiased">
      {/* Lorencia Ambience Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-amber-500/15 blur-[130px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 right-1/4 h-96 w-96 rounded-full bg-purple-600/15 blur-[140px]"
      />

      {/* Top Left Back Button to Landing Page */}
      <Link
        to="/"
        className="glass absolute top-5 left-5 flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-slate-300 transition hover:border-amber-400/50 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4 text-amber-400" />
        <span>กลับหน้าหลัก (Landing Page)</span>
      </Link>

      <div className="relative z-10 w-full max-w-md my-8">
        {/* Brand Header */}
        <div className="mb-6 text-center">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="relative grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 p-0.5 shadow-xl shadow-amber-500/25 transition group-hover:scale-105">
              <div className="grid h-full w-full place-items-center rounded-[14px] bg-[#090d18]">
                <img
                  src="/images/logo.png"
                  alt="eGiS-MU Logo"
                  className="h-10 w-10 rounded-xl object-cover"
                />
              </div>
            </div>
            <div className="text-left">
              <span className="font-display block text-xl font-black tracking-wide text-white drop-shadow-[0_0_12px_rgba(212,175,55,0.4)]">
                eGiS-<span className="text-gradient-gold">MU</span>
              </span>
              <span className="block font-mono text-[10px] tracking-[0.2em] text-white/50">
                PLAYER PORTAL • S6E3
              </span>
            </div>
          </Link>

          <h1 className="font-display mt-4 text-2xl font-black text-white">
            เข้าสู่ระบบผู้เล่น <span className="text-amber-400">(Account Login)</span>
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            เข้าสู่แดชบอร์ดผู้เล่นเพื่อแลกเครดิตจากเวลาออนไลน์ (1 ชม. = 5 เครดิต)
          </p>
        </div>

        {/* Login Form Box */}
        <div className="glass-strong gold-border-glow rounded-3xl p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-300">
                ชื่อไอดีเกม / บัญชีผู้เล่น (Username)
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  required
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError("");
                  }}
                  placeholder="กรอก Username ของคุณ"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pr-4 pl-10 text-sm text-white placeholder-slate-500 focus:border-amber-400/70 focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300">
                  รหัสผ่าน (Password)
                </label>
                <span className="text-[10px] text-slate-500">ทดสอบ: พิมพ์อะไรก็ได้</span>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pr-4 pl-10 text-sm text-white placeholder-slate-500 focus:border-amber-400/70 focus:outline-none transition"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs font-semibold text-rose-300">
                <ShieldAlert className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-shine flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#d4af37] via-[#ffb52e] to-[#ff8a3c] px-6 py-3.5 text-sm font-extrabold text-[#090d16] shadow-lg shadow-amber-500/30 transition hover:brightness-110 active:scale-[0.99] disabled:opacity-50"
            >
              <LogIn className="h-4 w-4" />
              <span>{loading ? "กำลังตรวจสอบข้อมูล…" : "เข้าสู่ระบบ (Sign In)"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Quick 1-Click Player Accounts for immediate test */}
          <div className="mt-6 border-t border-white/10 pt-4">
            <div className="mb-2.5 flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5 text-amber-300">
                <Sparkles className="h-3.5 w-3.5" /> เลือกบัญชีทดสอบด่วน (1-Click Login):
              </span>
              <span className="text-[10px] text-slate-500 font-normal">คลิกเพื่อเข้าสู่ระบบทันที</span>
            </div>

            <div className="space-y-1.5">
              {playerAccounts.map((account) => {
                const isSelected = username.toLowerCase() === account.username.toLowerCase();
                return (
                  <button
                    key={account.id}
                    type="button"
                    onClick={() => handleQuickLogin(account.username)}
                    className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-xs transition ${
                      isSelected
                        ? "border-amber-400 bg-amber-400/15 text-white ring-1 ring-amber-400/40"
                        : "border-white/10 bg-white/[0.02] text-slate-300 hover:border-amber-400/30 hover:bg-white/[0.06] hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2 text-left truncate">
                      <div className="grid h-7 w-7 place-items-center rounded-lg bg-amber-400/20 text-amber-300 font-bold text-[10px]">
                        {account.username.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="truncate">
                        <div className="font-bold text-white leading-tight">@{account.username}</div>
                        <div className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                          <Swords className="h-2.5 w-2.5 text-amber-400" />
                          <span>{account.characterClass}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="flex items-center gap-1 rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-mono font-bold text-emerald-300 border border-emerald-400/20">
                        <Clock className="h-2.5 w-2.5" /> {account.availableHours} ชม.
                      </span>
                      <span className="flex items-center gap-1 rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-mono font-bold text-amber-300 border border-amber-400/20">
                        <Coins className="h-2.5 w-2.5" /> {account.credits} Cr
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-5 text-center text-xs text-slate-400">
            ยังไม่มีบัญชีเกมใช่ไหม?{" "}
            <Link to="/#register" className="font-bold text-amber-300 hover:underline">
              สมัครสมาชิกใหม่ฟรี
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
