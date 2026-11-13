# 09 — รายงานทบทวนความปลอดภัย (Security Review)

## 1. การจัดการความลับและการตั้งค่าแบบ Fail-Closed
- **API Key Isolation**: Frontend ไม่มีสิทธิ์เห็นหรือถือ `OPENMU_API_KEY`; การเรียกใช้ AdminPanel API เกิดขึ้นเฉพาะฝั่ง Node BFF (`server/services/openmuClient.mjs`)
- **Production Fail-Closed Config (`server/config.mjs`)**:
  - หาก `NODE_ENV=production` แล้วขาด `DATABASE_URL` หรือ `SESSION_SECRET` ยาวน้อยกว่า 32 ตัวอักษร ระบบปฏิเสธการเริ่มต้นทันที
  - โหมด `ALLOW_INMEMORY_WEB_STORE` และ `ENABLE_DEV_TOPUP_SANDBOX` ถูกบังคับเป็น `false` อัตโนมัติเมื่อ `NODE_ENV=production`
- **ไม่มี Hardcoded Credentials หรือ Mock Fallback**:
  - ลบ `TEST_ACCOUNTS`, `INITIAL_PLAYERS`, `INITIAL_USERS`, รหัสผ่าน `"admin1234"`, `quickAdminLogin()`, และ Mock `catch { return { success: true } }` ออกจาก Frontend และลบ Mock API middleware ออกจาก `vite.config.ts`

## 2. Authentication, Session Separation & CSRF
- **Cookie Separation**:
  - Player session ใช้คุกกี้ `omu_player_sid` และ Admin session ใช้คุกกี้ `omu_admin_sid` (`HttpOnly`, `SameSite=Lax`, `Secure` ใน production)
  - Token จริงเก็บเฉพาะ SHA-256 hash ใน `web.web_sessions`
  - คุกกี้ผู้เล่นไม่สามารถเรียก `/api/admin/*` ได้ (`401 ADMIN_UNAUTHORIZED`) และคุกกี้แอดมินไม่สามารถเรียก endpoint ผู้เล่นได้ (`401 UNAUTHORIZED`)
- **IDOR Prevention**:
  - Endpoint ผู้เล่นทุกตัวอ้างอิง `session.loginName` จากคุกกี้ที่ผ่านการยืนยันลายเซ็น/ฐานข้อมูล ไม่ใช้ `loginName` จาก Request Body
  - ฝั่ง OpenMU [`WebCharacterController.cs`](file:///C:/OpenMU/OpenMU-Origins/src/Web/AdminPanel/API/WebCharacterController.cs) ตรวจสอบว่าตัวละครเป้าหมายอยู่ในบัญชี `loginName` นั้นจริง และจอง Lock บัญชีผ่าน `ILoginServer.TryReserveAccountAsync` ก่อนแก้ไขตัวละคร
- **CSRF & Headers**:
  - BFF ตรวจสอบ `Origin` / `Host` สำหรับคำขอเปลี่ยนแปลงข้อมูล (`/api/*` ยกเว้น `/api/payments/webhook` ที่ใช้ HMAC signature)
  - กำหนด `Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`

## 3. Payment & Economy Protections
- **Webhook Anti-Poisoning & Replay Protection**:
  - `walletService.processHmacWebhook` ตรวจ `X-Webhook-Signature` (HMAC-SHA256 + ±300s timestamp window) **ก่อน** บันทึก `web.payment_webhook_events` ทำให้ผู้โจมตีไม่สามารถยิง `eventId` ปลอมมาบล็อก Webhook จริงได้
  - รายการที่ผ่านลายเซ็นแล้วถูกกันประมวลผลซ้ำด้วย `UNIQUE (provider, event_id)`
- **Server-Side Pricing & Atomic Locking**:
  - ราคาและยอดรางวัลคำนวณจาก `TOPUP_PACKAGES` ฝั่งเซิร์ฟเวอร์เท่านั้น
  - PostgreSQL Transaction ใช้ `FOR UPDATE` และ `CHECK (credits_balance >= 0)` ป้องกันการเบิก/แลกเกินยอดจาก Race condition
- **Rate Limiting & Audit Logging**:
  - มี Sliding-window rate limit แยกตาม IP/บัญชีสำหรับ Login, Register, Password change, Redeem, Exchange, Top-up create, และ Admin login
  - บันทึก Audit Trail ทุกการกระทำสำคัญลง `web.web_audit_logs`

