# 10 — รายงานผลการทดสอบ (Test Report)

## 1. สรุปผลการรันทดสอบล่าสุด (หลังแก้ไขโค้ดครั้งสุดท้าย)

### ฝั่ง Game Server (`C:\OpenMU\OpenMU-Origins`)
1. **AdminPanel API & Web Integration Tests**
   - คำสั่ง:
     ```bash
     dotnet test C:\OpenMU\OpenMU-Origins\tests\MUnique.OpenMU.Web.Tests\MUnique.OpenMU.Web.Tests.csproj --filter "FullyQualifiedName~MUnique.OpenMU.Web.Tests.Api"
     ```
   - ผลลัพธ์: **Passed: 65, Failed: 0, Skipped: 0, Total: 65 (Duration: 6 s)**
   - ครอบคลุม [`WebIntegrationApiTests.cs`](file:///C:/OpenMU/OpenMU-Origins/tests/MUnique.OpenMU.Web.Tests/Api/WebIntegrationApiTests.cs): การยืนยันรหัสผ่านผู้เล่น/แอดมิน, อัปเดต/อ่านโปรไฟล์ (`onlineTimeSeconds`, `WCoinC`), เปลี่ยนรหัสผ่าน (พร้อมปฏิเสธเมื่อออนไลน์/รหัสเดิมผิด), และบริการตัวละครออฟไลน์ (`add-stats`, `pk-clear`, `reset-stats`, `reset`)

2. **GameLogic Online Time & WebShop Tests**
   - คำสั่ง:
     ```bash
     dotnet test C:\OpenMU\OpenMU-Origins\tests\MUnique.OpenMU.Tests\MUnique.OpenMU.Tests.csproj --no-build --filter "FullyQualifiedName~WebShop|FullyQualifiedName~OnlineTime"
     ```
   - ผลลัพธ์: **Passed: 4, Failed: 0, Skipped: 0, Total: 4 (Duration: 310 ms)**

*(หมายเหตุจากรันรวมก่อนหน้า: ในโปรเจกต์ `MUnique.OpenMU.Web.Tests` มี 3 เทสต์เดิมของต้นน้ำที่ไม่เกี่ยวกับ API integration ล้มเหลวจากสภาพแวดล้อม Windows/Thai locale ของเครื่องทดสอบ ได้แก่ `ArchiveListTests` ปี พ.ศ. 2569, `DiscordSetupPageTests` ไฟล์ถูกล็อก, `FileIsUtf8WithLineFeeds` CRLF, และ `McpIntegrationTests.CallsAllReadToolsAndNeverReturnsSecretsAsync`)*

### ฝั่ง Website (`C:\OpenMU\OpenMU-Web`)
- คำสั่ง:
  ```bash
  npm --prefix C:\OpenMU\OpenMU-Web run check
  ```
  1. **`tsc --noEmit` (TypeScript Strict Check)**: ผ่าน **0 errors**
  2. **`node --test server/*.test.mjs` ([`app.test.mjs`](file:///C:/OpenMU/OpenMU-Web/server/app.test.mjs))**: **Passed: 4/4, Failed: 0, Skipped: 0 (Duration: 284.64 ms)**
     - Test 1: Config fail-closed เมื่อ production settings ไม่ปลอดภัย/ขาดหาย
     - Test 2: Migration SQL [`001_initial_web_schema.sql`](file:///C:/OpenMU/OpenMU-Web/server/db/migrations/001_initial_web_schema.sql) มีครบ 9 ตาราง, `UNIQUE`, และ `CHECK` constraints
     - Test 3: Validation, character class normalization, PromptPay EMVCo payload (CRC16), HMAC webhook timestamp/signature verification
     - Test 4: Full HTTP BFF end-to-end (CSRF `403`, Register `201`, Player/Admin cookie isolation `401`, **P0-A** Online Rewards 7,500s -> 2h +10 Credits + idempotent replay, **P0-B** Exchange 100 Cr -> 50 WCoinC + replay + auto-reversal on `400` + `503` recovery, **P0-C** Dev Sandbox + PromptPay QR + signed HMAC Webhook + replay dedup + PayPal create/capture + GM confirm, Character add-stats + Password change, Admin wallet adjust + Disconnect + Audit logs)
  3. **`vite build`**: ผ่าน (**2,130 modules**, built in **2.33s** สร้าง `dist/index.html`, `dist/assets/*.css`, `dist/assets/*.js`)

## 2. ขอบเขตที่ยังต้องรันเพิ่มเมื่อDeploy บน PostgreSQL จริง
- เครื่องทดสอบนี้ไม่มีบริการ/CLI PostgreSQL (`psql`/`pg_isready` ไม่อยู่ในระบบ) ดังนั้นการทดสอบ End-to-End ฝั่ง BFF จึงรันบน [`InMemoryWebStore`](file:///C:/OpenMU/OpenMU-Web/server/db/inMemoryStore.mjs) ควบคู่กับการตรวจไฟล์ SQL Migration แบบ Static ส่วนการทดสอบบน PostgreSQL 16 จริงให้ทำตามขั้นตอนใน [`11-runbook.md`](file:///C:/OpenMU/OpenMU-Web/docs/integration/11-runbook.md)

