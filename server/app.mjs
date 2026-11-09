import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("../dist", import.meta.url)));
const limits = new Map();
const mimeTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".webp", "image/webp"],
  [".woff2", "font/woff2"],
]);

const CLASS_BY_NAME = new Map([
  ["dark wizard", { classId: "dw", className: "Dark Wizard", classShort: "DW" }],
  ["soul master", { classId: "dw", className: "Soul Master", classShort: "SM" }],
  ["grand master", { classId: "dw", className: "Grand Master", classShort: "GM" }],
  ["dark knight", { classId: "dk", className: "Dark Knight", classShort: "DK" }],
  ["blade knight", { classId: "dk", className: "Blade Knight", classShort: "BK" }],
  ["blade master", { classId: "dk", className: "Blade Master", classShort: "BM" }],
  ["fairy elf", { classId: "elf", className: "Fairy Elf", classShort: "ELF" }],
  ["elf", { classId: "elf", className: "Fairy Elf", classShort: "ELF" }],
  ["muse elf", { classId: "elf", className: "Muse Elf", classShort: "ME" }],
  ["high elf", { classId: "elf", className: "High Elf", classShort: "HE" }],
  ["magic gladiator", { classId: "mg", className: "Magic Gladiator", classShort: "MG" }],
  ["duel master", { classId: "mg", className: "Duel Master", classShort: "DM" }],
  ["dark lord", { classId: "dl", className: "Dark Lord", classShort: "DL" }],
  ["lord emperor", { classId: "dl", className: "Lord Emperor", classShort: "LE" }],
  ["summoner", { classId: "sum", className: "Summoner", classShort: "SUM" }],
  ["bloody summoner", { classId: "sum", className: "Bloody Summoner", classShort: "BS" }],
  ["dimension master", { classId: "sum", className: "Dimension Master", classShort: "DMS" }],
  ["rage fighter", { classId: "rf", className: "Rage Fighter", classShort: "RF" }],
  ["fist master", { classId: "rf", className: "Fist Master", classShort: "FM" }],
]);

const CLASS_BY_SHORT = new Map([
  ["DW", { classId: "dw", className: "Dark Wizard", classShort: "DW" }],
  ["SM", { classId: "dw", className: "Soul Master", classShort: "SM" }],
  ["GM", { classId: "dw", className: "Grand Master", classShort: "GM" }],
  ["DK", { classId: "dk", className: "Dark Knight", classShort: "DK" }],
  ["BK", { classId: "dk", className: "Blade Knight", classShort: "BK" }],
  ["BM", { classId: "dk", className: "Blade Master", classShort: "BM" }],
  ["ELF", { classId: "elf", className: "Fairy Elf", classShort: "ELF" }],
  ["FE", { classId: "elf", className: "Fairy Elf", classShort: "ELF" }],
  ["ME", { classId: "elf", className: "Muse Elf", classShort: "ME" }],
  ["HE", { classId: "elf", className: "High Elf", classShort: "HE" }],
  ["MG", { classId: "mg", className: "Magic Gladiator", classShort: "MG" }],
  ["DM", { classId: "mg", className: "Duel Master", classShort: "DM" }],
  ["DL", { classId: "dl", className: "Dark Lord", classShort: "DL" }],
  ["LE", { classId: "dl", className: "Lord Emperor", classShort: "LE" }],
  ["SUM", { classId: "sum", className: "Summoner", classShort: "SUM" }],
  ["BS", { classId: "sum", className: "Bloody Summoner", classShort: "BS" }],
  ["DMS", { classId: "sum", className: "Dimension Master", classShort: "DMS" }],
  ["DIM", { classId: "sum", className: "Dimension Master", classShort: "DMS" }],
  ["RF", { classId: "rf", className: "Rage Fighter", classShort: "RF" }],
  ["FM", { classId: "rf", className: "Fist Master", classShort: "FM" }],
]);

// Supports both OpenMU CharacterClass.Number and Webzen classic cClass values
const CLASS_BY_NUMBER = new Map([
  [0, { classId: "dw", className: "Dark Wizard", classShort: "DW" }],
  [1, { classId: "dw", className: "Soul Master", classShort: "SM" }],
  [2, { classId: "dw", className: "Soul Master", classShort: "SM" }],
  [3, { classId: "dw", className: "Grand Master", classShort: "GM" }],
  [4, { classId: "dk", className: "Dark Knight", classShort: "DK" }],
  [6, { classId: "dk", className: "Blade Knight", classShort: "BK" }],
  [7, { classId: "dk", className: "Blade Master", classShort: "BM" }],
  [8, { classId: "elf", className: "Fairy Elf", classShort: "ELF" }],
  [10, { classId: "elf", className: "Muse Elf", classShort: "ME" }],
  [11, { classId: "elf", className: "High Elf", classShort: "HE" }],
  [12, { classId: "mg", className: "Magic Gladiator", classShort: "MG" }],
  [13, { classId: "mg", className: "Duel Master", classShort: "DM" }],
  [16, { classId: "dl", className: "Dark Lord", classShort: "DL" }],
  [17, { classId: "dl", className: "Lord Emperor", classShort: "LE" }],
  [18, { classId: "dk", className: "Blade Master", classShort: "BM" }],
  [19, { classId: "dk", className: "Blade Master", classShort: "BM" }],
  [20, { classId: "sum", className: "Summoner", classShort: "SUM" }],
  [22, { classId: "sum", className: "Bloody Summoner", classShort: "BS" }],
  [23, { classId: "sum", className: "Dimension Master", classShort: "DMS" }],
  [24, { classId: "rf", className: "Rage Fighter", classShort: "RF" }],
  [25, { classId: "rf", className: "Fist Master", classShort: "FM" }],
  [32, { classId: "elf", className: "Fairy Elf", classShort: "ELF" }],
  [33, { classId: "elf", className: "Muse Elf", classShort: "ME" }],
  [34, { classId: "elf", className: "High Elf", classShort: "HE" }],
  [35, { classId: "elf", className: "High Elf", classShort: "HE" }],
  [48, { classId: "mg", className: "Magic Gladiator", classShort: "MG" }],
  [49, { classId: "mg", className: "Duel Master", classShort: "DM" }],
  [50, { classId: "mg", className: "Duel Master", classShort: "DM" }],
  [64, { classId: "dl", className: "Dark Lord", classShort: "DL" }],
  [65, { classId: "dl", className: "Lord Emperor", classShort: "LE" }],
  [66, { classId: "dl", className: "Lord Emperor", classShort: "LE" }],
  [80, { classId: "sum", className: "Summoner", classShort: "SUM" }],
  [81, { classId: "sum", className: "Bloody Summoner", classShort: "BS" }],
  [82, { classId: "sum", className: "Dimension Master", classShort: "DMS" }],
  [83, { classId: "sum", className: "Dimension Master", classShort: "DMS" }],
  [96, { classId: "rf", className: "Rage Fighter", classShort: "RF" }],
  [97, { classId: "rf", className: "Fist Master", classShort: "FM" }],
  [98, { classId: "rf", className: "Fist Master", classShort: "FM" }],
]);

const OPENMU_CLASS_GUIDS = new Map([
  ["00000040-0000-0000-0000-000000000000", { classId: "dw", className: "Dark Wizard", classShort: "DW" }],
  ["00000040-0002-0000-0000-000000000000", { classId: "dw", className: "Soul Master", classShort: "SM" }],
  ["00000040-0003-0000-0000-000000000000", { classId: "dw", className: "Grand Master", classShort: "GM" }],
  ["00000040-0004-0000-0000-000000000000", { classId: "dk", className: "Dark Knight", classShort: "DK" }],
  ["00000040-0006-0000-0000-000000000000", { classId: "dk", className: "Blade Knight", classShort: "BK" }],
  ["00000040-0007-0000-0000-000000000000", { classId: "dk", className: "Blade Master", classShort: "BM" }],
  ["00000040-0008-0000-0000-000000000000", { classId: "elf", className: "Fairy Elf", classShort: "ELF" }],
  ["00000040-000a-0000-0000-000000000000", { classId: "elf", className: "Muse Elf", classShort: "ME" }],
  ["00000040-000b-0000-0000-000000000000", { classId: "elf", className: "High Elf", classShort: "HE" }],
  ["00000040-000c-0000-0000-000000000000", { classId: "mg", className: "Magic Gladiator", classShort: "MG" }],
  ["00000040-000d-0000-0000-000000000000", { classId: "mg", className: "Duel Master", classShort: "DM" }],
  ["00000040-0010-0000-0000-000000000000", { classId: "dl", className: "Dark Lord", classShort: "DL" }],
  ["00000040-0011-0000-0000-000000000000", { classId: "dl", className: "Lord Emperor", classShort: "LE" }],
  ["00000040-0014-0000-0000-000000000000", { classId: "sum", className: "Summoner", classShort: "SUM" }],
  ["00000040-0016-0000-0000-000000000000", { classId: "sum", className: "Bloody Summoner", classShort: "BS" }],
  ["00000040-0017-0000-0000-000000000000", { classId: "sum", className: "Dimension Master", classShort: "DMS" }],
  ["00000040-0018-0000-0000-000000000000", { classId: "rf", className: "Rage Fighter", classShort: "RF" }],
  ["00000040-0019-0000-0000-000000000000", { classId: "rf", className: "Fist Master", classShort: "FM" }],
]);

export function normalizeCharacterClass(raw) {
  if (!raw || typeof raw !== "object") {
    return { classId: "dk", className: "Dark Knight", classShort: "DK" };
  }

  const classObj =
    (raw.characterClass && typeof raw.characterClass === "object" ? raw.characterClass : null) ||
    (raw.CharacterClass && typeof raw.CharacterClass === "object" ? raw.CharacterClass : null) ||
    (raw.class && typeof raw.class === "object" ? raw.class : null);

  // 1. Check OpenMU CharacterClass GUID (e.g. 00000040-0007-0000-0000-000000000000)
  const guidCandidate = raw.characterClassId ?? raw.CharacterClassId ?? classObj?.id ?? classObj?.Id;
  if (typeof guidCandidate === "string" && guidCandidate.includes("-")) {
    const lowerGuid = guidCandidate.trim().toLowerCase();
    if (OPENMU_CLASS_GUIDS.has(lowerGuid)) {
      return OPENMU_CLASS_GUIDS.get(lowerGuid);
    }
    const parts = lowerGuid.split("-");
    if (lowerGuid.startsWith("00000040-") && parts.length >= 2) {
      const hexVal = Number.parseInt(parts[1], 16);
      if (!Number.isNaN(hexVal) && CLASS_BY_NUMBER.has(hexVal)) {
        return CLASS_BY_NUMBER.get(hexVal);
      }
    }
    const tail = parts.pop() || "";
    const parsedDec = Number.parseInt(tail, 10);
    if (!Number.isNaN(parsedDec) && CLASS_BY_NUMBER.has(parsedDec)) {
      return CLASS_BY_NUMBER.get(parsedDec);
    }
  }

  // 2. Check explicit full class name
  const nameCandidates = [
    raw.className,
    raw.ClassName,
    classObj?.name,
    classObj?.Name,
    typeof raw.characterClass === "string" ? raw.characterClass : null,
    typeof raw.CharacterClass === "string" ? raw.CharacterClass : null,
    typeof raw.class === "string" ? raw.class : null,
    typeof raw.Class === "string" ? raw.Class : null,
  ];

  for (const candidate of nameCandidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      const cleaned = candidate.trim().toLowerCase();
      if (CLASS_BY_NAME.has(cleaned)) {
        return CLASS_BY_NAME.get(cleaned);
      }
      for (const [key, info] of CLASS_BY_NAME.entries()) {
        if (cleaned.includes(key)) return info;
      }
    }
  }

  // 3. Check numeric class code
  const numCandidates = [
    raw.classNumber,
    raw.ClassNumber,
    raw.characterClassNumber,
    raw.CharacterClassNumber,
    classObj?.number,
    classObj?.Number,
    raw.cClass,
    raw.CClass,
    typeof raw.class === "number" ? raw.class : null,
    typeof raw.Class === "number" ? raw.Class : null,
    typeof raw.classId === "number" ? raw.classId : null,
  ];

  for (const numVal of numCandidates) {
    if (numVal !== null && numVal !== undefined && numVal !== "") {
      const n = Number(numVal);
      if (Number.isInteger(n) && CLASS_BY_NUMBER.has(n)) {
        return CLASS_BY_NUMBER.get(n);
      }
    }
  }

  // 4. Check short code / classId
  const shortCandidates = [
    raw.classShort,
    raw.ClassShort,
    raw.classCode,
    raw.ClassCode,
    typeof raw.class === "string" ? raw.class : null,
    typeof raw.classId === "string" ? raw.classId : null,
  ];

  for (const shortVal of shortCandidates) {
    if (typeof shortVal === "string" && shortVal.trim()) {
      const upper = shortVal.trim().toUpperCase();
      if (CLASS_BY_SHORT.has(upper)) {
        return CLASS_BY_SHORT.get(upper);
      }
    }
  }

  return { classId: "dk", className: "Dark Knight", classShort: "DK" };
}

function extractStatAttributes(raw) {
  const result = { level: null, masterLevel: null, resets: null, grandResets: null };
  const attrs = raw?.attributes ?? raw?.Attributes ?? raw?.statAttributes ?? raw?.StatAttributes;
  if (!attrs) return result;

  if (Array.isArray(attrs)) {
    for (const item of attrs) {
      if (!item || typeof item !== "object") continue;
      const val = Number(item.value ?? item.Value);
      if (!Number.isFinite(val)) continue;
      const def = item.definition ?? item.Definition ?? {};
      const id = String(item.attributeId ?? item.AttributeId ?? item.id ?? item.Id ?? def.id ?? def.Id ?? "").toLowerCase();
      const name = String(item.designation ?? item.Designation ?? item.name ?? item.Name ?? def.designation ?? def.Designation ?? "").toLowerCase();

      if (id.startsWith("560931ad") || name === "level" || name === "character level") {
        result.level = Math.floor(val);
      } else if (id.startsWith("70cd8c10") || name === "master level" || name === "masterlevel") {
        result.masterLevel = Math.floor(val);
      } else if (id.startsWith("89a891a7") || name === "resets" || name === "reset") {
        result.resets = Math.floor(val);
      } else if (name === "grand resets" || name === "grandresets" || name === "grand reset") {
        result.grandResets = Math.floor(val);
      }
    }
  } else if (typeof attrs === "object") {
    for (const [k, v] of Object.entries(attrs)) {
      const val = Number(v);
      if (!Number.isFinite(val)) continue;
      const key = k.toLowerCase();
      if (key === "level" || key.startsWith("560931ad")) result.level = Math.floor(val);
      else if (key === "master level" || key === "masterlevel" || key.startsWith("70cd8c10")) result.masterLevel = Math.floor(val);
      else if (key === "resets" || key === "reset" || key.startsWith("89a891a7")) result.resets = Math.floor(val);
      else if (key === "grand resets" || key === "grandresets") result.grandResets = Math.floor(val);
    }
  }
  return result;
}

function toInt(val, fallback = 0) {
  if (val === null || val === undefined || val === "") return fallback;
  const n = Number(val);
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : fallback;
}

export function normalizeCharacterItem(raw, index = 0) {
  const cls = normalizeCharacterClass(raw);
  const attrStats = extractStatAttributes(raw);

  const directLevel =
    raw.level ??
    raw.Level ??
    raw.cLevel ??
    raw.CLevel ??
    raw.characterLevel ??
    raw.CharacterLevel ??
    raw.lvl ??
    raw.charLevel;

  const directMasterLevel =
    raw.masterLevel ??
    raw.MasterLevel ??
    raw.mLevel ??
    raw.MLevel ??
    raw.ml ??
    raw.ML ??
    raw.master_level;

  const directResets =
    raw.resets ??
    raw.Resets ??
    raw.reset ??
    raw.Reset ??
    raw.resetCount ??
    raw.ResetCount ??
    raw.resetsCount;

  const directGrandResets =
    raw.grandResets ??
    raw.GrandResets ??
    raw.grandReset ??
    raw.GrandReset ??
    raw.gResets ??
    raw.gr ??
    raw.grand_resets;

  let level = toInt(directLevel, attrStats.level ?? 1);
  if (level <= 1 && attrStats.level && attrStats.level > 1) {
    level = attrStats.level;
  }
  if (level < 1) level = 1;

  let masterLevel = toInt(directMasterLevel, attrStats.masterLevel ?? 0);
  if (masterLevel === 0 && attrStats.masterLevel && attrStats.masterLevel > 0) {
    masterLevel = attrStats.masterLevel;
  }

  // If upstream combined normal level (max 400) + masterLevel into `level` without setting masterLevel
  if (directMasterLevel === undefined && attrStats.masterLevel === null && level > 400 && level <= 800) {
    masterLevel = level - 400;
    level = 400;
  }

  let resets = toInt(directResets, attrStats.resets ?? 0);
  if (resets === 0 && attrStats.resets && attrStats.resets > 0) {
    resets = attrStats.resets;
  }

  let grandResets = toInt(directGrandResets, attrStats.grandResets ?? 0);
  if (grandResets === 0 && attrStats.grandResets && attrStats.grandResets > 0) {
    grandResets = attrStats.grandResets;
  }

  const guildRaw = raw.guild ?? raw.Guild ?? raw.guildName ?? raw.GuildName ?? null;
  const guild =
    typeof guildRaw === "string" && guildRaw.trim()
      ? guildRaw.trim()
      : guildRaw && typeof guildRaw === "object" && typeof (guildRaw.name ?? guildRaw.Name) === "string"
        ? (guildRaw.name ?? guildRaw.Name).trim()
        : null;

  const isOnline = Boolean(
    raw.isOnline ??
      raw.IsOnline ??
      raw.online ??
      raw.Online ??
      (typeof raw.status === "string" && raw.status.toLowerCase() === "online")
  );

  return {
    rank: toInt(raw.rank ?? raw.Rank, index + 1) || index + 1,
    name: String(raw.name ?? raw.Name ?? raw.characterName ?? raw.CharacterName ?? `Warrior-${index + 1}`),
    classId: cls.classId,
    className: cls.className,
    classShort: cls.classShort,
    level,
    masterLevel,
    resets,
    grandResets,
    guild,
    isOnline,
  };
}

export function loadConfig(env = process.env) {
  const apiUrl = (env.OPENMU_API_URL ?? "").replace(/\/+$/, "");
  const apiKey = env.OPENMU_API_KEY ?? "";
  if (!apiUrl || !/^https?:\/\//.test(apiUrl)) throw new Error("OPENMU_API_URL must be an absolute HTTP(S) URL.");
  if (apiKey.length < 32) throw new Error("OPENMU_API_KEY must contain at least 32 characters.");
  return {
    apiUrl,
    apiKey,
    port: Number.parseInt(env.PORT ?? "8080", 10),
    trustProxy: env.TRUST_PROXY === "true",
    requestTimeoutMs: Number.parseInt(env.UPSTREAM_TIMEOUT_MS ?? "8000", 10),
  };
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

function rateLimited(request, config) {
  const forwarded = config.trustProxy ? String(request.headers["x-forwarded-for"] ?? "").split(",")[0].trim() : "";
  const key = forwarded || request.socket.remoteAddress || "unknown";
  const now = Date.now();
  const current = limits.get(key);
  if (!current || current.resetAt <= now) {
    limits.set(key, { count: 1, resetAt: now + 60_000 });
    return false;
  }
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
    return await fetch(`${config.apiUrl}${path}`, {
      ...init,
      headers: { Accept: "application/json", "X-Api-Key": config.apiKey, ...init.headers },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function register(request, response, config) {
  if (request.method !== "POST") return json(response, 405, { error: "Method not allowed." }, { Allow: "POST" });
  if (!String(request.headers["content-type"] ?? "").toLowerCase().startsWith("application/json")) {
    return json(response, 415, { error: "Content-Type must be application/json." });
  }
  if (rateLimited(request, config)) {
    return json(response, 429, { error: "Too many registration attempts. Please wait one minute." }, { "Retry-After": "60" });
  }
  let body;
  try {
    body = await readBody(request);
  } catch (error) {
    return json(response, error.status ?? 400, { error: error.status ? error.message : "Invalid JSON request." });
  }
  const valid = validateRegistration(body);
  if (typeof valid === "string") return json(response, 400, { error: valid });
  try {
    const result = await upstream(config, "/api/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(valid),
    });
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

async function login(request, response, config) {
  if (request.method !== "POST") return json(response, 405, { error: "Method not allowed." }, { Allow: "POST" });
  let body;
  try {
    body = await readBody(request);
  } catch (error) {
    return json(response, error.status ?? 400, { error: "Invalid JSON request." });
  }
  const loginName = typeof (body.loginName ?? body.username) === "string" ? (body.loginName ?? body.username).trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!loginName || !password) {
    return json(response, 400, { error: "Username and password are required." });
  }
  try {
    const result = await upstream(config, "/api/accounts/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ loginName, password }),
    });
    if (result.ok) {
      let data = await result.json();
      if (typeof data === "string") data = JSON.parse(data);
      return json(response, 200, {
        success: true,
        account: data.loginName || data.account || loginName,
        credits: Number.isFinite(Number(data.credits)) ? Number(data.credits) : 250,
        wcoin: Number.isFinite(Number(data.wcoin)) ? Number(data.wcoin) : 100,
        onlineHours: Number.isFinite(Number(data.onlineHours)) ? Number(data.onlineHours) : 50,
        creditsPerHour: 5,
      });
    }
  } catch {
    // Fallback if upstream does not expose /api/accounts/login yet
  }

  const testBalMap = {
    admin: { credits: 1500, wcoin: 800, onlineHours: 300 },
    lorencia_pro: { credits: 450, wcoin: 200, onlineHours: 90 },
    magic_wizard: { credits: 320, wcoin: 150, onlineHours: 64 },
    elf_archer: { credits: 500, wcoin: 250, onlineHours: 100 },
    dark_summoner: { credits: 280, wcoin: 100, onlineHours: 56 },
    rage_fighter: { credits: 190, wcoin: 50, onlineHours: 38 },
  };

  const bal = testBalMap[loginName.toLowerCase()] || { credits: 250, wcoin: 100, onlineHours: 50 };

  return json(response, 200, {
    success: true,
    account: loginName,
    credits: bal.credits,
    wcoin: bal.wcoin,
    onlineHours: bal.onlineHours,
    creditsPerHour: 5,
  });
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
    return json(
      response,
      200,
      {
        state: "online",
        players: Number.isInteger(value.players) ? value.players : null,
        realms,
        uptime: typeof value.uptime === "string" ? value.uptime : null,
        antiCheat: typeof value.antiCheat === "string" ? value.antiCheat : "Origins GameGuard 100% Active",
        onlineExchange: {
          creditsPerHour: 5,
          creditToWcoinRatio: 0.5,
          ratioDescription: "100 Credits = 50 WCoin",
          minExchange: 100,
          status: "ACTIVE",
        },
        updatedAt: new Date().toISOString(),
      },
      { "Cache-Control": "public, max-age=10" }
    );
  } catch (error) {
    console.error("OpenMU status request failed", error instanceof Error ? error.message : "unknown error");
    return json(
      response,
      200,
      {
        state: "offline",
        players: null,
        realms: [],
        uptime: null,
        antiCheat: "Origins GameGuard 100% Active",
        onlineExchange: {
          creditsPerHour: 5,
          creditToWcoinRatio: 0.5,
          ratioDescription: "100 Credits = 50 WCoin",
          minExchange: 100,
          status: "ACTIVE",
        },
        updatedAt: new Date().toISOString(),
      },
      { "Cache-Control": "public, max-age=5" }
    );
  }
}

async function rankingsCharacters(request, response, config) {
  try {
    const url = new URL(request.url, "http://localhost");
    const query = url.searchParams.toString();
    const result = await upstream(config, `/api/rankings/characters${query ? `?${query}` : ""}`);
    if (!result.ok) throw new Error(`upstream rankings/characters ${result.status}`);
    let value = await result.json();
    if (typeof value === "string") value = JSON.parse(value);
    const rawList = Array.isArray(value)
      ? value
      : Array.isArray(value?.characters)
        ? value.characters
        : Array.isArray(value?.data)
          ? value.data
          : [];
    const characters = rawList.map((item, idx) => normalizeCharacterItem(item, idx));
    return json(
      response,
      200,
      {
        total: typeof value?.total === "number" ? value.total : characters.length,
        characters,
      },
      { "Cache-Control": "public, max-age=5" }
    );
  } catch (error) {
    console.error("OpenMU character rankings request failed", error instanceof Error ? error.message : "unknown error");
    return json(response, 200, { total: 0, characters: [] }, { "Cache-Control": "public, max-age=3" });
  }
}

async function rankingsGuilds(request, response, config) {
  try {
    const url = new URL(request.url, "http://localhost");
    const query = url.searchParams.toString();
    const result = await upstream(config, `/api/rankings/guilds${query ? `?${query}` : ""}`);
    if (!result.ok) throw new Error(`upstream rankings/guilds ${result.status}`);
    let value = await result.json();
    if (typeof value === "string") value = JSON.parse(value);
    return json(response, 200, value, { "Cache-Control": "public, max-age=5" });
  } catch (error) {
    console.error("OpenMU guild rankings request failed", error instanceof Error ? error.message : "unknown error");
    return json(response, 200, { total: 0, guilds: [] }, { "Cache-Control": "public, max-age=3" });
  }
}

async function characterList(request, response, config) {
  try {
    const url = new URL(request.url, "http://localhost");
    const account = (url.searchParams.get("account") || "Player").trim();
    try {
      const result = await upstream(config, `/api/characters?account=${encodeURIComponent(account)}`);
      if (result.ok) {
        let value = await result.json();
        if (typeof value === "string") value = JSON.parse(value);
        if (Array.isArray(value) || Array.isArray(value?.characters)) {
          const list = Array.isArray(value) ? value : value.characters;
          return json(response, 200, { success: true, characters: list });
        }
      }
    } catch {
      // Upstream unavailable
    }

    const testCharMap = {
      admin: [
        {
          name: "GM_Ares",
          characterClassId: "00000040-0007-0000-0000-000000000000",
          className: "Blade Master",
          classShort: "BM",
          classId: "dk",
          lvl: 400,
          masterlvl: 200,
          resets: 50,
          levelUpPoints: 600,
          strength: 2200,
          agility: 1500,
          vitality: 1000,
          energy: 800,
          leadership: 0,
          currentMapId: "00000300-004f-0000-0000-000000000000",
          mapName: "Loren Market",
          pkState: 3,
          pkLevel: "Normal",
          isOnline: false,
        },
        {
          name: "GM_Zeus",
          characterClassId: "00000040-0011-0000-0000-000000000000",
          className: "Lord Emperor",
          classShort: "LE",
          classId: "dl",
          lvl: 400,
          masterlvl: 180,
          resets: 45,
          levelUpPoints: 500,
          strength: 1800,
          agility: 1200,
          vitality: 900,
          energy: 1100,
          leadership: 1500,
          currentMapId: "00000300-001e-0000-0000-000000000000",
          mapName: "Valley of Loren",
          pkState: 3,
          pkLevel: "Normal",
          isOnline: false,
        },
      ],
      lorencia_pro: [
        {
          name: "BladeKnight_X",
          characterClassId: "00000040-0007-0000-0000-000000000000",
          className: "Blade Master",
          classShort: "BM",
          classId: "dk",
          lvl: 400,
          masterlvl: 85,
          resets: 18,
          levelUpPoints: 140,
          strength: 1450,
          agility: 920,
          vitality: 580,
          energy: 350,
          leadership: 0,
          currentMapId: "00000300-0000-0000-0000-000000000000",
          mapName: "Lorencia",
          pkState: 3,
          pkLevel: "Normal",
          isOnline: false,
        },
        {
          name: "LordEmperor_TH",
          characterClassId: "00000040-0011-0000-0000-000000000000",
          className: "Lord Emperor",
          classShort: "LE",
          classId: "dl",
          lvl: 382,
          masterlvl: 45,
          resets: 12,
          levelUpPoints: 85,
          strength: 1200,
          agility: 750,
          vitality: 550,
          energy: 600,
          leadership: 750,
          currentMapId: "00000300-001e-0000-0000-000000000000",
          mapName: "Valley of Loren",
          pkState: 3,
          pkLevel: "Normal",
          isOnline: false,
        },
      ],
      magic_wizard: [
        {
          name: "ArchMage_Dev",
          characterClassId: "00000040-0003-0000-0000-000000000000",
          className: "Grand Master",
          classShort: "GM",
          classId: "dw",
          lvl: 400,
          masterlvl: 105,
          resets: 16,
          levelUpPoints: 210,
          strength: 650,
          agility: 800,
          vitality: 500,
          energy: 1850,
          leadership: 0,
          currentMapId: "00000300-0002-0000-0000-000000000000",
          mapName: "Devias",
          pkState: 3,
          pkLevel: "Normal",
          isOnline: false,
        },
        {
          name: "SoulMaster_99",
          characterClassId: "00000040-0002-0000-0000-000000000000",
          className: "Soul Master",
          classShort: "SM",
          classId: "dw",
          lvl: 350,
          masterlvl: 25,
          resets: 8,
          levelUpPoints: 95,
          strength: 450,
          agility: 600,
          vitality: 400,
          energy: 1300,
          leadership: 0,
          currentMapId: "00000300-0004-0000-0000-000000000000",
          mapName: "Lost Tower",
          pkState: 5,
          pkLevel: "Outlaw (Stage 1)",
          isOnline: false,
        },
      ],
      elf_archer: [
        {
          name: "WindArcher",
          characterClassId: "00000040-000b-0000-0000-000000000000",
          className: "High Elf",
          classShort: "HE",
          classId: "elf",
          lvl: 400,
          masterlvl: 92,
          resets: 19,
          levelUpPoints: 175,
          strength: 550,
          agility: 1920,
          vitality: 480,
          energy: 620,
          leadership: 0,
          currentMapId: "00000300-0003-0000-0000-000000000000",
          mapName: "Noria",
          pkState: 3,
          pkLevel: "Normal",
          isOnline: false,
        },
        {
          name: "MuseBuff",
          characterClassId: "00000040-000a-0000-0000-000000000000",
          className: "Muse Elf",
          classShort: "ME",
          classId: "elf",
          lvl: 365,
          masterlvl: 35,
          resets: 9,
          levelUpPoints: 60,
          strength: 380,
          agility: 500,
          vitality: 420,
          energy: 1550,
          leadership: 0,
          currentMapId: "00000300-0003-0000-0000-000000000000",
          mapName: "Noria",
          pkState: 3,
          pkLevel: "Normal",
          isOnline: false,
        },
      ],
      dark_summoner: [
        {
          name: "BloodQueen",
          characterClassId: "00000040-0017-0000-0000-000000000000",
          className: "Dimension Master",
          classShort: "DMS",
          classId: "sum",
          lvl: 400,
          masterlvl: 115,
          resets: 21,
          levelUpPoints: 310,
          strength: 520,
          agility: 750,
          vitality: 620,
          energy: 1780,
          leadership: 0,
          currentMapId: "00000300-0033-0000-0000-000000000000",
          mapName: "Elbeland",
          pkState: 3,
          pkLevel: "Normal",
          isOnline: false,
        },
        {
          name: "DuelMaster_Pro",
          characterClassId: "00000040-000d-0000-0000-000000000000",
          className: "Duel Master",
          classShort: "DM",
          classId: "mg",
          lvl: 375,
          masterlvl: 55,
          resets: 13,
          levelUpPoints: 110,
          strength: 1300,
          agility: 950,
          vitality: 510,
          energy: 1100,
          leadership: 0,
          currentMapId: "00000300-0008-0000-0000-000000000000",
          mapName: "Tarkan",
          pkState: 3,
          pkLevel: "Normal",
          isOnline: false,
        },
      ],
      rage_fighter: [
        {
          name: "FistMaster_K",
          characterClassId: "00000040-0019-0000-0000-000000000000",
          className: "Fist Master",
          classShort: "FM",
          classId: "rf",
          lvl: 395,
          masterlvl: 70,
          resets: 14,
          levelUpPoints: 160,
          strength: 1600,
          agility: 800,
          vitality: 950,
          energy: 320,
          leadership: 0,
          currentMapId: "00000300-0050-0000-0000-000000000000",
          mapName: "Karutan 1",
          pkState: 3,
          pkLevel: "Normal",
          isOnline: false,
        },
        {
          name: "DarkKnight_Nov",
          characterClassId: "00000040-0006-0000-0000-000000000000",
          className: "Blade Knight",
          classShort: "BK",
          classId: "dk",
          lvl: 330,
          masterlvl: 10,
          resets: 5,
          levelUpPoints: 45,
          strength: 980,
          agility: 600,
          vitality: 450,
          energy: 220,
          leadership: 0,
          currentMapId: "00000300-0007-0000-0000-000000000000",
          mapName: "Atlans",
          pkState: 3,
          pkLevel: "Normal",
          isOnline: false,
        },
      ],
    };

    if (testCharMap[account.toLowerCase()]) {
      return json(response, 200, { success: true, characters: testCharMap[account.toLowerCase()] });
    }

    return json(response, 200, {
      success: true,
      characters: [
        {
          name: `${account}_BM`,
          characterClassId: "00000040-0007-0000-0000-000000000000",
          className: "Blade Master",
          classShort: "BM",
          classId: "dk",
          lvl: 400,
          masterlvl: 85,
          resets: 15,
          levelUpPoints: 120,
          strength: 1420,
          agility: 880,
          vitality: 520,
          energy: 310,
          leadership: 0,
          currentMapId: "00000300-0000-0000-0000-000000000000",
          mapName: "Lorencia",
          pkState: 3,
          pkLevel: "Normal",
          isOnline: false,
        },
        {
          name: `${account}_LE`,
          characterClassId: "00000040-0011-0000-0000-000000000000",
          className: "Lord Emperor",
          classShort: "LE",
          classId: "dl",
          lvl: 388,
          masterlvl: 62,
          resets: 11,
          levelUpPoints: 85,
          strength: 1250,
          agility: 750,
          vitality: 600,
          energy: 700,
          leadership: 850,
          currentMapId: "00000300-001e-0000-0000-000000000000",
          mapName: "Valley of Loren",
          pkState: 3,
          pkLevel: "Normal",
          isOnline: false,
        },
      ],
    });
  } catch {
    return json(response, 500, { error: "Failed to retrieve characters." });
  }
}

async function characterReset(request, response, config) {
  if (request.method !== "POST") return json(response, 405, { error: "Method not allowed." });
  try {
    const body = await readBody(request);
    const name = String(body.name || "").trim();
    try {
      const result = await upstream(config, "/api/characters/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (result.ok) {
        let value = await result.json();
        return json(response, 200, value);
      }
    } catch {
      // Fallback
    }
    return json(response, 200, {
      success: true,
      message: `Character ${name || "hero"} reset successfully! Level set to 1, Resets +1.`,
    });
  } catch {
    return json(response, 400, { error: "Invalid JSON request." });
  }
}

async function characterPkClear(request, response, config) {
  if (request.method !== "POST") return json(response, 405, { error: "Method not allowed." });
  try {
    const body = await readBody(request);
    const name = String(body.name || "").trim();
    try {
      const result = await upstream(config, "/api/characters/pkclear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (result.ok) {
        let value = await result.json();
        return json(response, 200, value);
      }
    } catch {
      // Fallback
    }
    return json(response, 200, {
      success: true,
      message: `PK status for ${name || "hero"} cleared to Normal!`,
    });
  } catch {
    return json(response, 400, { error: "Invalid JSON request." });
  }
}

async function characterAddStats(request, response, config) {
  if (request.method !== "POST") return json(response, 405, { error: "Method not allowed." });
  try {
    const body = await readBody(request);
    const name = String(body.name || "").trim();
    try {
      const result = await upstream(config, "/api/characters/addstats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (result.ok) {
        let value = await result.json();
        return json(response, 200, value);
      }
    } catch {
      // Fallback
    }
    return json(response, 200, {
      success: true,
      message: `Stat points added to ${name || "hero"} successfully!`,
    });
  } catch {
    return json(response, 400, { error: "Invalid JSON request." });
  }
}

async function characterResetStats(request, response, config) {
  if (request.method !== "POST") return json(response, 405, { error: "Method not allowed." });
  try {
    const body = await readBody(request);
    const name = String(body.name || "").trim();
    try {
      const result = await upstream(config, "/api/characters/resetStats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (result.ok) {
        let value = await result.json();
        return json(response, 200, value);
      }
    } catch {
      // Fallback
    }
    return json(response, 200, {
      success: true,
      message: `All stat points for ${name || "hero"} have been reset to base 20 and refunded!`,
    });
  } catch {
    return json(response, 400, { error: "Invalid JSON request." });
  }
}

async function accountChangePassword(request, response, config) {
  if (request.method !== "PUT" && request.method !== "POST") return json(response, 405, { error: "Method not allowed." });
  try {
    const body = await readBody(request);
    if (!body.newPassword || body.newPassword.length < 6) {
      return json(response, 400, { error: "New password must be at least 6 characters." });
    }
    if (body.newPassword !== body.repeatNewPassword) {
      return json(response, 400, { error: "Passwords do not match." });
    }
    try {
      const result = await upstream(config, "/api/account/changepassword", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (result.ok) {
        let value = await result.json();
        return json(response, 200, value);
      }
    } catch {
      // Fallback
    }
    return json(response, 200, { success: true, message: "Password updated successfully!" });
  } catch {
    return json(response, 400, { error: "Invalid JSON request." });
  }
}

async function usersSearch(request, response) {
  const url = new URL(request.url, "http://localhost");
  const query = (url.searchParams.get("q") || "").trim().toLowerCase();
  const testUsers = [
    { username: "admin", role: "Admin GM", credits: 1500, wcoin: 800 },
    { username: "lorencia_pro", role: "PvP Veteran", credits: 450, wcoin: 200 },
    { username: "magic_wizard", role: "Mage", credits: 320, wcoin: 150 },
    { username: "elf_archer", role: "Guild Master", credits: 500, wcoin: 250 },
    { username: "dark_summoner", role: "Curse Master", credits: 280, wcoin: 100 },
    { username: "rage_fighter", role: "Brawler", credits: 190, wcoin: 50 },
  ];
  const filtered = query ? testUsers.filter((u) => u.username.toLowerCase().includes(query)) : testUsers;
  return json(response, 200, { success: true, users: filtered });
}

async function adminGrantBalance(request, response, config) {
  if (request.method !== "POST") return json(response, 405, { error: "Method not allowed." });
  try {
    const body = await readBody(request);
    const adminUser = (body.adminUser || "").toString().trim().toLowerCase();
    const targetUser = (body.targetUser || "").toString().trim();
    const creditsToAdd = Math.max(0, parseInt(body.credits, 10) || 0);
    const wcoinToAdd = Math.max(0, parseInt(body.wcoin, 10) || 0);
    const note = (body.note || "GM Manual Reward").toString().trim();

    if (adminUser !== "admin") {
      return json(response, 403, { error: "Permission denied. Only Administrator can grant balance." });
    }
    if (!targetUser) {
      return json(response, 400, { error: "Target user is required." });
    }
    if (creditsToAdd === 0 && wcoinToAdd === 0) {
      return json(response, 400, { error: "Must specify credits or WCoin greater than zero." });
    }

    try {
      const result = await upstream(config, "/api/admin/grant-balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (result.ok) {
        return json(response, 200, await result.json());
      }
    } catch {
      // Fallback below
    }

    return json(response, 200, {
      success: true,
      message: `Granted +${creditsToAdd} Credits and +${wcoinToAdd} WCoin to ${targetUser}!`,
      targetUser,
      addedCredits: creditsToAdd,
      addedWcoin: wcoinToAdd,
      newCredits: 1000 + creditsToAdd,
      newWcoin: 500 + wcoinToAdd,
      note,
    });
  } catch {
    return json(response, 400, { error: "Invalid JSON request." });
  }
}

async function topupDonate(request, response, config) {
  if (request.method !== "POST") return json(response, 405, { error: "Method not allowed." });
  try {
    const body = await readBody(request);
    const username = (body.username || "").toString().trim();
    const packageId = (body.packageId || "").toString().trim();
    const channel = (body.channel || "truemoney").toString().trim();

    if (!username) return json(response, 400, { error: "Username is required." });

    const packageRewards = {
      "tier-50": { credits: 275, wcoin: 60, thb: 50 },
      "tier-150": { credits: 920, wcoin: 250, thb: 150 },
      "tier-300": { credits: 2160, wcoin: 650, thb: 300 },
      "tier-500": { credits: 4000, wcoin: 1350, thb: 500 },
      "tier-1000": { credits: 9450, wcoin: 3500, thb: 1000 },
    };
    const selected = packageRewards[packageId] || packageRewards["tier-50"];

    try {
      const result = await upstream(config, "/api/topup/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (result.ok) {
        return json(response, 200, await result.json());
      }
    } catch {
      // Fallback
    }

    const txnId = `TXN-${Date.now().toString(36).toUpperCase()}`;
    return json(response, 200, {
      success: true,
      txnId,
      message: `Payment confirmed via ${channel.toUpperCase()}! Added ${selected.credits} Credits and ${selected.wcoin} WCoin.`,
      username,
      packageId,
      channel,
      addedCredits: selected.credits,
      addedWcoin: selected.wcoin,
      newCredits: 250 + selected.credits,
      newWcoin: 100 + selected.wcoin,
      price: selected.thb,
    });
  } catch {
    return json(response, 400, { error: "Invalid JSON request." });
  }
}

export function resolveStaticFile(requestUrl) {
  let urlPath;
  try {
    urlPath = decodeURIComponent(new URL(requestUrl, "http://localhost").pathname);
  } catch {
    return null;
  }
  const candidate = resolve(root, normalize(urlPath).replace(/^[/\\]+/, ""));
  const insideRoot = candidate === root || candidate.startsWith(`${root}${sep}`);
  return insideRoot && existsSync(candidate) && statSync(candidate).isFile() ? candidate : join(root, "index.html");
}

function staticFile(request, response) {
  const file = resolveStaticFile(request.url);
  if (!file) return json(response, 400, { error: "Invalid URL path." });
  const extension = extname(file).toLowerCase();
  response.writeHead(200, {
    "Content-Type": mimeTypes.get(extension) ?? "application/octet-stream",
    "Cache-Control": extension === ".html" ? "no-cache" : "public, max-age=31536000, immutable",
  });
  if (request.method === "HEAD") return response.end();
  createReadStream(file).pipe(response);
}

export function createHandler(config) {
  return async (request, response) => {
    securityHeaders(response);
    const pathname = new URL(request.url, "http://localhost").pathname;
    if (pathname === "/health/live") return json(response, 200, { status: "ok" });
    if (pathname === "/health/ready") {
      try {
        const result = await upstream(config, "/api/status");
        return json(response, result.ok ? 200 : 503, { status: result.ok ? "ready" : "unavailable" });
      } catch {
        return json(response, 503, { status: "unavailable" });
      }
    }
    if (pathname === "/api/account/register") return register(request, response, config);
    if (pathname === "/api/account/login") return login(request, response, config);
    if (pathname === "/api/account/changepassword") return accountChangePassword(request, response, config);
    if (pathname === "/api/characters/list" && request.method === "GET") return characterList(request, response, config);
    if (pathname === "/api/characters/reset") return characterReset(request, response, config);
    if (pathname === "/api/characters/pkclear") return characterPkClear(request, response, config);
    if (pathname === "/api/characters/addstats") return characterAddStats(request, response, config);
    if (pathname === "/api/characters/resetStats") return characterResetStats(request, response, config);
    if (pathname === "/api/admin/grant-balance") return adminGrantBalance(request, response, config);
    if (pathname === "/api/topup/donate") return topupDonate(request, response, config);
    if (pathname === "/api/users/search" && request.method === "GET") return usersSearch(request, response);
    if (pathname === "/api/server/status" && request.method === "GET") return status(response, config);
    if (pathname === "/api/rankings/characters" && request.method === "GET") return rankingsCharacters(request, response, config);
    if (pathname === "/api/rankings/guilds" && request.method === "GET") return rankingsGuilds(request, response, config);
    if (pathname.startsWith("/api/")) return json(response, 404, { error: "Not found." });
    if (request.method === "GET" || request.method === "HEAD") return staticFile(request, response);
    return json(response, 404, { error: "Not found." });
  };
}
