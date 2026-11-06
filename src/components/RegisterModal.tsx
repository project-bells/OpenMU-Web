import { useEffect, useState, useId } from "react";
import { X, User, Mail, Lock, KeyRound, CheckCircle2, Gamepad2, Loader2, Check, AlertCircle, ArrowRight, Download } from "lucide-react";
import { registerOpenMuAccount } from "../services/openMuApi";

export default function RegisterModal({ open, onClose }: { open: boolean; onClose: () => void }) {
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

  // Real-time validations
  const isUsernameValid = username.length >= 4 && username.length <= 10 && /^[a-zA-Z0-9]+$/.test(username);
  let usernameError = "";
  if (touched.username && username) {
    if (username.length < 4) usernameError = "Min 4 characters";
    else if (username.length > 10) usernameError = "Max 10 characters";
    else if (!/^[a-zA-Z0-9]+$/.test(username)) usernameError = "Letters and numbers only";
  }

  const passHasMinLength = password.length >= 8;
  const passHasLower = /[a-z]/.test(password);
  const passHasUpper = /[A-Z]/.test(password);
  const passHasNumber = /[0-9]/.test(password);
  const passHasSymbol = /[^a-zA-Z0-9]/.test(password);
  const passScore = [passHasMinLength, passHasLower, passHasUpper, passHasNumber, passHasSymbol].filter(Boolean).length;

  const isConfirmValid = confirmPassword.length > 0 && confirmPassword === password;
  let confirmError = "";
  if (touched.confirmPassword && confirmPassword && confirmPassword !== password) {
    confirmError = "Passwords do not match";
  }

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  let emailError = "";
  if (touched.email && email && !isEmailValid) {
    emailError = "Invalid email format";
  }

  // Personal Character Deletion Code: exactly 7 digits
  const isPersonalCodeDigits = /^[0-9]*$/.test(personalCode);
  const isPersonalCodeValid = personalCode.length === 7 && /^[0-9]{7}$/.test(personalCode);
  let personalCodeError = "";
  if (touched.personalCode && personalCode) {
    if (!isPersonalCodeDigits) personalCodeError = "Numbers only (0-9)";
    else if (personalCode.length !== 7) personalCodeError = `Must be 7 digits (${personalCode.length}/7)`;
  }

  const isFormValid = isUsernameValid && passScore >= 3 && isConfirmValid && isEmailValid && isPersonalCodeValid;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setTouched({ username: true, password: true, confirmPassword: true, email: true, personalCode: true });

    if (!isFormValid) {
      if (!isUsernameValid) setApiError("Username must be 4-10 alphanumeric characters.");
      else if (passScore < 3) setApiError("Password must be at least 8 characters with numbers.");
      else if (!isConfirmValid) setApiError("Passwords do not match.");
      else if (!isEmailValid) setApiError("Please enter a valid email address.");
      else if (!isPersonalCodeValid) setApiError("รหัสลบตัวละครต้องเป็นตัวเลข 7 หลักพอดี (0-9)");
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
        setApiError(res.error || "Failed to create OpenMU account.");
      }
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : "Error contacting OpenMU server.");
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
      aria-label="Create OpenMU Account"
    >
      <div
        className="fantasy-panel gold-border relative w-full max-w-lg overflow-hidden rounded-3xl p-6 sm:p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "modalIn .35s cubic-bezier(.22,1,.36,1) both" }}
      >
        <div className="absolute -top-20 left-1/2 h-40 w-72 -translate-x-1/2 rounded-full bg-amber-500/20 blur-[80px]" aria-hidden="true" />
        
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 text-white/60 transition hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        {successAccount ? (
          <div className="relative text-center py-4">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              <CheckCircle2 className="h-9 w-9" />
            </span>
            <h3 className="font-display mt-4 text-2xl font-black text-white">
              WARRIOR CREATED!
            </h3>
            <p className="mt-1 text-xs text-white/60">
              Account <strong className="text-amber-300 font-mono">{successAccount}</strong> is ready on OpenMU S6E3.
            </p>

            <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-center">
              <p className="text-xs font-semibold text-emerald-300">
                บัญชีของคุณพร้อมใช้งานในระบบ OpenMU แล้ว
              </p>
              <p className="mt-0.5 text-[11px] text-white/50">
                Credentials verified & active. You can log into the game immediately.
              </p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <a
                href="#download"
                onClick={onClose}
                className="btn-shine flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#ff8a3c] px-4 py-3 text-xs font-extrabold text-[#090d16]"
              >
                <Download className="h-4 w-4" />
                Download Client
              </a>
              <button
                onClick={onClose}
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-xs font-bold text-white transition hover:bg-white/10"
              >
                Done & Close
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
                <h3 className="font-display text-xl font-black text-white">CREATE ACCOUNT</h3>
                <p className="text-xs text-white/50">Direct OpenMU Core Integration • 100% Free</p>
              </div>
            </div>

            {/* Error Message */}
            {apiError && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{apiError}</span>
              </div>
            )}

            <form onSubmit={submit} className="mt-5 space-y-3.5">
              {/* Username */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <label htmlFor={usernameId} className="font-semibold text-white/80">Account Name (4-10 chars)</label>
                  {isUsernameValid && <span className="text-emerald-400 flex items-center gap-1 text-[11px]"><Check className="h-3 w-3" /> Valid</span>}
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-white/40">
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
                    placeholder="e.g. BladeKnight26"
                    className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-amber-400/50"
                  />
                </div>
                {usernameError && <p className="mt-1 text-[11px] text-red-400">{usernameError}</p>}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <label htmlFor={passwordId} className="font-semibold text-white/80">Password (min 8 chars)</label>
                  {passScore >= 4 && <span className="text-emerald-400 text-[11px]">Strong</span>}
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-white/40">
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
                    placeholder="Enter password (8-64 chars)"
                    className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-amber-400/50"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <label htmlFor={confirmPasswordId} className="font-semibold text-white/80">Confirm Password</label>
                  {isConfirmValid && <span className="text-emerald-400 text-[11px]">Matches</span>}
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-white/40">
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
                    placeholder="Confirm password"
                    className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-amber-400/50"
                  />
                </div>
                {confirmError && <p className="mt-1 text-[11px] text-red-400">{confirmError}</p>}
              </div>

              {/* Email */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <label htmlFor={emailId} className="font-semibold text-white/80">Email</label>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-white/40">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    id={emailId}
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setTouched({ ...touched, email: true })}
                    placeholder="recovery@example.com"
                    className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-amber-400/50"
                  />
                </div>
                {emailError && <p className="mt-1 text-[11px] text-red-400">{emailError}</p>}
              </div>

              {/* Character Deletion Code (รหัสลบตัวละคร) */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <label htmlFor={personalCodeId} className="font-semibold text-white/80">
                    รหัสลบตัวละคร (7 หลัก)
                  </label>
                  {isPersonalCodeValid && (
                    <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                      <Check className="h-3 w-3" /> Valid
                    </span>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-white/40">
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
                    placeholder="ตัวเลข 7 หลัก (เช่น 1234567)"
                    className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-amber-400/50"
                  />
                </div>
                {personalCodeError && <p className="mt-1 text-[11px] text-red-400">{personalCodeError}</p>}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn-shine mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#d4af37] to-[#ff8a3c] px-6 py-3.5 text-sm font-black text-[#090d16] shadow-lg shadow-amber-500/25 transition hover:brightness-110 active:scale-[.99] disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Connecting to OpenMU Core…</span>
                  </>
                ) : (
                  <>
                    <span>CREATE ACCOUNT (POST /api/account/register)</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <p className="text-center text-[10px] text-white/40 pt-1">
                By registering you agree to server rules. Instant OpenMU activation.
              </p>
            </form>
          </div>
        )}
      </div>
      <style>{`@keyframes modalIn { from { opacity: 0; transform: translateY(28px) scale(.97) } to { opacity: 1; transform: translateY(0) scale(1) } }`}</style>
    </div>
  );
}
