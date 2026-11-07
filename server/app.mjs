import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("../dist", import.meta.url)));
const limits = new Map();
const mimeTypes = new Map([[".css", "text/css; charset=utf-8"], [".html", "text/html; charset=utf-8"], [".ico", "image/x-icon"], [".jpg", "image/jpeg"], [".jpeg", "image/jpeg"], [".js", "text/javascript; charset=utf-8"], [".json", "application/json; charset=utf-8"], [".png", "image/png"], [".svg", "image/svg+xml"], [".webp", "image/webp"], [".woff2", "font/woff2"]]);

export function loadConfig(env = process.env) {
  const apiUrl = (env.OPENMU_API_URL ?? "").replace(/\/+$/, "");
  const apiKey = env.OPENMU_API_KEY ?? "";
  if (!apiUrl || !/^https?:\/\//.test(apiUrl)) throw new Error("OPENMU_API_URL must be an absolute HTTP(S) URL.");
  if (apiKey.length < 32) throw new Error("OPENMU_API_KEY must contain at least 32 characters.");
  return { apiUrl, apiKey, port: Number.parseInt(env.PORT ?? "8080", 10), trustProxy: env.TRUST_PROXY === "true", requestTimeoutMs: Number.parseInt(env.UPSTREAM_TIMEOUT_MS ?? "8000", 10) };
}

export function validateRegistration(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return "Invalid request.";
  const loginName = typeof value.loginName === "string" ? value.loginName.trim() : "";
  const password = typeof value.password === "string" ? value.password : "";
  const email = typeof value.email === "string" ? value.email.trim() : "";
  if (!/^[\x21-\x7E]{3,10}$/.test(loginName)) return "Account name must be 3-10 printable ASCII characters without spaces.";
  if (!/^[\x20-\x7E]{8,20}$/.test(password)) return "Password must be 8-20 printable ASCII characters.";
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "A valid email address is required.";
  return { loginName, password, eMail: email };
}

function securityHeaders(response) {
  response.setHeader("Content-Security-Policy", "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; font-src 'self' data:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
  response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  response.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("X-Frame-Options", "DENY");
}

function json(response, status, body, headers = {}) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...headers });
  response.end(JSON.stringify(body));
}

function rateLimited(request, config) {
  const forwarded = config.trustProxy ? String(request.headers["x-forwarded-for"] ?? "").split(",")[0].trim() : "";
  const key = forwarded || request.socket.remoteAddress || "unknown";
  const now = Date.now();
  const current = limits.get(key);
  if (!current || current.resetAt <= now) { limits.set(key, { count: 1, resetAt: now + 60_000 }); return false; }
  current.count += 1;
  return current.count > 5;
}

async function readBody(request, maximum = 8192) {
  const chunks = [];
  let length = 0;
  for await (const chunk of request) {
    length += chunk.length;
    if (length > maximum) throw Object.assign(new Error("Payload too large"), { status: 413 });
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

async function upstream(config, path, init = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.requestTimeoutMs);
  try {
    return await fetch(`${config.apiUrl}${path}`, { ...init, headers: { Accept: "application/json", "X-Api-Key": config.apiKey, ...init.headers }, signal: controller.signal });
  } finally { clearTimeout(timeout); }
}

async function register(request, response, config) {
  if (request.method !== "POST") return json(response, 405, { error: "Method not allowed." }, { Allow: "POST" });
  if (!String(request.headers["content-type"] ?? "").toLowerCase().startsWith("application/json")) return json(response, 415, { error: "Content-Type must be application/json." });
  if (rateLimited(request, config)) return json(response, 429, { error: "Too many registration attempts. Please wait one minute." }, { "Retry-After": "60" });
  let body;
  try { body = await readBody(request); } catch (error) { return json(response, error.status ?? 400, { error: error.status ? error.message : "Invalid JSON request." }); }
  const valid = validateRegistration(body);
  if (typeof valid === "string") return json(response, 400, { error: valid });
  try {
    const result = await upstream(config, "/api/accounts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(valid) });
    if (result.status === 201) return json(response, 201, { message: "Account created successfully." });
    if (result.status === 409) return json(response, 409, { error: "This account name is already in use." });
    if (result.status === 400) return json(response, 400, { error: "The account details were rejected by the game server." });
    console.error("OpenMU registration returned status", result.status);
    return json(response, 502, { error: "Registration is temporarily unavailable." });
  } catch (error) {
    console.error("OpenMU registration request failed", error instanceof Error ? error.message : "unknown error");
    return json(response, 503, { error: "Registration is temporarily unavailable." });
  }
}

async function status(response, config) {
  try {
    const result = await upstream(config, "/api/status");
    if (!result.ok) throw new Error(`upstream status ${result.status}`);
    let value = await result.json();
    if (typeof value === "string") value = JSON.parse(value);
    const realms = Array.isArray(value.realms)
      ? value.realms.map((r, i) => ({
          id: typeof r.id === "number" ? r.id : i,
          name: typeof r.name === "string" ? r.name : `Origins-${i + 1}`,
          online: Number.isInteger(r.online) ? r.online : 0,
          max: Number.isInteger(r.max) ? r.max : 2500,
          loadPct: Number.isInteger(r.loadPct) ? r.loadPct : 0,
          pvp: typeof r.pvp === "boolean" ? r.pvp : true,
          status: typeof r.status === "string" ? r.status : "Normal",
        }))
      : [];
    return json(response, 200, { state: "online", players: Number.isInteger(value.players) ? value.players : null, realms, updatedAt: new Date().toISOString() }, { "Cache-Control": "public, max-age=10" });
  } catch (error) {
    console.error("OpenMU status request failed", error instanceof Error ? error.message : "unknown error");
    return json(response, 200, { state: "offline", players: null, realms: [], updatedAt: new Date().toISOString() }, { "Cache-Control": "public, max-age=5" });
  }
}

export function resolveStaticFile(requestUrl) {
  let urlPath;
  try { urlPath = decodeURIComponent(new URL(requestUrl, "http://localhost").pathname); }
  catch { return null; }
  const candidate = resolve(root, normalize(urlPath).replace(/^[/\\]+/, ""));
  const insideRoot = candidate === root || candidate.startsWith(`${root}${sep}`);
  return insideRoot && existsSync(candidate) && statSync(candidate).isFile() ? candidate : join(root, "index.html");
}

function staticFile(request, response) {
  const file = resolveStaticFile(request.url);
  if (!file) return json(response, 400, { error: "Invalid URL path." });
  const extension = extname(file).toLowerCase();
  response.writeHead(200, { "Content-Type": mimeTypes.get(extension) ?? "application/octet-stream", "Cache-Control": extension === ".html" ? "no-cache" : "public, max-age=31536000, immutable" });
  if (request.method === "HEAD") return response.end();
  createReadStream(file).pipe(response);
}

export function createHandler(config) {
  return async (request, response) => {
    securityHeaders(response);
    const pathname = new URL(request.url, "http://localhost").pathname;
    if (pathname === "/health/live") return json(response, 200, { status: "ok" });
    if (pathname === "/health/ready") {
      try { const result = await upstream(config, "/api/status"); return json(response, result.ok ? 200 : 503, { status: result.ok ? "ready" : "unavailable" }); }
      catch { return json(response, 503, { status: "unavailable" }); }
    }
    if (pathname === "/api/account/register") return register(request, response, config);
    if (pathname === "/api/server/status" && request.method === "GET") return status(response, config);
    if (pathname.startsWith("/api/")) return json(response, 404, { error: "Not found." });
    if (request.method === "GET" || request.method === "HEAD") return staticFile(request, response);
    return json(response, 404, { error: "Not found." });
  };
}
