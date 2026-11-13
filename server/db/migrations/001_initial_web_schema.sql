-- 001_initial_web_schema.sql
-- Integrated Web Portal schema (isolated under `web` schema; OpenMU entities live in `data`/`config`/`admin`).

CREATE SCHEMA IF NOT EXISTS web;

CREATE TABLE IF NOT EXISTS web.schema_migrations (
  version TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS web.wallet_accounts (
  login_name TEXT PRIMARY KEY,
  credits_balance INTEGER NOT NULL DEFAULT 0 CHECK (credits_balance >= 0),
  lifetime_credits_earned INTEGER NOT NULL DEFAULT 0 CHECK (lifetime_credits_earned >= 0),
  lifetime_credits_spent INTEGER NOT NULL DEFAULT 0 CHECK (lifetime_credits_spent >= 0),
  redeemed_online_seconds BIGINT NOT NULL DEFAULT 0 CHECK (redeemed_online_seconds >= 0),
  total_topup_thb NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (total_topup_thb >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS web.wallet_ledger (
  id UUID PRIMARY KEY,
  login_name TEXT NOT NULL REFERENCES web.wallet_accounts (login_name) ON DELETE CASCADE,
  entry_type TEXT NOT NULL CHECK (
    entry_type IN (
      'ONLINE_REWARD',
      'CREDIT_EXCHANGE_DEBIT',
      'CREDIT_EXCHANGE_REVERSAL',
      'TOPUP_CREDIT',
      'ADMIN_CREDIT',
      'ADMIN_DEBIT',
      'INITIAL_SEED'
    )
  ),
  delta_credits INTEGER NOT NULL CHECK (delta_credits <> 0),
  balance_after INTEGER NOT NULL CHECK (balance_after >= 0),
  currency_unit TEXT NOT NULL DEFAULT 'CREDITS',
  idempotency_key TEXT NOT NULL UNIQUE,
  reference_type TEXT NOT NULL,
  reference_id TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_wallet_ledger_login_created
  ON web.wallet_ledger (login_name, created_at DESC);

CREATE TABLE IF NOT EXISTS web.online_time_redemptions (
  id UUID PRIMARY KEY,
  login_name TEXT NOT NULL REFERENCES web.wallet_accounts (login_name) ON DELETE CASCADE,
  idempotency_key TEXT NOT NULL UNIQUE,
  authoritative_online_seconds BIGINT NOT NULL CHECK (authoritative_online_seconds >= 0),
  redeemed_before_seconds BIGINT NOT NULL CHECK (redeemed_before_seconds >= 0),
  redeemed_after_seconds BIGINT NOT NULL CHECK (redeemed_after_seconds >= redeemed_before_seconds),
  hours_redeemed INTEGER NOT NULL CHECK (hours_redeemed > 0),
  credits_per_hour INTEGER NOT NULL CHECK (credits_per_hour > 0),
  credits_granted INTEGER NOT NULL CHECK (credits_granted > 0),
  ledger_entry_id UUID NOT NULL REFERENCES web.wallet_ledger (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_online_redemptions_login_created
  ON web.online_time_redemptions (login_name, created_at DESC);

CREATE TABLE IF NOT EXISTS web.credit_exchanges (
  id UUID PRIMARY KEY,
  login_name TEXT NOT NULL REFERENCES web.wallet_accounts (login_name) ON DELETE CASCADE,
  idempotency_key TEXT NOT NULL UNIQUE,
  openmu_reference TEXT NOT NULL UNIQUE,
  credits_spent INTEGER NOT NULL CHECK (credits_spent > 0),
  wcoin_amount INTEGER NOT NULL CHECK (wcoin_amount > 0),
  coin_type TEXT NOT NULL DEFAULT 'WCoinC' CHECK (coin_type IN ('WCoinC', 'WCoinP', 'GoblinPoints')),
  status TEXT NOT NULL CHECK (status IN ('PENDING_GRANT', 'COMPLETED', 'REVERSED')),
  debit_ledger_id UUID NOT NULL REFERENCES web.wallet_ledger (id),
  reversal_ledger_id UUID NULL REFERENCES web.wallet_ledger (id),
  openmu_grant_id UUID NULL,
  openmu_applied_at TIMESTAMPTZ NULL,
  retry_count INTEGER NOT NULL DEFAULT 0,
  last_error TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_credit_exchanges_login_created
  ON web.credit_exchanges (login_name, created_at DESC);

CREATE INDEX IF NOT EXISTS ix_credit_exchanges_pending
  ON web.credit_exchanges (status, updated_at)
  WHERE status = 'PENDING_GRANT';

CREATE TABLE IF NOT EXISTS web.topup_orders (
  id UUID PRIMARY KEY,
  order_code TEXT NOT NULL UNIQUE,
  login_name TEXT NOT NULL REFERENCES web.wallet_accounts (login_name) ON DELETE CASCADE,
  package_id TEXT NOT NULL,
  amount_thb NUMERIC(12, 2) NOT NULL CHECK (amount_thb > 0),
  credits_amount INTEGER NOT NULL CHECK (credits_amount >= 0),
  wcoin_amount INTEGER NOT NULL CHECK (wcoin_amount >= 0),
  provider TEXT NOT NULL CHECK (provider IN ('promptpay_manual', 'paypal', 'webhook_hmac', 'dev_sandbox')),
  provider_order_id TEXT NULL,
  provider_transaction_id TEXT NULL,
  status TEXT NOT NULL CHECK (
    status IN (
      'CREATED',
      'PENDING_PAYMENT',
      'PAID',
      'FULFILLING',
      'FULFILLED',
      'FAILED',
      'CANCELLED',
      'REFUNDED'
    )
  ),
  idempotency_key TEXT NOT NULL UNIQUE,
  openmu_reference TEXT NOT NULL UNIQUE,
  credit_ledger_id UUID NULL REFERENCES web.wallet_ledger (id),
  openmu_grant_id UUID NULL,
  checkout_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  failure_reason TEXT NULL,
  paid_at TIMESTAMPTZ NULL,
  fulfilled_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_topup_orders_provider_tx
  ON web.topup_orders (provider, provider_transaction_id)
  WHERE provider_transaction_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS ix_topup_orders_login_created
  ON web.topup_orders (login_name, created_at DESC);

CREATE TABLE IF NOT EXISTS web.payment_webhook_events (
  id UUID PRIMARY KEY,
  provider TEXT NOT NULL,
  event_id TEXT NOT NULL,
  payload_sha256 TEXT NOT NULL,
  signature_valid BOOLEAN NOT NULL,
  processing_status TEXT NOT NULL CHECK (
    processing_status IN ('RECEIVED', 'PROCESSED', 'DUPLICATE', 'REJECTED', 'FAILED')
  ),
  order_id UUID NULL REFERENCES web.topup_orders (id) ON DELETE SET NULL,
  raw_payload JSONB NOT NULL,
  error_message TEXT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ NULL,
  CONSTRAINT ux_webhook_provider_event UNIQUE (provider, event_id)
);

CREATE TABLE IF NOT EXISTS web.web_sessions (
  session_token_hash TEXT PRIMARY KEY,
  principal_type TEXT NOT NULL CHECK (principal_type IN ('player', 'admin')),
  login_name TEXT NOT NULL,
  roles JSONB NOT NULL DEFAULT '[]'::jsonb,
  ip_address TEXT NULL,
  user_agent TEXT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_web_sessions_expires
  ON web.web_sessions (expires_at)
  WHERE revoked_at IS NULL;

CREATE TABLE IF NOT EXISTS web.web_audit_logs (
  id UUID PRIMARY KEY,
  actor_type TEXT NOT NULL CHECK (actor_type IN ('player', 'admin', 'system', 'webhook')),
  actor_name TEXT NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT NULL,
  target_id TEXT NULL,
  outcome TEXT NOT NULL CHECK (outcome IN ('SUCCESS', 'FAILURE', 'REJECTED')),
  ip_address TEXT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_web_audit_logs_created
  ON web.web_audit_logs (created_at DESC);

