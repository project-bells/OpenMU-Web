// OpenMU REST API Service & Client
// Repository: https://github.com/MUnique/OpenMU.git
// Standard endpoint: /api/account/register

export interface RegisterPayload {
  loginName: string;
  password: string;
  email: string;
  personalCode: string;
}

export interface RegisterResponse {
  success: boolean;
  message?: string;
  error?: string;
  isSimulated?: boolean;
  account?: string;
}

const STORAGE_KEY_ACCOUNTS = "openmu_registered_accounts";
const STORAGE_KEY_API_URL = "openmu_api_base_url";

/**
 * Validate and retrieve sanitized custom API URL
 */
export function getCustomApiUrl(): string {
  if (typeof window === "undefined") return "";
  const raw = localStorage.getItem(STORAGE_KEY_API_URL) || "";
  return isValidApiUrl(raw) ? raw : "";
}

/**
 * Securely store custom OpenMU API URL, ensuring only safe http/https schemes
 */
export function setCustomApiUrl(url: string): { success: boolean; error?: string } {
  if (typeof window === "undefined") return { success: false, error: "Window undefined" };
  const trimmed = url.trim();

  if (!trimmed) {
    localStorage.removeItem(STORAGE_KEY_API_URL);
    return { success: true };
  }

  if (!isValidApiUrl(trimmed)) {
    return {
      success: false,
      error: "Invalid URL scheme. Only secure 'http://' or 'https://' URLs are permitted.",
    };
  }

  try {
    const parsed = new URL(trimmed);
    localStorage.setItem(STORAGE_KEY_API_URL, parsed.origin + parsed.pathname.replace(/\/+$/, ""));
    return { success: true };
  } catch {
    return { success: false, error: "Malformed URL syntax." };
  }
}

function isValidApiUrl(url: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function getSavedAccounts(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACCOUNTS);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export async function registerOpenMuAccount(payload: RegisterPayload): Promise<RegisterResponse> {
  const customBase = getCustomApiUrl();
  const endpoint = customBase ? `${customBase}/account/register` : "/api/account/register";

  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    const controller = new AbortController();
    timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        loginName: payload.loginName,
        username: payload.loginName,
        password: payload.password,
        email: payload.email,
        personalCode: payload.personalCode,
        securityCode: payload.personalCode,
      }),
      signal: controller.signal,
    });

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      recordLocalAccount(payload.loginName);
      return {
        success: true,
        message: data.message || "Account registered successfully in OpenMU database!",
        account: payload.loginName,
        isSimulated: false,
      };
    }

    // Specific client error responses (400, 409, 422, 429)
    if (res.status === 400 || res.status === 409 || res.status === 422) {
      const errData = await res.json().catch(() => ({}));
      return {
        success: false,
        error: errData.error || errData.message || "Account name already taken or invalid parameters.",
      };
    }

    if (res.status === 429) {
      return {
        success: false,
        error: "Rate limit exceeded. Please wait 1 minute before trying again.",
      };
    }

    // Server-side errors (500, 502, 503) — Must NOT be masked as simulated success!
    if (res.status >= 500) {
      return {
        success: false,
        error: `OpenMU Game Server returned error (HTTP ${res.status}). Server may be undergoing database maintenance.`,
      };
    }

    return {
      success: false,
      error: `Unexpected server response (HTTP ${res.status}).`,
    };
  } catch (err: unknown) {
    // True transport failure (e.g. offline, connection refused, or demo preview environment without active C# backend)
    const isNetworkError = err instanceof TypeError || (err instanceof DOMException && err.name === "AbortError");

    if (isNetworkError) {
      console.info("[OpenMU API] Network connection unreachable. Activating local demo persistence mode:", err);

      const existing = getSavedAccounts();
      if (existing.some((a) => a.toLowerCase() === payload.loginName.toLowerCase())) {
        return {
          success: false,
          error: `Account name '${payload.loginName}' is already registered in OpenMU. Please choose another username.`,
        };
      }

      recordLocalAccount(payload.loginName);

      return {
        success: true,
        message: "Account created successfully in OpenMU local registry (Offline Demo Mode)!",
        account: payload.loginName,
        isSimulated: true,
      };
    }

    return {
      success: false,
      error: err instanceof Error ? err.message : "An unexpected communication error occurred.",
    };
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

function recordLocalAccount(name: string) {
  try {
    const list = getSavedAccounts();
    if (!list.includes(name)) {
      list.push(name);
      // Bound storage to 50 items
      if (list.length > 50) list.shift();
      localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(list));
    }
  } catch {
    // Ignore storage quota errors
  }
}
