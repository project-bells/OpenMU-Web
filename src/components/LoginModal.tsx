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
  RefreshCw,
  Skull,
  PlusCircle,
  RotateCcw,
  KeyRound,
  MapPin,
  Swords,
  ShieldAlert,
  Wallet,
  CreditCard,
  QrCode,
  Search,
  Award,
  Gift,
  Check,
  ChevronRight,
} from "lucide-react";
import { useI18n } from "../i18n";
import {
  loginAccount,
  exchangeCreditsToWcoin,
  fetchAccountCharacters,
  resetCharacterAction,
  clearPkAction,
  addStatsAction,
  resetStatsAction,
  changePasswordAction,
  searchUsers,
  adminGrantBalance,
  topupDonate,
  TOPUP_PACKAGES,
  TEST_ACCOUNTS,
  type OpenMuCharacter,
  type UserSearchItem,
} from "../services/dbApi";

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
  const [activeTab, setActiveTab] = useState<"overview" | "characters" | "donate" | "security" | "admin">("overview");
  const [credits, setCredits] = useState(250);
  const [wcoin, setWcoin] = useState(100);
  const [exchangeAmount, setExchangeAmount] = useState(100);
  const [exchanging, setExchanging] = useState(false);
  const [exchangeFeedback, setExchangeFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  // Characters state
  const [characters, setCharacters] = useState<OpenMuCharacter[]>([]);
  const [charLoading, setCharLoading] = useState(false);
  const [charActionMsg, setCharActionMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [addStatsTarget, setAddStatsTarget] = useState<string | null>(null);
  const [statsInput, setStatsInput] = useState<{ str: number; agi: number; vit: number; ene: number; lead: number }>({
    str: 0,
    agi: 0,
    vit: 0,
    ene: 0,
    lead: 0,
  });

  // Password state
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [repeatPass, setRepeatPass] = useState("");
  const [passLoading, setPassLoading] = useState(false);
  const [passMsg, setPassMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Top-up / Donate state
  const [selectedPackageId, setSelectedPackageId] = useState<string>("tier-300");
  const [selectedChannel, setSelectedChannel] = useState<"truemoney" | "paypal" | "credit_card">("truemoney");
  const [donateAccountOrPhone, setDonateAccountOrPhone] = useState<string>("089-123-4567");
  const [donateLoading, setDonateLoading] = useState(false);
  const [donateFeedback, setDonateFeedback] = useState<{
    ok: boolean;
    text: string;
    txnId?: string;
    addedCredits?: number;
    addedWcoin?: number;
  } | null>(null);

  // Admin GM state (Autocomplete search & balance grant)
  const [adminSearchQuery, setAdminSearchQuery] = useState("");
  const [adminSearchResults, setAdminSearchResults] = useState<UserSearchItem[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [selectedTargetUser, setSelectedTargetUser] = useState<UserSearchItem | null>(null);
  const [adminCreditsToAdd, setAdminCreditsToAdd] = useState<number>(500);
  const [adminWcoinToAdd, setAdminWcoinToAdd] = useState<number>(200);
  const [adminGrantNote, setAdminGrantNote] = useState<string>("Castle Siege Champion / GM Reward");
  const [adminGrantLoading, setAdminGrantLoading] = useState(false);
  const [adminGrantFeedback, setAdminGrantFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open && activeTab === "admin" && loggedInUser?.toLowerCase() === "admin") {
      let cancelled = false;
      setIsSearchingUsers(true);
      searchUsers(adminSearchQuery).then((results) => {
        if (!cancelled) {
          setAdminSearchResults(results);
          setIsSearchingUsers(false);
          if (!selectedTargetUser && results.length > 0) {
            const nonAdmin = results.find((r) => r.username.toLowerCase() !== "admin") || results[0];
            setSelectedTargetUser(nonAdmin);
          }
        }
      });
      return () => {
        cancelled = true;
      };
    }
  }, [open, adminSearchQuery, activeTab, loggedInUser, selectedTargetUser]);

  const loadCharacters = async (acc: string) => {
    setCharLoading(true);
    const list = await fetchAccountCharacters(acc);
    setCharacters(list);
    setCharLoading(false);
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setExchangeFeedback(null);
    setCharActionMsg(null);

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
      const user = res.account || trimmed;
      setLoggedInUser(user);
      setCredits(typeof res.credits === "number" ? res.credits : 250);
      setWcoin(typeof res.wcoin === "number" ? res.wcoin : 100);
      loadCharacters(user);
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

  const handleResetCharacter = async (char: OpenMuCharacter) => {
    setCharActionMsg(null);
    if (char.lvl < 400) {
      setCharActionMsg({
        ok: false,
        text: `${char.name} ${t.login.actionResetRequirement} (${t.login.charLevel}: ${char.lvl}/400)`,
      });
      return;
    }

    const res = await resetCharacterAction(char.name, char.characterClassId);
    if (res.success) {
      setCharActionMsg({ ok: true, text: res.message || t.login.resetSuccess });
      setCharacters((prev) =>
        prev.map((c) =>
          c.name === char.name
            ? { ...c, lvl: 1, resets: c.resets + 1, levelUpPoints: c.levelUpPoints + 500 }
            : c
        )
      );
    } else {
      setCharActionMsg({ ok: false, text: res.message });
    }
  };

  const handleClearPk = async (char: OpenMuCharacter) => {
    setCharActionMsg(null);
    const res = await clearPkAction(char.name);
    if (res.success) {
      setCharActionMsg({ ok: true, text: res.message || t.login.pkClearSuccess });
      setCharacters((prev) =>
        prev.map((c) => (c.name === char.name ? { ...c, pkState: 3, pkLevel: "Normal" } : c))
      );
    } else {
      setCharActionMsg({ ok: false, text: res.message });
    }
  };

  const handleAddStats = async (char: OpenMuCharacter) => {
    setCharActionMsg(null);
    const totalToAdd =
      statsInput.str + statsInput.agi + statsInput.vit + statsInput.ene + statsInput.lead;

    if (totalToAdd <= 0) {
      setCharActionMsg({ ok: false, text: "Please enter points to allocate." });
      return;
    }

    if (totalToAdd > char.levelUpPoints) {
      setCharActionMsg({
        ok: false,
        text: `Not enough free points. Available: ${char.levelUpPoints}, Requested: ${totalToAdd}`,
      });
      return;
    }

    const res = await addStatsAction(char.name, statsInput);
    if (res.success) {
      setCharActionMsg({ ok: true, text: res.message || t.login.statsAddedSuccess });
      setCharacters((prev) =>
        prev.map((c) =>
          c.name === char.name
            ? {
                ...c,
                strength: c.strength + statsInput.str,
                agility: c.agility + statsInput.agi,
                vitality: c.vitality + statsInput.vit,
                energy: c.energy + statsInput.ene,
                leadership: c.leadership + statsInput.lead,
                levelUpPoints: c.levelUpPoints - totalToAdd,
              }
            : c
        )
      );
      setStatsInput({ str: 0, agi: 0, vit: 0, ene: 0, lead: 0 });
      setAddStatsTarget(null);
    } else {
      setCharActionMsg({ ok: false, text: res.message });
    }
  };

  const handleResetStats = async (char: OpenMuCharacter) => {
    setCharActionMsg(null);
    const res = await resetStatsAction(char.name, char.characterClassId);
    if (res.success) {
      setCharActionMsg({ ok: true, text: res.message || t.login.statsResetSuccess });
      const refunded =
        Math.max(0, char.strength - 20) +
        Math.max(0, char.agility - 20) +
        Math.max(0, char.vitality - 20) +
        Math.max(0, char.energy - 20) +
        Math.max(0, char.leadership - 20);

      setCharacters((prev) =>
        prev.map((c) =>
          c.name === char.name
            ? {
                ...c,
                strength: 20,
                agility: 20,
                vitality: 20,
                energy: 20,
                leadership: 20,
                levelUpPoints: c.levelUpPoints + refunded,
              }
            : c
        )
      );
    } else {
      setCharActionMsg({ ok: false, text: res.message });
    }
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!loggedInUser) return;
    setPassMsg(null);

    if (newPass.length < 6) {
      setPassMsg({ ok: false, text: "Password must be at least 6 characters." });
      return;
    }

    if (newPass !== repeatPass) {
      setPassMsg({ ok: false, text: "Passwords do not match." });
      return;
    }

    setPassLoading(true);
    const res = await changePasswordAction(loggedInUser, oldPass, newPass, repeatPass);
    setPassLoading(false);

    if (res.success) {
      setPassMsg({ ok: true, text: res.message || t.login.passSuccess });
      setOldPass("");
      setNewPass("");
      setRepeatPass("");
    } else {
      setPassMsg({ ok: false, text: res.message });
    }
  };

  const handleDonate = async () => {
    if (!loggedInUser) return;
    setDonateLoading(true);
    setDonateFeedback(null);
    const res = await topupDonate(loggedInUser, selectedPackageId, selectedChannel, donateAccountOrPhone);
    setDonateLoading(false);
    if (res.success) {
      if (typeof res.newCredits === "number") {
        setCredits(res.newCredits);
      } else if (res.addedCredits) {
        setCredits((prev) => prev + res.addedCredits!);
      }
      if (typeof res.newWcoin === "number") {
        setWcoin(res.newWcoin);
      } else if (res.addedWcoin) {
        setWcoin((prev) => prev + res.addedWcoin!);
      }
      setDonateFeedback({
        ok: true,
        text: res.message || t.login.donateSuccess,
        txnId: res.txnId,
        addedCredits: res.addedCredits,
        addedWcoin: res.addedWcoin,
      });
    } else {
      setDonateFeedback({
        ok: false,
        text: res.error || "Top-up failed. Please check your payment information and try again.",
      });
    }
  };

  const handleAdminGrant = async () => {
    if (!loggedInUser || loggedInUser.toLowerCase() !== "admin") return;
    const target = selectedTargetUser?.username || adminSearchQuery.trim();
    if (!target) {
      setAdminGrantFeedback({ ok: false, text: t.login.searchUserPlaceholder });
      return;
    }
    if (adminCreditsToAdd === 0 && adminWcoinToAdd === 0) {
      setAdminGrantFeedback({ ok: false, text: "Please enter Credits or WCoin greater than zero." });
      return;
    }
    setAdminGrantLoading(true);
    setAdminGrantFeedback(null);
    const res = await adminGrantBalance(loggedInUser, target, adminCreditsToAdd, adminWcoinToAdd, adminGrantNote);
    setAdminGrantLoading(false);
    if (res.success) {
      if (target.toLowerCase() === loggedInUser.toLowerCase()) {
        if (typeof res.newCredits === "number") setCredits(res.newCredits);
        if (typeof res.newWcoin === "number") setWcoin(res.newWcoin);
      }
      setSelectedTargetUser((prev) =>
        prev
          ? {
              ...prev,
              credits: (prev.credits || 0) + adminCreditsToAdd,
              wcoin: (prev.wcoin || 0) + adminWcoinToAdd,
            }
          : null
      );
      setAdminGrantFeedback({
        ok: true,
        text: res.message || t.login.grantSuccess,
      });
    } else {
      setAdminGrantFeedback({
        ok: false,
        text: res.error || "Failed to grant balance",
      });
    }
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    setPassword("");
    setError("");
    setExchangeFeedback(null);
    setCharActionMsg(null);
    setDonateFeedback(null);
    setAdminGrantFeedback(null);
    setSelectedTargetUser(null);
    setAdminSearchQuery("");
    setActiveTab("overview");
  };

  const isDarkLord = (char: OpenMuCharacter) => {
    const cid = char.characterClassId.toLowerCase();
    return (
      char.classId === "dl" ||
      char.classShort === "DL" ||
      char.classShort === "LE" ||
      cid.includes("-0010-") ||
      cid.includes("-0011-")
    );
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
      className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-4"
    >
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/85 backdrop-blur-md transition-opacity"
      />
      <div className="glass-strong gold-border-glow relative z-10 flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl p-5 sm:p-7">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-amber-400/20 blur-3xl"
        />
        <button
          onClick={onClose}
          aria-label={t.modal.close}
          className="glass absolute top-4 right-4 z-20 grid h-9 w-9 place-items-center rounded-lg text-slate-300 transition hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        {!loggedInUser ? (
          <div className="overflow-y-auto pr-1">
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
                  <ShieldCheck className="h-3.5 w-3.5" /> OpenMU S6E3 Engine
                </span>
                <span className="font-mono text-amber-300">{t.login.onlineRateValue}</span>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs font-medium text-rose-300">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              {/* Quick Test Accounts Grid (1 Admin + 5 Users) */}
              <div className="rounded-2xl border border-amber-400/20 bg-amber-500/[0.04] p-3 sm:p-3.5">
                <div className="mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                    <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                    บัญชีทดสอบระบบ (1 Admin + 5 Users)
                  </span>
                  <span className="text-[10px] text-slate-400">คลิกเพื่อกรอกทันที</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {TEST_ACCOUNTS.map((acc) => (
                    <button
                      key={acc.username}
                      type="button"
                      onClick={() => {
                        setUsername(acc.username);
                        setPassword(acc.password);
                        setError("");
                      }}
                      className={`flex flex-col text-left p-2 rounded-xl border transition ${
                        username === acc.username
                          ? "border-amber-400 bg-amber-400/20 shadow-sm"
                          : "border-white/10 bg-white/5 hover:border-amber-400/40 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-mono text-xs font-bold text-white truncate">{acc.username}</span>
                        <span
                          className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                            acc.role === "Admin"
                              ? "bg-rose-500/25 text-rose-300 border border-rose-500/50"
                              : "bg-amber-400/15 text-amber-300 border border-amber-400/30"
                          }`}
                        >
                          {acc.role}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 truncate mt-0.5">{acc.desc}</span>
                      <span className="text-[9px] text-amber-200/60 font-mono mt-0.5">
                        Pass: {acc.password}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

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
          </div>
        ) : (
          <div className="flex h-full flex-col overflow-hidden">
            {/* Header info */}
            <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-xl font-black text-white">{loggedInUser}</h3>
                  {loggedInUser?.toLowerCase() === "admin" ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/40 bg-rose-500/15 px-2.5 py-0.5 text-[10px] font-black text-rose-300">
                      <ShieldCheck className="h-3 w-3" /> GM / ADMINISTRATOR
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                      <Sparkles className="h-3 w-3" /> {t.login.statusActive}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">{t.login.welcomeBack}</p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-rose-500/20 hover:text-rose-300"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>{t.login.logoutBtn}</span>
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="mb-4 flex flex-wrap gap-1 rounded-xl bg-white/[0.04] p-1 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("overview")}
                className={`flex flex-1 min-w-[70px] items-center justify-center gap-1.5 rounded-lg py-2 px-2 font-bold transition whitespace-nowrap ${
                  activeTab === "overview"
                    ? "bg-amber-400/20 text-amber-300 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Coins className="h-3.5 w-3.5 shrink-0" />
                <span>{t.login.tabOverview}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("characters")}
                className={`flex flex-1 min-w-[70px] items-center justify-center gap-1.5 rounded-lg py-2 px-2 font-bold transition whitespace-nowrap ${
                  activeTab === "characters"
                    ? "bg-amber-400/20 text-amber-300 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Swords className="h-3.5 w-3.5 shrink-0" />
                <span>{t.login.tabCharacters}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("donate")}
                className={`flex flex-1 min-w-[90px] items-center justify-center gap-1.5 rounded-lg py-2 px-2 font-bold transition whitespace-nowrap ${
                  activeTab === "donate"
                    ? "bg-gradient-to-r from-amber-400/25 to-orange-500/25 text-amber-300 border border-amber-400/30 shadow-sm"
                    : "text-amber-200/70 hover:text-amber-200 hover:bg-white/[0.03]"
                }`}
              >
                <Wallet className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                <span>{t.login.tabDonate}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("security")}
                className={`flex flex-1 min-w-[70px] items-center justify-center gap-1.5 rounded-lg py-2 px-2 font-bold transition whitespace-nowrap ${
                  activeTab === "security"
                    ? "bg-amber-400/20 text-amber-300 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <KeyRound className="h-3.5 w-3.5 shrink-0" />
                <span>{t.login.tabSecurity}</span>
              </button>
              {loggedInUser?.toLowerCase() === "admin" && (
                <button
                  type="button"
                  onClick={() => setActiveTab("admin")}
                  className={`flex flex-1 min-w-[80px] items-center justify-center gap-1.5 rounded-lg py-2 px-2 font-bold transition whitespace-nowrap ${
                    activeTab === "admin"
                      ? "bg-rose-500/25 text-rose-300 border border-rose-500/40 shadow-sm"
                      : "text-rose-400/80 hover:text-rose-300 hover:bg-rose-500/10"
                  }`}
                >
                  <Award className="h-3.5 w-3.5 shrink-0 text-rose-400" />
                  <span>{t.login.tabAdmin}</span>
                </button>
              )}
            </div>

            {/* Notice */}
            <div className="mb-3 flex items-center gap-2 rounded-xl border border-sky-400/20 bg-sky-500/10 px-3 py-2 text-[11px] text-sky-200">
              <ShieldAlert className="h-4 w-4 shrink-0 text-sky-300" />
              <span>{t.login.disconnectNotice}</span>
            </div>

            {/* Tab 1: Overview & Credit Exchange */}
            {activeTab === "overview" && (
              <div className="overflow-y-auto pr-1 space-y-4">
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

                {/* Quick Donate / Top-up Action Card */}
                <div
                  onClick={() => setActiveTab("donate")}
                  className="group flex cursor-pointer items-center justify-between rounded-2xl border border-amber-400/30 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent p-3.5 transition hover:border-amber-400 hover:bg-amber-500/20"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="grid h-8 w-8 place-items-center rounded-xl bg-amber-400/20 text-amber-300 group-hover:scale-105 transition">
                      <Wallet className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                        <span>{t.login.tabDonate}</span>
                        <span className="rounded bg-gradient-to-r from-orange-500 to-amber-500 px-1.5 py-0.5 text-[9px] font-black text-slate-950">
                          +35% BONUS
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-300">
                        TrueMoney • PayPal • บัตรเครดิต รับโบนัสเท่ากัน 100%
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-amber-300 transition group-hover:translate-x-1" />
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
                    {exchanging
                      ? t.login.exchanging
                      : `${t.login.exchangeBtn} (${exchangeAmount} Credits → ${Math.floor(exchangeAmount * 0.5)} WCoin)`}
                  </button>
                </div>
              </div>
            )}

            {/* Tab 2: Character Management (OpenMU features) */}
            {activeTab === "characters" && (
              <div className="flex-1 overflow-y-auto pr-1 space-y-3">
                {charActionMsg && (
                  <div
                    className={`flex items-center gap-2 rounded-xl border p-2.5 text-xs font-medium ${
                      charActionMsg.ok
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                        : "border-rose-500/40 bg-rose-500/10 text-rose-300"
                    }`}
                  >
                    {charActionMsg.ok ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
                    )}
                    <span>{charActionMsg.text}</span>
                  </div>
                )}

                {charLoading ? (
                  <div className="flex items-center justify-center py-8 text-xs text-slate-400">
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin text-amber-400" /> Loading OpenMU characters…
                  </div>
                ) : characters.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">{t.login.noCharacters}</div>
                ) : (
                  characters.map((char) => (
                    <div
                      key={char.name}
                      className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-amber-400/30"
                    >
                      {/* Character Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="grid h-10 w-10 place-items-center rounded-xl border border-amber-400/40 bg-amber-400/10 font-black text-amber-300">
                            {char.classShort}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-display font-black text-white">{char.name}</span>
                              <span className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-amber-300 font-semibold">
                                {char.className}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-slate-400" /> {char.mapName}
                              </span>
                              <span>•</span>
                              <span
                                className={`font-semibold ${
                                  char.pkLevel === "Normal" ? "text-emerald-400" : "text-rose-400"
                                }`}
                              >
                                {t.login.charPkStatus}: {char.pkLevel}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Stats Summary Badges */}
                        <div className="flex items-center gap-2 text-xs">
                          <div className="rounded-lg bg-black/40 px-2.5 py-1 text-center border border-white/5">
                            <div className="text-[10px] text-slate-400">{t.login.charLevel}</div>
                            <div className="font-bold text-white">{char.lvl}</div>
                          </div>
                          <div className="rounded-lg bg-black/40 px-2.5 py-1 text-center border border-white/5">
                            <div className="text-[10px] text-slate-400">{t.login.charMaster}</div>
                            <div className="font-bold text-purple-300">{char.masterlvl}</div>
                          </div>
                          <div className="rounded-lg bg-black/40 px-2.5 py-1 text-center border border-white/5">
                            <div className="text-[10px] text-slate-400">{t.login.charResets}</div>
                            <div className="font-bold text-amber-300">{char.resets}</div>
                          </div>
                          <div className="rounded-lg bg-amber-500/10 px-2.5 py-1 text-center border border-amber-400/20">
                            <div className="text-[10px] text-amber-300/80">{t.login.charPoints}</div>
                            <div className="font-bold text-amber-300">{char.levelUpPoints}</div>
                          </div>
                        </div>
                      </div>

                      {/* Character Current Attributes */}
                      <div className="mt-3 grid grid-cols-5 gap-1.5 rounded-xl bg-black/30 p-2 text-center text-[11px]">
                        <div>
                          <span className="text-slate-400">STR:</span>{" "}
                          <span className="font-bold text-white">{char.strength}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">AGI:</span>{" "}
                          <span className="font-bold text-white">{char.agility}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">VIT:</span>{" "}
                          <span className="font-bold text-white">{char.vitality}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">ENE:</span>{" "}
                          <span className="font-bold text-white">{char.energy}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">LEAD:</span>{" "}
                          <span className="font-bold text-white">
                            {isDarkLord(char) ? char.leadership : "—"}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons from open-mu-web */}
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {/* Reset Character (lvl 400 requirement) */}
                        <button
                          type="button"
                          onClick={() => handleResetCharacter(char)}
                          className="flex items-center gap-1 rounded-lg border border-amber-400/30 bg-amber-500/15 px-3 py-1.5 text-xs font-bold text-amber-200 transition hover:bg-amber-500/25"
                        >
                          <RefreshCw className="h-3.5 w-3.5 text-amber-300" />
                          <span>{t.login.actionReset}</span>
                        </button>

                        {/* Add Stats Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setAddStatsTarget(addStatsTarget === char.name ? null : char.name);
                            setStatsInput({ str: 0, agi: 0, vit: 0, ene: 0, lead: 0 });
                          }}
                          className="flex items-center gap-1 rounded-lg border border-emerald-400/30 bg-emerald-500/15 px-3 py-1.5 text-xs font-bold text-emerald-200 transition hover:bg-emerald-500/25"
                        >
                          <PlusCircle className="h-3.5 w-3.5 text-emerald-300" />
                          <span>{t.login.actionAddStats}</span>
                        </button>

                        {/* Clear PK Button */}
                        <button
                          type="button"
                          onClick={() => handleClearPk(char)}
                          className="flex items-center gap-1 rounded-lg border border-rose-400/30 bg-rose-500/15 px-3 py-1.5 text-xs font-bold text-rose-200 transition hover:bg-rose-500/25"
                        >
                          <Skull className="h-3.5 w-3.5 text-rose-300" />
                          <span>{t.login.actionClearPk}</span>
                        </button>

                        {/* Reset Stats (refund) Button */}
                        <button
                          type="button"
                          onClick={() => handleResetStats(char)}
                          className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
                        >
                          <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
                          <span>{t.login.actionResetStats}</span>
                        </button>
                      </div>

                      {/* Expandable Add Stats Drawer */}
                      {addStatsTarget === char.name && (
                        <div className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3">
                          <div className="mb-2 flex items-center justify-between text-xs">
                            <span className="font-bold text-emerald-300">{t.login.actionAddStats}</span>
                            <span className="font-mono text-amber-300">
                              {t.login.remainingPoints}:{" "}
                              {char.levelUpPoints -
                                (statsInput.str +
                                  statsInput.agi +
                                  statsInput.vit +
                                  statsInput.ene +
                                  statsInput.lead)}
                            </span>
                          </div>

                          <div
                            className={`grid gap-2 ${
                              isDarkLord(char) ? "grid-cols-5" : "grid-cols-4"
                            }`}
                          >
                            <div>
                              <label className="text-[10px] text-slate-400">STR</label>
                              <input
                                type="number"
                                min={0}
                                value={statsInput.str || ""}
                                placeholder="0"
                                onChange={(e) =>
                                  setStatsInput((s) => ({ ...s, str: Math.max(0, Number(e.target.value)) }))
                                }
                                className="w-full rounded-lg border border-white/10 bg-black/40 py-1 text-center font-mono text-xs text-white"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400">AGI</label>
                              <input
                                type="number"
                                min={0}
                                value={statsInput.agi || ""}
                                placeholder="0"
                                onChange={(e) =>
                                  setStatsInput((s) => ({ ...s, agi: Math.max(0, Number(e.target.value)) }))
                                }
                                className="w-full rounded-lg border border-white/10 bg-black/40 py-1 text-center font-mono text-xs text-white"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400">VIT</label>
                              <input
                                type="number"
                                min={0}
                                value={statsInput.vit || ""}
                                placeholder="0"
                                onChange={(e) =>
                                  setStatsInput((s) => ({ ...s, vit: Math.max(0, Number(e.target.value)) }))
                                }
                                className="w-full rounded-lg border border-white/10 bg-black/40 py-1 text-center font-mono text-xs text-white"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400">ENE</label>
                              <input
                                type="number"
                                min={0}
                                value={statsInput.ene || ""}
                                placeholder="0"
                                onChange={(e) =>
                                  setStatsInput((s) => ({ ...s, ene: Math.max(0, Number(e.target.value)) }))
                                }
                                className="w-full rounded-lg border border-white/10 bg-black/40 py-1 text-center font-mono text-xs text-white"
                              />
                            </div>
                            {isDarkLord(char) && (
                              <div>
                                <label className="text-[10px] text-slate-400">LEAD</label>
                                <input
                                  type="number"
                                  min={0}
                                  value={statsInput.lead || ""}
                                  placeholder="0"
                                  onChange={(e) =>
                                    setStatsInput((s) => ({ ...s, lead: Math.max(0, Number(e.target.value)) }))
                                  }
                                  className="w-full rounded-lg border border-white/10 bg-black/40 py-1 text-center font-mono text-xs text-white"
                                />
                              </div>
                            )}
                          </div>

                          <div className="mt-3 flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setAddStatsTarget(null)}
                              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAddStats(char)}
                              className="rounded-lg bg-emerald-500 px-4 py-1.5 text-xs font-bold text-slate-950 transition hover:bg-emerald-400"
                            >
                              {t.login.applyPoints}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab 3: Security & Change Password */}
            {activeTab === "security" && (
              <div className="overflow-y-auto pr-1">
                <form onSubmit={handleChangePassword} className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                    <KeyRound className="h-4 w-4 text-amber-400" />
                    <span className="text-xs font-bold text-white">{t.login.tabSecurity}</span>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-300">
                      {t.login.oldPasswordLabel}
                    </label>
                    <input
                      required
                      type="password"
                      value={oldPass}
                      onChange={(e) => setOldPass(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-3 text-xs text-white focus:border-amber-400/60 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-300">
                      {t.login.newPasswordLabel}
                    </label>
                    <input
                      required
                      type="password"
                      minLength={6}
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-3 text-xs text-white focus:border-amber-400/60 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-300">
                      {t.login.repeatPasswordLabel}
                    </label>
                    <input
                      required
                      type="password"
                      minLength={6}
                      value={repeatPass}
                      onChange={(e) => setRepeatPass(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-3 text-xs text-white focus:border-amber-400/60 focus:outline-none"
                    />
                  </div>

                  {passMsg && (
                    <div
                      className={`flex items-center gap-2 rounded-xl border p-2.5 text-xs font-medium ${
                        passMsg.ok
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                          : "border-rose-500/40 bg-rose-500/10 text-rose-300"
                      }`}
                    >
                      {passMsg.ok ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
                      )}
                      <span>{passMsg.text}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={passLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-3 text-xs font-extrabold text-slate-950 transition hover:brightness-110 disabled:opacity-50"
                  >
                    <KeyRound className="h-4 w-4" />
                    {passLoading ? "Updating…" : t.login.changePassBtn}
                  </button>
                </form>
              </div>
            )}

            {/* Tab 4: Top-up / Donate with Harmonized Promotions */}
            {activeTab === "donate" && (
              <div className="overflow-y-auto pr-1 space-y-4">
                {/* Header Banner */}
                <div className="rounded-2xl border border-amber-400/30 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 p-4">
                  <div className="flex items-center gap-2">
                    <div className="grid h-8 w-8 place-items-center rounded-xl bg-amber-400/20 text-amber-300">
                      <Gift className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-display text-sm font-bold text-white">{t.login.donateTitle}</h4>
                      <p className="text-[11px] text-slate-300">{t.login.donateSub}</p>
                    </div>
                  </div>
                  {/* Harmonization callout */}
                  <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/15 px-3 py-2 text-[11px] font-semibold text-emerald-200">
                    <Sparkles className="h-4 w-4 shrink-0 text-emerald-400" />
                    <span>โปรโมชั่นสอดคล้องเท่าเทียมกันทุกช่องทาง (TrueMoney, PayPal, บัตรเครดิต รับโบนัสเท่ากัน 100%)</span>
                  </div>
                </div>

                {/* 1. Channel Selector */}
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-200">
                    {t.login.selectChannel}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedChannel("truemoney")}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition ${
                        selectedChannel === "truemoney"
                          ? "border-amber-400 bg-amber-400/20 shadow-md ring-1 ring-amber-400/50"
                          : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                      }`}
                    >
                      <QrCode className="h-5 w-5 mb-1 text-orange-400" />
                      <span className="text-xs font-bold text-white leading-tight">TrueMoney / QR</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">THB ฿ • ค่าธรรมเนียม 0%</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedChannel("paypal")}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition ${
                        selectedChannel === "paypal"
                          ? "border-amber-400 bg-amber-400/20 shadow-md ring-1 ring-amber-400/50"
                          : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                      }`}
                    >
                      <Wallet className="h-5 w-5 mb-1 text-sky-400" />
                      <span className="text-xs font-bold text-white leading-tight">PayPal</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">USD $ • สากลทั่วโลก</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedChannel("credit_card")}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition ${
                        selectedChannel === "credit_card"
                          ? "border-amber-400 bg-amber-400/20 shadow-md ring-1 ring-amber-400/50"
                          : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                      }`}
                    >
                      <CreditCard className="h-5 w-5 mb-1 text-purple-400" />
                      <span className="text-xs font-bold text-white leading-tight">บัตรเครดิต</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">Visa / Mastercard</span>
                    </button>
                  </div>
                </div>

                {/* 2. Package Selector */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-200">{t.login.selectPackage}</label>
                    <span className="text-[11px] text-amber-300 font-medium">โบนัสแถมฟรีสูงสุด +35%</span>
                  </div>
                  <div className="space-y-2">
                    {TOPUP_PACKAGES.map((pkg) => {
                      const isSelected = selectedPackageId === pkg.id;
                      return (
                        <div
                          key={pkg.id}
                          onClick={() => setSelectedPackageId(pkg.id)}
                          className={`relative cursor-pointer rounded-2xl border p-3.5 transition ${
                            isSelected
                              ? "border-amber-400 bg-amber-400/15 shadow-md ring-1 ring-amber-400/50"
                              : "border-white/10 bg-white/[0.03] hover:border-amber-400/40 hover:bg-white/[0.06]"
                          }`}
                        >
                          {pkg.popular && (
                            <div className="absolute -top-2.5 right-4 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-2.5 py-0.5 text-[9px] font-black uppercase text-slate-950 shadow-sm">
                              ★ แนะนำยอดนิยม (MOST POPULAR)
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`grid h-5 w-5 place-items-center rounded-full border transition ${
                                  isSelected
                                    ? "border-amber-400 bg-amber-400 text-slate-950"
                                    : "border-slate-500 bg-transparent text-transparent"
                                }`}
                              >
                                <Check className="h-3 w-3 stroke-[3]" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-white">{pkg.name}</span>
                                  <span className="rounded bg-amber-400/20 px-1.5 py-0.5 text-[10px] font-extrabold text-amber-300">
                                    {pkg.tag}
                                  </span>
                                </div>
                                <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px]">
                                  <span className="flex items-center gap-1 font-bold text-amber-300">
                                    <Coins className="h-3.5 w-3.5" />
                                    {pkg.totalCredits.toLocaleString()} Credits
                                    <span className="text-[10px] text-amber-200/60 font-normal">
                                      ({pkg.baseCredits} + {pkg.bonusCredits} แถม)
                                    </span>
                                  </span>
                                  <span className="text-slate-500">•</span>
                                  <span className="flex items-center gap-1 font-bold text-purple-300">
                                    <Gem className="h-3.5 w-3.5" />
                                    {pkg.totalWcoin.toLocaleString()} WCoin
                                    <span className="text-[10px] text-purple-200/60 font-normal">
                                      ({pkg.baseWcoin} + {pkg.bonusWcoin} แถม)
                                    </span>
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="font-display text-base font-black text-white">
                                {selectedChannel === "paypal"
                                  ? `$${pkg.priceUsd.toFixed(2)}`
                                  : `฿${pkg.priceThb.toLocaleString()}`}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {selectedChannel === "paypal" ? `~฿${pkg.priceThb}` : `$${pkg.priceUsd.toFixed(2)} USD`}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Payment Details Field */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-300">
                      {selectedChannel === "truemoney"
                        ? "เบอร์ TrueMoney Wallet หรือ เบอร์พร้อมเพย์"
                        : selectedChannel === "paypal"
                        ? "อีเมลบัญชี PayPal"
                        : "ข้อมูลบัตรเครดิต / เดบิต"}
                    </label>
                    <input
                      type="text"
                      value={donateAccountOrPhone}
                      onChange={(e) => setDonateAccountOrPhone(e.target.value)}
                      placeholder={
                        selectedChannel === "truemoney"
                          ? "08X-XXX-XXXX"
                          : selectedChannel === "paypal"
                          ? "paypal-account@example.com"
                          : "4242 •••• •••• 4242"
                      }
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-3 text-xs text-white placeholder-slate-500 focus:border-amber-400/60 focus:outline-none"
                    />
                  </div>

                  {donateFeedback && (
                    <div
                      className={`flex flex-col gap-1 rounded-xl border p-3 text-xs ${
                        donateFeedback.ok
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                          : "border-rose-500/40 bg-rose-500/10 text-rose-300"
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold">
                        {donateFeedback.ok ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
                        )}
                        <span>{donateFeedback.text}</span>
                      </div>
                      {donateFeedback.txnId && (
                        <div className="mt-1 flex items-center justify-between text-[11px] text-emerald-200/80 border-t border-emerald-500/20 pt-1.5 font-mono">
                          <span>เลขที่รายการ: {donateFeedback.txnId}</span>
                          <span>+{donateFeedback.addedCredits} Credits • +{donateFeedback.addedWcoin} WCoin</span>
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={donateLoading}
                    onClick={handleDonate}
                    className="btn-shine flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 px-4 py-3 text-xs font-extrabold text-slate-950 shadow-md transition hover:brightness-110 disabled:opacity-50"
                  >
                    <Wallet className="h-4 w-4" />
                    {donateLoading ? "กำลังดำเนินการชำระเงิน…" : t.login.btnDonateNow}
                  </button>
                </div>
              </div>
            )}

            {/* Tab 5: Admin GM Management (Grant Balance + Autocomplete) */}
            {activeTab === "admin" && loggedInUser?.toLowerCase() === "admin" && (
              <div className="overflow-y-auto pr-1 space-y-4">
                {/* Header Banner */}
                <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4">
                  <div className="flex items-center gap-2">
                    <div className="grid h-8 w-8 place-items-center rounded-xl bg-rose-500/20 text-rose-300">
                      <Award className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-display text-sm font-bold text-white">{t.login.adminTitle}</h4>
                      <p className="text-[11px] text-slate-300">{t.login.adminSub}</p>
                    </div>
                  </div>
                </div>

                {/* Autocomplete User Search */}
                <div className="relative">
                  <label className="mb-1.5 block text-xs font-bold text-slate-200">
                    ค้นหาผู้เล่น (Autocomplete Search)
                  </label>
                  <div className="relative">
                    <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={adminSearchQuery}
                      onChange={(e) => {
                        setAdminSearchQuery(e.target.value);
                        setShowSearchDropdown(true);
                      }}
                      onFocus={() => setShowSearchDropdown(true)}
                      placeholder={t.login.searchUserPlaceholder}
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pr-4 pl-10 text-xs text-white placeholder-slate-500 focus:border-rose-400/60 focus:outline-none"
                    />
                    {isSearchingUsers && (
                      <div className="absolute top-1/2 right-3 -translate-y-1/2 text-[10px] text-slate-400">
                        กำลังค้นหา…
                      </div>
                    )}
                  </div>

                  {/* Autocomplete Dropdown */}
                  {showSearchDropdown && adminSearchResults.length > 0 && (
                    <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-48 overflow-y-auto rounded-xl border border-white/10 bg-slate-900/95 p-1 shadow-2xl backdrop-blur-md">
                      <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        ผลการค้นหา ({adminSearchResults.length} รายการ)
                      </div>
                      {adminSearchResults.map((u) => (
                        <button
                          key={u.username}
                          type="button"
                          onClick={() => {
                            setSelectedTargetUser(u);
                            setAdminSearchQuery(u.username);
                            setShowSearchDropdown(false);
                          }}
                          className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition ${
                            selectedTargetUser?.username === u.username
                              ? "bg-rose-500/25 text-white"
                              : "text-slate-300 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold">{u.username}</span>
                            <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-semibold text-slate-300">
                              {u.role}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] font-mono">
                            <span className="text-amber-300">{u.credits} Cr</span>
                            <span className="text-slate-500">•</span>
                            <span className="text-purple-300">{u.wcoin} WC</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Quick User Chips */}
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] text-slate-400">เลือกด่วน:</span>
                    {TEST_ACCOUNTS.filter((acc) => acc.username !== "admin").map((acc) => (
                      <button
                        key={acc.username}
                        type="button"
                        onClick={() => {
                          setSelectedTargetUser({
                            username: acc.username,
                            role: acc.role,
                            credits: 350,
                            wcoin: 150,
                          });
                          setAdminSearchQuery(acc.username);
                          setShowSearchDropdown(false);
                        }}
                        className={`rounded-lg border px-2 py-0.5 text-[10px] font-mono transition ${
                          selectedTargetUser?.username === acc.username
                            ? "border-rose-400 bg-rose-500/20 text-rose-300"
                            : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20"
                        }`}
                      >
                        {acc.username}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected User Details Card */}
                {selectedTargetUser && (
                  <div className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="grid h-8 w-8 place-items-center rounded-xl bg-rose-500/20 text-rose-300">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{selectedTargetUser.username}</span>
                            <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[9px] font-semibold text-rose-300">
                              {selectedTargetUser.role}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400">{t.login.selectedUserLabel}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-right">
                        <div>
                          <div className="text-[10px] text-amber-200/70">Credits ปัจจุบัน</div>
                          <div className="font-mono text-xs font-bold text-amber-300">
                            {selectedTargetUser.credits?.toLocaleString() ?? 0}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-purple-200/70">WCoin ปัจจุบัน</div>
                          <div className="font-mono text-xs font-bold text-purple-300">
                            {selectedTargetUser.wcoin?.toLocaleString() ?? 0}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Inputs for Credits & WCoin to Add */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-amber-300">
                      {t.login.creditsToAddLabel}
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={50}
                      value={adminCreditsToAdd || ""}
                      onChange={(e) => setAdminCreditsToAdd(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      placeholder="500"
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-3 text-xs text-white font-mono focus:border-amber-400/60 focus:outline-none"
                    />
                    <div className="mt-1.5 flex gap-1">
                      {[100, 500, 1000, 5000].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setAdminCreditsToAdd(amt)}
                          className="flex-1 rounded-md border border-white/10 bg-white/5 py-1 text-[10px] font-mono text-slate-300 hover:border-amber-400/40 hover:text-amber-300"
                        >
                          +{amt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-purple-300">
                      {t.login.wcoinToAddLabel}
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={50}
                      value={adminWcoinToAdd || ""}
                      onChange={(e) => setAdminWcoinToAdd(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      placeholder="200"
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-3 text-xs text-white font-mono focus:border-purple-400/60 focus:outline-none"
                    />
                    <div className="mt-1.5 flex gap-1">
                      {[50, 200, 500, 2000].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setAdminWcoinToAdd(amt)}
                          className="flex-1 rounded-md border border-white/10 bg-white/5 py-1 text-[10px] font-mono text-slate-300 hover:border-purple-400/40 hover:text-purple-300"
                        >
                          +{amt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Reason / Note input */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-300">
                    {t.login.grantReasonLabel}
                  </label>
                  <input
                    type="text"
                    value={adminGrantNote}
                    onChange={(e) => setAdminGrantNote(e.target.value)}
                    placeholder="เช่น รางวัลกิจกรรม, ผู้ชนะวอร์ปราสาท, โบนัสชดเชย…"
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-3 text-xs text-white placeholder-slate-500 focus:border-rose-400/60 focus:outline-none"
                  />
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {["Castle Siege Champion", "PvP Tournament Winner", "Event GM Reward", "Donation Adjustment"].map(
                      (preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setAdminGrantNote(preset)}
                          className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] text-slate-400 hover:text-white"
                        >
                          {preset}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {adminGrantFeedback && (
                  <div
                    className={`flex items-center gap-2 rounded-xl border p-3 text-xs font-medium ${
                      adminGrantFeedback.ok
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                        : "border-rose-500/40 bg-rose-500/10 text-rose-300"
                    }`}
                  >
                    {adminGrantFeedback.ok ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
                    )}
                    <span>{adminGrantFeedback.text}</span>
                  </div>
                )}

                <button
                  type="button"
                  disabled={adminGrantLoading}
                  onClick={handleAdminGrant}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 via-red-500 to-amber-500 px-4 py-3 text-xs font-extrabold text-white shadow-lg transition hover:brightness-110 disabled:opacity-50"
                >
                  <Sparkles className="h-4 w-4" />
                  {adminGrantLoading ? "กำลังเพิ่มยอดให้ผู้เล่น…" : t.login.btnGrant}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
