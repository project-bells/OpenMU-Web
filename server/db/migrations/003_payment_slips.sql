ALTER TABLE web.topup_orders
  ADD COLUMN IF NOT EXISTS slip_storage_name TEXT NULL,
  ADD COLUMN IF NOT EXISTS slip_content_type TEXT NULL,
  ADD COLUMN IF NOT EXISTS slip_sha256 TEXT NULL,
  ADD COLUMN IF NOT EXISTS slip_original_name TEXT NULL,
  ADD COLUMN IF NOT EXISTS slip_submitted_at TIMESTAMPTZ NULL;

CREATE UNIQUE INDEX IF NOT EXISTS ux_topup_orders_slip_sha256
  ON web.topup_orders (slip_sha256)
  WHERE slip_sha256 IS NOT NULL;
