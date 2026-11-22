-- Credit-funded VIP purchases with idempotent OpenMU delivery and compensation.

ALTER TABLE web.wallet_ledger DROP CONSTRAINT IF EXISTS wallet_ledger_entry_type_check;
ALTER TABLE web.wallet_ledger ADD CONSTRAINT wallet_ledger_entry_type_check CHECK (
  entry_type IN (
    'ONLINE_REWARD', 'CREDIT_EXCHANGE_DEBIT', 'CREDIT_EXCHANGE_REVERSAL',
    'VIP_PURCHASE_DEBIT', 'VIP_PURCHASE_REVERSAL',
    'TOPUP_CREDIT', 'ADMIN_CREDIT', 'ADMIN_DEBIT', 'INITIAL_SEED'
  )
);

CREATE TABLE IF NOT EXISTS web.vip_purchases (
  id UUID PRIMARY KEY,
  login_name TEXT NOT NULL REFERENCES web.wallet_accounts (login_name) ON DELETE CASCADE,
  idempotency_key TEXT NOT NULL UNIQUE,
  openmu_reference TEXT NOT NULL UNIQUE,
  credits_spent INTEGER NOT NULL CHECK (credits_spent > 0),
  duration_days INTEGER NOT NULL CHECK (duration_days > 0 AND duration_days % 30 = 0),
  status TEXT NOT NULL CHECK (status IN ('PENDING_GRANT', 'COMPLETED', 'REVERSED')),
  debit_ledger_id UUID NOT NULL REFERENCES web.wallet_ledger (id),
  reversal_ledger_id UUID NULL REFERENCES web.wallet_ledger (id),
  openmu_grant_id UUID NULL,
  vip_until TIMESTAMPTZ NULL,
  retry_count INTEGER NOT NULL DEFAULT 0,
  last_error TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_vip_purchases_login_created
  ON web.vip_purchases (login_name, created_at DESC);

CREATE INDEX IF NOT EXISTS ix_vip_purchases_pending
  ON web.vip_purchases (status, updated_at)
  WHERE status = 'PENDING_GRANT';
