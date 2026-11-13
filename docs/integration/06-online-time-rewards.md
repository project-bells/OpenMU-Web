# 06 — ระบบรางวัลชั่วโมงออนไลน์ (P0-A: Online-Time Rewards)

## 1. แหล่งข้อมูลเวลาออนไลน์ที่เป็นความจริงหนึ่งเดียว (Authoritative Source)
- เกมเซิร์ฟเวอร์ใน [`GameContext.cs`](file:///C:/OpenMU/OpenMU-Origins/src/GameLogic/GameContext.cs) อัปเดตฟิลด์ `Account.OnlineTimeSeconds` ตามเวลาออนไลน์จริงฝั่งเซิร์ฟเวอร์ (Frontend หรือ Client ไม่สามารถกำหนดตัวเลขนี้ได้)
- เว็บ BFF ดึงค่า `onlineTimeSeconds` ล่าสุดผ่าน `GET /api/accounts/{loginName}/profile` จาก [`openmuClient.mjs`](file:///C:/OpenMU/OpenMU-Web/server/services/openmuClient.mjs)

## 2. สูตรคำนวณและ Checkpoint Tracking
- อัตราคงที่ฝั่งเซิร์ฟเวอร์ (กำหนดใน [`config.mjs`](file:///C:/OpenMU/OpenMU-Web/server/config.mjs)):
  - `ONLINE_REWARD_SECONDS_PER_HOUR = 3600`
  - `ONLINE_REWARD_CREDITS_PER_HOUR = 5`
- ค่า Checkpoint เก็บใน `web.wallet_accounts.redeemed_online_seconds`:
  - `unredeemedSeconds = max(0, authoritativeOnlineSeconds - redeemed_online_seconds)`
  - `maxHours = floor(unredeemedSeconds / 3600)`
  - หาก `maxHours < 1` ระบบปฏิเสธด้วย HTTP `400 INSUFFICIENT_ONLINE_TIME`
  - เมื่อเคลมจำนวน $H$ ชั่วโมง ระบบเพิ่ม Credits เท่ากับ $5 \times H$ และเลื่อน checkpoint เป็น `redeemed_before_seconds + (H * 3600)` โดยเศษวินาทีที่ยังไม่ครบ 1 ชั่วโมงจะยังคงสะสมไว้ใช้ในรอบถัดไป

## 3. การป้องกันการกดซ้ำและการ Race Condition
- ทุกคำขอต้องส่ง `Idempotency-Key` (ความยาวไม่เกิน 128 ตัวอักษร)
- ใน PostgreSQL (`redeemOnlineTimeTransaction`):
  1. ตรวจ `web.online_time_redemptions` ด้วย `idempotency_key` ก่อน หากพบแล้วจะคืนผลลัพธ์เดิมพร้อม `idempotent: true` ทันทีโดยไม่แจกซ้ำ
  2. ใช้ `SELECT ... FROM web.wallet_accounts WHERE login_name = $1 FOR UPDATE` เพื่อ Serialize คำขอที่ยิงเข้ามาพร้อมกันของบัญชีเดียวกัน
  3. บันทึกแถวลง `web.wallet_ledger` (`entry_type = 'ONLINE_REWARD'`), `web.online_time_redemptions`, และ `web.web_audit_logs` ภายใน Transaction เดียวกัน

## 4. สถานะการทดสอบที่ยืนยันแล้ว
- ฝั่ง GameLogic: `dotnet test ... --filter "FullyQualifiedName~WebShop|FullyQualifiedName~OnlineTime"` ผ่าน 4/4 tests
- ฝั่ง BFF ([`app.test.mjs`](file:///C:/OpenMU/OpenMU-Web/server/app.test.mjs)): ยืนยันการเคลม 7,500 วินาที → ได้ 2 ชม. (+10 Credits), checkpoint เลื่อนเป็น 7,200 วินาที, เหลือ 300 วินาทีไม่สามารถเคลมเพิ่มได้, และการส่ง `Idempotency-Key` เดิมซ้ำไม่แจกยอดเพิ่ม

