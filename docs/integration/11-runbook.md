# 11 — คู่มือการติดตั้งและปฏิบัติการ (Runbook)

## 1. ข้อกำหนดระบบ (Prerequisites)
- **.NET 10 SDK** สำหรับรัน `OpenMU-Origins`
- **Node.js v22+** สำหรับรัน `OpenMU-Web` BFF และ Build Frontend
- **PostgreSQL 16+** สำหรับฐานข้อมูล `OpenMU-Origins` และ Schema `web` ของเว็บไซต์

## 2. การเตรียม Environment ของ OpenMU-Origins
1. คอมไพล์ Solution:
   ```bash
   dotnet build C:\OpenMU\OpenMU-Origins\src\MUnique.OpenMU.sln
   ```
2. เปิดใช้งาน AdminPanel และสร้าง API Key สำหรับเว็บไซต์ (ความยาวอย่างน้อย 32 ตัวอักษร) รวมถึงบัญชี Admin Operator (GM)
3. รัน OpenMU Startup / AdminPanel โดยตรวจสอบว่าเข้าถึงพอร์ต AdminPanel (เช่น `http://127.0.0.1:8085`) ได้

## 3. การตั้งค่า Environment ของ OpenMU-Web
คัดลอก [`.env.example`](file:///C:/OpenMU/OpenMU-Web/.env.example) เป็น `C:\OpenMU\OpenMU-Web\.env` แล้วกำหนดค่าสำคัญ:
- `OPENMU_API_URL=http://127.0.0.1:8085`
- `OPENMU_API_KEY=<32+ chars key ตรงกับฝั่ง OpenMU-Origins>`
- `DATABASE_URL=postgres://<user>:<password>@127.0.0.1:5432/<dbname>`
- `SESSION_SECRET=<32+ chars random hex>`
- `PAYMENT_WEBHOOK_SECRET=<32+ chars random secret>`
- `PROMPTPAY_ID=<เบอร์พร้อมเพย์หรือเลขประจำตัวผู้เสียภาษี>` (ถ้าเปิดรับ PromptPay QR)
- `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` / `PAYPAL_ENV` (`sandbox` หรือ `live`)
- `CORS_ALLOWED_ORIGINS` และ `PUBLIC_WEB_URL` ให้ตรงกับโดเมน/พอร์ตที่ใช้งานจริง
- **ใน Production ต้องตั้ง**: `NODE_ENV=production`, `COOKIE_SECURE=true` (หลัง HTTPS), `ALLOW_INMEMORY_WEB_STORE=false`, `ENABLE_DEV_TOPUP_SANDBOX=false`

## 4. การรันฐานข้อมูล Migration
เมื่อสตาร์ท BFF (`npm start` หรือ `npm run preview`) ฟังก์ชัน `PostgresStore.init()` จะรัน [`001_initial_web_schema.sql`](file:///C:/OpenMU/OpenMU-Web/server/db/migrations/001_initial_web_schema.sql) อัตโนมัติ ภายใต้ Schema `web` (สามารถตรวจสอบตารางได้ด้วย `\dt web.*` ใน `psql`)

## 5. การสตาร์ทระบบ (Development & Production)
- **Development**:
  1. รัน OpenMU-Origins GameServer + AdminPanel
  2. รัน Web BFF: `npm --prefix C:\OpenMU\OpenMU-Web start` (ค่าเริ่มต้นพอร์ต `8080`)
  3. รัน Vite Frontend: `npm --prefix C:\OpenMU\OpenMU-Web run dev` (พอร์ต `3000`, proxy `/api` และ `/health` ไป `8080`)
- **Production**:
  1. Build Frontend: `npm --prefix C:\OpenMU\OpenMU-Web run build`
  2. รัน Node BFF เสิร์ฟทั้ง API และ `dist/`: `NODE_ENV=production npm --prefix C:\OpenMU\OpenMU-Web start`
  3. ตรวจสุขภาพระบบ: `GET /health/live` และ `GET /health/ready`

## 6. การกู้คืนและปฏิบัติการ Admin (Troubleshooting)
- **รายการแลก WCoinC ค้างสถานะ `PENDING_GRANT`**: ตรวจสอบว่า `OPENMU_API_URL` กลับมาทำงานแล้ว BFF จะ Retry อัตโนมัติทุก 30 วินาที หรือผู้เล่นส่งคำขอซ้ำด้วย `Idempotency-Key` เดิมได้โดยไม่หัก Credits ซ้ำ
- **ยืนยันการเติมเงิน PromptPay Manual**: เข้า `/admin/login` ด้วยบัญชี GM ของ OpenMU แล้วไปที่ `/admin` เพื่อตรวจ Order ID/ยอด THB และกด "ยืนยันยอดเข้า" ระบบจะเพิ่ม Credits และมอบ WCoinC ให้อัตโนมัติพร้อมบันทึกใน `/api/admin/audit-logs`

