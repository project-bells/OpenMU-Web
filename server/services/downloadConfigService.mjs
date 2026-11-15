import fs from "node:fs/promises";
import path from "node:path";

export const DEFAULT_DOWNLOAD_CONFIG = Object.freeze({
  version: "1.04D • S6E3",
  fileSize: "2.1 GB",
  updatedAt: "November 2026",
  megaUrl: "https://mega.nz",
  mediafireUrl: "https://www.mediafire.com",
  virusTotalLabel: "VirusTotal Clean (0/72)",
});

function cleanText(value, fallback, maximum = 120) {
  const text = String(value ?? "").trim();
  return (text || fallback).slice(0, maximum);
}

function cleanDownloadUrl(value, fallback) {
  const text = String(value ?? "").trim();
  if (!text) return fallback;
  let parsed;
  try {
    parsed = new URL(text);
  } catch {
    throw new Error("Download links must be valid absolute URLs.");
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error("Download links must use HTTP or HTTPS.");
  }
  return parsed.toString();
}

export function normalizeDownloadConfig(raw = {}) {
  return {
    version: cleanText(raw.version, DEFAULT_DOWNLOAD_CONFIG.version, 80),
    fileSize: cleanText(raw.fileSize, DEFAULT_DOWNLOAD_CONFIG.fileSize, 40),
    updatedAt: cleanText(raw.updatedAt, DEFAULT_DOWNLOAD_CONFIG.updatedAt, 80),
    megaUrl: cleanDownloadUrl(raw.megaUrl, DEFAULT_DOWNLOAD_CONFIG.megaUrl),
    mediafireUrl: cleanDownloadUrl(raw.mediafireUrl, DEFAULT_DOWNLOAD_CONFIG.mediafireUrl),
    virusTotalLabel: cleanText(raw.virusTotalLabel, DEFAULT_DOWNLOAD_CONFIG.virusTotalLabel, 120),
  };
}

export function createDownloadConfigService(config) {
  const filePath = path.resolve(config.downloadConfigPath);

  async function get() {
    try {
      const raw = JSON.parse(await fs.readFile(filePath, "utf8"));
      return normalizeDownloadConfig(raw);
    } catch (error) {
      if (error?.code === "ENOENT") return { ...DEFAULT_DOWNLOAD_CONFIG };
      if (error instanceof SyntaxError) throw new Error("Download configuration file contains invalid JSON.");
      throw error;
    }
  }

  async function update(input) {
    const next = normalizeDownloadConfig(input);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    const temporary = `${filePath}.${process.pid}.tmp`;
    await fs.writeFile(temporary, `${JSON.stringify(next, null, 2)}\n`, "utf8");
    await fs.rename(temporary, filePath);
    return next;
  }

  return { get, update };
}
