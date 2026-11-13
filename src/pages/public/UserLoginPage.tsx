import { useState, useEffect, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Lock,
  LogIn,
  ShieldAlert,
  ArrowRight,
  ChevronLeft,
  ShieldCheck,
} from "lucide-react";
import { useUserDashboard } from "../../context/UserDashboardContext";

export default function UserLoginPage() {
  const { isAuthenticated, loginPlayer } = useUserDashboard();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/user/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    const trimmed = username.trim();
    if (!trimmed || !password) {
      setError("กรุณากรอก Username และ Password");
      return;
    }

    setLoading(true);
    const res = await loginPlayer(trimmed, password);
    setLoading(false);

    if (res.ok) {
      navigate("/user/dashboard", { replace: true });
    } else {
      setError(res.error || "ชื่อบัญชีหรือรหัสผ่านไม่ถูกต้อง");
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#070a13] p-4 text-slate-100 antialiased">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/10 blur-[120px]" />
      </div>

      <Link
        to="/"
        className="relative z-10 mb-6 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:border-amber-400/50 hover:text-white"
      >
        <ChevronLeft className="h-4 w-4" />
        กลับสู่หน้าแรก (Public Home)
      </Link>

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl border border-amber-400/40 bg-gradient-to-br from-amber-400/20 to-orange-600/20 shadow-lg shadow-amber-500/20">
            <ShieldCheck className="h-7 w-7 text-amber-400" />
          </div>
          <h1 className="font-display text-2xl font-black tracking-wide text-white">
            PLAYER <span className="text-gold-gradient">DASHBOARD LOGIN</span>
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            เข้าสู่ระบบด้วยบัญชีเกม OpenMU จริง เพื่อจัดการตัวละคร แลกเครดิต และเติมเงิน
          </p>
        </div>

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
                  autoComplete="username"
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
              <label className="mb-1.5 block text-xs font-bold text-slate-300">
                รหัสผ่าน (Password)
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  required
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
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
              <span>{loading ? "กำลังตรวจสอบข้อมูล..." : "เข้าสู่ระบบ (Sign In)"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

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
