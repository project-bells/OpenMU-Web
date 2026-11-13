import crypto from "node:crypto";
import { Pool } from "pg";
import { runMigrations } from "./migrate.mjs";
import { StoreError, normalizeLoginName } from "./errors.mjs";

export class PostgresStore {
  constructor(databaseUrl) {
    this.pool = new Pool({
      connectionString: databaseUrl,
      max: 20,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    });
  }

  async init() {
    await runMigrations(this.pool);
  }

  async close() {
    await this.pool.end();
  }

  async ping() {
    await this.pool.query("SELECT 1;");
    return true;
  }

  async withTransaction(fn) {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const result = await fn(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      try {
        await client.query("ROLLBACK");
      } catch {
        // Ignore rollback failure
      }
      throw error;
    } finally {
      client.release();
    }
  }

  async ensureWalletAccount(loginName, client = null) {
    const clean = normalizeLoginName(loginName);
    if (!clean) throw new StoreError(400, "INVALID_LOGIN_NAME", "LoginName is required.");
    const runner = client ?? this.pool;
    await runner.query(
      `INSERT INTO web.wallet_accounts (login_name) VALUES ($1) ON CONFLICT (login_name) DO NOTHING;`,
      [clean]
    );
    const res = await runner.query(
      `SELECT * FROM web.wallet_accounts WHERE login_name = $1${client ? " FOR UPDATE" : ""};`,
      [clean]
    );
    return mapWalletRow(res.rows[0]);
  }

  async getWalletSummary(loginName, limit = 50) {
    const wallet = await this.ensureWalletAccount(loginName);
    const [ledgerRes, redemptionsRes, exchangesRes, ordersRes] = await Promise.all([
      this.pool.query(
        `SELECT * FROM web.wallet_ledger WHERE login_name = $1 ORDER BY created_at DESC LIMIT $2;`,
        [wallet.loginName, limit]
      ),
      this.pool.query(
        `SELECT * FROM web.online_time_redemptions WHERE login_name = $1 ORDER BY created_at DESC LIMIT $2;`,
        [wallet.loginName, limit]
      ),
      this.pool.query(
        `SELECT * FROM web.credit_exchanges WHERE login_name = $1 ORDER BY created_at DESC LIMIT $2;`,
        [wallet.loginName, limit]
      ),
      this.pool.query(
        `SELECT * FROM web.topup_orders WHERE login_name = $1 ORDER BY created_at DESC LIMIT $2;`,
        [wallet.loginName, limit]
      ),
    ]);

    return {
      wallet,
      ledger: ledgerRes.rows.map(mapLedgerRow),
      redemptions: redemptionsRes.rows.map(mapRedemptionRow),
      exchanges: exchangesRes.rows.map(mapExchangeRow),
      orders: ordersRes.rows.map(mapOrderRow),
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
    return this.withTransaction(async (client) => {
      const existing = await client.query(
        `SELECT * FROM web.online_time_redemptions WHERE idempotency_key = $1;`,
        [idempotencyKey]
      );
      if (existing.rows.length > 0) {
        const walletRes = await client.query(
          `SELECT * FROM web.wallet_accounts WHERE login_name = $1;`,
          [existing.rows[0].login_name]
        );
        return {
          idempotent: true,
          redemption: mapRedemptionRow(existing.rows[0]),
          wallet: mapWalletRow(walletRes.rows[0]),
        };
      }

      const wallet = await this.ensureWalletAccount(loginName, client);
      const authSeconds = Math.max(0, Math.floor(Number(authoritativeOnlineSeconds) || 0));
      const availableSeconds = Math.max(0, authSeconds - wallet.redeemedOnlineSeconds);
      const maxRedeemableHours = Math.floor(availableSeconds / secondsPerHour);
      if (maxRedeemableHours < 1) {
        throw new StoreError(400, "INSUFFICIENT_ONLINE_TIME", "Less than 1 unredeemed online hour is available.");
      }

      const hours = hoursRequested === null
        ? maxRedeemableHours
        : Math.floor(Number(hoursRequested));
      if (!Number.isInteger(hours) || hours < 1) {
        throw new StoreError(400, "INVALID_HOURS", "Hours to redeem must be a positive integer.");
      }
      if (hours > maxRedeemableHours) {
        throw new StoreError(
          400,
          "INSUFFICIENT_ONLINE_TIME",
          `Requested ${hours} hour(s), but only ${maxRedeemableHours} unredeemed hour(s) available.`
        );
      }

      const creditsGranted = hours * creditsPerHour;
      const redeemedBefore = wallet.redeemedOnlineSeconds;
      const redeemedAfter = redeemedBefore + hours * secondsPerHour;
      const newBalance = wallet.creditsBalance + creditsGranted;
      const ledgerId = crypto.randomUUID();
      const redemptionId = crypto.randomUUID();

      await client.query(
        `UPDATE web.wallet_accounts
         SET credits_balance = $2,
             lifetime_credits_earned = lifetime_credits_earned + $3,
             redeemed_online_seconds = $4,
             updated_at = NOW()
         WHERE login_name = $1;`,
        [wallet.loginName, newBalance, creditsGranted, redeemedAfter]
      );

      await client.query(
        `INSERT INTO web.wallet_ledger
           (id, login_name, entry_type, delta_credits, balance_after, currency_unit, idempotency_key, reference_type, reference_id, description, metadata_json, created_by)
         VALUES ($1, $2, 'ONLINE_REWARD', $3, $4, 'CREDITS', $5, 'ONLINE_REDEMPTION', $6, $7, $8, $9);`,
        [
          ledgerId,
          wallet.loginName,
          creditsGranted,
          newBalance,
          `online:${idempotencyKey}`,
          redemptionId,
          `Online time reward: ${hours}h -> +${creditsGranted} Credits`,
          JSON.stringify({ hours, authoritativeOnlineSeconds: authSeconds, redeemedBefore, redeemedAfter }),
          createdBy,
        ]
      );

      const ins = await client.query(
        `INSERT INTO web.online_time_redemptions
           (id, login_name, idempotency_key, authoritative_online_seconds, redeemed_before_seconds, redeemed_after_seconds, hours_redeemed, credits_per_hour, credits_granted, ledger_entry_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *;`,
        [
          redemptionId,
          wallet.loginName,
          idempotencyKey,
          authSeconds,
          redeemedBefore,
          redeemedAfter,
          hours,
          creditsPerHour,
          creditsGranted,
          ledgerId,
        ]
      );

      await insertAudit(client, {
        actorType: "player",
        actorName: wallet.loginName,
        action: "ONLINE_TIME_REDEEM",
        targetType: "online_time_redemptions",
        targetId: redemptionId,
        outcome: "SUCCESS",
        ipAddress,
        details: { hours, creditsGranted, redeemedBefore, redeemedAfter },
      });

      const updatedWallet = await client.query(`SELECT * FROM web.wallet_accounts WHERE login_name = $1;`, [wallet.loginName]);
      return {
        idempotent: false,
        redemption: mapRedemptionRow(ins.rows[0]),
        wallet: mapWalletRow(updatedWallet.rows[0]),
      };
    });
  }

  async reserveExchangeDebitTransaction({
    loginName,
    idempotencyKey,
    creditsCost,
    wcoinAmount,
    coinType = "WCoinC",
    createdBy,
    ipAddress = null,
  }) {
    return this.withTransaction(async (client) => {
      const existing = await client.query(
        `SELECT * FROM web.credit_exchanges WHERE idempotency_key = $1;`,
        [idempotencyKey]
      );
      if (existing.rows.length > 0) {
        const walletRes = await client.query(
          `SELECT * FROM web.wallet_accounts WHERE login_name = $1;`,
          [existing.rows[0].login_name]
        );
        return {
          idempotent: true,
          exchange: mapExchangeRow(existing.rows[0]),
          wallet: mapWalletRow(walletRes.rows[0]),
        };
      }

      const wallet = await this.ensureWalletAccount(loginName, client);
      if (wallet.creditsBalance < creditsCost) {
        throw new StoreError(
          400,
          "INSUFFICIENT_CREDITS",
          `Insufficient Credits (available ${wallet.creditsBalance}, required ${creditsCost}).`
        );
      }

      const exchangeId = crypto.randomUUID();
      const openmuReference = `webex:${exchangeId}`;
      const ledgerId = crypto.randomUUID();
      const newBalance = wallet.creditsBalance - creditsCost;

      await client.query(
        `UPDATE web.wallet_accounts
         SET credits_balance = $2,
             lifetime_credits_spent = lifetime_credits_spent + $3,
             updated_at = NOW()
         WHERE login_name = $1;`,
        [wallet.loginName, newBalance, creditsCost]
      );

      await client.query(
        `INSERT INTO web.wallet_ledger
           (id, login_name, entry_type, delta_credits, balance_after, currency_unit, idempotency_key, reference_type, reference_id, description, metadata_json, created_by)
         VALUES ($1, $2, 'CREDIT_EXCHANGE_DEBIT', $3, $4, 'CREDITS', $5, 'CREDIT_EXCHANGE', $6, $7, $8, $9);`,
        [
          ledgerId,
          wallet.loginName,
          -creditsCost,
          newBalance,
          `exdebit:${idempotencyKey}`,
          exchangeId,
          `Exchange ${creditsCost} Credits -> ${wcoinAmount} ${coinType}`,
          JSON.stringify({ wcoinAmount, coinType, openmuReference }),
          createdBy,
        ]
      );

      const exRes = await client.query(
        `INSERT INTO web.credit_exchanges
           (id, login_name, idempotency_key, openmu_reference, credits_spent, wcoin_amount, coin_type, status, debit_ledger_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING_GRANT', $8)
         RETURNING *;`,
        [exchangeId, wallet.loginName, idempotencyKey, openmuReference, creditsCost, wcoinAmount, coinType, ledgerId]
      );

      await insertAudit(client, {
        actorType: "player",
        actorName: wallet.loginName,
        action: "CREDIT_EXCHANGE_INITIATED",
        targetType: "credit_exchanges",
        targetId: exchangeId,
        outcome: "SUCCESS",
        ipAddress,
        details: { creditsCost, wcoinAmount, coinType, openmuReference },
      });

      const updatedWallet = await client.query(`SELECT * FROM web.wallet_accounts WHERE login_name = $1;`, [wallet.loginName]);
      return {
        idempotent: false,
        exchange: mapExchangeRow(exRes.rows[0]),
        wallet: mapWalletRow(updatedWallet.rows[0]),
      };
    });
  }

  async completeExchangeTransaction({ exchangeId, openmuGrantId = null, appliedAt = null }) {
    return this.withTransaction(async (client) => {
      const res = await client.query(
        `UPDATE web.credit_exchanges
         SET status = 'COMPLETED',
             openmu_grant_id = COALESCE($2, openmu_grant_id),
             openmu_applied_at = COALESCE($3, openmu_applied_at),
             last_error = NULL,
             updated_at = NOW()
         WHERE id = $1 AND status IN ('PENDING_GRANT', 'COMPLETED')
         RETURNING *;`,
        [exchangeId, openmuGrantId, appliedAt]
      );
      if (res.rows.length === 0) throw new StoreError(404, "EXCHANGE_NOT_FOUND", "Exchange record not found.");
      const walletRes = await client.query(`SELECT * FROM web.wallet_accounts WHERE login_name = $1;`, [res.rows[0].login_name]);
      return { exchange: mapExchangeRow(res.rows[0]), wallet: mapWalletRow(walletRes.rows[0]) };
    });
  }

  async reverseExchangeTransaction({ exchangeId, reason, ipAddress = null }) {
    return this.withTransaction(async (client) => {
      const exRes = await client.query(`SELECT * FROM web.credit_exchanges WHERE id = $1 FOR UPDATE;`, [exchangeId]);
      if (exRes.rows.length === 0) throw new StoreError(404, "EXCHANGE_NOT_FOUND", "Exchange record not found.");
      const ex = exRes.rows[0];
      if (ex.status === "REVERSED") {
        const w = await client.query(`SELECT * FROM web.wallet_accounts WHERE login_name = $1;`, [ex.login_name]);
        return { exchange: mapExchangeRow(ex), wallet: mapWalletRow(w.rows[0]) };
      }
      if (ex.status === "COMPLETED") {
        throw new StoreError(409, "EXCHANGE_ALREADY_COMPLETED", "Cannot reverse a completed exchange.");
      }

      const wallet = await this.ensureWalletAccount(ex.login_name, client);
      const newBalance = wallet.creditsBalance + ex.credits_spent;
      const reversalId = crypto.randomUUID();

      await client.query(
        `UPDATE web.wallet_accounts
         SET credits_balance = $2,
             lifetime_credits_spent = GREATEST(0, lifetime_credits_spent - $3),
             updated_at = NOW()
         WHERE login_name = $1;`,
        [wallet.loginName, newBalance, ex.credits_spent]
      );

      await client.query(
        `INSERT INTO web.wallet_ledger
           (id, login_name, entry_type, delta_credits, balance_after, currency_unit, idempotency_key, reference_type, reference_id, description, metadata_json, created_by)
         VALUES ($1, $2, 'CREDIT_EXCHANGE_REVERSAL', $3, $4, 'CREDITS', $5, 'CREDIT_EXCHANGE', $6, $7, $8, 'system');`,
        [
          reversalId,
          wallet.loginName,
          ex.credits_spent,
          newBalance,
          `exrev:${ex.id}`,
          ex.id,
          `Refunded ${ex.credits_spent} Credits after rejected WCoin grant`,
          JSON.stringify({ reason }),
        ]
      );

      const updatedEx = await client.query(
        `UPDATE web.credit_exchanges
         SET status = 'REVERSED',
             reversal_ledger_id = $2,
             last_error = $3,
             updated_at = NOW()
         WHERE id = $1
         RETURNING *;`,
        [ex.id, reversalId, reason]
      );

      await insertAudit(client, {
        actorType: "system",
        actorName: "exchange-compensation",
        action: "CREDIT_EXCHANGE_REVERSED",
        targetType: "credit_exchanges",
        targetId: ex.id,
        outcome: "SUCCESS",
        ipAddress,
        details: { creditsRefunded: ex.credits_spent, reason },
      });

      const updatedWallet = await client.query(`SELECT * FROM web.wallet_accounts WHERE login_name = $1;`, [wallet.loginName]);
      return { exchange: mapExchangeRow(updatedEx.rows[0]), wallet: mapWalletRow(updatedWallet.rows[0]) };
    });
  }

  async markExchangeRetryError({ exchangeId, errorMessage }) {
    const res = await this.pool.query(
      `UPDATE web.credit_exchanges
       SET retry_count = retry_count + 1,
           last_error = $2,
           updated_at = NOW()
       WHERE id = $1
       RETURNING *;`,
      [exchangeId, String(errorMessage || "Unknown upstream error")]
    );
    return res.rows[0] ? mapExchangeRow(res.rows[0]) : null;
  }

  async listPendingExchanges(limit = 25) {
    const res = await this.pool.query(
      `SELECT * FROM web.credit_exchanges WHERE status = 'PENDING_GRANT' ORDER BY created_at ASC LIMIT $1;`,
      [limit]
    );
    return res.rows.map(mapExchangeRow);
  }

  async createTopupOrderTransaction({
    loginName,
    packageDef,
    provider,
    idempotencyKey,
    providerOrderId = null,
    checkoutPayload = {},
    ipAddress = null,
  }) {
    return this.withTransaction(async (client) => {
      const existing = await client.query(`SELECT * FROM web.topup_orders WHERE idempotency_key = $1;`, [idempotencyKey]);
      if (existing.rows.length > 0) {
        return { idempotent: true, order: mapOrderRow(existing.rows[0]) };
      }

      const wallet = await this.ensureWalletAccount(loginName, client);
      const orderId = crypto.randomUUID();
      const orderCode = `TU-${orderId.slice(0, 8).toUpperCase()}`;
      const openmuReference = `webtopup:${orderId}`;

      const ins = await client.query(
        `INSERT INTO web.topup_orders
           (id, order_code, login_name, package_id, amount_thb, credits_amount, wcoin_amount, provider, provider_order_id, status, idempotency_key, openmu_reference, checkout_payload)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'PENDING_PAYMENT', $10, $11, $12)
         RETURNING *;`,
        [
          orderId,
          orderCode,
          wallet.loginName,
          packageDef.id,
          packageDef.priceThb,
          packageDef.totalCredits,
          packageDef.totalWcoin,
          provider,
          providerOrderId,
          idempotencyKey,
          openmuReference,
          JSON.stringify(checkoutPayload),
        ]
      );

      await insertAudit(client, {
        actorType: "player",
        actorName: wallet.loginName,
        action: "TOPUP_ORDER_CREATED",
        targetType: "topup_orders",
        targetId: orderId,
        outcome: "SUCCESS",
        ipAddress,
        details: { orderCode, packageId: packageDef.id, amountThb: packageDef.priceThb, provider },
      });

      return { idempotent: false, order: mapOrderRow(ins.rows[0]) };
    });
  }

  async getTopupOrder({ orderId = null, orderCode = null, providerOrderId = null }) {
    let res;
    if (orderId) {
      res = await this.pool.query(`SELECT * FROM web.topup_orders WHERE id = $1;`, [orderId]);
    } else if (orderCode) {
      res = await this.pool.query(`SELECT * FROM web.topup_orders WHERE order_code = $1;`, [orderCode]);
    } else if (providerOrderId) {
      res = await this.pool.query(`SELECT * FROM web.topup_orders WHERE provider_order_id = $1;`, [providerOrderId]);
    } else {
      return null;
    }
    return res.rows[0] ? mapOrderRow(res.rows[0]) : null;
  }

  async listTopupOrders({ loginName = null, status = null, limit = 50 } = {}) {
    const conditions = [];
    const params = [];
    if (loginName) {
      params.push(normalizeLoginName(loginName));
      conditions.push(`login_name = $${params.length}`);
    }
    if (status) {
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }
    params.push(limit);
    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const res = await this.pool.query(
      `SELECT * FROM web.topup_orders ${where} ORDER BY created_at DESC LIMIT $${params.length};`,
      params
    );
    return res.rows.map(mapOrderRow);
  }

  async updateTopupCheckoutPayload(orderId, { providerOrderId = null, checkoutPayload = null }) {
    const res = await this.pool.query(
      `UPDATE web.topup_orders
       SET provider_order_id = COALESCE($2, provider_order_id),
           checkout_payload = COALESCE($3::jsonb, checkout_payload),
           updated_at = NOW()
       WHERE id = $1
       RETURNING *;`,
      [orderId, providerOrderId, checkoutPayload ? JSON.stringify(checkoutPayload) : null]
    );
    return res.rows[0] ? mapOrderRow(res.rows[0]) : null;
  }

  async recordWebhookEventTransaction({ provider, eventId, payloadSha256, signatureValid, rawPayload }) {
    return this.withTransaction(async (client) => {
      const existing = await client.query(
        `SELECT * FROM web.payment_webhook_events WHERE provider = $1 AND event_id = $2 FOR UPDATE;`,
        [provider, eventId]
      );
      if (existing.rows.length > 0) {
        return { duplicate: true, event: mapWebhookEventRow(existing.rows[0]) };
      }

      const id = crypto.randomUUID();
      const status = signatureValid ? "RECEIVED" : "REJECTED";
      const ins = await client.query(
        `INSERT INTO web.payment_webhook_events
           (id, provider, event_id, payload_sha256, signature_valid, processing_status, raw_payload)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *;`,
        [id, provider, eventId, payloadSha256, Boolean(signatureValid), status, JSON.stringify(rawPayload)]
      );
      return { duplicate: false, event: mapWebhookEventRow(ins.rows[0]) };
    });
  }

  async finalizeWebhookEvent(eventId, { processingStatus, orderId = null, errorMessage = null }) {
    await this.pool.query(
      `UPDATE web.payment_webhook_events
       SET processing_status = $2,
           order_id = COALESCE($3, order_id),
           error_message = $4,
           processed_at = NOW()
       WHERE id = $1;`,
      [eventId, processingStatus, orderId, errorMessage]
    );
  }

  async markTopupPaidAndCreditTransaction({
    orderId,
    providerTransactionId = null,
    actorType = "webhook",
    actorName = "payment-provider",
    ipAddress = null,
  }) {
    return this.withTransaction(async (client) => {
      const orderRes = await client.query(`SELECT * FROM web.topup_orders WHERE id = $1 FOR UPDATE;`, [orderId]);
      if (orderRes.rows.length === 0) throw new StoreError(404, "ORDER_NOT_FOUND", "Top-up order not found.");
      const order = orderRes.rows[0];

      if (order.status === "FULFILLED") {
        const walletRes = await client.query(`SELECT * FROM web.wallet_accounts WHERE login_name = $1;`, [order.login_name]);
        return { alreadyFulfilled: true, creditsNewlyGranted: false, order: mapOrderRow(order), wallet: mapWalletRow(walletRes.rows[0]) };
      }
      if (order.status === "CANCELLED" || order.status === "REFUNDED") {
        throw new StoreError(409, "INVALID_ORDER_STATE", `Order is ${order.status} and cannot be paid.`);
      }

      if (providerTransactionId) {
        const dupTx = await client.query(
          `SELECT id FROM web.topup_orders WHERE provider = $1 AND provider_transaction_id = $2 AND id <> $3;`,
          [order.provider, providerTransactionId, order.id]
        );
        if (dupTx.rows.length > 0) {
          throw new StoreError(409, "DUPLICATE_PROVIDER_TX", "Provider transaction ID was already consumed by another order.");
        }
      }

      const wallet = await this.ensureWalletAccount(order.login_name, client);
      let creditLedgerId = order.credit_ledger_id;
      let creditsNewlyGranted = false;

      if (!creditLedgerId && order.credits_amount > 0) {
        creditLedgerId = crypto.randomUUID();
        const newBalance = wallet.creditsBalance + order.credits_amount;
        await client.query(
          `UPDATE web.wallet_accounts
           SET credits_balance = $2,
               lifetime_credits_earned = lifetime_credits_earned + $3,
               total_topup_thb = total_topup_thb + $4,
               updated_at = NOW()
           WHERE login_name = $1;`,
          [wallet.loginName, newBalance, order.credits_amount, order.amount_thb]
        );
        await client.query(
          `INSERT INTO web.wallet_ledger
             (id, login_name, entry_type, delta_credits, balance_after, currency_unit, idempotency_key, reference_type, reference_id, description, metadata_json, created_by)
           VALUES ($1, $2, 'TOPUP_CREDIT', $3, $4, 'CREDITS', $5, 'TOPUP_ORDER', $6, $7, $8, $9);`,
          [
            creditLedgerId,
            wallet.loginName,
            order.credits_amount,
            newBalance,
            `topup-credit:${order.id}`,
            order.id,
            `Top-up ${order.order_code} (${order.package_id}): +${order.credits_amount} Credits`,
            JSON.stringify({ orderCode: order.order_code, provider: order.provider, providerTransactionId, wcoinAmount: order.wcoin_amount }),
            actorName,
          ]
        );
        creditsNewlyGranted = true;
      }

      const updatedOrder = await client.query(
        `UPDATE web.topup_orders
         SET status = CASE WHEN status = 'FULFILLED' THEN 'FULFILLED' ELSE 'FULFILLING' END,
             provider_transaction_id = COALESCE($2, provider_transaction_id),
             credit_ledger_id = COALESCE($3, credit_ledger_id),
             paid_at = COALESCE(paid_at, NOW()),
             failure_reason = NULL,
             updated_at = NOW()
         WHERE id = $1
         RETURNING *;`,
        [order.id, providerTransactionId, creditLedgerId]
      );

      await insertAudit(client, {
        actorType,
        actorName,
        action: "TOPUP_PAID_AND_CREDITED",
        targetType: "topup_orders",
        targetId: order.id,
        outcome: "SUCCESS",
        ipAddress,
        details: { orderCode: order.order_code, providerTransactionId, creditsGranted: creditsNewlyGranted ? order.credits_amount : 0 },
      });

      const updatedWallet = await client.query(`SELECT * FROM web.wallet_accounts WHERE login_name = $1;`, [wallet.loginName]);
      return {
        alreadyFulfilled: false,
        creditsNewlyGranted,
        order: mapOrderRow(updatedOrder.rows[0]),
        wallet: mapWalletRow(updatedWallet.rows[0]),
      };
    });
  }

  async markTopupFulfilledTransaction({ orderId, openmuGrantId = null }) {
    const res = await this.pool.query(
      `UPDATE web.topup_orders
       SET status = 'FULFILLED',
           openmu_grant_id = COALESCE($2, openmu_grant_id),
           fulfilled_at = COALESCE(fulfilled_at, NOW()),
           failure_reason = NULL,
           updated_at = NOW()
       WHERE id = $1
       RETURNING *;`,
      [orderId, openmuGrantId]
    );
    if (res.rows.length === 0) throw new StoreError(404, "ORDER_NOT_FOUND", "Top-up order not found.");
    return mapOrderRow(res.rows[0]);
  }

  async markTopupFailedTransaction({ orderId, reason }) {
    const res = await this.pool.query(
      `UPDATE web.topup_orders
       SET status = CASE WHEN status = 'FULFILLED' THEN 'FULFILLED' WHEN credit_ledger_id IS NOT NULL THEN 'PAID' ELSE 'FAILED' END,
           failure_reason = $2,
           updated_at = NOW()
       WHERE id = $1
       RETURNING *;`,
      [orderId, String(reason || "Fulfillment failed")]
    );
    return res.rows[0] ? mapOrderRow(res.rows[0]) : null;
  }

  async adminAdjustWalletTransaction({ loginName, amount, reason, adminLogin, idempotencyKey, ipAddress = null }) {
    if (!Number.isInteger(amount) || amount === 0) {
      throw new StoreError(400, "INVALID_AMOUNT", "Adjustment amount must be a non-zero integer.");
    }
    return this.withTransaction(async (client) => {
      const existing = await client.query(`SELECT * FROM web.wallet_ledger WHERE idempotency_key = $1;`, [idempotencyKey]);
      if (existing.rows.length > 0) {
        const walletRes = await client.query(`SELECT * FROM web.wallet_accounts WHERE login_name = $1;`, [existing.rows[0].login_name]);
        return { idempotent: true, ledgerEntry: mapLedgerRow(existing.rows[0]), wallet: mapWalletRow(walletRes.rows[0]) };
      }

      const wallet = await this.ensureWalletAccount(loginName, client);
      const newBalance = wallet.creditsBalance + amount;
      if (newBalance < 0) {
        throw new StoreError(400, "INSUFFICIENT_CREDITS", `Cannot deduct ${Math.abs(amount)} Credits; balance is ${wallet.creditsBalance}.`);
      }

      const entryType = amount > 0 ? "ADMIN_CREDIT" : "ADMIN_DEBIT";
      const ledgerId = crypto.randomUUID();

      await client.query(
        `UPDATE web.wallet_accounts
         SET credits_balance = $2,
             lifetime_credits_earned = lifetime_credits_earned + $3,
             lifetime_credits_spent = lifetime_credits_spent + $4,
             updated_at = NOW()
         WHERE login_name = $1;`,
        [wallet.loginName, newBalance, amount > 0 ? amount : 0, amount < 0 ? Math.abs(amount) : 0]
      );

      const ins = await client.query(
        `INSERT INTO web.wallet_ledger
           (id, login_name, entry_type, delta_credits, balance_after, currency_unit, idempotency_key, reference_type, reference_id, description, metadata_json, created_by)
         VALUES ($1, $2, $3, $4, $5, 'CREDITS', $6, 'ADMIN_ADJUST', $1, $7, $8, $9)
         RETURNING *;`,
        [
          ledgerId,
          wallet.loginName,
          entryType,
          amount,
          newBalance,
          idempotencyKey,
          `Admin ${adminLogin}: ${reason}`,
          JSON.stringify({ reason }),
          adminLogin,
        ]
      );

      await insertAudit(client, {
        actorType: "admin",
        actorName: adminLogin,
        action: "ADMIN_WALLET_ADJUST",
        targetType: "wallet_accounts",
        targetId: wallet.loginName,
        outcome: "SUCCESS",
        ipAddress,
        details: { amount, balanceAfter: newBalance, reason },
      });

      const updatedWallet = await client.query(`SELECT * FROM web.wallet_accounts WHERE login_name = $1;`, [wallet.loginName]);
      return { idempotent: false, ledgerEntry: mapLedgerRow(ins.rows[0]), wallet: mapWalletRow(updatedWallet.rows[0]) };
    });
  }

  async createSession({ tokenHash, principalType, loginName, roles = [], ipAddress = null, userAgent = null, expiresAt }) {
    await this.pool.query(
      `INSERT INTO web.web_sessions (session_token_hash, principal_type, login_name, roles, ip_address, user_agent, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7);`,
      [tokenHash, principalType, loginName, JSON.stringify(roles), ipAddress, userAgent, expiresAt]
    );
  }

  async getSession(tokenHash) {
    const res = await this.pool.query(
      `SELECT * FROM web.web_sessions
       WHERE session_token_hash = $1 AND revoked_at IS NULL AND expires_at > NOW();`,
      [tokenHash]
    );
    if (res.rows.length === 0) return null;
    await this.pool.query(`UPDATE web.web_sessions SET last_seen_at = NOW() WHERE session_token_hash = $1;`, [tokenHash]);
    const row = res.rows[0];
    return {
      principalType: row.principal_type,
      loginName: row.login_name,
      roles: Array.isArray(row.roles) ? row.roles : [],
      expiresAt: row.expires_at,
    };
  }

  async revokeSession(tokenHash) {
    await this.pool.query(
      `UPDATE web.web_sessions SET revoked_at = NOW() WHERE session_token_hash = $1 AND revoked_at IS NULL;`,
      [tokenHash]
    );
  }

  async recordAuditLog(entry) {
    await insertAudit(this.pool, entry);
  }

  async listAuditLogs({ limit = 100, actorName = null, action = null } = {}) {
    const conditions = [];
    const params = [];
    if (actorName) {
      params.push(actorName);
      conditions.push(`actor_name = $${params.length}`);
    }
    if (action) {
      params.push(action);
      conditions.push(`action = $${params.length}`);
    }
    params.push(limit);
    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const res = await this.pool.query(
      `SELECT * FROM web.web_audit_logs ${where} ORDER BY created_at DESC LIMIT $${params.length};`,
      params
    );
    return res.rows.map(mapAuditRow);
  }
}

async function insertAudit(runner, { actorType, actorName, action, targetType = null, targetId = null, outcome = "SUCCESS", ipAddress = null, details = {} }) {
  await runner.query(
    `INSERT INTO web.web_audit_logs (id, actor_type, actor_name, action, target_type, target_id, outcome, ip_address, details)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);`,
    [crypto.randomUUID(), actorType, actorName, action, targetType, targetId, outcome, ipAddress, JSON.stringify(details ?? {})]
  );
}

function mapWalletRow(row) {
  return {
    loginName: row.login_name,
    creditsBalance: Number(row.credits_balance),
    lifetimeCreditsEarned: Number(row.lifetime_credits_earned),
    lifetimeCreditsSpent: Number(row.lifetime_credits_spent),
    redeemedOnlineSeconds: Number(row.redeemed_online_seconds),
    totalTopupThb: Number(row.total_topup_thb),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapLedgerRow(row) {
  return {
    id: row.id,
    loginName: row.login_name,
    entryType: row.entry_type,
    deltaCredits: Number(row.delta_credits),
    balanceAfter: Number(row.balance_after),
    currencyUnit: row.currency_unit,
    idempotencyKey: row.idempotency_key,
    referenceType: row.reference_type,
    referenceId: row.reference_id,
    description: row.description,
    metadata: row.metadata_json ?? {},
    createdBy: row.created_by,
    createdAt: row.created_at,
  };
}

function mapRedemptionRow(row) {
  return {
    id: row.id,
    loginName: row.login_name,
    idempotencyKey: row.idempotency_key,
    authoritativeOnlineSeconds: Number(row.authoritative_online_seconds),
    redeemedBeforeSeconds: Number(row.redeemed_before_seconds),
    redeemedAfterSeconds: Number(row.redeemed_after_seconds),
    hoursRedeemed: Number(row.hours_redeemed),
    creditsPerHour: Number(row.credits_per_hour),
    creditsGranted: Number(row.credits_granted),
    ledgerEntryId: row.ledger_entry_id,
    createdAt: row.created_at,
  };
}

function mapExchangeRow(row) {
  return {
    id: row.id,
    loginName: row.login_name,
    idempotencyKey: row.idempotency_key,
    openmuReference: row.openmu_reference,
    creditsSpent: Number(row.credits_spent),
    wcoinAmount: Number(row.wcoin_amount),
    coinType: row.coin_type,
    status: row.status,
    debitLedgerId: row.debit_ledger_id,
    reversalLedgerId: row.reversal_ledger_id,
    openmuGrantId: row.openmu_grant_id,
    openmuAppliedAt: row.openmu_applied_at,
    retryCount: Number(row.retry_count),
    lastError: row.last_error,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapOrderRow(row) {
  return {
    id: row.id,
    orderCode: row.order_code,
    loginName: row.login_name,
    packageId: row.package_id,
    amountThb: Number(row.amount_thb),
    creditsAmount: Number(row.credits_amount),
    wcoinAmount: Number(row.wcoin_amount),
    provider: row.provider,
    providerOrderId: row.provider_order_id,
    providerTransactionId: row.provider_transaction_id,
    status: row.status,
    idempotencyKey: row.idempotency_key,
    openmuReference: row.openmu_reference,
    creditLedgerId: row.credit_ledger_id,
    openmuGrantId: row.openmu_grant_id,
    checkoutPayload: row.checkout_payload ?? {},
    failureReason: row.failure_reason,
    paidAt: row.paid_at,
    fulfilledAt: row.fulfilled_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapWebhookEventRow(row) {
  return {
    id: row.id,
    provider: row.provider,
    eventId: row.event_id,
    payloadSha256: row.payload_sha256,
    signatureValid: Boolean(row.signature_valid),
    processingStatus: row.processing_status,
    orderId: row.order_id,
    rawPayload: row.raw_payload,
    errorMessage: row.error_message,
    receivedAt: row.received_at,
    processedAt: row.processed_at,
  };
}

function mapAuditRow(row) {
  return {
    id: row.id,
    actorType: row.actor_type,
    actorName: row.actor_name,
    action: row.action,
    targetType: row.target_type,
    targetId: row.target_id,
    outcome: row.outcome,
    ipAddress: row.ip_address,
    details: row.details ?? {},
    createdAt: row.created_at,
  };
}
