import { useState, useEffect, FormEvent } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { ShieldCheck, Lock, User, ArrowLeft, AlertCircle, KeyRound, Server } from "lucide-react";
import { useAdminAuth } from "../../context/AdminAuthContext";

export default function AdminLoginPage() {
  const { isAuthenticated, login } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [requireTwoFactor, setRequireTwoFactor] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || "/admin/dashboard";

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await login(username, password, requireTwoFactor ? twoFactorCode.trim() : undefined);
    setLoading(false);

    if (res.ok) {
      navigate(from, { replace: true });
    } else {
      if (res.code === "TWO_FACTOR_REQUIRED") {
        setRequireTwoFactor(true);
      }
      setError(res.error || "Invalid administrator credentials");
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070a12] p-4 text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-amber-500/15 blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 right-1/4 h-96 w-96 rounded-full bg-rose-600/10 blur-[140px]"
      />

      <Link
        to="/"
        className="glass absolute top-5 left-5 flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-slate-300 transition hover:border-amber-400/50 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4 text-amber-400" />
        <span>กลับหน้าเว็บไซต์หลัก (Public Portal)</span>
      </Link>

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 grid h-16 w-16 place-items-center rounded-2xl border border-amber-400/40 bg-gradient-to-br from-amber-500/20 to-rose-600/20 shadow-[0_0_35px_-5px_rgba(212,175,55,0.4)]">
            <ShieldCheck className="h-8 w-8 text-amber-300" />
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-rose-300">
            <Server className="h-3 w-3" /> GM Administrator Access
          </div>
          <h1 className="font-display mt-2 text-2xl font-black tracking-wide text-white">
            OpenMU <span className="text-gradient-gold">GameMaster Console</span>
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            ตรวจสอบสิทธิ์จริงผ่าน AdminPanel Identity (รองรับ TOTP 2FA)
          </p>
        </div>

        <div className="glass-strong gold-border-glow rounded-3xl p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                ชื่อบัญชีผู้ดูแลระบบ (Admin Login Name)
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  required
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="กรอกชื่อบัญชี GM / Admin"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pr-4 pl-10 text-sm text-white placeholder-slate-500 focus:border-amber-400/60 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                รหัสผ่านความปลอดภัย (Security Password)
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  required
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pr-4 pl-10 text-sm text-white placeholder-slate-500 focus:border-amber-400/60 focus:outline-none"
                />
              </div>
            </div>

            {requireTwoFactor && (
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-amber-300">
                  รหัสยืนยันตัวตน 2FA / Authenticator Code
                </label>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-amber-400" />
                  <input
                    required
                    type="text"
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value)}
                    placeholder="123456"
                    className="w-full rounded-xl border border-amber-400/40 bg-white/5 py-3 pr-4 pl-10 font-mono text-sm text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs font-medium text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-shine flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#ffb52e] to-[#ff8a3c] px-6 py-3.5 text-sm font-extrabold text-[#090d16] shadow-lg shadow-amber-500/30 transition hover:brightness-110 disabled:opacity-50"
            >
              <KeyRound className="h-4 w-4" />
              {loading ? "กำลังตรวจสอบสิทธิ์..." : "เข้าสู่ระบบผู้ดูแล (LOGIN AS GM)"}
            </button>
          </form>

          <div className="mt-6 border-t border-white/10 pt-4 text-center text-[10px] text-slate-500">
            Session Cookie Protected (HttpOnly / HMAC Signed) • BFF Admin Auth Guard
          </div>
        </div>
      </div>
    </div>
  );
}
