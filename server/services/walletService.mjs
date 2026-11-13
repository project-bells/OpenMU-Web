import crypto from "node:crypto";
import {
  EXCHANGE_CREDITS_PER_BLOCK,
  EXCHANGE_WCOINC_PER_BLOCK,
  ONLINE_REWARD_CREDITS_PER_HOUR,
  ONLINE_REWARD_SECONDS_PER_HOUR,
  TOPUP_PACKAGES,
  TOPUP_PACKAGES_BY_ID,
} from "../config.mjs";
import { StoreError } from "../db/errors.mjs";
import { UpstreamError } from "./openmuClient.mjs";
import { buildPromptPayPayload, verifyWebhookHmacSignature } from "./paymentProviders.mjs";

export function createWalletService({ config, store, openmuClient, paypalClient }) {
  async function getPlayerSummary(loginName) {
    const [{ data: profile }, walletSummary] = await Promise.all([
      openmuClient.getAccountProfile(loginName),
      store.getWalletSummary(loginName, 50),
    ]);

    const authOnlineSeconds = Math.max(0, Number(profile?.onlineTimeSeconds || 0));
    const redeemedSeconds = walletSummary.wallet.redeemedOnlineSeconds;
    const unredeemedSeconds = Math.max(0, authOnlineSeconds - redeemedSeconds);
    const unredeemedHours = Math.floor(unredeemedSeconds / ONLINE_REWARD_SECONDS_PER_HOUR);

    return {
      account: {
        loginName: profile.loginName,
        email: profile.eMail ?? profile.email ?? "",
        state: profile.state,
        vipUntil: profile.vipUntil ?? null,
        online: Boolean(profile.online),
        serverId: profile.serverId ?? null,
        onlineTimeSeconds: authOnlineSeconds,
        redeemedOnlineSeconds: redeemedSeconds,
        availableOnlineSeconds: unredeemedSeconds,
        redeemableHours: unredeemedHours,
        potentialCredits: unredeemedHours * ONLINE_REWARD_CREDITS_PER_HOUR,
        creditsPerHour: ONLINE_REWARD_CREDITS_PER_HOUR,
        creditsBalance: walletSummary.wallet.creditsBalance,
        lifetimeCreditsEarned: walletSummary.wallet.lifetimeCreditsEarned,
        lifetimeCreditsSpent: walletSummary.wallet.lifetimeCreditsSpent,
        totalTopupThb: walletSummary.wallet.totalTopupThb,
        wcoinC: Number(profile?.balance?.wCoinC ?? 0),
        wcoinP: Number(profile?.balance?.wCoinP ?? 0),
        goblinPoints: Number(profile?.balance?.goblinPoints ?? 0),
        pendingWCoinC: Number(profile?.balance?.pendingWCoinC ?? 0),
      },
      characters: Array.isArray(profile.characters) ? profile.characters : [],
      wallet: walletSummary.wallet,
      ledger: walletSummary.ledger,
      redemptions: walletSummary.redemptions,
      exchanges: walletSummary.exchanges,
      orders: walletSummary.orders,
    };
  }

  async function redeemOnlineTime({ loginName, idempotencyKey, hours = null, ipAddress = null }) {
    const cleanKey = String(idempotencyKey || "").trim();
    if (!cleanKey || cleanKey.length > 128) {
      throw new StoreError(400, "INVALID_IDEMPOTENCY_KEY", "A valid Idempotency-Key (<=128 chars) is required.");
    }

    const { data: profile } = await openmuClient.getAccountProfile(loginName);
    const authoritativeOnlineSeconds = Math.max(0, Number(profile?.onlineTimeSeconds || 0));

    const result = await store.redeemOnlineTimeTransaction({
      loginName: profile.loginName,
      idempotencyKey: cleanKey,
      authoritativeOnlineSeconds,
      secondsPerHour: ONLINE_REWARD_SECONDS_PER_HOUR,
      creditsPerHour: ONLINE_REWARD_CREDITS_PER_HOUR,
      hoursRequested: hours === undefined || hours === null ? null : Number(hours),
      createdBy: profile.loginName,
      ipAddress,
    });

    return {
      ...result,
      authoritativeOnlineSeconds,
      availableOnlineSecondsAfter: Math.max(0, authoritativeOnlineSeconds - result.wallet.redeemedOnlineSeconds),
    };
  }

  async function grantExchangeOnOpenMu(exchange) {
    try {
      const res = await openmuClient.grantCashShopCoins(exchange.loginName, {
        coinType: exchange.coinType,
        amount: exchange.wcoinAmount,
        reason: `Web exchange ${exchange.creditsSpent} Credits -> ${exchange.wcoinAmount} ${exchange.coinType}`,
        reference: exchange.openmuReference,
      });

      const grant = res.data;
      const completed = await store.completeExchangeTransaction({
        exchangeId: exchange.id,
        openmuGrantId: grant?.id ?? null,
        appliedAt: grant?.appliedAt ?? null,
      });
      return { outcome: "COMPLETED", ...completed, upstream: grant };
    } catch (error) {
      if (error instanceof UpstreamError && error.status >= 400 && error.status < 500 && error.status !== 408 && error.status !== 429) {
        const reversed = await store.reverseExchangeTransaction({
          exchangeId: exchange.id,
          reason: error.message,
        });
        return { outcome: "REVERSED", error, ...reversed };
      }

      const message = error instanceof Error ? error.message : String(error);
      await store.markExchangeRetryError({ exchangeId: exchange.id, errorMessage: message });
      return { outcome: "PENDING_RETRY", error };
    }
  }

  async function exchangeCreditsToWCoin({ loginName, credits, idempotencyKey, coinType = "WCoinC", ipAddress = null }) {
    const cleanKey = String(idempotencyKey || "").trim();
    if (!cleanKey || cleanKey.length > 128) {
      throw new StoreError(400, "INVALID_IDEMPOTENCY_KEY", "A valid Idempotency-Key (<=128 chars) is required.");
    }
    if (coinType !== "WCoinC") {
      throw new StoreError(400, "UNSUPPORTED_COIN_TYPE", "Currently only WCoinC exchange is supported.");
    }

    const numericCredits = Number(credits);
    if (!Number.isInteger(numericCredits) || numericCredits < EXCHANGE_CREDITS_PER_BLOCK || numericCredits % EXCHANGE_CREDITS_PER_BLOCK !== 0) {
      throw new StoreError(
        400,
        "INVALID_EXCHANGE_AMOUNT",
        `Credits must be a positive multiple of ${EXCHANGE_CREDITS_PER_BLOCK} (100 Credits = ${EXCHANGE_WCOINC_PER_BLOCK} WCoinC).`
      );
    }

    const wcoinAmount = (numericCredits / EXCHANGE_CREDITS_PER_BLOCK) * EXCHANGE_WCOINC_PER_BLOCK;
    const reserved = await store.reserveExchangeDebitTransaction({
      loginName,
      idempotencyKey: cleanKey,
      creditsCost: numericCredits,
      wcoinAmount,
      coinType,
      createdBy: loginName,
      ipAddress,
    });

    if (reserved.idempotent && reserved.exchange.status === "COMPLETED") {
      return { idempotent: true, status: "COMPLETED", exchange: reserved.exchange, wallet: reserved.wallet };
    }
    if (reserved.idempotent && reserved.exchange.status === "REVERSED") {
      throw new StoreError(409, "EXCHANGE_PREVIOUSLY_REVERSED", reserved.exchange.lastError || "Exchange was previously rejected and refunded.");
    }

    const grantResult = await grantExchangeOnOpenMu(reserved.exchange);
    if (grantResult.outcome === "COMPLETED") {
      return {
        idempotent: reserved.idempotent,
        status: "COMPLETED",
        exchange: grantResult.exchange,
        wallet: grantResult.wallet,
      };
    }

    if (grantResult.outcome === "REVERSED") {
      throw new StoreError(
        grantResult.error.status || 400,
        "EXCHANGE_REJECTED_REFUNDED",
        `OpenMU rejected the WCoinC grant (${grantResult.error.message}). Credits were safely refunded to your wallet.`,
        { wallet: grantResult.wallet, exchange: grantResult.exchange }
      );
    }

    throw new StoreError(
      503,
      "EXCHANGE_PENDING_RETRY",
      "Credits reserved; OpenMU coin delivery is temporarily unavailable and queued for automatic retry.",
      { exchange: reserved.exchange, wallet: reserved.wallet }
    );
  }

  async function reconcilePendingExchanges() {
    const pending = await store.listPendingExchanges(20);
    const results = [];
    for (const ex of pending) {
      results.push(await grantExchangeOnOpenMu(ex));
    }
    return results;
  }

  function getCatalog() {
    return {
      packages: TOPUP_PACKAGES,
      providers: {
        promptpayManual: {
          enabled: true,
          configuredId: Boolean(config.promptPayAccountId),
          accountName: config.promptPayAccountName,
        },
        paypal: {
          enabled: paypalClient.isConfigured(),
          environment: config.paypalEnv,
        },
        webhookHmac: {
          enabled: Boolean(config.paymentWebhookSecret),
        },
        devSandbox: {
          enabled: config.enableDevTopupSandbox,
        },
      },
    };
  }

  async function createTopupOrder({ loginName, packageId, provider = "promptpay_manual", idempotencyKey, ipAddress = null }) {
    const cleanKey = String(idempotencyKey || "").trim();
    if (!cleanKey || cleanKey.length > 128) {
      throw new StoreError(400, "INVALID_IDEMPOTENCY_KEY", "A valid Idempotency-Key (<=128 chars) is required.");
    }
    const pkg = TOPUP_PACKAGES_BY_ID.get(String(packageId || "").trim());
    if (!pkg) {
      throw new StoreError(400, "UNKNOWN_PACKAGE", "Selected top-up package does not exist in server catalog.");
    }

    const allowedProviders = new Set(["promptpay_manual", "paypal", "webhook_hmac", "dev_sandbox"]);
    if (!allowedProviders.has(provider)) {
      throw new StoreError(400, "UNSUPPORTED_PROVIDER", `Unsupported payment provider '${provider}'.`);
    }
    if (provider === "dev_sandbox" && !config.enableDevTopupSandbox) {
      throw new StoreError(403, "SANDBOX_DISABLED", "Dev/test payment sandbox is disabled on this server.");
    }
    if (provider === "paypal" && !paypalClient.isConfigured()) {
      throw new StoreError(503, "PAYPAL_NOT_CONFIGURED", "PayPal checkout is not configured.");
    }

    // Verify account exists on OpenMU before accepting money
    await openmuClient.getAccountProfile(loginName);

    let checkoutPayload = {};
    if (provider === "promptpay_manual") {
      checkoutPayload = {
        accountName: config.promptPayAccountName,
        qrPayload: buildPromptPayPayload(config.promptPayAccountId, pkg.priceThb),
        instructions: config.promptPayAccountId
          ? "Scan PromptPay QR and include the Order Code in transfer note or verify via webhook/admin."
          : "Transfer the exact amount and provide the Order Code to verify settlement.",
      };
    } else if (provider === "dev_sandbox") {
      checkoutPayload = { mode: "sandbox", instructions: "Non-production sandbox order ready for test settlement." };
    }

    const created = await store.createTopupOrderTransaction({
      loginName,
      packageDef: pkg,
      provider,
      idempotencyKey: cleanKey,
      checkoutPayload,
      ipAddress,
    });

    if (provider === "paypal" && !created.idempotent && !created.order.providerOrderId) {
      const pp = await paypalClient.createOrder({ order: created.order, packageDef: pkg });
      const updated = await store.updateTopupCheckoutPayload(created.order.id, {
        providerOrderId: pp.providerOrderId,
        checkoutPayload: { approvalUrl: pp.approvalUrl, rawStatus: pp.rawStatus },
      });
      return { ...created, order: updated };
    }

    return created;
  }

  async function fulfillPaidOrder({ orderId, providerTransactionId = null, actorType, actorName, ipAddress = null }) {
    const paid = await store.markTopupPaidAndCreditTransaction({
      orderId,
      providerTransactionId,
      actorType,
      actorName,
      ipAddress,
    });

    if (paid.alreadyFulfilled) {
      return { status: "FULFILLED", idempotent: true, order: paid.order, wallet: paid.wallet };
    }

    if (paid.order.wcoinAmount > 0) {
      try {
        const res = await openmuClient.grantCashShopCoins(paid.order.loginName, {
          coinType: "WCoinC",
          amount: paid.order.wcoinAmount,
          reason: `Top-up order ${paid.order.orderCode} (${paid.order.packageId})`,
          reference: paid.order.openmuReference,
        });
        const fulfilledOrder = await store.markTopupFulfilledTransaction({
          orderId: paid.order.id,
          openmuGrantId: res.data?.id ?? null,
        });
        return { status: "FULFILLED", idempotent: false, order: fulfilledOrder, wallet: paid.wallet };
      } catch (error) {
        await store.markTopupFailedTransaction({
          orderId: paid.order.id,
          reason: error?.message || "Failed to grant WCoinC on OpenMU.",
        });
        throw new StoreError(
          503,
          "TOPUP_WCOIN_PENDING",
          "Payment confirmed and Credits added, but WCoinC delivery to OpenMU failed and awaits retry.",
          { orderId: paid.order.id, wallet: paid.wallet }
        );
      }
    }

    const fulfilledOrder = await store.markTopupFulfilledTransaction({ orderId: paid.order.id });
    return { status: "FULFILLED", idempotent: false, order: fulfilledOrder, wallet: paid.wallet };
  }

  async function capturePayPalOrder({ loginName, orderId, ipAddress = null }) {
    const order = await store.getTopupOrder({ orderId });
    if (!order || order.loginName !== loginName) {
      throw new StoreError(404, "ORDER_NOT_FOUND", "Top-up order not found.");
    }
    if (order.provider !== "paypal" || !order.providerOrderId) {
      throw new StoreError(400, "INVALID_PROVIDER_ORDER", "Order is not a PayPal checkout order.");
    }
    if (order.status === "FULFILLED") {
      const wallet = await store.ensureWalletAccount(loginName);
      return { status: "FULFILLED", idempotent: true, order, wallet };
    }

    const capture = await paypalClient.captureOrder({
      providerOrderId: order.providerOrderId,
      expectedAmountThb: order.amountThb,
    });

    return fulfillPaidOrder({
      orderId: order.id,
      providerTransactionId: capture.providerTransactionId,
      actorType: "player",
      actorName: loginName,
      ipAddress,
    });
  }

  async function settleSandboxTopup({ loginName, orderId, ipAddress = null }) {
    if (!config.enableDevTopupSandbox) {
      throw new StoreError(403, "SANDBOX_DISABLED", "Dev/test sandbox confirmation is disabled.");
    }
    const order = await store.getTopupOrder({ orderId });
    if (!order || order.loginName !== loginName) {
      throw new StoreError(404, "ORDER_NOT_FOUND", "Top-up order not found.");
    }
    if (order.provider !== "dev_sandbox") {
      throw new StoreError(400, "NOT_SANDBOX_ORDER", "Only dev_sandbox orders can be settled via sandbox confirmation.");
    }
    return fulfillPaidOrder({
      orderId: order.id,
      providerTransactionId: `SANDBOX-${order.id}`,
      actorType: "player",
      actorName: loginName,
      ipAddress,
    });
  }

  async function processHmacWebhook({ rawBody, headers, ipAddress = null }) {
    const sig = verifyWebhookHmacSignature({
      rawBody,
      headers,
      secret: config.paymentWebhookSecret,
    });
    const payloadSha256 = crypto.createHash("sha256").update(rawBody).digest("hex");

    let payload;
    try {
      payload = JSON.parse(rawBody || "{}");
    } catch {
      throw new StoreError(400, "INVALID_JSON", "Malformed JSON webhook body.");
    }

    const eventId = String(payload.eventId || payload.id || headers["x-webhook-event-id"] || "").trim();
    if (!eventId) {
      throw new StoreError(400, "MISSING_EVENT_ID", "Webhook eventId is required.");
    }

    if (!sig.valid) {
      await store.recordAuditLog({
        actorType: "webhook",
        actorName: "webhook_hmac",
        action: "TOPUP_WEBHOOK_REJECTED",
        targetType: "payment_webhook_events",
        targetId: eventId,
        outcome: "REJECTED",
        ipAddress,
        details: { eventId, payloadSha256, reason: sig.reason },
      });
      throw new StoreError(401, "INVALID_WEBHOOK_SIGNATURE", sig.reason);
    }

    const recorded = await store.recordWebhookEventTransaction({
      provider: "webhook_hmac",
      eventId,
      payloadSha256,
      signatureValid: true,
      rawPayload: payload,
    });

    if (recorded.duplicate) {
      return { duplicate: true, event: recorded.event };
    }

    try {
      const order = await store.getTopupOrder({
        orderId: payload.orderId || null,
        orderCode: payload.orderCode || null,
      });
      if (!order) {
        throw new StoreError(404, "ORDER_NOT_FOUND", "Referenced top-up order does not exist.");
      }
      if (payload.amountThb !== undefined && Math.abs(Number(payload.amountThb) - Number(order.amountThb)) > 0.01) {
        throw new StoreError(400, "WEBHOOK_AMOUNT_MISMATCH", "Webhook payment amount does not match order amount.");
      }

      const providerTxId = String(payload.transactionId || payload.providerTransactionId || eventId);
      const fulfilled = await fulfillPaidOrder({
        orderId: order.id,
        providerTransactionId: providerTxId,
        actorType: "webhook",
        actorName: "webhook_hmac",
        ipAddress,
      });

      await store.finalizeWebhookEvent(recorded.event.id, {
        processingStatus: "PROCESSED",
        orderId: order.id,
      });

      return { duplicate: false, eventId: recorded.event.id, ...fulfilled };
    } catch (error) {
      await store.finalizeWebhookEvent(recorded.event.id, {
        processingStatus: "FAILED",
        errorMessage: error?.message || "Webhook fulfillment failed",
      });
      throw error;
    }
  }

  return {
    getPlayerSummary,
    redeemOnlineTime,
    exchangeCreditsToWCoin,
    reconcilePendingExchanges,
    getCatalog,
    createTopupOrder,
    fulfillPaidOrder,
    capturePayPalOrder,
    settleSandboxTopup,
    processHmacWebhook,
  };
}
