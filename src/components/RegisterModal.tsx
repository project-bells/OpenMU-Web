import { useEffect, useState, useId } from "react";
import {
  X,
  User,
  Mail,
  Lock,
  KeyRound,
  CheckCircle2,
  Gamepad2,
  Loader2,
  Check,
  AlertCircle,
  ArrowRight,
  Download,
} from "lucide-react";
import { registerOpenMuAccount } from "../services/openMuApi";
import { useI18n } from "../i18n";

export default function RegisterModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useI18n();
  const r = t.register;
  const m = t.modal;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [personalCode, setPersonalCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [successAccount, setSuccessAccount] = useState<string | null>(null);

  const [touched, setTouched] = useState({
    username: false,
    password: false,
    confirmPassword: false,
    email: false,
    personalCode: false,
  });

  const usernameId = useId();
  const passwordId = useId();
  const confirmPasswordId = useId();
  const emailId = useId();
  const personalCodeId = useId();

  useEffect(() => {
    if (open) {
      setSuccessAccount(null);
      setApiError("");
      document.body.style.overflow = "hidden";
      const fn = (e: KeyboardEvent) => e.key === "Escape" && onClose();
      window.addEventListener("keydown", fn);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", fn);
      };
    }
  }, [open, onClose]);

  if (!open) return null;

  const isUsernameValid =
    username.length >= 4 && username.length <= 10 && /^[a-zA-Z0-9]+$/.test(username);
  const usernameError = touched.username && username && !isUsernameValid ? m.errUser : "";

  const passHasMinLength = password.length >= 6;
  const isConfirmValid = confirmPassword.length > 0 && confirmPassword === password;
  const confirmError =
    touched.confirmPassword && confirmPassword && confirmPassword !== password
      ? r.errConfirmMatch
      : "";

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const emailError = touched.email && email && !isEmailValid ? m.errEmail : "";

  const isPersonalCodeValid = personalCode.length === 7 && /^[0-9]{7}$/.test(personalCode);
  const personalCodeError =
    touched.personalCode && personalCode && !isPersonalCodeValid ? r.errCodeReq : "";

  const isFormValid =
    isUsernameValid && passHasMinLength && isConfirmValid && isEmailValid && isPersonalCodeValid;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setTouched({
      username: true,
      password: true,
      confirmPassword: true,
      email: true,
      personalCode: true,
    });

    if (!isFormValid) {
      if (!isUsernameValid) setApiError(m.errUser);
      else if (!passHasMinLength) setApiError(m.errPass);
      else if (!isConfirmValid) setApiError(r.errConfirmMatch);
      else if (!isEmailValid) setApiError(m.errEmail);
      else if (!isPersonalCodeValid) setApiError(r.errCodeReq);
      return;
    }

    setLoading(true);
    setApiError("");

    try {
      const res = await registerOpenMuAccount({
        loginName: username,
        password,
        email,
        personalCode,
      });

      if (res.success) {
        setSuccessAccount(res.account || username);
      } else {
        setApiError(res.error || m.errUser);
      }
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : m.errUser);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/80 p-4 backdrop-blur-md sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={m.aria}
    >
      <div
        className="fantasy-panel gold-border relative w-full max-w-lg overflow-hidden rounded-3xl p-6 shadow-2xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "modalIn .35s cubic-bezier(.22,1,.36,1) both" }}
      >
        <div
          className="absolute -top-20 left-1/2 h-40 w-72 -translate-x-1/2 rounded-full bg-amber-500/20 blur-[80px]"
          aria-hidden="true"
        />

        <button
          onClick={onClose}
          aria-label={m.close}
          className="absolute top-4 right-4 grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 text-white/60 transition hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        {successAccount ? (
          <div className="relative py-4 text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-emerald-500/40 bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="h-9 w-9" />
            </span>
            <h3 className="font-display mt-4 text-2xl font-black text-white">
              {m.welcome.replace("{name}", successAccount)}
            </h3>
            <p className="mt-1 text-xs text-white/60">{m.created}</p>

            <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-center">
              <p className="text-xs font-semibold text-emerald-300">{m.redeem}</p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <a
                href="#download"
                onClick={onClose}
                className="btn-shine flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#ff8a3c] px-4 py-3 text-xs font-extrabold text-[#090d16]"
              >
                <Download className="h-4 w-4" />
                {m.download}
              </a>
              <button
                onClick={onClose}
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-xs font-bold text-white transition hover:bg-white/10"
              >
                {r.doneClose}
              </button>
            </div>
          </div>
        ) : (
          <div className="relative">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#d4af37] to-[#ff8a3c] shadow-lg shadow-amber-500/30">
                <Gamepad2 className="h-6 w-6 text-[#090d16]" />
              </span>
              <div>
                <h3 className="font-display text-xl font-black text-white">{m.title}</h3>
                <p className="text-xs text-white/50">{m.sub}</p>
              </div>
            </div>

            {apiError && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{apiError}</span>
              </div>
            )}

            <form onSubmit={submit} className="mt-5 space-y-3.5">
              {/* Username */}
              <div>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <label htmlFor={usernameId} className="font-semibold text-white/80">
                    {r.usernameLabel}
                  </label>
                  {isUsernameValid && (
                    <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                      <Check className="h-3 w-3" /> {r.validLabel}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-white/40">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    id={usernameId}
                    type="text"
                    required
                    maxLength={10}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onBlur={() => setTouched({ ...touched, username: true })}
                    placeholder={m.phUser}
                    className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 pr-3 pl-10 text-sm text-white outline-none placeholder:text-white/30 focus:border-amber-400/50"
                  />
                </div>
                {usernameError && <p className="mt-1 text-[11px] text-red-400">{usernameError}</p>}
              </div>

              {/* Password */}
              <div>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <label htmlFor={passwordId} className="font-semibold text-white/80">
                    {r.passwordLabel}
                  </label>
                </div>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-white/40">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    id={passwordId}
                    type="password"
                    required
                    maxLength={64}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setTouched({ ...touched, password: true })}
                    placeholder={m.phPass}
                    className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 pr-3 pl-10 text-sm text-white outline-none placeholder:text-white/30 focus:border-amber-400/50"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <label htmlFor={confirmPasswordId} className="font-semibold text-white/80">
                    {r.confirmLabel}
                  </label>
                  {isConfirmValid && (
                    <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                      <Check className="h-3 w-3" /> {r.matchesLabel}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-white/40">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    id={confirmPasswordId}
                    type="password"
                    required
                    maxLength={64}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onBlur={() => setTouched({ ...touched, confirmPassword: true })}
                    placeholder={r.confirmPlaceholder}
                    className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 pr-3 pl-10 text-sm text-white outline-none placeholder:text-white/30 focus:border-amber-400/50"
                  />
                </div>
                {confirmError && <p className="mt-1 text-[11px] text-red-400">{confirmError}</p>}
              </div>

              {/* Email */}
              <div>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <label htmlFor={emailId} className="font-semibold text-white/80">
                    {r.emailLabel}
                  </label>
                </div>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-white/40">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    id={emailId}
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setTouched({ ...touched, email: true })}
                    placeholder={m.phEmail}
                    className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 pr-3 pl-10 text-sm text-white outline-none placeholder:text-white/30 focus:border-amber-400/50"
                  />
                </div>
                {emailError && <p className="mt-1 text-[11px] text-red-400">{emailError}</p>}
              </div>

              {/* Character Deletion Code */}
              <div>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <label htmlFor={personalCodeId} className="font-semibold text-white/80">
                    {r.personalCodeLabel}
                  </label>
                  {isPersonalCodeValid && (
                    <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                      <Check className="h-3 w-3" /> {r.validLabel}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-white/40">
                    <KeyRound className="h-4 w-4" />
                  </span>
                  <input
                    id={personalCodeId}
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    required
                    maxLength={7}
                    value={personalCode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, "").slice(0, 7);
                      setPersonalCode(val);
                      if (!touched.personalCode) setTouched({ ...touched, personalCode: true });
                    }}
                    onBlur={() => setTouched({ ...touched, personalCode: true })}
                    placeholder={r.personalCodePlaceholder}
                    className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 pr-3 pl-10 text-sm text-white outline-none placeholder:text-white/30 focus:border-amber-400/50"
                  />
                </div>
                {personalCodeError && (
                  <p className="mt-1 text-[11px] text-red-400">{personalCodeError}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-shine mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#d4af37] to-[#ff8a3c] px-6 py-3.5 text-sm font-black text-[#090d16] shadow-lg shadow-amber-500/25 transition hover:brightness-110 active:scale-[.99] disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{m.loading}</span>
                  </>
                ) : (
                  <>
                    <span>{m.submit}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <p className="pt-1 text-center text-[10px] text-white/40">
                {m.terms1} {m.terms2}
              </p>
            </form>
          </div>
        )}
      </div>
      <style>{`@keyframes modalIn { from { opacity: 0; transform: translateY(28px) scale(.97) } to { opacity: 1; transform: translateY(0) scale(1) } }`}</style>
    </div>
  );
}
