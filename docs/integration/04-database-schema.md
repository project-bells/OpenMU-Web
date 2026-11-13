# 04 — การออกแบบ PostgreSQL Schema (`web` schema)

เอกสารนี้อธิบายโครงสร้างฐานข้อมูลของเว็บไซต์ภายใต้ Schema `web` ซึ่งแยกอิสระจาก Schema `data`, `config`, และ `admin` ของ OpenMU-Origins

## 1. การทำงานของ Migration
- ไฟล์ Migration: [`001_initial_web_schema.sql`](file:///C:/OpenMU/OpenMU-Web/server/db/migrations/001_initial_web_schema.sql)
- ตัวรันอัตโนมัติ: [`migrate.mjs`](file:///C:/OpenMU/OpenMU-Web/server/db/migrate.mjs) ฟังก์ชัน `runMigrations(pool)` ซึ่งสร้างตาราง `web.schema_migrations` และรัน `.sql` ที่ยังไม่เคยถูกรันภายใน `BEGIN ... COMMIT`
- ตัวจัดการหลัก: [`postgresStore.mjs`](file:///C:/OpenMU/OpenMU-Web/server/db/postgresStore.mjs) (`PostgresStore`) และตัวจำลองเทียบเท่าสำหรับการทดสอบ Unit/BFF (`ALLOW_INMEMORY_WEB_STORE=true` เฉพาะ non-production) คือ [`inMemoryStore.mjs`](file:///C:/OpenMU/OpenMU-Web/server/db/inMemoryStore.mjs)

## 2. ตารางทั้งหมดภายใต้ Schema `web`

| ตาราง | Primary Key | หน้าที่หลัก | Constraints สำคัญ |
|---|---|---|---|
| `web.schema_migrations` | `version TEXT` | เก็บประวัติการรัน SQL migration | `PRIMARY KEY (version)` |
| `web.wallet_accounts` | `login_name TEXT` | กระเป๋า Credits ของผู้เล่น และ checkpoint เวลาออนไลน์ที่แลกแล้ว | `CHECK (credits_balance >= 0)`, `CHECK (redeemed_online_seconds >= 0)`, `CHECK (total_topup_thb >= 0)` |
| `web.wallet_ledger` | `id UUID` | สมุดบัญชี Immutable ledger บันทึกทุกความเคลื่อนไหวของ Credits | `UNIQUE (idempotency_key)`, `CHECK (delta_credits <> 0)`, `CHECK (balance_after >= 0)` |
| `web.online_time_redemptions` | `id UUID` | ประวัติการเคลมรางวัลชั่วโมงออนไลน์ (P0-A) | `UNIQUE (idempotency_key)`, `CHECK (hours_redeemed > 0)`, `CHECK (redeemed_after_seconds >= redeemed_before_seconds)` |
| `web.credit_exchanges` | `id UUID` | ตาราง Outbox / Two-phase exchange `Credits -> WCoinC` (P0-B) | `UNIQUE (idempotency_key)`, `UNIQUE (openmu_reference)`, status IN `('PENDING_GRANT','COMPLETED','REVERSED')` |
| `web.topup_orders` | `id UUID` | คำสั่งซื้อเติมเงินและสถานะการชำระ/มอบยอด (P0-C) | `UNIQUE (order_code)`, `UNIQUE (idempotency_key)`, `UNIQUE (openmu_reference)`, Partial Unique `(provider, provider_transaction_id)`, `CHECK (amount_thb > 0)` |
| `web.payment_webhook_events` | `id UUID` | บันทึก Webhook event ที่ผ่านตรวจลายเซ็น เพื่อกัน Replay ซ้ำ | `CONSTRAINT ux_webhook_provider_event UNIQUE (provider, event_id)` |
| `web.web_sessions` | `session_token_hash TEXT` | เก็บ Session ของ Player และ Admin (เก็บเฉพาะ SHA-256 hash) | `principal_type IN ('player', 'admin')` |
| `web.web_audit_logs` | `id UUID` | บันทึก Audit Trail ทุกการกระทำสำคัญ (Login, Register, Exchange, Payment, Admin) | `actor_type IN ('player','admin','system','webhook')`, `outcome IN ('SUCCESS','FAILURE','REJECTED')` |

## 3. เหตุผลด้าน Transactional Integrity
1. **การล็อกแถวด้วย `FOR UPDATE`**: ทั้งการเคลมเวลาออนไลน์, การหักเครดิตเพื่อแลก WCoinC, และการปรับยอดโดย GM จะล็อกแถวใน `web.wallet_accounts` ภายใน Transaction เดียวกัน ทำให้คำขอพร้อมกันแบบ Concurrent ไม่สามารถใช้ยอดซ้ำหรือติดลบได้ (`CHECK (credits_balance >= 0)` เป็นปราการด่านสุดท้ายใน DB)
2. **Idempotency ระดับฐานข้อมูล**: คอลัมน์ `idempotency_key UNIQUE` ใน `wallet_ledger`, `online_time_redemptions`, `credit_exchanges`, และ `topup_orders` รับประกันว่าคำขอที่ Retry ซ้ำด้วย Key เดิมจะไม่ให้รางวัลหรือหักเงินซ้ำ
3. **การเชื่อมต่ออ้างอิงกับ OpenMU**: คอลัมน์ `openmu_reference` รูปแบบ `webex:<exchangeId>` และ `webtopup:<orderId>` ส่งไปที่ OpenMU `CashShopController` เพื่อทำ Idempotent grant ทั้งสองฝั่ง

