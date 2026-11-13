export class StoreError extends Error {
  constructor(status, code, message, extra = {}) {
    super(message);
    this.name = "StoreError";
    this.status = status;
    this.code = code;
    this.extra = extra;
  }
}

export function normalizeLoginName(loginName) {
  return String(loginName ?? "").trim();
}

