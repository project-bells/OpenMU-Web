export interface RegisterPayload {
  loginName: string;
  password: string;
  email: string;
}

export interface RegisterResponse {
  success: boolean;
  message?: string;
  error?: string;
  account?: string;
}

export interface ServerStatus {
  state: "online" | "offline" | "maintenance";
  players: number | null;
  updatedAt: string;
}

async function readJson(response: Response): Promise<Record<string, unknown>> {
  if (!(response.headers.get("content-type") ?? "").includes("application/json")) return {};
  return response.json().catch(() => ({}));
}

export async function registerOpenMuAccount(payload: RegisterPayload): Promise<RegisterResponse> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 10_000);
  try {
    const response = await fetch("/api/account/register", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const body = await readJson(response);
    if (response.ok) return { success: true, message: typeof body.message === "string" ? body.message : "Account created successfully.", account: payload.loginName };
    const fallback = response.status === 409
      ? "This account name is already in use."
      : response.status === 429
        ? "Too many attempts. Please wait before trying again."
        : response.status >= 500
          ? "Registration is temporarily unavailable. Please try again later."
          : "Please check the registration details and try again.";
    return { success: false, error: typeof body.error === "string" ? body.error : fallback };
  } catch (error: unknown) {
    return { success: false, error: error instanceof DOMException && error.name === "AbortError" ? "Registration timed out. Please try again." : "Unable to reach the registration service. Please try again later." };
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export async function getServerStatus(signal?: AbortSignal): Promise<ServerStatus> {
  const response = await fetch("/api/server/status", { credentials: "same-origin", headers: { Accept: "application/json" }, signal });
  if (!response.ok) throw new Error(`Status request failed: ${response.status}`);
  return response.json() as Promise<ServerStatus>;
}
