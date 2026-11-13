import crypto from "node:crypto";

export const PLAYER_COOKIE_NAME = "omu_player_sid";
export const ADMIN_COOKIE_NAME = "omu_admin_sid";

export function parseCookies(cookieHeader) {
  const result = {};
  if (!cookieHeader || typeof cookieHeader !== "string") return result;
  for (const part of cookieHeader.split(";")) {
    const idx = part.indexOf("=");
    if (idx <= 0) continue;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    try {
      result[key] = decodeURIComponent(value);
    } catch {
      result[key] = value;
    }
  }
  return result;
}

export function serializeCookie(name, value, { maxAge, httpOnly = true, secure = false, sameSite = "Lax", path = "/" } = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`, `Path=${path}`, `SameSite=${sameSite}`];
  if (httpOnly) parts.push("HttpOnly");
  if (secure) parts.push("Secure");
  if (typeof maxAge === "number") parts.push(`Max-Age=${Math.max(0, Math.floor(maxAge))}`);
  return parts.join("; ");
}

export function createSessionManager(config, store) {
  function signToken(rawToken) {
    const mac = crypto.createHmac("sha256", config.sessionSecret).update(rawToken).digest("base64url");
    return `${rawToken}.${mac}`;
  }

  function verifyAndHashToken(cookieValue) {
    if (!cookieValue || typeof cookieValue !== "string") return null;
    const dot = cookieValue.lastIndexOf(".");
    if (dot <= 10) return null;
    const rawToken = cookieValue.slice(0, dot);
    const providedMac = cookieValue.slice(dot + 1);
    const expectedMac = crypto.createHmac("sha256", config.sessionSecret).update(rawToken).digest("base64url");
    const a = Buffer.from(providedMac);
    const b = Buffer.from(expectedMac);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    return crypto.createHash("sha256").update(rawToken).digest("hex");
  }

  async function issueSession({ principalType, loginName, roles = [], ipAddress = null, userAgent = null }) {
    const rawToken = crypto.randomBytes(32).toString("base64url");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + config.sessionTtlSeconds * 1000);
    await store.createSession({
      tokenHash,
      principalType,
      loginName,
      roles,
      ipAddress,
      userAgent,
      expiresAt,
    });
    const cookieName = principalType === "admin" ? ADMIN_COOKIE_NAME : PLAYER_COOKIE_NAME;
    const setCookie = serializeCookie(cookieName, signToken(rawToken), {
      maxAge: config.sessionTtlSeconds,
      httpOnly: true,
      secure: config.cookieSecure,
      sameSite: "Lax",
    });
    return { setCookie, expiresAt };
  }

  async function resolveSession(request, principalType) {
    const cookies = parseCookies(request.headers.cookie);
    const cookieName = principalType === "admin" ? ADMIN_COOKIE_NAME : PLAYER_COOKIE_NAME;
    const tokenHash = verifyAndHashToken(cookies[cookieName]);
    if (!tokenHash) return null;
    const session = await store.getSession(tokenHash);
    if (!session || session.principalType !== principalType) return null;
    return { ...session, tokenHash };
  }

  async function revokeSessionFromRequest(request, principalType) {
    const cookies = parseCookies(request.headers.cookie);
    const cookieName = principalType === "admin" ? ADMIN_COOKIE_NAME : PLAYER_COOKIE_NAME;
    const tokenHash = verifyAndHashToken(cookies[cookieName]);
    if (tokenHash) {
      await store.revokeSession(tokenHash);
    }
    return serializeCookie(cookieName, "", {
      maxAge: 0,
      httpOnly: true,
      secure: config.cookieSecure,
      sameSite: "Lax",
    });
  }

  return {
    issueSession,
    resolveSession,
    revokeSessionFromRequest,
  };
}

export function createRateLimiter() {
  const buckets = new Map();

  return function checkRateLimit(bucketName, key, { limit = 10, windowMs = 60_000 } = {}) {
    const now = Date.now();
    const mapKey = `${bucketName}:${key}`;
    const entry = buckets.get(mapKey);
    if (!entry || entry.resetAt <= now) {
      buckets.set(mapKey, { count: 1, resetAt: now + windowMs });
      return { limited: false, remaining: limit - 1 };
    }
    entry.count += 1;
    return { limited: entry.count > limit, remaining: Math.max(0, limit - entry.count) };
  };
}

export function getClientIp(request, config) {
  if (config.trustProxy) {
    const forwarded = String(request.headers["x-forwarded-for"] ?? "").split(",")[0].trim();
    if (forwarded) return forwarded;
  }
  return request.socket?.remoteAddress || "unknown";
}

export function isCsrfOriginValid(request, config) {
  const method = String(request.method || "GET").toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") return true;

  const origin = request.headers.origin;
  if (!origin) return true;

  if (config.allowedOrigins.includes(origin)) return true;

  const host = request.headers["x-forwarded-host"] || request.headers.host;
  if (!host) return false;
  try {
    const originHost = new URL(origin).host;
    return originHost.toLowerCase() === String(host).toLowerCase();
  } catch {
    return false;
  }
}

