import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  createHandler,
  loadConfig,
  normalizeCharacterClass,
  normalizeCharacterRankingItem,
  validateRegistration,
} from "./app.mjs";
import { InMemoryWebStore } from "./db/inMemoryStore.mjs";
import { buildPromptPayPayload, verifyWebhookHmacSignature } from "./services/paymentProviders.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function makeTestConfig(upstreamUrl, overrides = {}) {
  return loadConfig({
    NODE_ENV: "test",
    ALLOW_INMEMORY_WEB_STORE: "true",
    OPENMU_API_URL: upstreamUrl,
    OPENMU_API_KEY: "test-openmu-internal-api-key-32chars!",
    SESSION_SECRET: "test-session-secret-that-is-over-32-chars",
    PAYMENT_WEBHOOK_SECRET: "test-webhook-hmac-secret-over-32chars",
    PROMPTPAY_ID: "0812345678",
    PROMPTPAY_NAME: "OpenMU-Origins",
    ENABLE_DEV_TOPUP_SANDBOX: "true",
    PUBLIC_WEB_URL: "http://127.0.0.1",
    ...overrides,
  });
}

async function listen(handler) {
  const server = createServer(handler);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const addr = server.address();
  return { server, url: `http://127.0.0.1:${addr.port}` };
}

function extractCookies(setCookieHeaders) {
  const map = new Map();
  const list = Array.isArray(setCookieHeaders) ? setCookieHeaders : setCookieHeaders ? [setCookieHeaders] : [];
  for (const raw of list) {
    const first = String(raw).split(";")[0];
    const eq = first.indexOf("=");
    if (eq > 0) {
      map.set(first.slice(0, eq).trim(), first.slice(eq + 1).trim());
    }
  }
  return map;
}

function createFakeOpenMuServer() {
  const accounts = new Map([
    [
      "hero01",
      {
        loginName: "hero01",
        eMail: "hero01@example.com",
        password: "StrongPass123",
        state: "Normal",
        online: false,
        serverId: null,
        onlineTimeSeconds: 7500,
        wCoinC: 120,
        wCoinP: 0,
        goblinPoints: 0,
        pendingWCoinC: 0,
        characters: [
          {
            id: "00000000-0000-0000-0000-000000000101",
            name: "BladeOne",
            characterClassId: "00000002-0010-0000-0000-000000000000",
            className: "Dark Knight",
            classShort: "DK",
            classId: "dk",
            lvl: 400,
            masterlvl: 0,
            resets: 1,
            levelUpPoints: 250,
            strength: 128,
            agility: 70,
            vitality: 25,
            energy: 10,
            leadership: 0,
            currentMapId: "00000300-0000-0000-0000-000000000000",
            mapName: "Lorencia",
            pkState: 1,
            pkLevel: "Hero",
            playerKillCount: 2,
            zen: 50000000,
            isOnline: false,
          },
        ],
      },
    ],
  ]);

  const grants = [];
  let forceGrantStatus = null;
  let disconnectCalls = 0;

  const handler = async (req, res) => {
    const url = new URL(req.url, "http://127.0.0.1");
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const bodyText = Buffer.concat(chunks).toString("utf8");
    const body = bodyText ? JSON.parse(bodyText) : {};

    const send = (status, payload) => {
      res.writeHead(status, { "Content-Type": "application/json" });
      res.end(JSON.stringify(payload));
    };

    const apiKey = req.headers["x-api-key"];
    if (!url.pathname.startsWith("/api/server/status") && !url.pathname.startsWith("/api/rankings")) {
      if (!apiKey || apiKey !== "test-openmu-internal-api-key-32chars!") {
        return send(401, { message: "Invalid API Key" });
      }
    }

    if (url.pathname === "/api/server/status") {
      return send(200, {
        status: "online",
        totalOnline: 15,
        maxPlayers: 1000,
        realms: [{ id: 0, name: "Origins-1", online: 15, max: 1000, status: "Normal" }],
      });
    }

    if (url.pathname === "/api/accounts" && req.method === "POST") {
      if (accounts.has(body.loginName?.toLowerCase())) {
        return send(409, { message: "Account already exists." });
      }
      accounts.set(body.loginName.toLowerCase(), {
        loginName: body.loginName,
        eMail: body.eMail,
        password: body.password,
        state: "Normal",
        online: false,
        onlineTimeSeconds: 0,
        wCoinC: 0,
        wCoinP: 0,
        goblinPoints: 0,
        pendingWCoinC: 0,
        characters: [],
      });
      return send(201, { loginName: body.loginName, receivedApiKey: apiKey });
    }

    if (url.pathname === "/api/accounts/authenticate" && req.method === "POST") {
      const acc = accounts.get(String(body.loginName || "").toLowerCase());
      if (!acc || acc.password !== body.password) {
        return send(401, { message: "Invalid credentials" });
      }
      if (acc.state === "Banned") {
        return send(403, { message: "Account is banned" });
      }
      return send(200, { loginName: acc.loginName, state: acc.state });
    }

    if (url.pathname === "/api/admin/auth/verify" && req.method === "POST") {
      if (body.loginName === "gmchief" && body.password === "GmSuperSecret123") {
        return send(200, { authenticated: true, loginName: "gmchief", roles: ["Administrator"] });
      }
      return send(401, { authenticated: false, code: "INVALID_CREDENTIALS" });
    }

    if (url.pathname === "/api/accounts" && req.method === "GET") {
      const q = (url.searchParams.get("text") || "").toLowerCase();
      const state = url.searchParams.get("state") || "";
      const list = [...accounts.values()].filter(
        (a) =>
          (!q || a.loginName.toLowerCase().includes(q) || a.eMail.toLowerCase().includes(q)) &&
          (!state || a.state === state)
      );
      return send(200, {
        total: list.length,
        items: list.map((a) => ({ loginName: a.loginName, eMail: a.eMail, state: a.state })),
      });
    }

    const profileMatch = url.pathname.match(/^\/api\/accounts\/([^/]+)\/profile$/);
    if (profileMatch && req.method === "GET") {
      const acc = accounts.get(decodeURIComponent(profileMatch[1]).toLowerCase());
      if (!acc) return send(404, { message: "Account not found" });
      return send(200, {
        loginName: acc.loginName,
        eMail: acc.eMail,
        state: acc.state,
        online: acc.online,
        serverId: acc.serverId,
        onlineTimeSeconds: acc.onlineTimeSeconds,
        balance: {
          wCoinC: acc.wCoinC,
          wCoinP: acc.wCoinP,
          goblinPoints: acc.goblinPoints,
          pendingWCoinC: acc.pendingWCoinC,
        },
        characters: acc.characters,
      });
    }

    const grantMatch = url.pathname.match(/^\/api\/accounts\/([^/]+)\/cash-shop\/grants$/);
    if (grantMatch && req.method === "POST") {
      if (forceGrantStatus) {
        return send(forceGrantStatus, { message: `Forced upstream failure ${forceGrantStatus}` });
      }
      const acc = accounts.get(decodeURIComponent(grantMatch[1]).toLowerCase());
      if (!acc) return send(404, { message: "Account not found" });

      const existing = grants.find((g) => g.reference === body.reference);
      if (existing) {
        return send(200, existing);
      }

      const amount = Number(body.amount || 0);
      acc.wCoinC += amount;
      const grant = {
        id: crypto.randomUUID(),
        loginName: acc.loginName,
        coinType: body.coinType || "WCoinC",
        amount,
        reference: body.reference,
        appliedAt: new Date().toISOString(),
      };
      grants.push(grant);
      return send(200, grant);
    }

    const passMatch = url.pathname.match(/^\/api\/accounts\/([^/]+)\/password\/change$/);
    if (passMatch && req.method === "POST") {
      const acc = accounts.get(decodeURIComponent(passMatch[1]).toLowerCase());
      if (!acc) return send(404, { message: "Account not found" });
      if (acc.password !== body.currentPassword) return send(401, { message: "Wrong current password" });
      acc.password = body.newPassword;
      return send(200, { success: true });
    }

    const stateMatch = url.pathname.match(/^\/api\/accounts\/([^/]+)\/state$/);
    if (stateMatch && req.method === "PUT") {
      const acc = accounts.get(decodeURIComponent(stateMatch[1]).toLowerCase());
      if (!acc) return send(404, { message: "Account not found" });
      acc.state = body.state;
      return send(200, { loginName: acc.loginName, state: acc.state });
    }

    const disconnectMatch = url.pathname.match(/^\/api\/players\/([^/]+)\/disconnect$/);
    if (disconnectMatch && req.method === "POST") {
      disconnectCalls += 1;
      return send(200, { disconnected: true });
    }

    const addStatsMatch = url.pathname.match(/^\/api\/accounts\/([^/]+)\/characters\/([^/]+)\/add-stats$/);
    if (addStatsMatch && req.method === "POST") {
      const acc = accounts.get(decodeURIComponent(addStatsMatch[1]).toLowerCase());
      const ch = acc?.characters.find((c) => c.name === decodeURIComponent(addStatsMatch[2]));
      if (!ch) return send(404, { message: "Character not found" });
      const total = Number(body.strength || 0) + Number(body.agility || 0) + Number(body.vitality || 0) + Number(body.energy || 0);
      if (total <= 0 || total > ch.levelUpPoints) return send(400, { message: "Invalid points" });
      ch.levelUpPoints -= total;
      ch.strength += Number(body.strength || 0);
      return send(200, { success: true, character: ch });
    }

    const resetMatch = url.pathname.match(/^\/api\/accounts\/([^/]+)\/characters\/([^/]+)\/reset$/);
    if (resetMatch && req.method === "POST") {
      const acc = accounts.get(decodeURIComponent(resetMatch[1]).toLowerCase());
      const ch = acc?.characters.find((c) => c.name === decodeURIComponent(resetMatch[2]));
      if (!ch) return send(404, { message: "Character not found" });
      ch.resets += 1;
      ch.lvl = 10;
      return send(200, { success: true, character: ch });
    }

    return send(404, { message: `Unhandled mock route: ${url.pathname}` });
  };

  return {
    handler,
    accounts,
    grants,
    setForceGrantStatus(status) {
      forceGrantStatus = status;
    },
    getDisconnectCalls() {
      return disconnectCalls;
    },
  };
}

test("configuration fails closed on unsafe or missing production settings", () => {
  assert.throws(() => loadConfig({}), /OPENMU_API_URL/);
  assert.throws(
    () => loadConfig({ OPENMU_API_URL: "https://openmu.local", OPENMU_API_KEY: "short" }),
    /OPENMU_API_KEY/
  );
  assert.throws(
    () =>
      loadConfig({
        NODE_ENV: "production",
        ALLOW_INMEMORY_WEB_STORE: "true",
        OPENMU_API_URL: "https://openmu.local",
        OPENMU_API_KEY: "x".repeat(32),
        SESSION_SECRET: "y".repeat(32),
      }),
    /DATABASE_URL is required in production/
  );
  assert.throws(
    () =>
      loadConfig({
        NODE_ENV: "production",
        DATABASE_URL: "postgres://user:pass@localhost:5432/openmu",
        OPENMU_API_URL: "https://openmu.local",
        OPENMU_API_KEY: "x".repeat(32),
        SESSION_SECRET: "too-short",
      }),
    /SESSION_SECRET/
  );

  const prodCfg = loadConfig({
    NODE_ENV: "production",
    DATABASE_URL: "postgres://user:pass@localhost:5432/openmu",
    OPENMU_API_URL: "https://openmu.local",
    OPENMU_API_KEY: "x".repeat(32),
    SESSION_SECRET: "y".repeat(32),
    ENABLE_DEV_TOPUP_SANDBOX: "true",
  });
  assert.equal(prodCfg.enableDevTopupSandbox, false);
  assert.equal(prodCfg.allowInMemoryStore, false);
});

test("PostgreSQL initial migration defines required web tables, UNIQUE keys, and CHECK constraints", () => {
  const sqlPath = path.join(__dirname, "db", "migrations", "001_initial_web_schema.sql");
  const sql = fs.readFileSync(sqlPath, "utf8");
  for (const table of [
    "web.schema_migrations",
    "web.wallet_accounts",
    "web.wallet_ledger",
    "web.online_time_redemptions",
    "web.credit_exchanges",
    "web.topup_orders",
    "web.payment_webhook_events",
    "web.web_sessions",
    "web.web_audit_logs",
  ]) {
    assert.ok(sql.includes(table), `Missing table ${table} in 001_initial_web_schema.sql`);
  }
  assert.ok(sql.includes("CHECK (credits_balance >= 0)"));
  assert.ok(sql.includes("CHECK (amount_thb > 0)"));
  assert.ok(sql.includes("idempotency_key TEXT NOT NULL UNIQUE"));
  assert.ok(sql.includes("openmu_reference TEXT NOT NULL UNIQUE"));
});

test("validation, character normalization, PromptPay EMVCo payload, and HMAC helpers work correctly", () => {
  assert.deepEqual(
    validateRegistration({ loginName: "Hero02", password: "GoodPass9!", email: "hero02@example.com" }),
    { loginName: "Hero02", password: "GoodPass9!", eMail: "hero02@example.com" }
  );
  assert.equal(typeof validateRegistration({ loginName: "too-long-login", password: "GoodPass9!", email: "a@b.com" }), "string");

  const cls = normalizeCharacterClass({ classNumber: 0 });
  assert.equal(cls.classShort, "DW");
  const rankItem = normalizeCharacterRankingItem({ name: "Wizard1", className: "Soul Master", lvl: 350 }, 0);
  assert.equal(rankItem.rank, 1);
  assert.equal(rankItem.classId, "dw");

  const qr = buildPromptPayPayload("0812345678", 300);
  assert.ok(qr && qr.startsWith("00020101021229370016A00000067701011101130066812345678"));
  assert.equal(buildPromptPayPayload("", 300), null);

  const secret = "webhook-secret-over-32-chars-ok";
  const nowSec = Math.floor(Date.now() / 1000);
  const rawBody = JSON.stringify({ eventId: "evt_1", orderId: "ord_1" });
  const digest = crypto.createHmac("sha256", secret).update(`${nowSec}.${rawBody}`).digest("hex");
  assert.equal(
    verifyWebhookHmacSignature({
      rawBody,
      headers: { "x-webhook-signature": `t=${nowSec},v1=${digest}` },
      secret,
      nowSeconds: nowSec,
    }).valid,
    true
  );
  assert.equal(
    verifyWebhookHmacSignature({
      rawBody,
      headers: { "x-webhook-signature": `t=${nowSec - 600},v1=${digest}` },
      secret,
      nowSeconds: nowSec,
    }).valid,
    false
  );
});

test("Full BFF integration: Auth isolation, P0-A Online Rewards, P0-B Credit Exchange (idempotency + auto-refund + retry), P0-C Top-Up, Characters & Admin", async (t) => {
  const fakeOpenMu = createFakeOpenMuServer();
  const upstream = await listen(fakeOpenMu.handler);
  const store = new InMemoryWebStore();
  const config = makeTestConfig(upstream.url);

  let fakePayPalCaptured = 0;
  const fakeFetch = async (url, init = {}) => {
    const target = String(url);
    if (target.startsWith("https://api-m.sandbox.paypal.com/v1/oauth2/token")) {
      return new Response(JSON.stringify({ access_token: "pp-token-123" }), { status: 200 });
    }
    if (target.startsWith("https://api-m.sandbox.paypal.com/v2/checkout/orders") && !target.includes("/capture")) {
      return new Response(
        JSON.stringify({
          id: "PP-ORDER-999",
          links: [{ rel: "approve", href: "https://sandbox.paypal.com/checkoutnow?token=PP-ORDER-999" }],
        }),
        { status: 201 }
      );
    }
    if (target.includes("/v2/checkout/orders/PP-ORDER-999/capture")) {
      fakePayPalCaptured += 1;
      return new Response(
        JSON.stringify({
          status: "COMPLETED",
          purchase_units: [
            {
              payments: {
                captures: [{ id: "PP-CAP-777", status: "COMPLETED", amount: { currency_code: "THB", value: "300.00" } }],
              },
            },
          ],
        }),
        { status: 201 }
      );
    }
    return fetch(url, init);
  };

  config.paypalClientId = "pp-client-id";
  config.paypalClientSecret = "pp-client-secret";
  const bffApp = createHandler(config, { store, fetchImpl: fakeFetch });
  const bff = await listen(bffApp.handler);
  t.after(() => {
    bff.server.closeAllConnections?.();
    bff.server.close();
    upstream.server.closeAllConnections?.();
    upstream.server.close();
  });

  // 1. Cross-origin CSRF guard rejects spoofed browser origin
  const csrfRes = await fetch(`${bff.url}/api/account/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "https://evil.attacker" },
    body: JSON.stringify({ loginName: "hero02", password: "GoodPassword9!", email: "hero02@example.com" }),
  });
  assert.equal(csrfRes.status, 403);

  // 2. Account registration works & never leaks OpenMU API key
  const regRes = await fetch(`${bff.url}/api/account/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ loginName: "hero02", password: "GoodPassword9!", email: "hero02@example.com" }),
  });
  assert.equal(regRes.status, 201);
  assert.doesNotMatch(await regRes.text(), /test-openmu-internal-api-key/);

  // 3. Player login issues omu_player_sid, cannot access Admin endpoints
  const loginRes = await fetch(`${bff.url}/api/account/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ loginName: "hero01", password: "StrongPass123" }),
  });
  assert.equal(loginRes.status, 200);
  const playerCookies = extractCookies(loginRes.headers.getSetCookie?.() || loginRes.headers.get("set-cookie"));
  const playerCookieHeader = `omu_player_sid=${playerCookies.get("omu_player_sid")}`;
  assert.ok(playerCookies.get("omu_player_sid"));

  const playerOnAdmin = await fetch(`${bff.url}/api/admin/me`, { headers: { Cookie: playerCookieHeader } });
  assert.equal(playerOnAdmin.status, 401);

  // 4. P0-A: Online-Time Rewards (7500s -> 2h = +10 Credits, checkpoint = 7200s, idempotent replay)
  const redeemTooMany = await fetch(`${bff.url}/api/rewards/online-time/redeem`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: playerCookieHeader, "Idempotency-Key": "p0a-too-high" },
    body: JSON.stringify({ hours: 3 }),
  });
  assert.equal(redeemTooMany.status, 400);

  const redeemOk = await fetch(`${bff.url}/api/rewards/online-time/redeem`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: playerCookieHeader, "Idempotency-Key": "p0a-redeem-1" },
    body: JSON.stringify({}),
  });
  assert.equal(redeemOk.status, 200);
  const redeemBody = await redeemOk.json();
  assert.equal(redeemBody.redemption.hoursRedeemed, 2);
  assert.equal(redeemBody.redemption.creditsGranted, 10);
  assert.equal(redeemBody.wallet.redeemedOnlineSeconds, 7200);
  assert.equal(redeemBody.wallet.creditsBalance, 10);

  // Replay exact Idempotency-Key -> zero duplicate grant
  const redeemReplay = await fetch(`${bff.url}/api/rewards/online-time/redeem`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: playerCookieHeader, "Idempotency-Key": "p0a-redeem-1" },
    body: JSON.stringify({}),
  });
  assert.equal(redeemReplay.status, 200);
  const redeemReplayBody = await redeemReplay.json();
  assert.equal(redeemReplayBody.idempotent, true);
  assert.equal(redeemReplayBody.wallet.creditsBalance, 10);

  // New Idempotency-Key with 300s left -> rejected (<1h)
  const redeemLeftover = await fetch(`${bff.url}/api/rewards/online-time/redeem`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: playerCookieHeader, "Idempotency-Key": "p0a-redeem-2" },
    body: JSON.stringify({}),
  });
  assert.equal(redeemLeftover.status, 400);

  // 5. P0-C Top-Up #1: Dev Sandbox creates server-priced order (ignores spoofed client price) & fulfills Credits + WCoinC
  const sandboxCreate = await fetch(`${bff.url}/api/topup/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: playerCookieHeader, "Idempotency-Key": "topup-sbx-1" },
    body: JSON.stringify({ packageId: "tier-50", provider: "dev_sandbox", amountThb: 1, creditsAmount: 999999 }),
  });
  assert.equal(sandboxCreate.status, 201);
  const sandboxOrder = (await sandboxCreate.json()).order;
  assert.equal(sandboxOrder.amountThb, 50);
  assert.equal(sandboxOrder.creditsAmount, 275);
  assert.equal(sandboxOrder.wcoinAmount, 60);

  const sandboxConfirm = await fetch(`${bff.url}/api/topup/orders/${sandboxOrder.id}/sandbox-confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: playerCookieHeader },
    body: JSON.stringify({}),
  });
  assert.equal(sandboxConfirm.status, 200);
  const sandboxSettled = await sandboxConfirm.json();
  assert.equal(sandboxSettled.wallet.creditsBalance, 285); // 10 + 275
  assert.equal(sandboxSettled.account.wcoinC, 180); // 120 + 60

  // 6. P0-B Credit Exchange: 100 Credits -> 50 WCoinC, idempotent replay, 400 refund reversal, and 503 retry recovery
  const badMultiple = await fetch(`${bff.url}/api/exchange/credits-to-wcoin`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: playerCookieHeader, "Idempotency-Key": "ex-bad-mult" },
    body: JSON.stringify({ credits: 50 }),
  });
  assert.equal(badMultiple.status, 400);

  const exOk = await fetch(`${bff.url}/api/exchange/credits-to-wcoin`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: playerCookieHeader, "Idempotency-Key": "ex-ok-1" },
    body: JSON.stringify({ credits: 100 }),
  });
  assert.equal(exOk.status, 200);
  const exOkBody = await exOk.json();
  assert.equal(exOkBody.wallet.creditsBalance, 185);
  assert.equal(exOkBody.account.wcoinC, 230); // 180 + 50
  assert.equal(exOkBody.exchange.status, "COMPLETED");

  const exReplay = await fetch(`${bff.url}/api/exchange/credits-to-wcoin`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: playerCookieHeader, "Idempotency-Key": "ex-ok-1" },
    body: JSON.stringify({ credits: 100 }),
  });
  assert.equal(exReplay.status, 200);
  const exReplayBody = await exReplay.json();
  assert.equal(exReplayBody.idempotent, true);
  assert.equal(exReplayBody.wallet.creditsBalance, 185);
  assert.equal(exReplayBody.account.wcoinC, 230);

  // Simulate upstream 400 definitive reject -> must refund 100 Credits via reversal ledger entry
  fakeOpenMu.setForceGrantStatus(400);
  const exReject = await fetch(`${bff.url}/api/exchange/credits-to-wcoin`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: playerCookieHeader, "Idempotency-Key": "ex-reject-1" },
    body: JSON.stringify({ credits: 100 }),
  });
  assert.equal(exReject.status, 400);
  const exRejectBody = await exReject.json();
  assert.equal(exRejectBody.code, "EXCHANGE_REJECTED_REFUNDED");
  assert.equal(exRejectBody.wallet.creditsBalance, 185);
  assert.equal(exRejectBody.exchange.status, "REVERSED");

  // Simulate upstream 503 transient failure -> debited & PENDING_GRANT; later reconcile completes grant
  fakeOpenMu.setForceGrantStatus(503);
  const exTransient = await fetch(`${bff.url}/api/exchange/credits-to-wcoin`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: playerCookieHeader, "Idempotency-Key": "ex-retry-1" },
    body: JSON.stringify({ credits: 100 }),
  });
  assert.equal(exTransient.status, 503);
  fakeOpenMu.setForceGrantStatus(null);
  const retrySummary = await store.listPendingExchanges(10);
  assert.equal(retrySummary.length, 1);
  // Trigger same Idempotency-Key retry cleanly completes the pending grant
  const exRecover = await fetch(`${bff.url}/api/exchange/credits-to-wcoin`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: playerCookieHeader, "Idempotency-Key": "ex-retry-1" },
    body: JSON.stringify({ credits: 100 }),
  });
  assert.equal(exRecover.status, 200);
  const exRecoverBody = await exRecover.json();
  assert.equal(exRecoverBody.wallet.creditsBalance, 85);
  assert.equal(exRecoverBody.account.wcoinC, 280);

  // 7. P0-C Top-Up #2: PromptPay QR + Signed HMAC Webhook + Duplicate Webhook Replay
  const ppOrderRes = await fetch(`${bff.url}/api/topup/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: playerCookieHeader, "Idempotency-Key": "topup-qr-1" },
    body: JSON.stringify({ packageId: "tier-300", provider: "promptpay_manual" }),
  });
  assert.equal(ppOrderRes.status, 201);
  const ppOrder = (await ppOrderRes.json()).order;
  assert.ok(ppOrder.checkoutPayload.qrPayload);

  const whPayload = JSON.stringify({
    eventId: "evt_promptpay_300_1",
    orderId: ppOrder.id,
    amountThb: 300,
    transactionId: "BANK-TX-300",
  });
  const ts = Math.floor(Date.now() / 1000);
  const badWh = await fetch(`${bff.url}/api/payments/webhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Webhook-Signature": `t=${ts},v1=${"0".repeat(64)}` },
    body: whPayload,
  });
  assert.equal(badWh.status, 401);

  const goodSig = crypto.createHmac("sha256", config.paymentWebhookSecret).update(`${ts}.${whPayload}`).digest("hex");
  const goodWh = await fetch(`${bff.url}/api/payments/webhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Webhook-Signature": `t=${ts},v1=${goodSig}` },
    body: whPayload,
  });
  assert.equal(goodWh.status, 200);
  const goodWhBody = await goodWh.json();
  assert.equal(goodWhBody.order.status, "FULFILLED");
  assert.equal(goodWhBody.wallet.creditsBalance, 2245); // 85 + 2160
  assert.equal(fakeOpenMu.accounts.get("hero01").wCoinC, 930); // 280 + 650

  // Replay webhook eventId -> duplicate: true, zero extra credit
  const replayWh = await fetch(`${bff.url}/api/payments/webhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Webhook-Signature": `t=${ts},v1=${goodSig}` },
    body: whPayload,
  });
  assert.equal(replayWh.status, 200);
  assert.equal((await replayWh.json()).duplicate, true);
  assert.equal(fakeOpenMu.accounts.get("hero01").wCoinC, 930);

  // 8. P0-C Top-Up #3: PayPal Create & Capture
  const ppalCreate = await fetch(`${bff.url}/api/topup/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: playerCookieHeader, "Idempotency-Key": "topup-paypal-1" },
    body: JSON.stringify({ packageId: "tier-300", provider: "paypal" }),
  });
  assert.equal(ppalCreate.status, 201);
  const ppalOrder = (await ppalCreate.json()).order;
  assert.equal(ppalOrder.providerOrderId, "PP-ORDER-999");

  const ppalCapture = await fetch(`${bff.url}/api/topup/orders/${ppalOrder.id}/paypal-capture`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: playerCookieHeader },
    body: JSON.stringify({}),
  });
  assert.equal(ppalCapture.status, 200);
  const ppalBody = await ppalCapture.json();
  assert.equal(ppalBody.wallet.creditsBalance, 4405); // 2245 + 2160
  assert.equal(ppalBody.account.wcoinC, 1580); // 930 + 650
  assert.equal(fakePayPalCaptured, 1);

  // 9. Character self-service & account password change
  const addStats = await fetch(`${bff.url}/api/characters/addstats`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: playerCookieHeader },
    body: JSON.stringify({ characterName: "BladeOne", strength: 50, agility: 0, vitality: 0, energy: 0 }),
  });
  assert.equal(addStats.status, 200);
  assert.equal(fakeOpenMu.accounts.get("hero01").characters[0].strength, 178);

  const changePass = await fetch(`${bff.url}/api/account/changepassword`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: playerCookieHeader },
    body: JSON.stringify({ currentPassword: "StrongPass123", newPassword: "NewPassword99" }),
  });
  assert.equal(changePass.status, 200);
  assert.equal(fakeOpenMu.accounts.get("hero01").password, "NewPassword99");

  // 10. Admin authentication, user search, wallet adjust, GM confirm PromptPay, kick, & audit logs
  const adminLogin = await fetch(`${bff.url}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ loginName: "gmchief", password: "GmSuperSecret123" }),
  });
  assert.equal(adminLogin.status, 200);
  const adminCookies = extractCookies(adminLogin.headers.getSetCookie?.() || adminLogin.headers.get("set-cookie"));
  const adminCookieHeader = `omu_admin_sid=${adminCookies.get("omu_admin_sid")}`;

  // Admin cookie cannot hit player-only endpoint
  const adminOnPlayer = await fetch(`${bff.url}/api/wallet/summary`, { headers: { Cookie: adminCookieHeader } });
  assert.equal(adminOnPlayer.status, 401);

  const pendingQr = await fetch(`${bff.url}/api/topup/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: playerCookieHeader, "Idempotency-Key": "topup-qr-manual" },
    body: JSON.stringify({ packageId: "tier-50", provider: "promptpay_manual" }),
  });
  const pendingQrOrder = (await pendingQr.json()).order;

  const gmConfirm = await fetch(`${bff.url}/api/admin/topup/orders/${pendingQrOrder.id}/confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: adminCookieHeader },
    body: JSON.stringify({ providerTransactionId: "SLIP-2026-001" }),
  });
  assert.equal(gmConfirm.status, 200);
  assert.equal((await gmConfirm.json()).wallet.creditsBalance, 4680); // 4405 + 275

  const adminAdjust = await fetch(`${bff.url}/api/admin/users/hero01/wallet-adjust`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: adminCookieHeader,
      "Idempotency-Key": "gm-adj-1",
    },
    body: JSON.stringify({ currency: "credits", amount: 120, reason: "Castle Siege event reward" }),
  });
  assert.equal(adminAdjust.status, 200);
  assert.equal((await adminAdjust.json()).wallet.creditsBalance, 4800);

  const disconnect = await fetch(`${bff.url}/api/admin/users/hero01/disconnect`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: adminCookieHeader },
    body: JSON.stringify({}),
  });
  assert.equal(disconnect.status, 200);
  assert.equal(fakeOpenMu.getDisconnectCalls(), 1);

  const auditRes = await fetch(`${bff.url}/api/admin/audit-logs?limit=20`, {
    headers: { Cookie: adminCookieHeader },
  });
  assert.equal(auditRes.status, 200);
  const auditBody = await auditRes.json();
  assert.ok(auditBody.logs.some((l) => l.action === "TOPUP_PAID_AND_CREDITED"));
  assert.ok(auditBody.logs.some((l) => l.action === "ADMIN_WALLET_ADJUST"));
});
