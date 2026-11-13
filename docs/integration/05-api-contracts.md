# 05 — เอกสารสัญญา API (API Contracts)

ระบบแยก API ออกเป็น 2 ชั้น ได้แก่:
1. **Website BFF API (`OpenMU-Web/server/app.mjs`)**: รับคำขอจาก Browser บนพอร์ตเดียวกับ Frontend / Vite proxy, บังคับ CSRF Origin validation, Session Cookies แยกสิทธิ์ และ Rate limiting
2. **OpenMU-Origins AdminPanel Internal API**: สื่อสารจาก BFF ไปยัง GameServer/AdminPanel ผ่าน `OPENMU_API_URL` โดยแนบ `X-API-Key` เฉพาะฝั่งเซิร์ฟเวอร์ (ตามการตั้งค่า `OPENMU_API_KEY`)

## 1. Public & Health Endpoints (Website BFF)
- `GET /health/live` → `200 { status: "ok" }`
- `GET /health/ready` → ทดสอบ `store.ping()` และ `GET /api/server/status` ของ OpenMU (`200 { status: "ready" }` หรือ `503`)
- `GET /api/server/status` → Proxy สถานะเซิร์ฟเวอร์และจำนวนผู้เล่นออนไลน์จาก OpenMU
- `GET /api/rankings/characters` → อันดับตัวละคร (ผ่าน `normalizeCharacterRankingItem`)
- `GET /api/rankings/guilds` → อันดับกิลด์
- `GET /api/topup/packages` → แค็ตตาล็อกแพ็กเกจเติมเงินที่กำหนดจากเซิร์ฟเวอร์ (`TOPUP_PACKAGES`) พร้อมสถานะ Provider (`promptpayManual`, `paypal`, `webhookHmac`, `devSandbox`)

## 2. Player Authentication & Self-Service (`omu_player_sid`)
- `POST /api/account/register` → ตรวจสอบความยาว `loginName` (3-10), `password` (8-20), `email` แล้วส่งไป `POST /api/accounts`
- `POST /api/account/login` → ตรวจสอบรหัสผ่านกับ OpenMU `POST /api/accounts/authenticate`, ออกคุกกี้ `omu_player_sid` (`HttpOnly`, `SameSite=Lax`), คืน Player Summary
- `POST /api/account/logout` → เพิกถอน Session ใน DB และล้างคุกกี้
- `GET /api/auth/me` และ `GET /api/wallet/summary` → ต้องมี `omu_player_sid` ที่ยังไม่หมดอายุ/ไม่ถูกเพิกถอน; คืนโปรไฟล์จาก OpenMU + Wallet/Ledger/Orders/Exchanges/Redemptions
- `POST /api/account/changepassword` → เรียก OpenMU `POST /api/accounts/{loginName}/password/change` โดยใช้ `session.loginName`
- `GET /api/characters/list` → รายชื่อตัวละครของบัญชีใน Session
- `POST /api/characters/reset` / `pkclear` / `addstats` / `resetStats` → เรียก `WebCharacterController` ของ OpenMU ภายใต้ Online-account reservation lock

## 3. Core P0 Business Endpoints (`omu_player_sid`)
- `POST /api/rewards/online-time/redeem` (Header: `Idempotency-Key`): เคลมชั่วโมงออนไลน์เป็น Credits (1 ชั่วโมง = 5 Credits)
- `POST /api/exchange/credits-to-wcoin` (Header: `Idempotency-Key`, Body: `{ credits, coinType: "WCoinC" }`): แลก Credits เป็น WCoinC (ทวีคูณของ 100 Credits = 50 WCoinC)
- `POST /api/topup/orders` (Header: `Idempotency-Key`, Body: `{ packageId, provider }`): สร้างคำสั่งซื้อโดยอ้างอิงราคาและโบนัสจากฝั่งเซิร์ฟเวอร์เท่านั้น
- `GET /api/topup/orders` และ `GET /api/topup/orders/:id`: ดูรายการ/รายละเอียดคำสั่งซื้อของบัญชีตนเอง
- `POST /api/topup/orders/:id/paypal-capture`: จับยอด (Capture) PayPal v2 Order และยืนยันจำนวนเงิน + สกุลเงิน `THB` ก่อนมอบยอด
- `POST /api/topup/orders/:id/sandbox-confirm`: ใช้ได้เฉพาะ non-production เมื่อ `ENABLE_DEV_TOPUP_SANDBOX=true`
- `POST /api/payments/webhook`: Webhook รับแจ้งชำระเงินจาก Gateway (ตรวจ `X-Webhook-Signature: t=<unix>,v1=<hex>` ด้วย HMAC-SHA256 และ Replay window ±300 วินาที)

## 4. Admin Endpoints (`omu_admin_sid`)
- `POST /api/admin/login` / `POST /api/admin/logout` / `GET /api/admin/me`: ยืนยันตัวตน GM ผ่าน OpenMU `POST /api/admin/auth/verify` (รองรับ 2FA TOTP / Recovery code) ออกคุกกี้ `omu_admin_sid` แยกขาดจากผู้เล่น
- `GET /api/admin/users` และ `GET /api/admin/users/:loginName`: ค้นหาและดูรายละเอียดบัญชีผู้เล่น (รวม Online time, Credits, WCoinC)
- `POST /api/admin/users/:loginName/wallet-adjust`: ปรับ Credits (ลง PostgreSQL Ledger) หรือ WCoinC (ส่ง `CashShop` Grant) พร้อม `reason` บังคับขั้นต่ำ 3 ตัวอักษร
- `POST /api/admin/users/:loginName/account-state`: เปลี่ยนสถานะ `Normal` / `Banned` / `TemporarilyBanned` พร้อม `reason`
- `POST /api/admin/users/:loginName/disconnect`: ตัดการเชื่อมต่อผู้เล่นที่ออนไลน์ผ่าน `POST /api/players/{loginName}/disconnect`
- `GET /api/admin/topup/orders` และ `POST /api/admin/topup/orders/:id/confirm`: ตรวจสอบและยืนยันคำสั่งซื้อ PromptPay / Manual transfer
- `GET /api/admin/audit-logs`: ดูบันทึก Audit Logs ทั้งหมด

## 5. ข้อความสื่อสารกับ OpenMU-Origins Endpoints ที่เพิ่ม/ใช้งาน
- [`AccountController.cs`](file:///C:/OpenMU/OpenMU-Origins/src/Web/AdminPanel/API/AccountController.cs): `authenticate`, `{loginName}/profile`, `{loginName}/password/change`
- [`WebAdminAuthController.cs`](file:///C:/OpenMU/OpenMU-Origins/src/Web/AdminPanel/API/WebAdminAuthController.cs): `POST /api/admin/auth/verify`
- [`WebCharacterController.cs`](file:///C:/OpenMU/OpenMU-Origins/src/Web/AdminPanel/API/WebCharacterController.cs): `{loginName}/characters/{charName}/{reset,pk-clear,add-stats,reset-stats}`
- `CashShopController`: `GET /api/accounts/{loginName}/cash-shop` และ `POST /api/accounts/{loginName}/cash-shop/grants`

