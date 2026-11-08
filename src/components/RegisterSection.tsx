import { useState, useId } from "react";
import { User, Lock, Mail, KeyRound, Check, X, ShieldCheck, Sparkles, Loader2, CheckCircle2, AlertCircle, ArrowRight, Download } from "lucide-react";
import { registerOpenMuAccount } from "../services/openMuApi";
import { useI18n } from "../i18n";

export default function RegisterSection() {
  const { lang } = useI18n();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [personalCode, setPersonalCode] = useState("");
  const [agreed, setAgreed] = useState(true);

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [successData, setSuccessData] = useState<{ account: string; isSimulated?: boolean } | null>(null);

  // Field touch state for showing errors appropriately
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
  // Username: 4-10 alphanumeric characters
  const isUsernameAlphaNumeric = /^[a-zA-Z0-9]*$/.test(username);
  const isUsernameValid = username.length >= 4 && username.length <= 10 && /^[a-zA-Z0-9]+$/.test(username);

  let usernameError = "";
  if (touched.username) {
    if (!username) usernameError = "Username is required";
    else if (username.length < 4) usernameError = `Too short (${username.length}/4 characters)`;
    else if (username.length > 10) usernameError = `Too long (${username.length}/10 characters max)`;
    else if (!isUsernameAlphaNumeric) usernameError = "Only alphanumeric letters (A-Z) and numbers (0-9) allowed";
  }

  // Strong Password Checks
  const passHasMinLength = password.length >= 8;
  const passHasLower = /[a-z]/.test(password);
  const passHasUpper = /[A-Z]/.test(password);
  const passHasNumber = /[0-9]/.test(password);
  const passHasSymbol = /[^a-zA-Z0-9]/.test(password);

  const passScore = [passHasMinLength, passHasLower, passHasUpper, passHasNumber, passHasSymbol].filter(Boolean).length;

  const getPassStrength = () => {
    if (!password) return { label: "Enter Password", color: "bg-white/10", text: "text-white/40", width: "0%" };
    if (passScore <= 2) return { label: "Weak", color: "bg-red-500", text: "text-red-400", width: "25%" };
    if (passScore === 3) return { label: "Fair", color: "bg-amber-500", text: "text-amber-400", width: "50%" };
    if (passScore === 4) return { label: "Strong", color: "bg-emerald-500", text: "text-emerald-400", width: "75%" };
    return { label: "Legendary", color: "bg-gradient-to-r from-amber-400 to-purple-500", text: "text-amber-300 font-bold", width: "100%" };
  };

  const strength = getPassStrength();

  // Confirm Password Check
  const isConfirmValid = confirmPassword.length > 0 && confirmPassword === password;
  let confirmError = "";
  if (touched.confirmPassword && confirmPassword) {
    if (confirmPassword !== password) {
      confirmError = "Passwords do not match";
    }
  }

  // Email check
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  let emailError = "";
  if (touched.email && email && !isEmailValid) {
    emailError = "Please enter a valid email address";
  }

  // Character Deletion Code: Exactly 7 numeric digits (0-9)
  const isPersonalCodeDigits = /^[0-9]*$/.test(personalCode);
  const isPersonalCodeValid = personalCode.length === 7 && /^[0-9]{7}$/.test(personalCode);
  let personalCodeError = "";
  if (touched.personalCode) {
    if (!personalCode) personalCodeError = "รหัสลบตัวละครจำเป็นต้องระบุ (7 หลัก)";
    else if (!isPersonalCodeDigits) personalCodeError = "ต้องเป็นตัวเลข 0-9 เท่านั้น";
    else if (personalCode.length !== 7) personalCodeError = `ต้องเป็นตัวเลข 7 หลักพอดี (ปัจจุบัน ${personalCode.length}/7)`;
  }

  const isFormValid = isUsernameValid && passScore >= 3 && isConfirmValid && isEmailValid && isPersonalCodeValid && agreed;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setTouched({ username: true, password: true, confirmPassword: true, email: true, personalCode: true });

    if (!isFormValid) {
      if (!isUsernameValid) setApiError("Username must be 4-10 alphanumeric characters.");
      else if (passScore < 3) setApiError("Password is too weak. Please include at least 8 characters with numbers/symbols.");
      else if (!isConfirmValid) setApiError("Passwords do not match.");
      else if (!isEmailValid) setApiError("Valid email address is required.");
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
        setSuccessData({
          account: res.account || username,
          isSimulated: res.isSimulated,
        });
      } else {
        setApiError(res.error || "Registration failed. Please try again.");
      }
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : "Network error contacting OpenMU server.");
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
    setTouched({ username: false, password: false, confirmPassword: false, email: false, personalCode: false });
  };

  return (
    <section id="register" className="relative scroll-mt-28 py-16 sm:py-24">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-radial from-amber-500/5 via-transparent to-transparent opacity-60 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-96 bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3.5 py-1 text-xs font-semibold text-amber-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{lang === "th" ? "สมัครไอดีเกมฟรี" : "Free Account Registration"}</span>
          </div>
          <h2 className="font-display mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
            {lang === "th" ? "สร้างตัวละครของคุณ" : "FORGE YOUR"}{" "}
            <span className="text-gradient-gold">{lang === "th" ? "และก้าวสู่ลอเรนเซีย" : "WARRIOR"}</span>
          </h2>
          <p className="mt-2 text-sm text-white/60 sm:text-base">
            {lang === "th"
              ? "สร้างไอดีของคุณในไม่กี่วินาที เข้าเล่นได้ทันที เล่นฟรี 100% ไร้ Pay-to-Win"
              : "Create your free account in seconds. Instant game activation. 100% Free-to-Play, zero pay-to-win."}
          </p>
        </div>

        {/* Card Container */}
        <div className="fantasy-panel gold-border relative mx-auto max-w-2xl rounded-3xl p-6 sm:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)]">
          {successData ? (
            /* Registration Success View */
            <div className="text-center py-6">
              <span className="mx-auto grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-[#090d16] shadow-xl shadow-emerald-500/25">
                <CheckCircle2 className="h-10 w-10 text-white" />
              </span>
              <h3 className="font-display mt-5 text-2xl font-black text-white sm:text-3xl">
                {lang === "th" ? "สร้างไอดีสำเร็จแล้ว!" : "ACCOUNT CREATED!"}
              </h3>
              <p className="mt-2 text-sm text-white/70">
                {lang === "th" ? "ยินดีต้อนรับสู่นักรบแห่ง eGiS-MU S6E3" : "Welcome to eGiS-MU S6E3"},{" "}
                <span className="font-bold text-amber-300 font-mono text-base">{successData.account.toUpperCase()}</span>
              </p>

              <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
                <p className="text-sm font-semibold text-emerald-300">
                  {lang === "th"
                    ? "บัญชีของคุณเปิดใช้งานเรียบร้อยแล้ว สามารถใช้ล็อกอินเข้าเล่นเกมได้ทันที"
                    : "Your account is activated and ready to log in immediately."}
                </p>
                <p className="mt-1 text-xs text-white/50">
                  {lang === "th"
                    ? "ข้อมูลของคุณถูกจัดเก็บด้วยระบบรักษาความปลอดภัยระดับมาตรฐาน"
                    : "Your credentials have been securely registered."}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <a
                  href="#download"
                  className="btn-shine flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#ffb52e] to-[#ff8a3c] px-5 py-3.5 text-sm font-extrabold text-[#090d16] shadow-lg shadow-amber-500/25 transition hover:brightness-110"
                >
                  <Download className="h-4 w-4" />
                  {lang === "th" ? "ดาวน์โหลดตัวเกม" : "Download Game Client"}
                </a>
                <button
                  onClick={resetForm}
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  {lang === "th" ? "สมัครไอดีอื่นเพิ่ม" : "Register Another Account"}
                </button>
              </div>

              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-white/40">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>
                  {lang === "th"
                    ? "ความปลอดภัยระดับมาตรฐาน ป้องกันข้อมูลส่วนบุคคล 100%"
                    : "Secure credentials verification and encryption enabled."}
                </span>
              </div>
            </div>
          ) : (
            /* Registration Form View */
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* API Alert Banner */}
              {apiError && (
                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-xs font-medium text-red-200"
                >
                  <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
                  <div className="flex-1">
                    <p className="font-bold text-red-300">Registration Error</p>
                    <p className="mt-0.5">{apiError}</p>
                  </div>
                </div>
              )}

              {/* 1. Username Field */}
              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor={usernameId} className="block text-xs font-semibold uppercase tracking-wider text-white/80">
                    Username / Account Name <span className="text-amber-400">*</span>
                  </label>
                  <span className="font-mono text-[11px] text-white/40">
                    {username.length}/10 chars (min 4)
                  </span>
                </div>
                <div className="relative mt-1.5">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-white/40">
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
                    placeholder="4-10 characters (letters & numbers only)"
                    className={`w-full rounded-xl border bg-white/[0.04] py-3 pl-10 pr-10 text-sm font-medium text-white outline-none transition placeholder:text-white/30 ${
                      usernameError
                        ? "border-red-500/50 focus:border-red-500 bg-red-500/5"
                        : isUsernameValid
                        ? "border-emerald-500/50 focus:border-emerald-500 bg-emerald-500/5"
                        : "border-white/15 focus:border-amber-400/60 focus:bg-white/[0.06]"
                    }`}
                  />
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none">
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
                  <p className="mt-1 text-[11px] text-white/40">
                    Alphanumeric characters only. No special symbols or spaces.
                  </p>
                )}
              </div>

              {/* 2. Password Field */}
              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor={passwordId} className="block text-xs font-semibold uppercase tracking-wider text-white/80">
                    Password <span className="text-amber-400">*</span>
                  </label>
                  {password && (
                    <span className={`text-[11px] font-semibold ${strength.text}`}>
                      Strength: {strength.label}
                    </span>
                  )}
                </div>
                <div className="relative mt-1.5">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-white/40">
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
                    placeholder="Create a strong master password (8-64 chars)"
                    className="w-full rounded-xl border border-white/15 bg-white/[0.04] py-3 pl-10 pr-10 text-sm font-medium text-white outline-none transition placeholder:text-white/30 focus:border-amber-400/60 focus:bg-white/[0.06]"
                  />
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none">
                    {passScore >= 4 ? (
                      <Check className="h-4 w-4 text-emerald-400" />
                    ) : null}
                  </span>
                </div>

                {/* Password Strength Meter */}
                {password && (
                  <div className="mt-2 space-y-2">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className={`h-full transition-all duration-300 ${strength.color}`}
                        style={{ width: strength.width }}
                      />
                    </div>

                    {/* Criteria checklist */}
                    <div className="grid grid-cols-2 gap-1 text-[11px] text-white/50 pt-1 sm:grid-cols-3">
                      <span className={`flex items-center gap-1 ${passHasMinLength ? "text-emerald-400 font-medium" : ""}`}>
                        {passHasMinLength ? <Check className="h-3 w-3" /> : <span className="h-1.5 w-1.5 rounded-full bg-white/20" />}
                        8+ Characters
                      </span>
                      <span className={`flex items-center gap-1 ${passHasUpper && passHasLower ? "text-emerald-400 font-medium" : ""}`}>
                        {passHasUpper && passHasLower ? <Check className="h-3 w-3" /> : <span className="h-1.5 w-1.5 rounded-full bg-white/20" />}
                        Upper & Lower
                      </span>
                      <span className={`flex items-center gap-1 ${passHasNumber ? "text-emerald-400 font-medium" : ""}`}>
                        {passHasNumber ? <Check className="h-3 w-3" /> : <span className="h-1.5 w-1.5 rounded-full bg-white/20" />}
                        Includes Numbers
                      </span>
                      <span className={`flex items-center gap-1 ${passHasSymbol ? "text-emerald-400 font-medium" : ""}`}>
                        {passHasSymbol ? <Check className="h-3 w-3" /> : <span className="h-1.5 w-1.5 rounded-full bg-white/20" />}
                        Special Symbol (!@#$)
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Confirm Password Field */}
              <div>
                <label htmlFor={confirmPasswordId} className="block text-xs font-semibold uppercase tracking-wider text-white/80">
                  Confirm Password <span className="text-amber-400">*</span>
                </label>
                <div className="relative mt-1.5">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-white/40">
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
                    placeholder="Retype your password (8-64 chars)"
                    className={`w-full rounded-xl border bg-white/[0.04] py-3 pl-10 pr-10 text-sm font-medium text-white outline-none transition placeholder:text-white/30 ${
                      confirmError
                        ? "border-red-500/50 focus:border-red-500 bg-red-500/5"
                        : isConfirmValid
                        ? "border-emerald-500/50 focus:border-emerald-500 bg-emerald-500/5"
                        : "border-white/15 focus:border-amber-400/60 focus:bg-white/[0.06]"
                    }`}
                  />
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none">
                    {isConfirmValid ? (
                      <Check className="h-4 w-4 text-emerald-400" />
                    ) : confirmError ? (
                      <X className="h-4 w-4 text-red-400" />
                    ) : null}
                  </span>
                </div>
                {confirmError ? (
                  <p className="mt-1 text-xs text-red-400">{confirmError}</p>
                ) : isConfirmValid ? (
                  <p className="mt-1 text-xs text-emerald-400">Passwords match perfectly.</p>
                ) : null}
              </div>

              {/* 4. Email Field */}
              <div>
                <label htmlFor={emailId} className="block text-xs font-semibold uppercase tracking-wider text-white/80">
                  Email Address <span className="text-amber-400">*</span>
                </label>
                <div className="relative mt-1.5">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-white/40">
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
                    placeholder="account-recovery@example.com"
                    className={`w-full rounded-xl border bg-white/[0.04] py-3 pl-10 pr-10 text-sm font-medium text-white outline-none transition placeholder:text-white/30 ${
                      emailError
                        ? "border-red-500/50 focus:border-red-500 bg-red-500/5"
                        : isEmailValid
                        ? "border-emerald-500/50 focus:border-emerald-500 bg-emerald-500/5"
                        : "border-white/15 focus:border-amber-400/60 focus:bg-white/[0.06]"
                    }`}
                  />
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none">
                    {isEmailValid ? (
                      <Check className="h-4 w-4 text-emerald-400" />
                    ) : emailError ? (
                      <X className="h-4 w-4 text-red-400" />
                    ) : null}
                  </span>
                </div>
                {emailError ? (
                  <p className="mt-1 text-xs text-red-400">{emailError}</p>
                ) : (
                  <p className="mt-1 text-[11px] text-white/40">
                    Used strictly for account recovery and two-factor PIN. Never shared.
                  </p>
                )}
              </div>

              {/* 5. Character Deletion Code (รหัสลบตัวละคร) */}
              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor={personalCodeId} className="block text-xs font-semibold uppercase tracking-wider text-white/80">
                    รหัสลบตัวละคร (Character Deletion Code) <span className="text-amber-400">*</span>
                  </label>
                  <span className="font-mono text-[11px] text-white/40">
                    {personalCode.length}/7 หลัก (0-9)
                  </span>
                </div>
                <div className="relative mt-1.5">
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
                    className={`w-full rounded-xl border bg-white/[0.04] py-3 pl-10 pr-10 text-sm font-medium text-white outline-none transition placeholder:text-white/30 ${
                      personalCodeError
                        ? "border-red-500/50 focus:border-red-500 bg-red-500/5"
                        : isPersonalCodeValid
                        ? "border-emerald-500/50 focus:border-emerald-500 bg-emerald-500/5"
                        : "border-white/15 focus:border-amber-400/60 focus:bg-white/[0.06]"
                    }`}
                  />
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none">
                    {isPersonalCodeValid ? (
                      <Check className="h-4 w-4 text-emerald-400" />
                    ) : personalCodeError ? (
                      <X className="h-4 w-4 text-red-400" />
                    ) : null}
                  </span>
                </div>
                {personalCodeError ? (
                  <p className="mt-1 text-xs text-red-400">{personalCodeError}</p>
                ) : (
                  <p className="mt-1 text-[11px] text-white/40">
                    รหัสความปลอดภัย 7 หลัก สำหรับยืนยันการลบตัวละครในเกม (MU Personal Security ID)
                  </p>
                )}
              </div>

              {/* Terms Checkbox */}
              <label className="flex items-start gap-2.5 pt-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/5 text-amber-400 focus:ring-amber-400"
                />
                <span className="text-xs text-white/60 leading-relaxed">
                  I agree to the eGiS-MU Fair Play Policy (no botting, no speedhacks, respectful chat).
                </span>
              </label>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn-shine relative flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#d4af37] via-[#ffb52e] to-[#ff8a3c] px-6 py-4 text-base font-black text-[#090d16] shadow-[0_12px_40px_-8px_rgba(212,175,55,0.4)] transition hover:brightness-110 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>{lang === "th" ? "กำลังสร้างบัญชีผู้เล่น…" : "Creating Account…"}</span>
                  </>
                ) : (
                  <>
                    <span>{lang === "th" ? "สมัครสมาชิก (CREATE ACCOUNT)" : "CREATE FREE ACCOUNT"}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-3 pt-2 text-[11px] text-white/40">
                <span>{lang === "th" ? "เปิดใช้งานทันที" : "Instant Activation"}</span>
                <span>•</span>
                <span>{lang === "th" ? "เล่นฟรี 100%" : "100% Free to Play"}</span>
                <span>•</span>
                <span>{lang === "th" ? "ไร้ Pay-to-Win" : "Zero Pay-to-Win"}</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
