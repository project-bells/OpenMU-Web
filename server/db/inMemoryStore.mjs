import crypto from "node:crypto";
import { StoreError, normalizeLoginName } from "./errors.mjs";

/**
 * Transactional-semantics in-memory store used strictly when DATABASE_URL is absent
 * in non-production automated test/dev runs (`ALLOW_INMEMORY_WEB_STORE=true`).
 */
export class InMemoryWebStore {
  constructor() {
    this.wallets = new Map();
    this.ledger = [];
    this.redemptions = [];
    this.exchanges = [];
    this.orders = [];
    this.webhookEvents = [];
    this.sessions = new Map();
    this.auditLogs = [];
  }

  async init() {}
  async close() {}
  async ping() {
    return true;
  }

  async ensureWalletAccount(loginName) {
    const clean = normalizeLoginName(loginName);
    if (!clean) throw new StoreError(400, "INVALID_LOGIN_NAME", "LoginName is required.");
    let wallet = this.wallets.get(clean);
    if (!wallet) {
      const now = new Date().toISOString();
      wallet = {
        loginName: clean,
        creditsBalance: 0,
        lifetimeCreditsEarned: 0,
        lifetimeCreditsSpent: 0,
        redeemedOnlineSeconds: 0,
        totalTopupThb: 0,
        createdAt: now,
        updatedAt: now,
      };
      this.wallets.set(clean, wallet);
    }
    return { ...wallet };
  }

  async getWalletSummary(loginName, limit = 50) {
    const wallet = await this.ensureWalletAccount(loginName);
    return {
      wallet,
      ledger: this.ledger.filter((e) => e.loginName === wallet.loginName).slice(0, limit),
      redemptions: this.redemptions.filter((e) => e.loginName === wallet.loginName).slice(0, limit),
      exchanges: this.exchanges.filter((e) => e.loginName === wallet.loginName).slice(0, limit),
      orders: this.orders.filter((e) => e.loginName === wallet.loginName).slice(0, limit),
    };
  }

  async redeemOnlineTimeTransaction({
    loginName,
    idempotencyKey,
    authoritativeOnlineSeconds,
    secondsPerHour,
    creditsPerHour,
    hoursRequested = null,
    createdBy,
    ipAddress = null,
  }) {
    const existing = this.redemptions.find((r) => r.idempotencyKey === idempotencyKey);
    if (existing) {
      return { idempotent: true, redemption: { ...existing }, wallet: await this.ensureWalletAccount(existing.loginName) };
    }

    const wallet = await this.ensureWalletAccount(loginName);
    const live = this.wallets.get(wallet.loginName);
    const authSeconds = Math.max(0, Math.floor(Number(authoritativeOnlineSeconds) || 0));
    const availableSeconds = Math.max(0, authSeconds - live.redeemedOnlineSeconds);
    const maxHours = Math.floor(availableSeconds / secondsPerHour);
    if (maxHours < 1) {
      throw new StoreError(400, "INSUFFICIENT_ONLINE_TIME", "Less than 1 unredeemed online hour is available.");
    }

    const hours = hoursRequested === null ? maxHours : Math.floor(Number(hoursRequested));
    if (!Number.isInteger(hours) || hours < 1) {
      throw new StoreError(400, "INVALID_HOURS", "Hours to redeem must be a positive integer.");
    }
    if (hours > maxHours) {
      throw new StoreError(400, "INSUFFICIENT_ONLINE_TIME", `Requested ${hours} hour(s), but only ${maxHours} unredeemed hour(s) available.`);
    }

    const creditsGranted = hours * creditsPerHour;
    const redeemedBefore = live.redeemedOnlineSeconds;
    const redeemedAfter = redeemedBefore + hours * secondsPerHour;
    live.creditsBalance += creditsGranted;
    live.lifetimeCreditsEarned += creditsGranted;
    live.redeemedOnlineSeconds = redeemedAfter;
    live.updatedAt = new Date().toISOString();

    const ledgerId = crypto.randomUUID();
    const redemptionId = crypto.randomUUID();
    this.ledger.unshift({
      id: ledgerId,
      loginName: live.loginName,
      entryType: "ONLINE_REWARD",
      deltaCredits: creditsGranted,
      balanceAfter: live.creditsBalance,
      currencyUnit: "CREDITS",
      idempotencyKey: `online:${idempotencyKey}`,
      referenceType: "ONLINE_REDEMPTION",
      referenceId: redemptionId,
      description: `Online time reward: ${hours}h -> +${creditsGranted} Credits`,
      metadata: { hours, authoritativeOnlineSeconds: authSeconds, redeemedBefore, redeemedAfter },
      createdBy,
      createdAt: live.updatedAt,
    });

    const redemption = {
      id: redemptionId,
      loginName: live.loginName,
      idempotencyKey,
      authoritativeOnlineSeconds: authSeconds,
      redeemedBeforeSeconds: redeemedBefore,
      redeemedAfterSeconds: redeemedAfter,
      hoursRedeemed: hours,
      creditsPerHour,
      creditsGranted,
      ledgerEntryId: ledgerId,
      createdAt: live.updatedAt,
    };
    this.redemptions.unshift(redemption);
    await this.recordAuditLog({
      actorType: "player",
      actorName: live.loginName,
      action: "ONLINE_TIME_REDEEM",
      targetType: "online_time_redemptions",
      targetId: redemptionId,
      outcome: "SUCCESS",
      ipAddress,
      details: { hours, creditsGranted, redeemedBefore, redeemedAfter },
    });

    return { idempotent: false, redemption: { ...redemption }, wallet: { ...live } };
  }

  async reserveExchangeDebitTransaction({ loginName, idempotencyKey, creditsCost, wcoinAmount, coinType = "WCoinC", createdBy, ipAddress = null }) {
    const existing = this.exchanges.find((e) => e.idempotencyKey === idempotencyKey);
    if (existing) {
      return { idempotent: true, exchange: { ...existing }, wallet: await this.ensureWalletAccount(existing.loginName) };
    }

    const wallet = await this.ensureWalletAccount(loginName);
    const live = this.wallets.get(wallet.loginName);
    if (live.creditsBalance < creditsCost) {
      throw new StoreError(400, "INSUFFICIENT_CREDITS", `Insufficient Credits (available ${live.creditsBalance}, required ${creditsCost}).`);
    }

    const exchangeId = crypto.randomUUID();
    const openmuReference = `webex:${exchangeId}`;
    const ledgerId = crypto.randomUUID();
    const now = new Date().toISOString();

    live.creditsBalance -= creditsCost;
    live.lifetimeCreditsSpent += creditsCost;
    live.updatedAt = now;

    this.ledger.unshift({
      id: ledgerId,
      loginName: live.loginName,
      entryType: "CREDIT_EXCHANGE_DEBIT",
      deltaCredits: -creditsCost,
      balanceAfter: live.creditsBalance,
      currencyUnit: "CREDITS",
      idempotencyKey: `exdebit:${idempotencyKey}`,
      referenceType: "CREDIT_EXCHANGE",
      referenceId: exchangeId,
      description: `Exchange ${creditsCost} Credits -> ${wcoinAmount} ${coinType}`,
      metadata: { wcoinAmount, coinType, openmuReference },
      createdBy,
      createdAt: now,
    });

    const exchange = {
      id: exchangeId,
      loginName: live.loginName,
      idempotencyKey,
      openmuReference,
      creditsSpent: creditsCost,
      wcoinAmount,
      coinType,
      status: "PENDING_GRANT",
      debitLedgerId: ledgerId,
      reversalLedgerId: null,
      openmuGrantId: null,
      openmuAppliedAt: null,
      retryCount: 0,
      lastError: null,
      createdAt: now,
      updatedAt: now,
    };
    this.exchanges.unshift(exchange);

    await this.recordAuditLog({
      actorType: "player",
      actorName: live.loginName,
      action: "CREDIT_EXCHANGE_INITIATED",
      targetType: "credit_exchanges",
      targetId: exchangeId,
      outcome: "SUCCESS",
      ipAddress,
      details: { creditsCost, wcoinAmount, coinType, openmuReference },
    });

    return { idempotent: false, exchange: { ...exchange }, wallet: { ...live } };
  }

  async completeExchangeTransaction({ exchangeId, openmuGrantId = null, appliedAt = null }) {
    const ex = this.exchanges.find((e) => e.id === exchangeId);
    if (!ex) throw new StoreError(404, "EXCHANGE_NOT_FOUND", "Exchange record not found.");
    ex.status = "COMPLETED";
    if (openmuGrantId) ex.openmuGrantId = openmuGrantId;
    if (appliedAt) ex.openmuAppliedAt = appliedAt;
    ex.lastError = null;
    ex.updatedAt = new Date().toISOString();
    return { exchange: { ...ex }, wallet: await this.ensureWalletAccount(ex.loginName) };
  }

  async reverseExchangeTransaction({ exchangeId, reason, ipAddress = null }) {
    const ex = this.exchanges.find((e) => e.id === exchangeId);
    if (!ex) throw new StoreError(404, "EXCHANGE_NOT_FOUND", "Exchange record not found.");
    if (ex.status === "REVERSED") {
      return { exchange: { ...ex }, wallet: await this.ensureWalletAccount(ex.loginName) };
    }
    if (ex.status === "COMPLETED") {
      throw new StoreError(409, "EXCHANGE_ALREADY_COMPLETED", "Cannot reverse a completed exchange.");
    }

    const live = this.wallets.get(ex.loginName);
    const now = new Date().toISOString();
    live.creditsBalance += ex.creditsSpent;
    live.lifetimeCreditsSpent = Math.max(0, live.lifetimeCreditsSpent - ex.creditsSpent);
    live.updatedAt = now;

    const reversalId = crypto.randomUUID();
    this.ledger.unshift({
      id: reversalId,
      loginName: live.loginName,
      entryType: "CREDIT_EXCHANGE_REVERSAL",
      deltaCredits: ex.creditsSpent,
      balanceAfter: live.creditsBalance,
      currencyUnit: "CREDITS",
      idempotencyKey: `exrev:${ex.id}`,
      referenceType: "CREDIT_EXCHANGE",
      referenceId: ex.id,
      description: `Refunded ${ex.creditsSpent} Credits after rejected WCoin grant`,
      metadata: { reason },
      createdBy: "system",
      createdAt: now,
    });

    ex.status = "REVERSED";
    ex.reversalLedgerId = reversalId;
    ex.lastError = reason;
    ex.updatedAt = now;

    await this.recordAuditLog({
      actorType: "system",
      actorName: "exchange-compensation",
      action: "CREDIT_EXCHANGE_REVERSED",
      targetType: "credit_exchanges",
      targetId: ex.id,
      outcome: "SUCCESS",
      ipAddress,
      details: { creditsRefunded: ex.creditsSpent, reason },
    });

    return { exchange: { ...ex }, wallet: { ...live } };
  }

  async markExchangeRetryError({ exchangeId, errorMessage }) {
    const ex = this.exchanges.find((e) => e.id === exchangeId);
    if (!ex) return null;
    ex.retryCount += 1;
    ex.lastError = String(errorMessage || "Unknown upstream error");
    ex.updatedAt = new Date().toISOString();
    return { ...ex };
  }

  async listPendingExchanges(limit = 25) {
    return this.exchanges.filter((e) => e.status === "PENDING_GRANT").slice(0, limit).map((e) => ({ ...e }));
  }

  async createTopupOrderTransaction({ loginName, packageDef, provider, idempotencyKey, providerOrderId = null, checkoutPayload = {}, ipAddress = null }) {
    const existing = this.orders.find((o) => o.idempotencyKey === idempotencyKey);
    if (existing) return { idempotent: true, order: { ...existing } };

    const wallet = await this.ensureWalletAccount(loginName);
    const orderId = crypto.randomUUID();
    const orderCode = `TU-${orderId.slice(0, 8).toUpperCase()}`;
    const now = new Date().toISOString();
    const order = {
      id: orderId,
      orderCode,
      loginName: wallet.loginName,
      packageId: packageDef.id,
      amountThb: packageDef.priceThb,
      creditsAmount: packageDef.totalCredits,
      wcoinAmount: packageDef.totalWcoin,
      provider,
      providerOrderId,
      providerTransactionId: null,
      status: "PENDING_PAYMENT",
      idempotencyKey,
      openmuReference: `webtopup:${orderId}`,
      creditLedgerId: null,
      openmuGrantId: null,
      checkoutPayload,
      failureReason: null,
      paidAt: null,
      fulfilledAt: null,
      createdAt: now,
      updatedAt: now,
    };
    this.orders.unshift(order);

    await this.recordAuditLog({
      actorType: "player",
      actorName: wallet.loginName,
      action: "TOPUP_ORDER_CREATED",
      targetType: "topup_orders",
      targetId: orderId,
      outcome: "SUCCESS",
      ipAddress,
      details: { orderCode, packageId: packageDef.id, amountThb: packageDef.priceThb, provider },
    });

    return { idempotent: false, order: { ...order } };
  }

  async getTopupOrder({ orderId = null, orderCode = null, providerOrderId = null }) {
    const found = this.orders.find(
      (o) => (orderId && o.id === orderId) || (orderCode && o.orderCode === orderCode) || (providerOrderId && o.providerOrderId === providerOrderId)
    );
    return found ? { ...found } : null;
  }

  async listTopupOrders({ loginName = null, status = null, limit = 50 } = {}) {
    return this.orders
      .filter((o) => (!loginName || o.loginName === normalizeLoginName(loginName)) && (!status || o.status === status))
      .slice(0, limit)
      .map((o) => ({ ...o }));
  }

  async updateTopupCheckoutPayload(orderId, { providerOrderId = null, checkoutPayload = null }) {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return null;
    if (providerOrderId) order.providerOrderId = providerOrderId;
    if (checkoutPayload) order.checkoutPayload = checkoutPayload;
    order.updatedAt = new Date().toISOString();
    return { ...order };
  }

  async recordWebhookEventTransaction({ provider, eventId, payloadSha256, signatureValid, rawPayload }) {
    const existing = this.webhookEvents.find((w) => w.provider === provider && w.eventId === eventId);
    if (existing) return { duplicate: true, event: { ...existing } };

    const event = {
      id: crypto.randomUUID(),
      provider,
      eventId,
      payloadSha256,
      signatureValid: Boolean(signatureValid),
      processingStatus: signatureValid ? "RECEIVED" : "REJECTED",
      orderId: null,
      rawPayload,
      errorMessage: null,
      receivedAt: new Date().toISOString(),
      processedAt: null,
    };
    this.webhookEvents.unshift(event);
    return { duplicate: false, event: { ...event } };
  }

  async finalizeWebhookEvent(eventId, { processingStatus, orderId = null, errorMessage = null }) {
    const event = this.webhookEvents.find((w) => w.id === eventId);
    if (!event) return;
    event.processingStatus = processingStatus;
    if (orderId) event.orderId = orderId;
    event.errorMessage = errorMessage;
    event.processedAt = new Date().toISOString();
  }

  async markTopupPaidAndCreditTransaction({
    orderId,
    providerTransactionId = null,
    actorType = "webhook",
    actorName = "payment-provider",
    ipAddress = null,
  }) {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) throw new StoreError(404, "ORDER_NOT_FOUND", "Top-up order not found.");
    if (order.status === "FULFILLED") {
      return { alreadyFulfilled: true, creditsNewlyGranted: false, order: { ...order }, wallet: await this.ensureWalletAccount(order.loginName) };
    }
    if (order.status === "CANCELLED" || order.status === "REFUNDED") {
      throw new StoreError(409, "INVALID_ORDER_STATE", `Order is ${order.status} and cannot be paid.`);
    }

    if (providerTransactionId && this.orders.some((o) => o.id !== order.id && o.provider === order.provider && o.providerTransactionId === providerTransactionId)) {
      throw new StoreError(409, "DUPLICATE_PROVIDER_TX", "Provider transaction ID was already consumed by another order.");
    }

    const live = this.wallets.get(order.loginName) ?? (await this.ensureWalletAccount(order.loginName), this.wallets.get(order.loginName));
    const now = new Date().toISOString();
    let creditsNewlyGranted = false;

    if (!order.creditLedgerId && order.creditsAmount > 0) {
      const ledgerId = crypto.randomUUID();
      live.creditsBalance += order.creditsAmount;
      live.lifetimeCreditsEarned += order.creditsAmount;
      live.totalTopupThb += order.amountThb;
      live.updatedAt = now;
      this.ledger.unshift({
        id: ledgerId,
        loginName: live.loginName,
        entryType: "TOPUP_CREDIT",
        deltaCredits: order.creditsAmount,
        balanceAfter: live.creditsBalance,
        currencyUnit: "CREDITS",
        idempotencyKey: `topup-credit:${order.id}`,
        referenceType: "TOPUP_ORDER",
        referenceId: order.id,
        description: `Top-up ${order.orderCode} (${order.packageId}): +${order.creditsAmount} Credits`,
        metadata: { orderCode: order.orderCode, provider: order.provider, providerTransactionId, wcoinAmount: order.wcoinAmount },
        createdBy: actorName,
        createdAt: now,
      });
      order.creditLedgerId = ledgerId;
      creditsNewlyGranted = true;
    }

    if (providerTransactionId) order.providerTransactionId = providerTransactionId;
    order.paidAt = order.paidAt || now;
    order.status = "FULFILLING";
    order.failureReason = null;
    order.updatedAt = now;

    await this.recordAuditLog({
      actorType,
      actorName,
      action: "TOPUP_PAID_AND_CREDITED",
      targetType: "topup_orders",
      targetId: order.id,
      outcome: "SUCCESS",
      ipAddress,
      details: { orderCode: order.orderCode, providerTransactionId, creditsGranted: creditsNewlyGranted ? order.creditsAmount : 0 },
    });

    return { alreadyFulfilled: false, creditsNewlyGranted, order: { ...order }, wallet: { ...live } };
  }

  async markTopupFulfilledTransaction({ orderId, openmuGrantId = null }) {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) throw new StoreError(404, "ORDER_NOT_FOUND", "Top-up order not found.");
    order.status = "FULFILLED";
    if (openmuGrantId) order.openmuGrantId = openmuGrantId;
    order.fulfilledAt = order.fulfilledAt || new Date().toISOString();
    order.failureReason = null;
    order.updatedAt = order.fulfilledAt;
    return { ...order };
  }

  async markTopupFailedTransaction({ orderId, reason }) {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return null;
    if (order.status !== "FULFILLED") {
      order.status = order.creditLedgerId ? "PAID" : "FAILED";
      order.failureReason = String(reason || "Fulfillment failed");
      order.updatedAt = new Date().toISOString();
    }
    return { ...order };
  }

  async adminAdjustWalletTransaction({ loginName, amount, reason, adminLogin, idempotencyKey, ipAddress = null }) {
    if (!Number.isInteger(amount) || amount === 0) {
      throw new StoreError(400, "INVALID_AMOUNT", "Adjustment amount must be a non-zero integer.");
    }
    const existing = this.ledger.find((l) => l.idempotencyKey === idempotencyKey);
    if (existing) {
      return { idempotent: true, ledgerEntry: { ...existing }, wallet: await this.ensureWalletAccount(existing.loginName) };
    }

    const wallet = await this.ensureWalletAccount(loginName);
    const live = this.wallets.get(wallet.loginName);
    const newBalance = live.creditsBalance + amount;
    if (newBalance < 0) {
      throw new StoreError(400, "INSUFFICIENT_CREDITS", `Cannot deduct ${Math.abs(amount)} Credits; balance is ${live.creditsBalance}.`);
    }

    const now = new Date().toISOString();
    live.creditsBalance = newBalance;
    if (amount > 0) live.lifetimeCreditsEarned += amount;
    else live.lifetimeCreditsSpent += Math.abs(amount);
    live.updatedAt = now;

    const entry = {
      id: crypto.randomUUID(),
      loginName: live.loginName,
      entryType: amount > 0 ? "ADMIN_CREDIT" : "ADMIN_DEBIT",
      deltaCredits: amount,
      balanceAfter: newBalance,
      currencyUnit: "CREDITS",
      idempotencyKey,
      referenceType: "ADMIN_ADJUST",
      referenceId: crypto.randomUUID(),
      description: `Admin ${adminLogin}: ${reason}`,
      metadata: { reason },
      createdBy: adminLogin,
      createdAt: now,
    };
    this.ledger.unshift(entry);

    await this.recordAuditLog({
      actorType: "admin",
      actorName: adminLogin,
      action: "ADMIN_WALLET_ADJUST",
      targetType: "wallet_accounts",
      targetId: live.loginName,
      outcome: "SUCCESS",
      ipAddress,
      details: { amount, balanceAfter: newBalance, reason },
    });

    return { idempotent: false, ledgerEntry: { ...entry }, wallet: { ...live } };
  }

  async createSession({ tokenHash, principalType, loginName, roles = [], ipAddress = null, userAgent = null, expiresAt }) {
    this.sessions.set(tokenHash, {
      principalType,
      loginName,
      roles,
      ipAddress,
      userAgent,
      expiresAt: new Date(expiresAt).toISOString(),
      revokedAt: null,
    });
  }

  async getSession(tokenHash) {
    const row = this.sessions.get(tokenHash);
    if (!row || row.revokedAt || new Date(row.expiresAt).getTime() <= Date.now()) return null;
    return { principalType: row.principalType, loginName: row.loginName, roles: row.roles, expiresAt: row.expiresAt };
  }

  async revokeSession(tokenHash) {
    const row = this.sessions.get(tokenHash);
    if (row) row.revokedAt = new Date().toISOString();
  }

  async recordAuditLog({ actorType, actorName, action, targetType = null, targetId = null, outcome = "SUCCESS", ipAddress = null, details = {} }) {
    this.auditLogs.unshift({
      id: crypto.randomUUID(),
      actorType,
      actorName,
      action,
      targetType,
      targetId,
      outcome,
      ipAddress,
      details,
      createdAt: new Date().toISOString(),
    });
  }

  async listAuditLogs({ limit = 100, actorName = null, action = null } = {}) {
    return this.auditLogs
      .filter((e) => (!actorName || e.actorName === actorName) && (!action || e.action === action))
      .slice(0, limit);
  }
}
