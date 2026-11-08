import { useState, useEffect, FormEvent } from "react";
import {
  X,
  LogIn,
  User,
  Lock,
  Coins,
  Gem,
  Clock,
  ArrowRightLeft,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { useI18n } from "../i18n";
import { loginAccount, exchangeCreditsToWcoin } from "../services/dbApi";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onSwitchToRegister?: () => void;
}

export default function LoginModal({ open, onClose, onSwitchToRegister }: LoginModalProps) {
  const { t } = useI18n();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Authenticated state
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);
  const [credits, setCredits] = useState(250);
  const [wcoin, setWcoin] = useState(100);
  const [exchangeAmount, setExchangeAmount] = useState(100);
  const [exchanging, setExchanging] = useState(false);
  const [exchangeFeedback, setExchangeFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setExchangeFeedback(null);

    const trimmed = username.trim();
    if (!trimmed || !password) {
      setError(t.login.errRequired);
      return;
    }

    if (trimmed.length < 3 || password.length < 4) {
      setError(t.login.errInvalid);
      return;
    }

    setLoading(true);
    const res = await loginAccount(trimmed, password);
    setLoading(false);

    if (res.success) {
      setLoggedInUser(res.account || trimmed);
      setCredits(typeof res.credits === "number" ? res.credits : 250);
      setWcoin(typeof res.wcoin === "number" ? res.wcoin : 100);
    } else {
      setError(res.error || t.login.errInvalid);
    }
  };

  const handleExchange = async () => {
    if (!loggedInUser) return;
    setExchanging(true);
    setExchangeFeedback(null);

    const res = await exchangeCreditsToWcoin(loggedInUser, exchangeAmount);
    setExchanging(false);

    if (res.success) {
      const deducted = res.deductedCredits || exchangeAmount;
      const addedWcoin = res.wcoinReceived || Math.floor(exchangeAmount * 0.5);
      setCredits((prev) =>
        typeof res.remainingCredits === "number" ? res.remainingCredits : Math.max(0, prev - deducted)
      );
      setWcoin((prev) => (typeof res.newWcoinBalance === "number" ? res.newWcoinBalance : prev + addedWcoin));
      setExchangeFeedback({
        ok: true,
        text: `${deducted} Credits → +${addedWcoin} WCoin`,
      });
    } else {
      setExchangeFeedback({
        ok: false,
        text: res.error || "Exchange failed",
      });
    }
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    setPassword("");
    setError("");
    setExchangeFeedback(null);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
    >
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
      />
      <div className="glass-strong gold-border-glow relative z-10 w-full max-w-lg overflow-hidden rounded-3xl p-6 sm:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 h-60 w-60 rounded-full bg-amber-400/20 blur-3xl"
        />
        <button
          onClick={onClose}
          aria-label={t.modal.close}
          className="glass absolute top-4 right-4 grid h-9 w-9 place-items-center rounded-lg text-slate-300 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        {!loggedInUser ? (
          <>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300">
              <LogIn className="h-3.5 w-3.5" /> {t.nav.accountLogin}
            </div>
            <h3 id="login-modal-title" className="font-display mt-3 text-2xl font-black text-white">
              {t.login.title}
            </h3>
            <p className="mt-1 text-sm text-slate-400">{t.login.subtitle}</p>

            {/* Online Reward Rate Banner */}
            <div className="mt-4 flex items-center justify-between rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-3.5 py-2.5 text-xs">
              <span className="flex items-center gap-1.5 font-semibold text-emerald-300">
                <Clock className="h-4 w-4 shrink-0" />
                {t.login.onlineRateLabel}:
              </span>
              <span className="font-mono font-bold text-amber-300">{t.login.onlineRateValue}</span>
            </div>

            <form onSubmit={handleLogin} className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                  {t.login.usernameLabel}
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={t.login.usernamePlaceholder}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pr-4 pl-10 text-sm text-white placeholder-slate-500 focus:border-amber-400/60 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                  {t.login.passwordLabel}
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    required
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.login.passwordPlaceholder}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pr-4 pl-10 text-sm text-white placeholder-slate-500 focus:border-amber-400/60 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1 text-emerald-400">
                  <ShieldCheck className="h-3.5 w-3.5" /> OpenMU S6E3
                </span>
                <span className="font-mono text-amber-300">{t.login.onlineRateValue}</span>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs font-medium text-rose-300">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-shine flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#ffb52e] to-[#ff8a3c] px-6 py-3.5 text-sm font-extrabold text-[#090d16] shadow-[0_12px_40px_-8px_rgba(212,175,55,.65)] transition hover:brightness-110 disabled:opacity-50"
              >
                <LogIn className="h-4 w-4" />
                {loading ? t.login.signingIn : t.login.submitBtn}
              </button>

              {onSwitchToRegister && (
                <div className="border-t border-white/10 pt-4 text-center text-xs text-slate-400">
                  <span>{t.login.noAccount} </span>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onSwitchToRegister();
                    }}
                    className="font-bold text-amber-300 underline decoration-amber-400/40 underline-offset-4 hover:text-amber-200"
                  >
                    {t.login.createOne}
                  </button>
                </div>
              )}
            </form>
          </>
        ) : (
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
              <Sparkles className="h-3.5 w-3.5" /> {t.login.statusActive}
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">{t.login.welcomeBack}</p>
                <h3 className="font-display text-2xl font-black text-white">{loggedInUser}</h3>
              </div>
              <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5 text-right">
                <div className="text-xs font-bold text-emerald-300">{t.login.statusActive}</div>
              </div>
            </div>

            {/* Balances Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-amber-400/25 bg-amber-500/10 p-4">
                <div className="flex items-center gap-1.5 text-xs font-medium text-amber-200/80">
                  <Coins className="h-4 w-4 text-amber-300" />
                  {t.login.creditsBalance}
                </div>
                <div className="font-display mt-1 text-2xl font-black text-amber-300">
                  {credits.toLocaleString()}
                </div>
                <div className="mt-1 text-[11px] text-amber-200/70">{t.login.onlineRateValue}</div>
              </div>

              <div className="rounded-2xl border border-purple-400/25 bg-purple-500/10 p-4">
                <div className="flex items-center gap-1.5 text-xs font-medium text-purple-200/80">
                  <Gem className="h-4 w-4 text-purple-300" />
                  {t.login.wcoinBalance}
                </div>
                <div className="font-display mt-1 text-2xl font-black text-purple-300">
                  {wcoin.toLocaleString()}
                </div>
                <div className="mt-1 text-[11px] text-purple-200/70">100 Credits = 50 WCoin</div>
              </div>
            </div>

            {/* Quick Credit to WCoin Exchange */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-bold text-white">{t.login.exchangeTitle}</span>
                <span className="font-mono text-xs font-bold text-emerald-300">
                  +{Math.floor(exchangeAmount * 0.5)} WCoin
                </span>
              </div>
              <p className="mb-3 text-[11px] text-slate-400">{t.login.exchangeSubtitle}</p>

              <div className="mb-1.5 text-[11px] font-semibold text-slate-300">
                {t.login.exchangeAmountLabel}:
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[100, 200, 500, 1000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setExchangeAmount(amt)}
                    className={`rounded-lg border py-2 font-mono text-xs font-bold transition ${
                      exchangeAmount === amt
                        ? "border-amber-400 bg-amber-400/20 text-amber-200"
                        : "border-white/10 bg-white/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    {amt}
                  </button>
                ))}
              </div>

              {exchangeFeedback && (
                <div
                  className={`mt-3 flex items-center gap-2 rounded-xl border p-2.5 text-xs font-medium ${
                    exchangeFeedback.ok
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                      : "border-rose-500/40 bg-rose-500/10 text-rose-300"
                  }`}
                >
                  {exchangeFeedback.ok ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
                  )}
                  <span>{exchangeFeedback.text}</span>
                </div>
              )}

              <button
                type="button"
                disabled={exchanging}
                onClick={handleExchange}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-3 text-xs font-extrabold text-slate-950 transition hover:brightness-110 disabled:opacity-50"
              >
                <ArrowRightLeft className="h-4 w-4" />
                {exchanging ? t.login.exchanging : `${t.login.exchangeBtn} (${exchangeAmount} Credits → ${Math.floor(exchangeAmount * 0.5)} WCoin)`}
              </button>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              {t.login.logoutBtn}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
