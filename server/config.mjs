import crypto from "node:crypto";

export const ONLINE_REWARD_SECONDS_PER_HOUR = 3600;
export const ONLINE_REWARD_CREDITS_PER_HOUR = 5;

export const EXCHANGE_CREDITS_PER_BLOCK = 100;
export const EXCHANGE_WCOINC_PER_BLOCK = 50;

export const TOPUP_PACKAGES = Object.freeze([
  {
    id: "tier-50",
    name: "Starter Pack",
    tag: "+10% Bonus",
    priceThb: 50,
    priceUsd: 1.5,
    baseCredits: 250,
    bonusCredits: 25,
    totalCredits: 275,
    baseWcoin: 50,
    bonusWcoin: 10,
    totalWcoin: 60,
    bonusPct: 10,
    popular: false,
  },
  {
    id: "tier-150",
    name: "Adventurer Pack",
    tag: "+15% Bonus",
    priceThb: 150,
    priceUsd: 4.5,
    baseCredits: 800,
    bonusCredits: 120,
    totalCredits: 920,
    baseWcoin: 200,
    bonusWcoin: 50,
    totalWcoin: 250,
    bonusPct: 15,
    popular: false,
  },
  {
    id: "tier-300",
    name: "Hero Choice",
    tag: "+20% Most Popular",
    priceThb: 300,
    priceUsd: 9.0,
    baseCredits: 1800,
    bonusCredits: 360,
    totalCredits: 2160,
    baseWcoin: 500,
    bonusWcoin: 150,
    totalWcoin: 650,
    bonusPct: 20,
    popular: true,
  },
  {
    id: "tier-500",
    name: "Champion Bundle",
    tag: "+25% Mega Value",
    priceThb: 500,
    priceUsd: 15.0,
    baseCredits: 3200,
    bonusCredits: 800,
    totalCredits: 4000,
    baseWcoin: 1000,
    bonusWcoin: 350,
    totalWcoin: 1350,
    bonusPct: 25,
    popular: false,
  },
  {
    id: "tier-1000",
    name: "Emperor VIP Pack",
    tag: "+35% Max Value + VIP",
    priceThb: 1000,
    priceUsd: 30.0,
    baseCredits: 7000,
    bonusCredits: 2450,
    totalCredits: 9450,
    baseWcoin: 2500,
    bonusWcoin: 1000,
    totalWcoin: 3500,
    bonusPct: 35,
    popular: false,
  },
]);

export const TOPUP_PACKAGES_BY_ID = new Map(TOPUP_PACKAGES.map((pkg) => [pkg.id, pkg]));

export function loadConfig(env = process.env) {
  const nodeEnv = String(env.NODE_ENV || "development").trim().toLowerCase();
  const isProduction = nodeEnv === "production";
  const allowInMemoryStore = env.ALLOW_INMEMORY_WEB_STORE === "true" && !isProduction;

  const apiUrl = String(env.OPENMU_API_URL ?? "").replace(/\/+$/, "");
  const apiKey = String(env.OPENMU_API_KEY ?? "");
  if (!apiUrl || !/^https?:\/\//.test(apiUrl)) {
    throw new Error("OPENMU_API_URL must be an absolute HTTP(S) URL.");
  }
  if (apiKey.length < 32) {
    throw new Error("OPENMU_API_KEY must contain at least 32 characters.");
  }

  const databaseUrl = String(env.DATABASE_URL ?? "").trim();
  if (isProduction && !databaseUrl) {
    throw new Error("DATABASE_URL is required in production.");
  }
  if (!databaseUrl && !allowInMemoryStore) {
    throw new Error("DATABASE_URL is required unless ALLOW_INMEMORY_WEB_STORE=true in non-production.");
  }

  let sessionSecret = String(env.SESSION_SECRET ?? "").trim();
  if (isProduction && sessionSecret.length < 32) {
    throw new Error("SESSION_SECRET must contain at least 32 characters in production.");
  }
  if (!sessionSecret) {
    sessionSecret = crypto.randomBytes(32).toString("hex");
  }

  const enableDevTopupSandbox = env.ENABLE_DEV_TOPUP_SANDBOX === "true" && !isProduction;
  const paymentWebhookSecret = String(env.PAYMENT_WEBHOOK_SECRET ?? "").trim();
  const allowedOrigins = String(env.CORS_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return {
    nodeEnv,
    isProduction,
    allowInMemoryStore,
    apiUrl,
    apiKey,
    databaseUrl,
    sessionSecret,
    sessionTtlSeconds: Number.parseInt(env.SESSION_TTL_SECONDS ?? "86400", 10) || 86400,
    port: Number.parseInt(env.PORT ?? "8080", 10),
    trustProxy: env.TRUST_PROXY === "true",
    requestTimeoutMs: Number.parseInt(env.UPSTREAM_TIMEOUT_MS ?? "8000", 10),
    cookieSecure: env.COOKIE_SECURE === "true" || isProduction,
    allowedOrigins,
    enableDevTopupSandbox,
    paymentWebhookSecret,
    promptPayAccountId: String(env.PROMPTPAY_ID ?? "").trim(),
    promptPayAccountName: String(env.PROMPTPAY_NAME ?? "OpenMU-Origins").trim(),
    paypalClientId: String(env.PAYPAL_CLIENT_ID ?? "").trim(),
    paypalClientSecret: String(env.PAYPAL_CLIENT_SECRET ?? "").trim(),
    paypalEnv: String(env.PAYPAL_ENV ?? "sandbox").trim().toLowerCase() === "live" ? "live" : "sandbox",
    paypalWebhookId: String(env.PAYPAL_WEBHOOK_ID ?? "").trim(),
    publicWebUrl: String(env.PUBLIC_WEB_URL ?? "http://localhost:8080").replace(/\/+$/, ""),
  };
}

