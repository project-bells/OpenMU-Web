import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { StoreError } from "./db/errors.mjs";
import { UpstreamError, createOpenMuClient } from "./services/openmuClient.mjs";
import {
  createRateLimiter,
  createSessionManager,
  getClientIp,
  isCsrfOriginValid,
} from "./services/authService.mjs";
import { createPayPalClient } from "./services/paymentProviders.mjs";
import { createWalletService } from "./services/walletService.mjs";
import { normalizeCharacterRankingItem } from "./services/characterHelpers.mjs";

export { loadConfig } from "./config.mjs";
export { normalizeCharacterClass, normalizeCharacterRankingItem } from "./services/characterHelpers.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, "..", "dist");
const MIME = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};

export function validateRegistration(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return "Invalid request.";
  const loginName = typeof value.loginName === "string" ? value.loginName.trim() : "";
  const password = typeof value.password === "string" ? value.password : "";
  const email = typeof value.email === "string" ? value.email.trim() : "";
  if (!/^[\x21-\x7E]{3,10}$/.test(loginName)) {
    return "Account name must be 3-10 printable ASCII characters without spaces.";
  }
  if (!/^[\x20-\x7E]{8,20}$/.test(password)) {
    return "Password must be 8-20 printable ASCII characters.";
  }
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "A valid email address is required.";
  }
  return { loginName, password, eMail: email };
}

function securityHeaders(response) {
  response.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; font-src 'self' data:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
  );
  response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  response.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("X-Frame-Options", "DENY");
}

function json(response, status, body, headers = {}) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    ...headers,
  });
  response.end(JSON.stringify(body));
}

async function readRawBody(request, maximum = 16384) {
  const chunks = [];
  let length = 0;
  for await (const chunk of request) {
    length += chunk.length;
    if (length > maximum) {
      throw new StoreError(413, "PAYLOAD_TOO_LARGE", "Payload too large.");
    }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

async function readJsonBody(request, maximum = 16384) {
  const raw = await readRawBody(request, maximum);
  try {
    return JSON.parse(raw || "{}");
  } catch {
    throw new StoreError(400, "INVALID_JSON", "Malformed JSON request body.");
  }
}

function handleError(response, error) {
  if (error instanceof StoreError) {
    return json(response, error.status, {
      success: false,
      code: error.code,
      message: error.message,
      ...error.extra,
    });
  }
  if (error instanceof UpstreamError) {
    return json(response, error.status, {
      success: false,
      code: error.code,
      message: error.message,
    });
  }
  console.error("[OpenMU-Web BFF error]", error);
  return json(response, 500, {
    success: false,
    code: "INTERNAL_ERROR",
    message: "Internal server error.",
  });
}

async function serveStatic(pathname, response) {
  const relative = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const filePath = path.resolve(DIST, relative);
  if (!filePath.startsWith(DIST + path.sep) && filePath !== path.join(DIST, "index.html")) {
    response.writeHead(403).end();
    return;
  }

  let data;
  let targetPath = filePath;
  try {
    data = await fs.readFile(targetPath);
  } catch {
    if (!path.extname(relative)) {
      targetPath = path.join(DIST, "index.html");
      try {
        data = await fs.readFile(targetPath);
      } catch {
        response.writeHead(404).end();
        return;
      }
    } else {
      response.writeHead(404).end();
      return;
    }
  }

  const ext = path.extname(targetPath);
  response.writeHead(200, {
    "Content-Type": MIME[ext] ?? "application/octet-stream",
    "Cache-Control": targetPath.includes(`${path.sep}assets${path.sep}`)
      ? "public, max-age=31536000, immutable"
      : "no-cache",
  });
  response.end(data);
}

export function createHandler(config, deps = {}) {
  if (!deps.store) {
    throw new Error("createHandler requires a backing store instance.");
  }

  const store = deps.store;
  const openmuClient = deps.openmuClient ?? createOpenMuClient(config, deps.fetchImpl);
  const paypalClient = deps.paypalClient ?? createPayPalClient(config, deps.fetchImpl);
  const sessions = createSessionManager(config, store);
  const walletService =
    deps.walletService ?? createWalletService({ config, store, openmuClient, paypalClient });
  const checkRateLimit = createRateLimiter();

  async function requirePlayer(request, response) {
    const session = await sessions.resolveSession(request, "player");
    if (!session) {
      json(response, 401, {
        success: false,
        code: "UNAUTHORIZED",
        message: "Player authentication is required.",
      });
      return null;
    }
    return session;
  }

  async function requireAdmin(request, response) {
    const session = await sessions.resolveSession(request, "admin");
    if (!session) {
      json(response, 401, {
        success: false,
        code: "ADMIN_UNAUTHORIZED",
        message: "Administrator authentication is required.",
      });
      return null;
    }
    return session;
  }

  function resolveIdempotencyKey(request, body) {
    return (
      request.headers["idempotency-key"] ||
      body?.idempotencyKey ||
      crypto.randomUUID()
    );
  }

  const handler = async (request, response) => {
    securityHeaders(response);
    const url = new URL(request.url, "http://localhost");
    const pathname = url.pathname;
    const method = String(request.method || "GET").toUpperCase();
    const ipAddress = getClientIp(request, config);

    try {
      // Health checks
      if (pathname === "/health/live" && method === "GET") {
        return json(response, 200, { status: "ok" });
      }
      if (pathname === "/health/ready" && method === "GET") {
        try {
          await Promise.all([store.ping(), openmuClient.getServerStatus()]);
          return json(response, 200, { status: "ready" });
        } catch (err) {
          return json(response, 503, { status: "degraded", message: err?.message || "Dependency unavailable" });
        }
      }

      // CSRF Origin guard for state-changing API requests (webhooks exempted cleanly)
      if (pathname.startsWith("/api/") && pathname !== "/api/payments/webhook" && !isCsrfOriginValid(request, config)) {
        return json(response, 403, { success: false, code: "CSRF_ORIGIN_REJECTED", message: "Cross-origin request rejected." });
      }

      // Public Server Info & Catalog
      if (pathname === "/api/server/status" && method === "GET") {
        const { data } = await openmuClient.getServerStatus();
        return json(response, 200, data);
      }

      if (pathname === "/api/rankings/characters" && method === "GET") {
        const qs = url.search ? url.search.slice(1) : "";
        const { data } = await openmuClient.getCharacterRankings(qs);
        const list = Array.isArray(data) ? data : data?.items ?? data?.characters ?? data?.data ?? [];
        return json(response, 200, { items: list.map((item, idx) => normalizeCharacterRankingItem(item, idx)) });
      }

      if (pathname === "/api/rankings/guilds" && method === "GET") {
        const qs = url.search ? url.search.slice(1) : "";
        const { data } = await openmuClient.getGuildRankings(qs);
        const list = Array.isArray(data) ? data : data?.items ?? data?.guilds ?? data?.data ?? [];
        return json(response, 200, { items: list });
      }

      if (pathname === "/api/topup/packages" && method === "GET") {
        return json(response, 200, walletService.getCatalog());
      }

      // Registration
      if (pathname === "/api/account/register" && method === "POST") {
        if (checkRateLimit("register", ipAddress, { limit: 5, windowMs: 60_000 }).limited) {
          return json(response, 429, { success: false, code: "RATE_LIMITED", message: "Too many registration attempts." });
        }
        const raw = await readJsonBody(request);
        const parsed = validateRegistration(raw);
        if (typeof parsed === "string") {
          return json(response, 400, { success: false, code: "VALIDATION_ERROR", message: parsed });
        }
        await openmuClient.registerAccount(parsed);
        await store.ensureWalletAccount(parsed.loginName);
        await store.recordAuditLog({
          actorType: "player",
          actorName: parsed.loginName,
          action: "ACCOUNT_REGISTER",
          targetType: "accounts",
          targetId: parsed.loginName,
          outcome: "SUCCESS",
          ipAddress,
        });
        return json(response, 201, { success: true, loginName: parsed.loginName });
      }

      // Player Login / Logout / Me / Change Password
      if (pathname === "/api/account/login" && method === "POST") {
        const raw = await readJsonBody(request);
        const loginName = String(raw?.loginName ?? "").trim();
        const password = String(raw?.password ?? "");
        if (!loginName || !password) {
          return json(response, 400, { success: false, code: "MISSING_CREDENTIALS", message: "Login name and password are required." });
        }
        if (
          checkRateLimit("player-login-ip", ipAddress, { limit: 12, windowMs: 60_000 }).limited ||
          checkRateLimit("player-login-user", loginName.toLowerCase(), { limit: 6, windowMs: 60_000 }).limited
        ) {
          return json(response, 429, { success: false, code: "RATE_LIMITED", message: "Too many login attempts. Please wait a minute." });
        }

        const { data: profile } = await openmuClient.authenticateAccount(loginName, password);
        await store.ensureWalletAccount(profile.loginName);
        const { setCookie } = await sessions.issueSession({
          principalType: "player",
          loginName: profile.loginName,
          roles: ["Player"],
          ipAddress,
          userAgent: request.headers["user-agent"] || null,
        });
        const summary = await walletService.getPlayerSummary(profile.loginName);
        await store.recordAuditLog({
          actorType: "player",
          actorName: profile.loginName,
          action: "PLAYER_LOGIN",
          targetType: "accounts",
          targetId: profile.loginName,
          outcome: "SUCCESS",
          ipAddress,
        });
        return json(response, 200, { success: true, ...summary }, { "Set-Cookie": setCookie });
      }

      if (pathname === "/api/account/logout" && method === "POST") {
        const clearCookie = await sessions.revokeSessionFromRequest(request, "player");
        return json(response, 200, { success: true }, { "Set-Cookie": clearCookie });
      }

      if ((pathname === "/api/auth/me" || pathname === "/api/wallet/summary") && method === "GET") {
        const session = await requirePlayer(request, response);
        if (!session) return;
        const summary = await walletService.getPlayerSummary(session.loginName);
        return json(response, 200, { authenticated: true, ...summary });
      }

      if (pathname === "/api/account/changepassword" && method === "POST") {
        const session = await requirePlayer(request, response);
        if (!session) return;
        if (checkRateLimit("changepass", session.loginName, { limit: 5, windowMs: 60_000 }).limited) {
          return json(response, 429, { success: false, code: "RATE_LIMITED", message: "Too many password change attempts." });
        }
        const raw = await readJsonBody(request);
        await openmuClient.changeOwnPassword(
          session.loginName,
          String(raw?.currentPassword ?? ""),
          String(raw?.newPassword ?? "")
        );
        await store.recordAuditLog({
          actorType: "player",
          actorName: session.loginName,
          action: "ACCOUNT_PASSWORD_CHANGE",
          targetType: "accounts",
          targetId: session.loginName,
          outcome: "SUCCESS",
          ipAddress,
        });
        return json(response, 200, { success: true, message: "Password changed successfully." });
      }

      // P0-A: Online-Time Rewards
      if (pathname === "/api/rewards/online-time/redeem" && method === "POST") {
        const session = await requirePlayer(request, response);
        if (!session) return;
        if (checkRateLimit("redeem", session.loginName, { limit: 10, windowMs: 60_000 }).limited) {
          return json(response, 429, { success: false, code: "RATE_LIMITED", message: "Too many reward redemptions. Please slow down." });
        }
        const raw = await readJsonBody(request);
        const result = await walletService.redeemOnlineTime({
          loginName: session.loginName,
          idempotencyKey: resolveIdempotencyKey(request, raw),
          hours: raw?.hours ?? null,
          ipAddress,
        });
        const summary = await walletService.getPlayerSummary(session.loginName);
        return json(response, 200, { success: true, ...result, ...summary });
      }

      // P0-B: Credit Exchange -> WCoinC
      if (pathname === "/api/exchange/credits-to-wcoin" && method === "POST") {
        const session = await requirePlayer(request, response);
        if (!session) return;
        if (checkRateLimit("exchange", session.loginName, { limit: 10, windowMs: 60_000 }).limited) {
          return json(response, 429, { success: false, code: "RATE_LIMITED", message: "Too many exchange requests." });
        }
        const raw = await readJsonBody(request);
        const result = await walletService.exchangeCreditsToWCoin({
          loginName: session.loginName,
          credits: raw?.credits,
          coinType: raw?.coinType || "WCoinC",
          idempotencyKey: resolveIdempotencyKey(request, raw),
          ipAddress,
        });
        const summary = await walletService.getPlayerSummary(session.loginName);
        return json(response, 200, { success: true, ...result, ...summary });
      }

      // P0-C: Credit Top-Up & Payment Processing
      if (pathname === "/api/topup/orders" && method === "POST") {
        const session = await requirePlayer(request, response);
        if (!session) return;
        if (checkRateLimit("topup-create", session.loginName, { limit: 10, windowMs: 60_000 }).limited) {
          return json(response, 429, { success: false, code: "RATE_LIMITED", message: "Too many top-up order requests." });
        }
        const raw = await readJsonBody(request);
        const created = await walletService.createTopupOrder({
          loginName: session.loginName,
          packageId: raw?.packageId,
          provider: raw?.provider || "promptpay_manual",
          idempotencyKey: resolveIdempotencyKey(request, raw),
          ipAddress,
        });
        return json(response, created.idempotent ? 200 : 201, { success: true, ...created });
      }

      if (pathname === "/api/topup/orders" && method === "GET") {
        const session = await requirePlayer(request, response);
        if (!session) return;
        const orders = await store.listTopupOrders({ loginName: session.loginName, limit: 50 });
        return json(response, 200, { orders });
      }

      const orderDetailMatch = pathname.match(/^\/api\/topup\/orders\/([^/]+)$/);
      if (orderDetailMatch && method === "GET") {
        const session = await requirePlayer(request, response);
        if (!session) return;
        const order = await store.getTopupOrder({ orderId: decodeURIComponent(orderDetailMatch[1]) });
        if (!order || order.loginName !== session.loginName) {
          return json(response, 404, { success: false, code: "ORDER_NOT_FOUND", message: "Top-up order not found." });
        }
        return json(response, 200, { order });
      }

      const paypalCaptureMatch = pathname.match(/^\/api\/topup\/orders\/([^/]+)\/paypal-capture$/);
      if (paypalCaptureMatch && method === "POST") {
        const session = await requirePlayer(request, response);
        if (!session) return;
        const result = await walletService.capturePayPalOrder({
          loginName: session.loginName,
          orderId: decodeURIComponent(paypalCaptureMatch[1]),
          ipAddress,
        });
        const summary = await walletService.getPlayerSummary(session.loginName);
        return json(response, 200, { success: true, ...result, ...summary });
      }

      const sandboxConfirmMatch = pathname.match(/^\/api\/topup\/orders\/([^/]+)\/sandbox-confirm$/);
      if (sandboxConfirmMatch && method === "POST") {
        const session = await requirePlayer(request, response);
        if (!session) return;
        const result = await walletService.settleSandboxTopup({
          loginName: session.loginName,
          orderId: decodeURIComponent(sandboxConfirmMatch[1]),
          ipAddress,
        });
        const summary = await walletService.getPlayerSummary(session.loginName);
        return json(response, 200, { success: true, ...result, ...summary });
      }

      // Payment Webhook (HMAC signed)
      if (pathname === "/api/payments/webhook" && method === "POST") {
        const rawBody = await readRawBody(request, 65536);
        const result = await walletService.processHmacWebhook({
          rawBody,
          headers: request.headers,
          ipAddress,
        });
        return json(response, 200, { success: true, ...result });
      }

      // Character Management (Server-Authoritative Offline Reservation)
      if (pathname === "/api/characters/list" && method === "GET") {
        const session = await requirePlayer(request, response);
        if (!session) return;
        const { data: profile } = await openmuClient.getAccountProfile(session.loginName);
        return json(response, 200, { characters: profile.characters || [] });
      }

      if (pathname === "/api/characters/reset" && method === "POST") {
        const session = await requirePlayer(request, response);
        if (!session) return;
        const raw = await readJsonBody(request);
        const charName = String(raw?.characterName ?? "").trim();
        if (!charName) return json(response, 400, { success: false, code: "MISSING_CHARACTER", message: "characterName is required." });
        const { data } = await openmuClient.resetCharacter(session.loginName, charName);
        await store.recordAuditLog({
          actorType: "player",
          actorName: session.loginName,
          action: "CHARACTER_RESET",
          targetType: "characters",
          targetId: charName,
          outcome: "SUCCESS",
          ipAddress,
        });
        return json(response, 200, data);
      }

      if (pathname === "/api/characters/pkclear" && method === "POST") {
        const session = await requirePlayer(request, response);
        if (!session) return;
        const raw = await readJsonBody(request);
        const charName = String(raw?.characterName ?? "").trim();
        if (!charName) return json(response, 400, { success: false, code: "MISSING_CHARACTER", message: "characterName is required." });
        const { data } = await openmuClient.clearCharacterPk(session.loginName, charName);
        await store.recordAuditLog({
          actorType: "player",
          actorName: session.loginName,
          action: "CHARACTER_PK_CLEAR",
          targetType: "characters",
          targetId: charName,
          outcome: "SUCCESS",
          ipAddress,
        });
        return json(response, 200, data);
      }

      if (pathname === "/api/characters/addstats" && method === "POST") {
        const session = await requirePlayer(request, response);
        if (!session) return;
        const raw = await readJsonBody(request);
        const charName = String(raw?.characterName ?? "").trim();
        if (!charName) return json(response, 400, { success: false, code: "MISSING_CHARACTER", message: "characterName is required." });
        const { data } = await openmuClient.addCharacterStats(session.loginName, charName, {
          strength: Math.max(0, Number.parseInt(raw?.str ?? raw?.strength ?? 0, 10) || 0),
          agility: Math.max(0, Number.parseInt(raw?.agi ?? raw?.agility ?? 0, 10) || 0),
          vitality: Math.max(0, Number.parseInt(raw?.vit ?? raw?.vitality ?? 0, 10) || 0),
          energy: Math.max(0, Number.parseInt(raw?.ene ?? raw?.energy ?? 0, 10) || 0),
          leadership: Math.max(0, Number.parseInt(raw?.cmd ?? raw?.leadership ?? 0, 10) || 0),
        });
        return json(response, 200, data);
      }

      if (pathname === "/api/characters/resetStats" && method === "POST") {
        const session = await requirePlayer(request, response);
        if (!session) return;
        const raw = await readJsonBody(request);
        const charName = String(raw?.characterName ?? "").trim();
        if (!charName) return json(response, 400, { success: false, code: "MISSING_CHARACTER", message: "characterName is required." });
        const { data } = await openmuClient.resetCharacterStats(session.loginName, charName);
        await store.recordAuditLog({
          actorType: "player",
          actorName: session.loginName,
          action: "CHARACTER_RESET_STATS",
          targetType: "characters",
          targetId: charName,
          outcome: "SUCCESS",
          ipAddress,
        });
        return json(response, 200, data);
      }

      // Admin Auth & Console Endpoints
      if (pathname === "/api/admin/login" && method === "POST") {
        const raw = await readJsonBody(request);
        const loginName = String(raw?.loginName ?? raw?.username ?? "").trim();
        const password = String(raw?.password ?? "");
        if (!loginName || !password) {
          return json(response, 400, { success: false, code: "MISSING_CREDENTIALS", message: "Admin username and password are required." });
        }
        if (checkRateLimit("admin-login", `${ipAddress}:${loginName}`, { limit: 8, windowMs: 60_000 }).limited) {
          return json(response, 429, { success: false, code: "RATE_LIMITED", message: "Too many admin login attempts." });
        }

        const { data } = await openmuClient.verifyAdminCredentials({
          loginName,
          password,
          twoFactorCode: raw?.twoFactorCode ? String(raw.twoFactorCode) : undefined,
          isRecoveryCode: Boolean(raw?.isRecoveryCode),
        });

        const { setCookie } = await sessions.issueSession({
          principalType: "admin",
          loginName: data.loginName,
          roles: Array.isArray(data.roles) ? data.roles : [],
          ipAddress,
          userAgent: request.headers["user-agent"] || null,
        });

        await store.recordAuditLog({
          actorType: "admin",
          actorName: data.loginName,
          action: "ADMIN_LOGIN",
          targetType: "admin_users",
          targetId: data.loginName,
          outcome: "SUCCESS",
          ipAddress,
          details: { roles: data.roles },
        });

        return json(
          response,
          200,
          { success: true, authenticated: true, admin: { loginName: data.loginName, roles: data.roles } },
          { "Set-Cookie": setCookie }
        );
      }

      if (pathname === "/api/admin/logout" && method === "POST") {
        const clearCookie = await sessions.revokeSessionFromRequest(request, "admin");
        return json(response, 200, { success: true }, { "Set-Cookie": clearCookie });
      }

      if (pathname === "/api/admin/me" && method === "GET") {
        const admin = await requireAdmin(request, response);
        if (!admin) return;
        return json(response, 200, { authenticated: true, admin: { loginName: admin.loginName, roles: admin.roles } });
      }

      if ((pathname === "/api/admin/users" || pathname === "/api/users/search") && method === "GET") {
        const admin = await requireAdmin(request, response);
        if (!admin) return;
        const text = url.searchParams.get("q") ?? url.searchParams.get("text") ?? "";
        const state = url.searchParams.get("state") ?? "";
        const offset = Math.max(0, Number.parseInt(url.searchParams.get("offset") ?? "0", 10) || 0);
        const limit = Math.min(50, Math.max(1, Number.parseInt(url.searchParams.get("limit") ?? "25", 10) || 25));

        const { data: searchData } = await openmuClient.searchAccounts({ text, state, offset, limit });
        const rawItems = Array.isArray(searchData?.items) ? searchData.items : [];
        const enriched = await Promise.all(
          rawItems.map(async (entry) => {
            const login = entry.loginName || entry.LoginName;
            const summary = await walletService.getPlayerSummary(login).catch(() => null);
            return summary ? summary : { account: { loginName: login, email: entry.eMail || "", state: entry.state || "Normal" } };
          })
        );
        return json(response, 200, {
          items: enriched,
          total: Number(searchData?.total ?? enriched.length),
          offset,
          limit,
        });
      }

      const adminUserDetailMatch = pathname.match(/^\/api\/admin\/users\/([^/]+)$/);
      if (adminUserDetailMatch && method === "GET") {
        const admin = await requireAdmin(request, response);
        if (!admin) return;
        const summary = await walletService.getPlayerSummary(decodeURIComponent(adminUserDetailMatch[1]));
        return json(response, 200, summary);
      }

      const adminWalletAdjustMatch = pathname.match(/^\/api\/admin\/users\/([^/]+)\/wallet-adjust$/);
      if (adminWalletAdjustMatch && method === "POST") {
        const admin = await requireAdmin(request, response);
        if (!admin) return;
        const targetLogin = decodeURIComponent(adminWalletAdjustMatch[1]);
        const raw = await readJsonBody(request);
        const currency = String(raw?.currency || "credits").toLowerCase();
        const amount = Number(raw?.amount);
        const reason = String(raw?.reason || "").trim();
        if (!Number.isInteger(amount) || amount === 0) {
          return json(response, 400, { success: false, code: "INVALID_AMOUNT", message: "amount must be a non-zero integer." });
        }
        if (reason.length < 3) {
          return json(response, 400, { success: false, code: "REASON_REQUIRED", message: "An audit reason (>= 3 chars) is required." });
        }
        const idempotencyKey = resolveIdempotencyKey(request, raw);

        // Verify target account exists on OpenMU
        await openmuClient.getAccountProfile(targetLogin);

        if (currency === "wcoin" || currency === "wcoinc") {
          const grantRes = await openmuClient.grantCashShopCoins(targetLogin, {
            coinType: "WCoinC",
            amount,
            reason: `Admin ${admin.loginName}: ${reason}`,
            reference: `adm-wcoin:${idempotencyKey}`,
          });
          await store.recordAuditLog({
            actorType: "admin",
            actorName: admin.loginName,
            action: "ADMIN_WCOINC_ADJUST",
            targetType: "accounts",
            targetId: targetLogin,
            outcome: "SUCCESS",
            ipAddress,
            details: { amount, reason, grantId: grantRes.data?.id ?? null },
          });
        } else {
          await store.adminAdjustWalletTransaction({
            loginName: targetLogin,
            amount,
            reason,
            adminLogin: admin.loginName,
            idempotencyKey: `adm-cr:${idempotencyKey}`,
            ipAddress,
          });
        }

        const summary = await walletService.getPlayerSummary(targetLogin);
        return json(response, 200, { success: true, ...summary });
      }

      const adminStateMatch = pathname.match(/^\/api\/admin\/users\/([^/]+)\/account-state$/);
      if (adminStateMatch && method === "POST") {
        const admin = await requireAdmin(request, response);
        if (!admin) return;
        const targetLogin = decodeURIComponent(adminStateMatch[1]);
        const raw = await readJsonBody(request);
        const state = String(raw?.state || "").trim();
        const reason = String(raw?.reason || "").trim();
        if (!["Normal", "Banned", "TemporarilyBanned"].includes(state)) {
          return json(response, 400, { success: false, code: "INVALID_STATE", message: "state must be Normal, Banned, or TemporarilyBanned." });
        }
        if (reason.length < 3) {
          return json(response, 400, { success: false, code: "REASON_REQUIRED", message: "Audit reason is required." });
        }
        const { data } = await openmuClient.setAccountState(targetLogin, state, `Admin ${admin.loginName}: ${reason}`);
        await store.recordAuditLog({
          actorType: "admin",
          actorName: admin.loginName,
          action: "ADMIN_ACCOUNT_STATE_CHANGE",
          targetType: "accounts",
          targetId: targetLogin,
          outcome: "SUCCESS",
          ipAddress,
          details: { state, reason },
        });
        return json(response, 200, { success: true, result: data });
      }

      const adminDisconnectMatch = pathname.match(/^\/api\/admin\/users\/([^/]+)\/disconnect$/);
      if (adminDisconnectMatch && method === "POST") {
        const admin = await requireAdmin(request, response);
        if (!admin) return;
        const targetLogin = decodeURIComponent(adminDisconnectMatch[1]);
        const { data } = await openmuClient.disconnectAccount(targetLogin);
        await store.recordAuditLog({
          actorType: "admin",
          actorName: admin.loginName,
          action: "ADMIN_DISCONNECT_PLAYER",
          targetType: "accounts",
          targetId: targetLogin,
          outcome: "SUCCESS",
          ipAddress,
        });
        return json(response, 200, { success: true, result: data });
      }

      if (pathname === "/api/admin/topup/orders" && method === "GET") {
        const admin = await requireAdmin(request, response);
        if (!admin) return;
        const statusFilter = url.searchParams.get("status") || null;
        const orders = await store.listTopupOrders({ status: statusFilter, limit: 100 });
        return json(response, 200, { orders });
      }

      const adminConfirmTopupMatch = pathname.match(/^\/api\/admin\/topup\/orders\/([^/]+)\/confirm$/);
      if (adminConfirmTopupMatch && method === "POST") {
        const admin = await requireAdmin(request, response);
        if (!admin) return;
        const orderId = decodeURIComponent(adminConfirmTopupMatch[1]);
        const raw = await readJsonBody(request);
        const reference = String(raw?.providerTransactionId || `ADMIN-${admin.loginName}-${Date.now()}`).trim();
        const result = await walletService.fulfillPaidOrder({
          orderId,
          providerTransactionId: reference,
          actorType: "admin",
          actorName: admin.loginName,
          ipAddress,
        });
        return json(response, 200, { success: true, ...result });
      }

      if (pathname === "/api/admin/audit-logs" && method === "GET") {
        const admin = await requireAdmin(request, response);
        if (!admin) return;
        const limit = Math.min(200, Math.max(1, Number.parseInt(url.searchParams.get("limit") ?? "100", 10) || 100));
        const logs = await store.listAuditLogs({ limit });
        return json(response, 200, { logs });
      }

      if (pathname.startsWith("/api/")) {
        return json(response, 404, { success: false, code: "NOT_FOUND", message: "API route not found." });
      }

      await serveStatic(pathname, response);
    } catch (error) {
      return handleError(response, error);
    }
  };

  return { handler, store, openmuClient, sessions, walletService };
}
