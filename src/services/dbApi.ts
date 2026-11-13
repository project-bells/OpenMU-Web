export interface RealmData {
  id?: number | string;
  name: string;
  serverName?: string;
  online: number;
  max: number;
  capacity?: number;
  onlineCount?: number;
  load?: number;
  loadPct?: number;
  pvp?: boolean;
  status: string;
  ping?: number;
  isOnline?: boolean;
  experienceRate?: number;
}

export interface ServerStatusData {
  status: string;
  serverName?: string;
  uptime?: string;
  totalOnline: number;
  onlineCount?: number;
  maxPlayers?: number;
  totalAccounts?: number;
  totalCharacters?: number;
  totalGuilds?: number;
  uptimeSeconds?: number;
  updatedAt?: string;
  servers?: RealmData[];
  realms?: RealmData[];
  dataSource?: string;
}

export interface ClassInfo {
  id: string;
  name: string;
  short: string;
  color: string;
  badge: string;
}

export interface CharacterRankItem {
  rank: number;
  name: string;
  classId: string;
  className: string;
  classShort: string;
  classColor?: string;
  classBadge?: string;
  level: number;
  masterLevel?: number;
  resets: number;
  grandResets?: number;
  guild?: string;
  guildName?: string;
  map?: string;
  online?: boolean;
  isOnline?: boolean;
  pkCount?: number;
}

export interface GuildRankItem {
  rank: number;
  name: string;
  master: string;
  score: number;
  members: number;
  memberCount?: number;
  maxMembers?: number;
  totalResets?: number;
  siegeStatus?: string;
  alliance?: string;
  logo?: string;
}

export interface OpenMuCharacter {
  id?: string;
  name: string;
  characterClassId: string;
  className: string;
  classShort: string;
  classId: string;
  lvl: number;
  masterlvl: number;
  resets: number;
  levelUpPoints: number;
  strength: number;
  agility: number;
  vitality: number;
  energy: number;
  leadership: number;
  currentMapId: string;
  mapName: string;
  pkState: number;
  pkLevel: string;
  playerKillCount?: number;
  zen?: number;
  isOnline: boolean;
}

export interface AccountProfile {
  loginName: string;
  email: string;
  state: string;
  isOnline: boolean;
  onlineTimeSeconds: number;
  credits: number;
  wcoin: number;
  pendingWcoin?: number;
  wcoinP?: number;
  goblinPoints?: number;
  lastLoginAt?: string | null;
  createdAt?: string | null;
  role?: string;
  characters?: OpenMuCharacter[];
}

export interface WalletState {
  loginName: string;
  credits: number;
  redeemedOnlineSeconds: number;
  updatedAt?: string | null;
}

export interface WalletLedgerEntry {
  id: string;
  loginName: string;
  entryType: string;
  amount: number;
  balanceAfter: number;
  referenceType: string;
  referenceId: string;
  description: string;
  createdAt: string;
}

export interface OnlineTimeRedemptionRecord {
  id: string;
  loginName: string;
  hoursRedeemed: number;
  secondsConsumed: number;
  creditsAwarded: number;
  checkpointSecondsAfter: number;
  createdAt: string;
}

export interface CreditExchangeRecord {
  id: string;
  loginName: string;
  creditsSpent: number;
  wcoinGranted: number;
  coinType: string;
  status: string;
  openmuReference: string;
  errorMessage?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TopupPackage {
  id: string;
  name: string;
  tag?: string;
  priceThb: number;
  priceUsd?: number;
  credits?: number;
  baseCredits?: number;
  bonusCredits: number;
  totalCredits?: number;
  baseWcoin?: number;
  bonusWcoin: number;
  totalWcoin?: number;
  bonusPct?: number;
  popular?: boolean;
  badge?: string;
  description?: string;
}

export interface TopupOrderRecord {
  id: string;
  orderCode?: string;
  loginName: string;
  packageId: string;
  packageName?: string;
  provider: "promptpay_manual" | "paypal" | "webhook_hmac" | "dev_sandbox" | string;
  providerOrderId?: string | null;
  providerTransactionId?: string | null;
  amountThb: number;
  creditsToGrant: number;
  wcoinToGrant: number;
  creditsAmount?: number;
  wcoinAmount?: number;
  status: string;
  paymentUrl?: string | null;
  qrPayload?: string | null;
  checkoutPayload?: {
    qrPayload?: string | null;
    approveUrl?: string | null;
    accountName?: string | null;
    instructions?: string | null;
  } | null;
  expiresAt?: string | null;
  paidAt?: string | null;
  fulfilledAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TopupProvidersInfo {
  promptpayManual: { enabled: boolean };
  paypal: { enabled: boolean; mode?: string };
  webhookHmac: { enabled: boolean };
  devSandbox: { enabled: boolean };
}

export interface PlayerSessionSummary {
  authenticated: boolean;
  account: AccountProfile;
  characters: OpenMuCharacter[];
  wallet: WalletState;
  ledger: WalletLedgerEntry[];
  redemptions: OnlineTimeRedemptionRecord[];
  exchanges: CreditExchangeRecord[];
  orders: TopupOrderRecord[];
  onlineRewardConfig?: {
    secondsPerHour: number;
    creditsPerHour: number;
    availableOnlineSeconds: number;
    availableHours: number;
  };
  exchangeConfig?: {
    creditsPerUnit: number;
    wcoinPerUnit: number;
  };
}

export interface AccountLoginResult {
  success: boolean;
  account?: string;
  credits?: number;
  wcoin?: number;
  pendingWcoin?: number;
  onlineHours?: number;
  onlineSeconds?: number;
  email?: string;
  characters?: OpenMuCharacter[];
  summary?: PlayerSessionSummary;
  error?: string;
  code?: string;
}

export interface OnlineTimeRedeemResult {
  success: boolean;
  idempotent?: boolean;
  redemption?: OnlineTimeRedemptionRecord;
  wallet?: WalletState;
  account?: AccountProfile;
  authoritativeOnlineSeconds?: number;
  availableOnlineSecondsAfter?: number;
  availableHoursAfter?: number;
  summary?: PlayerSessionSummary;
  error?: string;
}

export interface ExchangeResult {
  success: boolean;
  idempotent?: boolean;
  status?: string;
  exchange?: CreditExchangeRecord;
  wallet?: WalletState;
  account?: AccountProfile;
  deductedCredits?: number;
  remainingCredits?: number;
  wcoinReceived?: number;
  newWcoinBalance?: number;
  summary?: PlayerSessionSummary;
  error?: string;
}

export interface UserSearchItem {
  loginName: string;
  username: string;
  email: string;
  state: string;
  role: string;
  credits: number;
  wcoin: number;
  pendingWcoin?: number;
  onlineTimeSeconds?: number;
  isOnline?: boolean;
  charactersCount?: number;
  characters?: string;
  lastLoginAt?: string | null;
  createdAt?: string | null;
}

export interface AdminSessionInfo {
  authenticated: boolean;
  admin: {
    loginName: string;
    roles: string[];
  };
}

export interface AdminAuditLogEntry {
  id: string;
  actorLogin: string;
  targetLogin?: string | null;
  action: string;
  details: string;
  createdAt: string;
}

export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function createIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `idem-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

async function apiJson<T>(url: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  const res = await fetch(url, {
    ...init,
    headers,
    credentials: "include",
  });

  const text = await res.text();
  let data: any = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
  }

  if (!res.ok) {
    throw new ApiError(
      res.status,
      data?.code || `HTTP_${res.status}`,
      data?.error || data?.message || `HTTP Error ${res.status}`,
      data
    );
  }

  return data as T;
}

export const OPENMU_MAPS: Record<string, string> = {
  "00000300-0000-0000-0000-000000000000": "Lorencia",
  "00000300-0001-0000-0000-000000000000": "Dungeon",
  "00000300-0002-0000-0000-000000000000": "Devias",
  "00000300-0003-0000-0000-000000000000": "Noria",
  "00000300-0004-0000-0000-000000000000": "Lost Tower",
  "00000300-0005-0000-0000-000000000000": "Exile",
  "00000300-0006-0000-0000-000000000000": "Arena / Stadium",
  "00000300-0007-0000-0000-000000000000": "Atlans",
  "00000300-0008-0000-0000-000000000000": "Tarkan",
  "00000300-000a-0000-0000-000000000000": "Icarus",
  "00000300-001e-0000-0000-000000000000": "Valley of Loren",
  "00000300-001f-0000-0000-000000000000": "Land of Trials",
  "00000300-0021-0000-0000-000000000000": "Aida",
  "00000300-0022-0000-0000-000000000000": "Crywolf Fortress",
  "00000300-0025-0000-0000-000000000000": "Kanturu I",
  "00000300-0026-0000-0000-000000000000": "Kanturu Relics",
  "00000300-0033-0000-0000-000000000000": "Elbeland",
  "00000300-0038-0000-0000-000000000000": "Swamp of Calmness",
  "00000300-0039-0000-0000-000000000000": "LaCleon",
  "00000300-003f-0000-0000-000000000000": "Vulcanus",
  "00000300-004f-0000-0000-000000000000": "Loren Market",
  "00000300-0050-0000-0000-000000000000": "Karutan 1",
  "00000300-0051-0000-0000-000000000000": "Karutan 2",
};

export function getMapName(mapGuidOrNumber?: string | number): string {
  if (!mapGuidOrNumber && mapGuidOrNumber !== 0) return "Lorencia";
  const str = String(mapGuidOrNumber).toLowerCase();
  if (OPENMU_MAPS[str]) return OPENMU_MAPS[str];
  const num = Number(mapGuidOrNumber);
  const numMaps: Record<number, string> = {
    0: "Lorencia",
    1: "Dungeon",
    2: "Devias",
    3: "Noria",
    4: "Lost Tower",
    6: "Arena",
    7: "Atlans",
    8: "Tarkan",
    10: "Icarus",
    30: "Valley of Loren",
    31: "Land of Trials",
    33: "Aida",
    34: "Crywolf",
    37: "Kanturu",
    51: "Elbeland",
  };
  return numMaps[num] || String(mapGuidOrNumber || "Lorencia");
}

export function resolveCharacterClass(raw: unknown): ClassInfo {
  const num = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isNaN(num)) {
    if (num >= 0 && num <= 3) return { id: "DW", name: "Dark Wizard", short: "DW", color: "text-sky-400", badge: "bg-sky-500/20 text-sky-300 border-sky-400/40" };
    if (num >= 16 && num <= 19) return { id: "DK", name: "Dark Knight", short: "DK", color: "text-rose-400", badge: "bg-rose-500/20 text-rose-300 border-rose-400/40" };
    if (num >= 32 && num <= 35) return { id: "ELF", name: "Fairy Elf", short: "ELF", color: "text-emerald-400", badge: "bg-emerald-500/20 text-emerald-300 border-emerald-400/40" };
    if (num >= 48 && num <= 51) return { id: "MG", name: "Magic Gladiator", short: "MG", color: "text-purple-400", badge: "bg-purple-500/20 text-purple-300 border-purple-400/40" };
    if (num >= 64 && num <= 67) return { id: "DL", name: "Dark Lord", short: "DL", color: "text-amber-400", badge: "bg-amber-500/20 text-amber-300 border-amber-400/40" };
    if (num >= 80 && num <= 83) return { id: "SUM", name: "Summoner", short: "SUM", color: "text-fuchsia-400", badge: "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-400/40" };
    if (num >= 96 && num <= 99) return { id: "RF", name: "Rage Fighter", short: "RF", color: "text-orange-400", badge: "bg-orange-500/20 text-orange-300 border-orange-400/40" };
  }
  const s = String(raw ?? "").toLowerCase();
  if (s.includes("wizard") || s.includes("soul") || s === "dw" || s === "sm" || s === "gm") {
    return { id: "DW", name: "Dark Wizard", short: "DW", color: "text-sky-400", badge: "bg-sky-500/20 text-sky-300 border-sky-400/40" };
  }
  if (s.includes("knight") || s.includes("blade") || s === "dk" || s === "bk" || s === "bm") {
    return { id: "DK", name: "Dark Knight", short: "DK", color: "text-rose-400", badge: "bg-rose-500/20 text-rose-300 border-rose-400/40" };
  }
  if (s.includes("elf") || s.includes("muse") || s === "elf" || s === "me" || s === "he") {
    return { id: "ELF", name: "Fairy Elf", short: "ELF", color: "text-emerald-400", badge: "bg-emerald-500/20 text-emerald-300 border-emerald-400/40" };
  }
  if (s.includes("gladiator") || s.includes("duel") || s === "mg" || s === "dm") {
    return { id: "MG", name: "Magic Gladiator", short: "MG", color: "text-purple-400", badge: "bg-purple-500/20 text-purple-300 border-purple-400/40" };
  }
  if (s.includes("lord") || s.includes("emperor") || s === "dl" || s === "le") {
    return { id: "DL", name: "Dark Lord", short: "DL", color: "text-amber-400", badge: "bg-amber-500/20 text-amber-300 border-amber-400/40" };
  }
  if (s.includes("summon") || s.includes("dimension") || s === "sum" || s === "bs") {
    return { id: "SUM", name: "Summoner", short: "SUM", color: "text-fuchsia-400", badge: "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-400/40" };
  }
  if (s.includes("fighter") || s.includes("fist") || s === "rf" || s === "fm") {
    return { id: "RF", name: "Rage Fighter", short: "RF", color: "text-orange-400", badge: "bg-orange-500/20 text-orange-300 border-orange-400/40" };
  }
  return { id: "DK", name: String(raw || "Warrior"), short: "DK", color: "text-slate-300", badge: "bg-slate-500/20 text-slate-300 border-slate-400/40" };
}

export const TOPUP_PACKAGES: TopupPackage[] = [
  {
    id: "tier-50",
    name: "Starter Pack",
    tag: "+10% Bonus",
    priceThb: 50,
    priceUsd: 1.5,
    baseCredits: 250,
    credits: 250,
    bonusCredits: 25,
    totalCredits: 275,
    baseWcoin: 50,
    bonusWcoin: 10,
    totalWcoin: 60,
    bonusPct: 10,
    description: "แพ็กเกจเริ่มต้นสำหรับนักผจญภัยหน้าใหม่",
  },
  {
    id: "tier-150",
    name: "Adventurer Pack",
    tag: "+15% Bonus",
    priceThb: 150,
    priceUsd: 4.5,
    baseCredits: 800,
    credits: 800,
    bonusCredits: 120,
    totalCredits: 920,
    baseWcoin: 200,
    bonusWcoin: 50,
    totalWcoin: 250,
    bonusPct: 15,
    description: "คุ้มค่าสำหรับเก็บเลเวลและหาของ",
  },
  {
    id: "tier-300",
    name: "Hero Choice",
    tag: "+20% Most Popular",
    priceThb: 300,
    priceUsd: 9.0,
    baseCredits: 1800,
    credits: 1800,
    bonusCredits: 360,
    totalCredits: 2160,
    baseWcoin: 500,
    bonusWcoin: 150,
    totalWcoin: 650,
    bonusPct: 20,
    popular: true,
    badge: "MOST POPULAR",
    description: "แพ็กเกจยอดนิยม พร้อมโบนัส WCoinC สำหรับ Item Mall",
  },
  {
    id: "tier-500",
    name: "Champion Bundle",
    tag: "+25% Mega Value",
    priceThb: 500,
    priceUsd: 15.0,
    baseCredits: 3200,
    credits: 3200,
    bonusCredits: 800,
    totalCredits: 4000,
    baseWcoin: 1000,
    bonusWcoin: 350,
    totalWcoin: 1350,
    bonusPct: 25,
    badge: "+25% VALUE",
    description: "จัดเต็มสำหรับสาย PvP และกิลด์วอร์",
  },
  {
    id: "tier-1000",
    name: "Emperor VIP Pack",
    tag: "+35% Max Value + VIP",
    priceThb: 1000,
    priceUsd: 30.0,
    baseCredits: 7000,
    credits: 7000,
    bonusCredits: 2450,
    totalCredits: 9450,
    baseWcoin: 2500,
    bonusWcoin: 1000,
    totalWcoin: 3500,
    bonusPct: 35,
    badge: "+35% VIP MAX",
    description: "คุ้มสุดขีดระดับราชา รับ Credits & WCoinC สูงสุด",
  },
];

export function normalizeTopupPackage(raw: any): TopupPackage {
  const priceThb = Number(raw?.priceThb ?? 0);
  const baseCredits = Number(raw?.baseCredits ?? raw?.credits ?? 0);
  const bonusCredits = Number(raw?.bonusCredits ?? 0);
  const totalCredits = Number(raw?.totalCredits ?? baseCredits + bonusCredits);
  const baseWcoin = Number(raw?.baseWcoin ?? 0);
  const bonusWcoin = Number(raw?.bonusWcoin ?? 0);
  const totalWcoin = Number(raw?.totalWcoin ?? baseWcoin + bonusWcoin);
  return {
    id: String(raw?.id ?? ""),
    name: String(raw?.name ?? ""),
    tag: raw?.tag ?? raw?.badge ?? undefined,
    priceThb,
    priceUsd: Number(raw?.priceUsd ?? Math.round((priceThb / 33) * 100) / 100),
    credits: baseCredits,
    baseCredits,
    bonusCredits,
    totalCredits,
    baseWcoin,
    bonusWcoin,
    totalWcoin,
    bonusPct: Number(raw?.bonusPct ?? 0),
    popular: Boolean(raw?.popular),
    badge: raw?.badge ?? raw?.tag ?? undefined,
    description: raw?.description ?? raw?.tag ?? "",
  };
}

export function normalizeTopupOrder(raw: any): TopupOrderRecord {
  const payload = raw?.checkoutPayload || {};
  return {
    ...raw,
    creditsToGrant: Number(raw?.creditsToGrant ?? raw?.creditsAmount ?? 0),
    wcoinToGrant: Number(raw?.wcoinToGrant ?? raw?.wcoinAmount ?? 0),
    paymentUrl: raw?.paymentUrl ?? payload?.approvalUrl ?? payload?.approveUrl ?? null,
    qrPayload: raw?.qrPayload ?? payload?.qrPayload ?? null,
  };
}

export function normalizePlayerSummary(raw: any): PlayerSessionSummary {
  const rawAcc = raw?.account || {};
  const rawWallet = raw?.wallet || {};
  const creditsBalance = Number(
    rawWallet?.credits ?? rawWallet?.creditsBalance ?? rawAcc?.credits ?? rawAcc?.creditsBalance ?? 0
  );
  const wcoinC = Number(rawAcc?.wcoin ?? rawAcc?.wcoinC ?? 0);
  const pendingWcoin = Number(rawAcc?.pendingWcoin ?? rawAcc?.pendingWCoinC ?? 0);
  const characters = Array.isArray(raw?.characters) ? raw.characters : Array.isArray(rawAcc?.characters) ? rawAcc.characters : [];
  const redeemedOnlineSeconds = Number(
    rawWallet?.redeemedOnlineSeconds ?? rawAcc?.redeemedOnlineSeconds ?? 0
  );
  const onlineTimeSeconds = Number(rawAcc?.onlineTimeSeconds ?? 0);
  const availableOnlineSeconds = Math.max(0, onlineTimeSeconds - redeemedOnlineSeconds);

  const account: AccountProfile = {
    loginName: String(rawAcc?.loginName ?? ""),
    email: String(rawAcc?.email ?? rawAcc?.eMail ?? ""),
    state: String(rawAcc?.state ?? "Normal"),
    isOnline: Boolean(rawAcc?.isOnline ?? rawAcc?.online ?? false),
    onlineTimeSeconds,
    credits: creditsBalance,
    wcoin: wcoinC,
    pendingWcoin,
    wcoinP: Number(rawAcc?.wcoinP ?? 0),
    goblinPoints: Number(rawAcc?.goblinPoints ?? 0),
    lastLoginAt: rawAcc?.lastLoginAt ?? null,
    createdAt: rawAcc?.createdAt ?? null,
    role: rawAcc?.role ?? "Player",
    characters,
  };

  const wallet: WalletState = {
    loginName: String(rawWallet?.loginName ?? account.loginName),
    credits: creditsBalance,
    redeemedOnlineSeconds,
    updatedAt: rawWallet?.updatedAt ?? null,
  };

  const ledger: WalletLedgerEntry[] = (Array.isArray(raw?.ledger) ? raw.ledger : []).map((e: any) => ({
    id: String(e.id ?? ""),
    loginName: String(e.loginName ?? account.loginName),
    entryType: String(e.entryType ?? ""),
    amount: Number(e.amount ?? e.deltaCredits ?? 0),
    balanceAfter: Number(e.balanceAfter ?? 0),
    referenceType: String(e.referenceType ?? ""),
    referenceId: String(e.referenceId ?? ""),
    description: String(e.description ?? ""),
    createdAt: String(e.createdAt ?? ""),
  }));

  const redemptions: OnlineTimeRedemptionRecord[] = (Array.isArray(raw?.redemptions) ? raw.redemptions : []).map((r: any) => {
    const before = Number(r.redeemedBeforeSeconds ?? 0);
    const after = Number(r.redeemedAfterSeconds ?? r.checkpointSecondsAfter ?? 0);
    return {
      id: String(r.id ?? ""),
      loginName: String(r.loginName ?? account.loginName),
      hoursRedeemed: Number(r.hoursRedeemed ?? 0),
      secondsConsumed: Number(r.secondsConsumed ?? Math.max(0, after - before)),
      creditsAwarded: Number(r.creditsAwarded ?? r.creditsGranted ?? 0),
      checkpointSecondsAfter: after,
      createdAt: String(r.createdAt ?? ""),
    };
  });

  const exchanges: CreditExchangeRecord[] = (Array.isArray(raw?.exchanges) ? raw.exchanges : []).map((x: any) => ({
    id: String(x.id ?? ""),
    loginName: String(x.loginName ?? account.loginName),
    creditsSpent: Number(x.creditsSpent ?? 0),
    wcoinGranted: Number(x.wcoinGranted ?? x.wcoinAmount ?? 0),
    coinType: String(x.coinType ?? "WCoinC"),
    status: String(x.status ?? ""),
    openmuReference: String(x.openmuReference ?? ""),
    errorMessage: x.errorMessage ?? x.lastError ?? null,
    createdAt: String(x.createdAt ?? ""),
    updatedAt: String(x.updatedAt ?? ""),
  }));

  const orders: TopupOrderRecord[] = (Array.isArray(raw?.orders) ? raw.orders : []).map(normalizeTopupOrder);

  return {
    authenticated: Boolean(raw?.authenticated ?? true),
    account,
    characters,
    wallet,
    ledger,
    redemptions,
    exchanges,
    orders,
    onlineRewardConfig: raw?.onlineRewardConfig ?? {
      secondsPerHour: 3600,
      creditsPerHour: 5,
      availableOnlineSeconds,
      availableHours: Math.floor(availableOnlineSeconds / 3600),
    },
    exchangeConfig: raw?.exchangeConfig ?? {
      creditsPerUnit: 100,
      wcoinPerUnit: 50,
    },
  };
}

export function normalizeCharacterRankItem(raw: any, idx = 0): CharacterRankItem {
  const cls = resolveCharacterClass(raw.classShort ?? raw.classId ?? raw.className ?? raw.characterClass);
  return {
    rank: Number(raw.rank ?? idx + 1),
    name: String(raw.name ?? "-"),
    classId: cls.id,
    className: String(raw.className ?? cls.name),
    classShort: String(raw.classShort ?? cls.short),
    classColor: cls.color,
    classBadge: cls.badge,
    level: Number(raw.level ?? raw.lvl ?? 1),
    masterLevel: Number(raw.masterLevel ?? raw.masterlvl ?? 0),
    resets: Number(raw.resets ?? 0),
    grandResets: Number(raw.grandResets ?? 0),
    guild: raw.guild ?? raw.guildName ?? undefined,
    guildName: raw.guildName ?? raw.guild ?? undefined,
    map: raw.map ?? raw.mapName ?? undefined,
    online: Boolean(raw.online ?? raw.isOnline ?? false),
    isOnline: Boolean(raw.isOnline ?? raw.online ?? false),
    pkCount: Number(raw.pkCount ?? 0),
  };
}

export function normalizeGuildRankItem(raw: any, idx = 0): GuildRankItem {
  return {
    rank: Number(raw.rank ?? idx + 1),
    name: String(raw.name ?? "-"),
    master: String(raw.master ?? raw.guildMaster ?? "-"),
    score: Number(raw.score ?? raw.totalScore ?? 0),
    members: Number(raw.members ?? raw.memberCount ?? 0),
    memberCount: Number(raw.memberCount ?? raw.members ?? 0),
    maxMembers: Number(raw.maxMembers ?? 80),
    alliance: raw.alliance ?? undefined,
    logo: raw.logo ?? undefined,
  };
}

export async function fetchServerStatus(): Promise<ServerStatusData> {
  try {
    return await apiJson<ServerStatusData>("/api/server/status");
  } catch {
    return {
      status: "offline",
      totalOnline: 0,
      maxPlayers: 0,
      servers: [],
      realms: [],
    };
  }
}

export async function fetchCharacterRankings(search = "", classFilter = "ALL"): Promise<CharacterRankItem[]> {
  const params = new URLSearchParams();
  if (search.trim()) params.set("search", search.trim());
  if (classFilter && classFilter !== "ALL") params.set("class", classFilter);
  const query = params.toString();
  const data = await apiJson<{ items?: unknown[] }>(`/api/rankings/characters${query ? `?${query}` : ""}`);
  return (Array.isArray(data.items) ? data.items : []).map((row, idx) => normalizeCharacterRankItem(row, idx));
}

export async function fetchGuildRankings(search = ""): Promise<GuildRankItem[]> {
  const params = new URLSearchParams();
  if (search.trim()) params.set("search", search.trim());
  const query = params.toString();
  const data = await apiJson<{ items?: unknown[] }>(`/api/rankings/guilds${query ? `?${query}` : ""}`);
  return (Array.isArray(data.items) ? data.items : []).map((row, idx) => normalizeGuildRankItem(row, idx));
}

export async function fetchTopupCatalog(): Promise<{ packages: TopupPackage[]; providers: TopupProvidersInfo }> {
  const res = await apiJson<{ packages?: any[]; providers: TopupProvidersInfo }>("/api/topup/packages");
  return {
    packages: Array.isArray(res.packages) ? res.packages.map(normalizeTopupPackage) : [],
    providers: res.providers,
  };
}

export async function registerAccount(
  loginName: string,
  password: string,
  email: string
): Promise<{ success: boolean; loginName?: string; message?: string }> {
  return apiJson<{ success: boolean; loginName?: string; message?: string }>("/api/account/register", {
    method: "POST",
    body: JSON.stringify({ loginName, password, email }),
  });
}

function summaryToLoginResult(summary: PlayerSessionSummary): AccountLoginResult {
  const acc = summary.account;
  return {
    success: true,
    account: acc.loginName,
    credits: summary.wallet?.credits ?? acc.credits ?? 0,
    wcoin: acc.wcoin ?? 0,
    pendingWcoin: acc.pendingWcoin ?? 0,
    onlineSeconds: acc.onlineTimeSeconds ?? 0,
    onlineHours: Math.floor((acc.onlineTimeSeconds ?? 0) / 3600),
    email: acc.email,
    characters: summary.characters ?? acc.characters ?? [],
    summary,
  };
}

export async function loginAccount(username: string, password: string): Promise<AccountLoginResult> {
  try {
    const data = await apiJson<any>("/api/account/login", {
      method: "POST",
      body: JSON.stringify({ loginName: username, password }),
    });
    return summaryToLoginResult(normalizePlayerSummary(data));
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Invalid username or password",
      code: err?.code,
    };
  }
}

export async function logoutAccount(): Promise<void> {
  await apiJson("/api/account/logout", { method: "POST" });
}

export async function fetchPlayerSession(): Promise<PlayerSessionSummary | null> {
  try {
    const data = await apiJson<any>("/api/auth/me");
    return normalizePlayerSummary(data);
  } catch (err: any) {
    if (err instanceof ApiError && err.status === 401) {
      return null;
    }
    throw err;
  }
}

export async function fetchWalletSummary(): Promise<PlayerSessionSummary> {
  const data = await apiJson<any>("/api/wallet/summary");
  return normalizePlayerSummary(data);
}

export async function redeemOnlineTimeCredits(
  hours?: number | null,
  idempotencyKey = createIdempotencyKey()
): Promise<OnlineTimeRedeemResult> {
  try {
    const res = await apiJson<any>("/api/rewards/online-time/redeem", {
      method: "POST",
      headers: { "Idempotency-Key": idempotencyKey },
      body: JSON.stringify(typeof hours === "number" ? { hours } : {}),
    });
    const summary = normalizePlayerSummary(res);
    return {
      ...res,
      summary,
      wallet: summary.wallet,
      account: summary.account,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Redeem failed",
    };
  }
}

export async function exchangeCreditsToWcoin(
  credits: number,
  idempotencyKey = createIdempotencyKey()
): Promise<ExchangeResult> {
  try {
    const res = await apiJson<any>("/api/exchange/credits-to-wcoin", {
      method: "POST",
      headers: { "Idempotency-Key": idempotencyKey },
      body: JSON.stringify({ credits, coinType: "WCoinC" }),
    });
    const summary = normalizePlayerSummary(res);
    return {
      success: true,
      idempotent: Boolean(res.idempotent),
      status: res.status ?? res.exchange?.status,
      exchange: summary.exchanges[0] ?? res.exchange,
      wallet: summary.wallet,
      account: summary.account,
      deductedCredits: res.exchange?.creditsSpent ?? credits,
      remainingCredits: summary.wallet.credits,
      wcoinReceived: res.exchange?.wcoinAmount ?? res.exchange?.wcoinGranted,
      newWcoinBalance: summary.account.wcoin,
      summary,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Exchange failed",
    };
  }
}

export async function createTopupOrder(
  packageId: string,
  provider: "promptpay_manual" | "paypal" | "webhook_hmac" | "dev_sandbox",
  idempotencyKey = createIdempotencyKey()
): Promise<{ success: boolean; idempotent?: boolean; order?: TopupOrderRecord; error?: string }> {
  try {
    const res = await apiJson<{ success: boolean; idempotent?: boolean; order?: any }>(
      "/api/topup/orders",
      {
        method: "POST",
        headers: { "Idempotency-Key": idempotencyKey },
        body: JSON.stringify({ packageId, provider }),
      }
    );
    return {
      ...res,
      order: res.order ? normalizeTopupOrder(res.order) : undefined,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Could not create top-up order",
    };
  }
}

export async function fetchTopupOrders(): Promise<TopupOrderRecord[]> {
  const data = await apiJson<{ orders?: any[] }>("/api/topup/orders");
  return Array.isArray(data.orders) ? data.orders.map(normalizeTopupOrder) : [];
}

export async function capturePaypalTopupOrder(
  orderId: string
): Promise<{ success: boolean; status?: string; order?: TopupOrderRecord; summary?: PlayerSessionSummary; error?: string }> {
  try {
    const res = await apiJson<any>(`/api/topup/orders/${encodeURIComponent(orderId)}/paypal-capture`, {
      method: "POST",
      body: JSON.stringify({}),
    });
    return {
      ...res,
      order: res.order ? normalizeTopupOrder(res.order) : undefined,
    };
  } catch (err: any) {
    return { success: false, error: err?.message || "PayPal capture failed" };
  }
}

export async function confirmSandboxTopupOrder(
  orderId: string
): Promise<{ success: boolean; status?: string; order?: TopupOrderRecord; summary?: PlayerSessionSummary; error?: string }> {
  try {
    const res = await apiJson<any>(`/api/topup/orders/${encodeURIComponent(orderId)}/sandbox-confirm`, {
      method: "POST",
      body: JSON.stringify({}),
    });
    return {
      ...res,
      order: res.order ? normalizeTopupOrder(res.order) : undefined,
    };
  } catch (err: any) {
    return { success: false, error: err?.message || "Sandbox confirmation failed" };
  }
}

export async function fetchAccountCharacters(): Promise<OpenMuCharacter[]> {
  const data = await apiJson<{ characters?: OpenMuCharacter[] }>("/api/characters/list");
  return Array.isArray(data.characters) ? data.characters : [];
}

export async function resetCharacterAction(
  characterName: string
): Promise<{ success: boolean; message: string; character?: OpenMuCharacter }> {
  try {
    return await apiJson("/api/characters/reset", {
      method: "POST",
      body: JSON.stringify({ characterName }),
    });
  } catch (err: any) {
    return { success: false, message: err?.message || "Character reset failed" };
  }
}

export async function clearPkAction(
  characterName: string
): Promise<{ success: boolean; message: string; character?: OpenMuCharacter }> {
  try {
    return await apiJson("/api/characters/pkclear", {
      method: "POST",
      body: JSON.stringify({ characterName }),
    });
  } catch (err: any) {
    return { success: false, message: err?.message || "PK clear failed" };
  }
}

export async function addStatsAction(
  characterName: string,
  stats: { str: number; agi: number; vit: number; ene: number; lead: number }
): Promise<{ success: boolean; message: string; character?: OpenMuCharacter }> {
  try {
    return await apiJson("/api/characters/addstats", {
      method: "POST",
      body: JSON.stringify({
        characterName,
        strength: stats.str,
        agility: stats.agi,
        vitality: stats.vit,
        energy: stats.ene,
        leadership: stats.lead,
      }),
    });
  } catch (err: any) {
    return { success: false, message: err?.message || "Add stats failed" };
  }
}

export async function resetStatsAction(
  characterName: string
): Promise<{ success: boolean; message: string; character?: OpenMuCharacter }> {
  try {
    return await apiJson("/api/characters/resetStats", {
      method: "POST",
      body: JSON.stringify({ characterName }),
    });
  } catch (err: any) {
    return { success: false, message: err?.message || "Reset stats failed" };
  }
}

export async function changePasswordAction(
  currentPassword: string,
  newPassword: string,
  repeatPassword: string
): Promise<{ success: boolean; message: string }> {
  if (newPassword !== repeatPassword) {
    return { success: false, message: "รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน" };
  }
  try {
    return await apiJson<{ success: boolean; message: string }>("/api/account/changepassword", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  } catch (err: any) {
    return { success: false, message: err?.message || "Change password failed" };
  }
}

export async function loginAdmin(
  loginName: string,
  password: string,
  twoFactorCode?: string,
  isRecoveryCode = false
): Promise<{ success: boolean; admin?: AdminSessionInfo["admin"]; error?: string; code?: string }> {
  try {
    const data = await apiJson<AdminSessionInfo & { success: boolean }>("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({ loginName, password, twoFactorCode, isRecoveryCode }),
    });
    return { success: true, admin: data.admin };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Admin authentication failed",
      code: err?.code,
    };
  }
}

export async function logoutAdmin(): Promise<void> {
  await apiJson("/api/admin/logout", { method: "POST" });
}

export async function fetchAdminSession(): Promise<AdminSessionInfo | null> {
  try {
    return await apiJson<AdminSessionInfo>("/api/admin/me");
  } catch (err: any) {
    if (err instanceof ApiError && err.status === 401) {
      return null;
    }
    throw err;
  }
}

export async function searchUsers(
  query: string,
  state = "",
  offset = 0,
  limit = 25
): Promise<{ items: UserSearchItem[]; total: number }> {
  const params = new URLSearchParams();
  if (query.trim()) params.set("q", query.trim());
  if (state.trim()) params.set("state", state.trim());
  params.set("offset", String(offset));
  params.set("limit", String(limit));
  const data = await apiJson<{ items?: any[]; total?: number }>(`/api/admin/users?${params.toString()}`);
  const items: UserSearchItem[] = (Array.isArray(data.items) ? data.items : []).map((entry) => {
    const acc = entry?.account ?? entry ?? {};
    const wallet = entry?.wallet ?? {};
    const chars = Array.isArray(entry?.characters) ? entry.characters : Array.isArray(acc.characters) ? acc.characters : null;
    return {
      loginName: String(acc.loginName ?? acc.username ?? ""),
      username: String(acc.loginName ?? acc.username ?? ""),
      email: String(acc.email ?? acc.eMail ?? ""),
      state: String(acc.state ?? "Normal"),
      role: acc.role ? String(acc.role) : "Player",
      credits: Number(wallet.credits ?? wallet.creditsBalance ?? acc.credits ?? acc.creditsBalance ?? 0),
      wcoin: Number(acc.wcoin ?? acc.wcoinC ?? 0),
      pendingWcoin: Number(acc.pendingWcoin ?? acc.pendingWCoinC ?? 0),
      onlineTimeSeconds: Number(acc.onlineTimeSeconds ?? 0),
      isOnline: Boolean(acc.isOnline ?? acc.online ?? false),
      charactersCount: Number(acc.charactersCount ?? (chars ? chars.length : 0)),
      characters: chars
        ? chars.map((c: any) => `${c.name} (Lv.${c.lvl ?? c.level ?? 1})`).join(", ")
        : String(acc.characters ?? "-"),
      lastLoginAt: acc.lastLoginAt ?? null,
      createdAt: acc.createdAt ?? null,
    };
  });
  return { items, total: Number(data.total ?? items.length) };
}

export async function fetchAdminUserDetail(loginName: string): Promise<PlayerSessionSummary> {
  const data = await apiJson<any>(`/api/admin/users/${encodeURIComponent(loginName)}`);
  return normalizePlayerSummary(data);
}

export async function adminAdjustWallet(
  loginName: string,
  currency: "credits" | "wcoin",
  amount: number,
  reason: string,
  idempotencyKey = createIdempotencyKey()
): Promise<{ success: boolean; wallet?: WalletState; account?: AccountProfile; error?: string }> {
  try {
    const res = await apiJson<any>(`/api/admin/users/${encodeURIComponent(loginName)}/wallet-adjust`, {
      method: "POST",
      headers: { "Idempotency-Key": idempotencyKey },
      body: JSON.stringify({ currency, amount, reason }),
    });
    const summary = normalizePlayerSummary(res);
    return { success: true, wallet: summary.wallet, account: summary.account };
  } catch (err: any) {
    return { success: false, error: err?.message || "Wallet adjustment failed" };
  }
}

export async function adminSetAccountState(
  loginName: string,
  state: "Normal" | "Banned" | "TemporarilyBanned",
  reason: string
): Promise<{ success: boolean; account?: AccountProfile; error?: string }> {
  try {
    return await apiJson(`/api/admin/users/${encodeURIComponent(loginName)}/account-state`, {
      method: "POST",
      body: JSON.stringify({ state, reason }),
    });
  } catch (err: any) {
    return { success: false, error: err?.message || "Account state update failed" };
  }
}

export async function adminDisconnectPlayer(
  loginName: string
): Promise<{ success: boolean; disconnected?: boolean; error?: string }> {
  try {
    return await apiJson(`/api/admin/users/${encodeURIComponent(loginName)}/disconnect`, {
      method: "POST",
      body: JSON.stringify({}),
    });
  } catch (err: any) {
    return { success: false, error: err?.message || "Disconnect failed" };
  }
}

export async function fetchAdminTopupOrders(status = ""): Promise<TopupOrderRecord[]> {
  const qs = status ? `?status=${encodeURIComponent(status)}` : "";
  const data = await apiJson<{ orders?: any[] }>(`/api/admin/topup/orders${qs}`);
  return Array.isArray(data.orders) ? data.orders.map(normalizeTopupOrder) : [];
}

export async function adminConfirmTopupOrder(
  orderId: string,
  providerTransactionId?: string
): Promise<{ success: boolean; order?: TopupOrderRecord; error?: string }> {
  try {
    const res = await apiJson<any>(`/api/admin/topup/orders/${encodeURIComponent(orderId)}/confirm`, {
      method: "POST",
      body: JSON.stringify(providerTransactionId ? { providerTransactionId } : {}),
    });
    return {
      ...res,
      order: res.order ? normalizeTopupOrder(res.order) : undefined,
    };
  } catch (err: any) {
    return { success: false, error: err?.message || "Confirm order failed" };
  }
}

export async function fetchAdminAuditLogs(limit = 100): Promise<AdminAuditLogEntry[]> {
  const data = await apiJson<{ logs?: any[] }>(`/api/admin/audit-logs?limit=${limit}`);
  return (Array.isArray(data.logs) ? data.logs : []).map((row) => ({
    id: String(row.id ?? ""),
    actorLogin: String(row.actorLogin ?? row.actorName ?? ""),
    targetLogin: row.targetLogin ?? row.targetId ?? null,
    action: String(row.action ?? ""),
    details: row.details,
    ipAddress: row.ipAddress ?? null,
    createdAt: String(row.createdAt ?? ""),
  }));
}
