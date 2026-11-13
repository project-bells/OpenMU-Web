# 02 - System Architecture & Integration Design

## 1. หลักการออกแบบสถาปัตยกรรม (Core Architectural Principles)

การเชื่อม `OpenMU-Web` เข้ากับ `OpenMU-Origins` ต้องยึดขอบเขตความเป็นเจ้าของข้อมูล (Single Source of Truth) เพื่อป้องกัน Race Condition กับ Memory State ของ Game Server และป้องกันการเสกเงิน/ทำซ้ำ (Double-Spend):

1. **Browser คุยกับ `OpenMU-Web` Node Backend (BFF) เท่านั้น**
   - ห้าม Browser เชื่อมต่อ PostgreSQL หรือรู้ `OPENMU_API_KEY` เด็ดขาด
   - Authentication ใช้ **Signed / Opaque HttpOnly Session Cookie** + CSRF protection (`Origin`/`Referer` check และ `SameSite=Lax`/`Strict`) แทนการส่ง `username` / `adminUser` ใน JSON body
2. **`OpenMU-Origins` เป็น Authoritative Owner ของข้อมูลเกมทั้งหมด (`data.*` & `admin.*`)**
   - `Account` (Authentication, State, PasswordHash, `OnlineTimeSeconds`, `WCoinC`, `WCoinP`, `GoblinPoints`, `Vault`) และ `Character` ถูกควบคุมผ่าน `OpenMU-Origins` AdminPanel HTTP API (`X-Api-Key`) เท่านั้น
   - การแก้ไขออฟไลน์ (Password reset, Character Reset, Stat Reset, Add Stats, PK Clear) ต้องจองสิทธิ์ผ่าน `ILoginServer.TryReserveAccountAsync` และบันทึกอย่างมีลำดับภายใน `OpenMU-Origins` เพื่อไม่ให้ชนกับการล็อกอินเข้าเกม
   - การเติม `WCoinC` เข้าตัวเกม **ห้าม** `UPDATE data."Account"` ตรงๆ — ต้องสร้าง `CashShopCoinGrant` ผ่าน `POST /api/accounts/{loginName}/cash-shop/grants` พร้อม `Reference` ที่ไม่ซ้ำ เพื่อให้ Game Server นำไปบวกเข้า balance ของผู้เล่นอย่างปลอดภัย (idempotent) ทั้งตอนออนไลน์และออฟไลน์
3. **PostgreSQL `web.*` Schema ฝั่ง `OpenMU-Web` BFF เป็น Authoritative Owner ของ Web Economy & Payment**
   - แยก schema `web` ใน PostgreSQL (`DATABASE_URL`) สำหรับ:
     - `web.wallet_accounts`: `credits_balance`, `redeemed_online_seconds` (Checkpoint!), `updated_at`
     - `web.wallet_ledger`: บัญชีแยกประเภทแบบ append-only (ห้ามแก้/ลบย้อนหลัง)
     - `web.online_time_redemptions`: บันทึกการแลกเวลาออนไลน์เป็น Credits พร้อม idempotency key
     - `web.credit_exchanges`: บันทึกการแลก Credits -> WCoinC + สถานะ Outbox (`PENDING_GRANT`, `COMPLETED`, `FAILED_REFUNDED`)
     - `web.topup_orders`: Order State Machine สำหรับการเติมเงิน (`CREATED`, `PENDING_PROVIDER`, `PAID_VERIFIED`, `FULFILLED`, `FAILED`, `CANCELLED`, `EXPIRED`, `REFUNDED`)
     - `web.payment_webhook_events`: เก็บ event ID + signature check log เพื่อกัน replay/duplicate webhook
     - `web.web_sessions`: Session ของ Player และ Admin/GM พร้อมบทบาท (role), expiry, IP/UA
     - `web.web_audit_logs`: บันทึกกิจกรรมสำคัญทั้งหมด (Login ล้มเหลว, Admin Grant, Ban/Unban, Character Self-Service, Webhook errors)

---

## 2. การไหลของข้อมูลหลัก (Logical Data Flows)

```text
Browser (React SPA)
   │  HttpOnly Session Cookie + HTTPS/Same-Origin Fetch
   ▼
OpenMU-Web BFF (server/app.mjs)
   ├──► PostgreSQL Schema [web.*]  (ACID Transactions, SELECT ... FOR UPDATE, UNIQUE Idempotency)
   │      • wallet_accounts, wallet_ledger, online_time_redemptions
   │      • credit_exchanges, topup_orders, payment_webhook_events
   │      • web_sessions, web_audit_logs
   │
   └──► OpenMU-Origins AdminPanel API (X-Api-Key Server-to-Server)
          • POST /api/accounts                         (Register)
          • POST /api/accounts/authenticate            (Verify User Password + State)
          • POST /api/admin/authenticate               (Verify AdminPanel Operator/Administrator User)
          • GET  /api/accounts?text=...                (Admin User Search)
          • GET  /api/accounts/{loginName}             (Account + Characters + OnlineTimeSeconds + PendingWCoin)
          • PUT  /api/accounts/{loginName}/password    (Self-service verified / Admin password reset)
          • PUT  /api/accounts/{loginName}/state       (Ban / Unban Offline)
          • POST /api/players/{loginName}/disconnect   (Force Disconnect Live Session)
          • POST /api/accounts/{loginName}/characters/{name}/{reset|pk-clear|add-stats|reset-stats}
          • GET  /api/accounts/{loginName}/cash-shop   (WCoinC/WCoinP/GoblinPoints + Pending)
          • POST /api/accounts/{loginName}/cash-shop/grants (Idempotent CashShopCoinGrant)
          • GET  /api/status, /api/rankings/characters, /api/rankings/guilds
```

---

## 3. การออกแบบ 3 ฟีเจอร์หลัก (P0-A, P0-B, P0-C)

### P0-A: Online-Time Rewards (เวลาออนไลน์ -> Credits)
- **ปัญหาเดิม**: ไม่มีระบบนับ/ตัดยอดเวลาออนไลน์ที่ปลอดภัย; ถ้าไปลด `Account.OnlineTimeSeconds` จากภายนอกจะ race กับ Game Server ที่เขียนทับค่านี้ตลอดเวลา
- **วิธีแก้แบบ Checkpoint Invariant**:
  1. `OpenMU-Origins` คงความเป็นเจ้าของ `Account.OnlineTimeSeconds` แบบบวกสะสมอย่างเดียว (Monotonic) และเปิดเผยค่านี้ใน `GET /api/accounts/{loginName}` (รวมทั้ง flush/accrue ที่ `PlayerPersistence` และตอน disconnect)
  2. `OpenMU-Web` เก็บ `redeemed_online_seconds` (วินาทีที่แลกไปแล้ว) ไว้ใน `web.wallet_accounts`
  3. คำนวณเวลาที่แลกได้: `available_seconds = max(0, authoritative_online_seconds - wallet.redeemed_online_seconds)`
  4. อัตราแลกเปลี่ยน: **1 ชั่วโมง (3,600 วินาที) = 5 Credits** (`available_hours = floor(available_seconds / 3600)`)
  5. เมื่อผู้เล่นกดแลก `hours`:
     - ทำใน DB Transaction (`SELECT ... FOR UPDATE` บน `web.wallet_accounts`)
     - ตรวจ `Idempotency-Key` จาก `web.online_time_redemptions`
     - ตรวจ `hours > 0` และ `authoritative_online_seconds - wallet.redeemed_online_seconds >= hours * 3600`
     - อัปเดต `redeemed_online_seconds += hours * 3600`, `credits_balance += hours * 5` และบันทึก `web.wallet_ledger` (`ONLINE_TIME_REDEEM`)

### P0-B: Credit Exchange (Credits -> WCoinC)
- **อัตราแลกเปลี่ยน**: **100 Credits = 50 WCoinC** (ขั้นต่ำ 100 Credits และต้องเป็นพหุคูณของ 100 หรือปรับได้จาก Server Config โดยห้ามเชื่อยอดจาก Client)
- **รูปแบบ Two-Phase Outbox + Compensation เพื่อความถูกต้องทางการเงิน**:
  1. **Phase 1 (DB Transaction)**: ล็อกแถว `web.wallet_accounts` (`FOR UPDATE`), ตรวจ idempotency key, ตรวจ `credits_balance >= credits`, หัก `credits_balance -= credits`, บันทึก `web.credit_exchanges` (`status = 'PENDING_GRANT'`, `cash_shop_reference = 'webex:<uuid>'`) และ `web.wallet_ledger` (`CREDIT_EXCHANGE_DEBIT`).
  2. **Phase 2 (Upstream Call)**: เรียก `OpenMU-Origins`: `POST /api/accounts/{loginName}/cash-shop/grants` ด้วย `CoinType = WCoinC`, `Amount = wcoin`, `Reference = 'webex:<uuid>'`.
     - หากได้ `201 Created` หรือ `200 OK (AlreadyGranted)` -> อัปเดต `web.credit_exchanges` เป็น `COMPLETED`
     - หากได้ `400 / 404 / 409` (ปฏิเสธถาวร) -> ทำ Transaction คืนเงิน (`credits_balance += credits`), ลง ledger `CREDIT_EXCHANGE_REVERSAL`, อัปเดตสถานะเป็น `FAILED_REFUNDED`
     - หาก Upstream timeout / 5xx -> คงสถานะ `PENDING_GRANT` เพื่อให้ retry worker หรือ retry endpoint ยิงซ้ำด้วย `Reference` เดิมอย่างปลอดภัย (Idempotent 100%)
- **การแสดงผลยอด WCoinC**: แสดงทั้ง `savedWcoin` (ในเกมที่บันทึกแล้ว) + `pendingWcoin` (รอ Game Server apply ตอน login / เปิด Cash Shop) เพื่อให้ผู้เล่นเห็นยอดรวมที่ถูกต้องทันทีหลังแลก

### P0-C: Credit Top-Up & Payment Processing
- **Authoritative Catalog**: แพ็คเกจราคาและรางวัล (`tier-50` .. `tier-1000`) กำหนดบน Server Backend เท่านั้น ห้าม Client ส่งจำนวนเงินหรือจำนวนรางวัล
- **Order Lifecycle & State Machine**:
  `CREATED` -> `PENDING_PROVIDER` -> `PAID_VERIFIED` -> `FULFILLED` (หรือ `FAILED`, `CANCELLED`, `EXPIRED`, `REFUNDED`)
- **Provider Abstraction**:
  - `PayPal`: สร้าง Order ผ่าน PayPal Orders v2 และ Verify/Capture ฝั่ง Server ก่อน Fulfill (ตรวจยอดเงิน, สกุลเงิน, `custom_id` / `orderId`)
  - `PromptPay / Credit Card / TrueMoney Gateway`: Adapter รองรับ Checkout creation + Signed Webhook (`HMAC-SHA256` + timestamp tolerance + `web.payment_webhook_events` deduplication)
  - `Test / Sandbox Adapter`: เปิดใช้ได้เฉพาะเมื่อตั้งค่า explicit `PAYMENT_SANDBOX_ENABLED=true` และมี token ลับหรือ webhook test signature — ห้ามเปิดใน Production โดยปริยาย และต้องติดป้าย `SANDBOX` ชัดเจน
- **Fulfillment Idempotent**:
  - เมื่อ Payment ผ่านสถานะ `PAID_VERIFIED` เท่านั้นจึงทำการ Fulfill:
    1. Transaction ใน PostgreSQL: เปลี่ยนสถานะเป็น `FULFILLING` / `PAID_VERIFIED` -> เพิ่ม `credits_balance` + บันทึก `TOPUP_CREDITS` ledger (ป้องกันจ่ายซ้ำด้วย unique constraint บน `order_id` และ `provider_tx_id`)
    2. เรียก `CashShopController.GrantAsync` (`Reference = 'topup:<order_id>'`) เพื่อเพิ่ม `WCoinC` เข้าเกมแบบ idempotent
    3. อัปเดตคำสั่งซื้อเป็น `FULFILLED` (หาก Grant ขั้นตอน 2 ชั่วคราวล่ม เก็บสถานะรอ retry โดยไม่บวก Credits ซ้ำ!)

---

## 4. ความปลอดภัยและการควบคุมการเข้าถึง

1. **Auth Boundaries**:
   - **Player Session**: ตรวจรหัสผ่านผ่าน OpenMU (`POST /api/accounts/authenticate` ใช้ BCrypt), ตรวจ `AccountState` (`Banned`/`TemporarilyBanned` เข้าไม่ได้), ออก HttpOnly Cookie (`openmu_session`), มี login rate limit + audit log
   - **Admin Session**: ห้ามใช้ `admin/admin1234` hardcode ใน frontend และห้ามมีปุ่ม `quickAdminLogin()` bypass! Admin Login ต้องเรียก Backend `/api/admin/login` ซึ่งตรวจสอบกับ `OpenMU-Origins` AdminUser (`IAdminUserRepository`) หรือ Admin API auth พร้อมตรวจ role (`Operator`/`Administrator`) และออก HttpOnly Admin Session Cookie แยก (`openmu_admin_session`)
2. **Offline Safety & Concurrency Lock**:
   - Character actions (`reset`, `pk-clear`, `add-stats`, `reset-stats`) และ `change-password` ต้องตรวจสอบว่าเจ้าของ Session คือเจ้าของบัญชีจริง และฝั่ง `OpenMU-Origins` ต้องจอง Login Lock ผ่าน `ILoginServer.TryReserveAccountAsync` (ปฏิเสธทันทีด้วย `409 Conflict` หากตัวละครกำลังออนไลน์ในเกม)
3. **Production Fail-Closed**:
   - ใน Runtime ปกติ: ต้องตั้งค่า `OPENMU_API_URL`, `OPENMU_API_KEY`, `DATABASE_URL`, `SESSION_SECRET` หากขาดให้ Fail Startup ทันที และห้าม Frontend มี fallback mock success (`catch { return { success: true } }`) อีกต่อไป!

