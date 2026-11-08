import { useState, useId } from "react";
import {
  User,
  Lock,
  Mail,
  KeyRound,
  Check,
  X,
  ShieldCheck,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Download,
} from "lucide-react";
import { registerOpenMuAccount } from "../services/openMuApi";
import { useI18n } from "../i18n";

export default function RegisterSection() {
  const { t } = useI18n();
  const r = t.register;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [personalCode, setPersonalCode] = useState("");
  const [agreed, setAgreed] = useState(true);

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [successData, setSuccessData] = useState<{ account: string; isSimulated?: boolean } | null>(
    null
  );

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

  // --- Real-time Validation ---
  const isUsernameValid =
    username.length >= 4 && username.length <= 10 && /^[a-zA-Z0-9]+$/.test(username);
  const usernameError =
    touched.username && !isUsernameValid
      ? !username
        ? r.errUsernameReq
        : username.length < 4
          ? r.errUsernameShort.replace("{n}", String(username.length))
          : username.length > 10
            ? r.errUsernameLong.replace("{n}", String(username.length))
            : r.errUsernameAlpha
      : "";

  // Password Strength Checks
  const passHasMinLength = password.length >= 8;
  const passHasLower = /[a-z]/.test(password);
  const passHasUpper = /[A-Z]/.test(password);
  const passHasNumber = /[0-9]/.test(password);
  const passHasSymbol = /[^a-zA-Z0-9]/.test(password);

  const passScore = [
    passHasMinLength,
    passHasLower && passHasUpper,
    passHasNumber,
    passHasSymbol,
  ].filter(Boolean).length;

  const getPassStrength = () => {
    if (!password)
      return { label: r.strengthEnter, color: "bg-white/10", text: "text-white/40", width: "0%" };
    if (passScore <= 1)
      return { label: r.strengthWeak, color: "bg-red-500", text: "text-red-400", width: "25%" };
    if (passScore === 2)
      return { label: r.strengthFair, color: "bg-amber-500", text: "text-amber-400", width: "50%" };
    if (passScore === 3)
      return {
        label: r.strengthStrong,
        color: "bg-emerald-500",
        text: "text-emerald-400",
        width: "75%",
      };
    return {
      label: r.strengthLegendary,
      color: "bg-gradient-to-r from-amber-400 to-purple-500",
      text: "text-amber-300 font-bold",
      width: "100%",
    };
  };

  const strength = getPassStrength();

  const isConfirmValid = confirmPassword.length > 0 && confirmPassword === password;
  const confirmError =
    touched.confirmPassword && confirmPassword && confirmPassword !== password
      ? r.errConfirmMatch
      : "";

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const emailError = touched.email && email && !isEmailValid ? r.errEmailInvalid : "";

  const isPersonalCodeValid = personalCode.length === 7 && /^[0-9]{7}$/.test(personalCode);
  const personalCodeError =
    touched.personalCode && !isPersonalCodeValid
      ? !personalCode
        ? r.errCodeReq
        : r.errCodeLen.replace("{n}", String(personalCode.length))
      : "";

  const isFormValid =
    isUsernameValid &&
    password.length >= 6 &&
    isConfirmValid &&
    isEmailValid &&
    isPersonalCodeValid &&
    agreed;

  const handleSubmit = async (e: React.FormEvent) => {
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
      if (!isUsernameValid) setApiError(r.errUsernameReq);
      else if (password.length < 6) setApiError(r.passwordPlaceholder);
      else if (!isConfirmValid) setApiError(r.errConfirmMatch);
      else if (!isEmailValid) setApiError(r.errEmailInvalid);
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
        setSuccessData({
          account: res.account || username,
          isSimulated: res.isSimulated,
        });
      } else {
        setApiError(res.error || r.errorTitle);
      }
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : r.errorTitle);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    setEmail("");
    setPersonalCode("");
    setSuccessData(null);
    setApiError("");
    setTouched({
      username: false,
      password: false,
      confirmPassword: false,
      email: false,
      personalCode: false,
    });
  };

  return (
    <section id="register" className="relative scroll-mt-28 py-16 sm:py-24">
      <div className="pointer-events-none absolute inset-0 bg-radial from-amber-500/5 via-transparent to-transparent opacity-60" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-96 w-full max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-900/10 blur-[120px]" />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3.5 py-1 text-xs font-semibold text-amber-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{r.badge}</span>
          </div>
          <h2 className="font-display mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
            {r.h2a} <span className="text-gradient-gold">{r.h2b}</span>
          </h2>
          <p className="mt-2 text-sm text-white/60 sm:text-base">{r.sub}</p>
        </div>

        <div className="fantasy-panel gold-border relative mx-auto max-w-2xl rounded-3xl p-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] sm:p-10">
          {successData ? (
            <div className="py-6 text-center">
              <span className="mx-auto grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-[#090d16] shadow-xl shadow-emerald-500/25">
                <CheckCircle2 className="h-10 w-10 text-white" />
              </span>
              <h3 className="font-display mt-5 text-2xl font-black text-white sm:text-3xl">
                {r.successTitle}
              </h3>
              <p className="mt-2 text-sm text-white/70">{r.successWelcome}</p>

              <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
                <p className="font-mono text-base font-bold text-amber-300">
                  {successData.account.toUpperCase()}
                </p>
                <p className="mt-1 text-xs text-emerald-300">{r.successActivated}</p>
                <p className="mt-0.5 text-[11px] text-white/60">{r.successSecured}</p>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <a
                  href="#download"
                  className="btn-shine flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#ffb52e] to-[#ff8a3c] px-5 py-3.5 text-sm font-extrabold text-[#090d16] shadow-lg shadow-amber-500/25 transition hover:brightness-110"
                >
                  <Download className="h-4 w-4" />
                  {r.downloadBtn}
                </a>
                <button
                  onClick={resetForm}
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  {r.registerAnotherBtn}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {apiError && (
                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-xs font-medium text-red-200"
                >
                  <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
                  <div className="flex-1">
                    <p>{apiError}</p>
                  </div>
                </div>
              )}

              {/* 1. Username */}
              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor={usernameId}
                    className="block text-xs font-semibold tracking-wider text-white/80 uppercase"
                  >
                    {r.usernameLabel} <span className="text-amber-400">*</span>
                  </label>
                  <span className="font-mono text-[11px] text-white/40">
                    {r.usernameCount.replace("{n}", String(username.length))}
                  </span>
                </div>
                <div className="relative mt-1.5">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-white/40">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    id={usernameId}
                    type="text"
                    required
                    maxLength={10}
                    autoComplete="username"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (!touched.username) setTouched({ ...touched, username: true });
                    }}
                    onBlur={() => setTouched({ ...touched, username: true })}
                    placeholder={r.usernamePlaceholder}
                    className={`w-full rounded-xl border bg-white/[0.04] py-3 pr-10 pl-10 text-sm font-medium text-white outline-none transition placeholder:text-white/30 ${
                      usernameError
                        ? "border-red-500/50 bg-red-500/5 focus:border-red-500"
                        : isUsernameValid
                          ? "border-emerald-500/50 bg-emerald-500/5 focus:border-emerald-500"
                          : "border-white/15 focus:border-amber-400/60 focus:bg-white/[0.06]"
                    }`}
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5">
                    {isUsernameValid ? (
                      <Check className="h-4 w-4 text-emerald-400" />
                    ) : usernameError ? (
                      <X className="h-4 w-4 text-red-400" />
                    ) : null}
                  </span>
                </div>
                {usernameError ? (
                  <p className="mt-1 text-xs text-red-400">{usernameError}</p>
                ) : (
                  <p className="mt-1 text-[11px] text-white/40">{r.usernameHint}</p>
                )}
              </div>

              {/* 2. Password */}
              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor={passwordId}
                    className="block text-xs font-semibold tracking-wider text-white/80 uppercase"
                  >
                    {r.passwordLabel} <span className="text-amber-400">*</span>
                  </label>
                  {password && (
                    <span className={`text-[11px] font-semibold ${strength.text}`}>
                      {r.strengthPrefix} {strength.label}
                    </span>
                  )}
                </div>
                <div className="relative mt-1.5">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-white/40">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    id={passwordId}
                    type="password"
                    required
                    maxLength={64}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (!touched.password) setTouched({ ...touched, password: true });
                    }}
                    onBlur={() => setTouched({ ...touched, password: true })}
                    placeholder={r.passwordPlaceholder}
                    className="w-full rounded-xl border border-white/15 bg-white/[0.04] py-3 pr-10 pl-10 text-sm font-medium text-white outline-none transition placeholder:text-white/30 focus:border-amber-400/60 focus:bg-white/[0.06]"
                  />
                </div>
                {password && (
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className={`h-full transition-all duration-300 ${strength.color}`}
                      style={{ width: strength.width }}
                    />
                  </div>
                )}
              </div>

              {/* 3. Confirm Password */}
              <div>
                <label
                  htmlFor={confirmPasswordId}
                  className="block text-xs font-semibold tracking-wider text-white/80 uppercase"
                >
                  {r.confirmLabel} <span className="text-amber-400">*</span>
                </label>
                <div className="relative mt-1.5">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-white/40">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    id={confirmPasswordId}
                    type="password"
                    required
                    maxLength={64}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (!touched.confirmPassword) setTouched({ ...touched, confirmPassword: true });
                    }}
                    onBlur={() => setTouched({ ...touched, confirmPassword: true })}
                    placeholder={r.confirmPlaceholder}
                    className={`w-full rounded-xl border bg-white/[0.04] py-3 pr-10 pl-10 text-sm font-medium text-white outline-none transition placeholder:text-white/30 ${
                      confirmError
                        ? "border-red-500/50 bg-red-500/5 focus:border-red-500"
                        : isConfirmValid
                          ? "border-emerald-500/50 bg-emerald-500/5 focus:border-emerald-500"
                          : "border-white/15 focus:border-amber-400/60 focus:bg-white/[0.06]"
                    }`}
                  />
                </div>
                {confirmError && <p className="mt-1 text-xs text-red-400">{confirmError}</p>}
              </div>

              {/* 4. Email */}
              <div>
                <label
                  htmlFor={emailId}
                  className="block text-xs font-semibold tracking-wider text-white/80 uppercase"
                >
                  {r.emailLabel} <span className="text-amber-400">*</span>
                </label>
                <div className="relative mt-1.5">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-white/40">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    id={emailId}
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (!touched.email) setTouched({ ...touched, email: true });
                    }}
                    onBlur={() => setTouched({ ...touched, email: true })}
                    placeholder={r.emailPlaceholder}
                    className={`w-full rounded-xl border bg-white/[0.04] py-3 pr-10 pl-10 text-sm font-medium text-white outline-none transition placeholder:text-white/30 ${
                      emailError
                        ? "border-red-500/50 bg-red-500/5 focus:border-red-500"
                        : isEmailValid
                          ? "border-emerald-500/50 bg-emerald-500/5 focus:border-emerald-500"
                          : "border-white/15 focus:border-amber-400/60 focus:bg-white/[0.06]"
                    }`}
                  />
                </div>
                {emailError ? (
                  <p className="mt-1 text-xs text-red-400">{emailError}</p>
                ) : (
                  <p className="mt-1 text-[11px] text-white/40">{r.emailHint}</p>
                )}
              </div>

              {/* 5. Character Deletion Code */}
              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor={personalCodeId}
                    className="block text-xs font-semibold tracking-wider text-white/80 uppercase"
                  >
                    {r.personalCodeLabel} <span className="text-amber-400">*</span>
                  </label>
                  <span className="font-mono text-[11px] text-white/40">
                    {r.personalCodeCount.replace("{n}", String(personalCode.length))}
                  </span>
                </div>
                <div className="relative mt-1.5">
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
                    className={`w-full rounded-xl border bg-white/[0.04] py-3 pr-10 pl-10 text-sm font-medium text-white outline-none transition placeholder:text-white/30 ${
                      personalCodeError
                        ? "border-red-500/50 bg-red-500/5 focus:border-red-500"
                        : isPersonalCodeValid
                          ? "border-emerald-500/50 bg-emerald-500/5 focus:border-emerald-500"
                          : "border-white/15 focus:border-amber-400/60 focus:bg-white/[0.06]"
                    }`}
                  />
                </div>
                {personalCodeError ? (
                  <p className="mt-1 text-xs text-red-400">{personalCodeError}</p>
                ) : (
                  <p className="mt-1 text-[11px] text-white/40">{r.personalCodeHint}</p>
                )}
              </div>

              {/* Terms Checkbox */}
              <label className="flex cursor-pointer items-start gap-2.5 pt-1 select-none">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/5 text-amber-400 focus:ring-amber-400"
                />
                <span className="text-xs leading-relaxed text-white/60">{r.agreeTerms}</span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="btn-shine relative flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#d4af37] via-[#ffb52e] to-[#ff8a3c] px-6 py-4 text-base font-black text-[#090d16] shadow-[0_12px_40px_-8px_rgba(212,175,55,0.4)] transition hover:brightness-110 active:scale-[0.99] disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>{r.creatingBtn}</span>
                  </>
                ) : (
                  <>
                    <span>{r.submitBtn}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-[11px] text-white/40">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  {r.footInstant}
                </span>
                <span>•</span>
                <span>{r.footFree}</span>
                <span>•</span>
                <span>{r.footNoP2w}</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
