export class UpstreamError extends Error {
  constructor(status, code, message, body = null) {
    super(message);
    this.name = "UpstreamError";
    this.status = status;
    this.code = code;
    this.body = body;
  }
}

export function createOpenMuClient(config, fetchImpl = fetch) {
  async function request(path, { method = "GET", body = undefined, headers = {} } = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.requestTimeoutMs || 8000);
    try {
      const response = await fetchImpl(`${config.apiUrl}${path}`, {
        method,
        headers: {
          "Accept": "application/json",
          "X-Api-Key": config.apiKey,
          ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
          ...headers,
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      const rawText = await response.text();
      let data = null;
      if (rawText) {
        try {
          data = JSON.parse(rawText);
        } catch {
          data = { rawText };
        }
      }

      if (!response.ok) {
        const msg =
          data?.message ||
          data?.detail ||
          data?.title ||
          data?.error ||
          `OpenMU API failed with HTTP ${response.status}`;
        throw new UpstreamError(
          response.status,
          data?.code || `UPSTREAM_${response.status}`,
          String(msg),
          data
        );
      }

      return { status: response.status, data };
    } catch (error) {
      if (error instanceof UpstreamError) throw error;
      if (error?.name === "AbortError") {
        throw new UpstreamError(504, "UPSTREAM_TIMEOUT", "OpenMU server request timed out.");
      }
      throw new UpstreamError(502, "UPSTREAM_UNREACHABLE", `Failed to reach OpenMU server: ${error?.message || "network error"}`);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  return {
    registerAccount: (payload) => request("/api/accounts", { method: "POST", body: payload }),
    authenticateAccount: (loginName, password) =>
      request("/api/accounts/authenticate", { method: "POST", body: { loginName, password } }),
    getAccountProfile: (loginName) =>
      request(`/api/accounts/${encodeURIComponent(loginName)}/profile`),
    searchAccounts: ({ text = "", state = "", offset = 0, limit = 25 } = {}) => {
      const qs = new URLSearchParams();
      if (text) qs.set("text", text);
      if (state) qs.set("state", state);
      qs.set("offset", String(offset));
      qs.set("limit", String(limit));
      return request(`/api/accounts?${qs.toString()}`);
    },
    changeOwnPassword: (loginName, currentPassword, newPassword) =>
      request(`/api/accounts/${encodeURIComponent(loginName)}/password/change`, {
        method: "POST",
        body: { currentPassword, newPassword },
      }),
    setAccountState: (loginName, state, reason) =>
      request(`/api/accounts/${encodeURIComponent(loginName)}/state`, {
        method: "PUT",
        body: { state, reason },
      }),
    adminResetPassword: (loginName, password, reason) =>
      request(`/api/accounts/${encodeURIComponent(loginName)}/password`, {
        method: "PUT",
        body: { password, reason },
      }),
    verifyAdminCredentials: ({ loginName, password, twoFactorCode = undefined, isRecoveryCode = false }) =>
      request("/api/admin/auth/verify", {
        method: "POST",
        body: { loginName, password, twoFactorCode, isRecoveryCode },
      }),
    disconnectAccount: (loginName) =>
      request(`/api/players/${encodeURIComponent(loginName)}/disconnect`, { method: "POST", body: {} }),
    resetCharacter: (loginName, characterName) =>
      request(
        `/api/accounts/${encodeURIComponent(loginName)}/characters/${encodeURIComponent(characterName)}/reset`,
        { method: "POST", body: {} }
      ),
    clearCharacterPk: (loginName, characterName) =>
      request(
        `/api/accounts/${encodeURIComponent(loginName)}/characters/${encodeURIComponent(characterName)}/pk-clear`,
        { method: "POST", body: {} }
      ),
    addCharacterStats: (loginName, characterName, stats) =>
      request(
        `/api/accounts/${encodeURIComponent(loginName)}/characters/${encodeURIComponent(characterName)}/add-stats`,
        { method: "POST", body: stats }
      ),
    resetCharacterStats: (loginName, characterName) =>
      request(
        `/api/accounts/${encodeURIComponent(loginName)}/characters/${encodeURIComponent(characterName)}/reset-stats`,
        { method: "POST", body: {} }
      ),
    getCashShopSummary: (loginName) =>
      request(`/api/accounts/${encodeURIComponent(loginName)}/cash-shop`),
    grantCashShopCoins: (loginName, { coinType = "WCoinC", amount, reason, reference }) =>
      request(`/api/accounts/${encodeURIComponent(loginName)}/cash-shop/grants`, {
        method: "POST",
        body: { coinType, amount, reason, reference },
      }),
    getServerStatus: () => request("/api/server/status"),
    getCharacterRankings: (queryString = "") =>
      request(`/api/server/rankings/characters${queryString ? `?${queryString}` : ""}`),
    getGuildRankings: (queryString = "") =>
      request(`/api/server/rankings/guilds${queryString ? `?${queryString}` : ""}`),
  };
}

