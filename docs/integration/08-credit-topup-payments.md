# 08 — ระบบเติมเงินและประมวลผลการชำระเงิน (P0-C: Credit Top-Up & Payments)

## 1. แค็ตตาล็อกแพ็กเกจฝั่งเซิร์ฟเวอร์
ราคา (THB/USD), จำนวน Credits, และโบนัส WCoinC ถูกกำหนดใน [`config.mjs`](file:///C:/OpenMU/OpenMU-Web/server/config.mjs) (`TOPUP_PACKAGES`) เท่านั้น ค่า `amountThb`, `creditsAmount`, หรือ `wcoinAmount` ที่อาจถูกปลอมแปลงส่งมาจาก Browser จะถูกเพิกเฉยทั้งหมด:

| Package ID | ชื่อแพ็กเกจ | ราคา (THB) | Credits รวม | WCoinC รวม |
|---|---|---|---|---|
| `tier-50` | Starter Pack | 50 | 275 (250+25) | 60 (50+10) |
| `tier-150` | Adventurer Pack | 150 | 920 (800+120) | 250 (200+50) |
| `tier-300` | Hero Choice (Popular) | 300 | 2,160 (1,800+360) | 650 (500+150) |
| `tier-500` | Champion Bundle | 500 | 4,000 (3,200+800) | 1,350 (1,000+350) |
| `tier-1000` | Emperor VIP Pack | 1,000 | 9,450 (7,000+2,450) | 3,500 (2,500+1,000) |

## 2. ช่องทางที่รองรับและ State Machine
สถานะใน `web.topup_orders`: `PENDING_PAYMENT -> FULFILLING -> FULFILLED` (หรือ `PAID` หากมอบ WCoinC ไม่สำเร็จชั่วคราว, `FAILED` / `CANCELLED` / `REFUNDED`).

1. **PromptPay QR (`promptpay_manual`)**:
   - สร้าง EMVCo QR Payload พร้อม CRC16-CCITT ผ่าน `buildPromptPayPayload()` ใน [`paymentProviders.mjs`](file:///C:/OpenMU/OpenMU-Web/server/services/paymentProviders.mjs) เมื่อตั้งค่า `PROMPTPAY_ID`
   - ปิดบิลได้ 2 ทาง: ผ่าน Signed Webhook อัตโนมัติ หรือให้ GM ตรวจสอบสลิปและกดยืนยันผ่าน `POST /api/admin/topup/orders/:id/confirm`
2. **Webhook แบบลงนาม HMAC-SHA256 (`POST /api/payments/webhook`)**:
   - ตรวจสอบ Header `X-Webhook-Signature` (`t=<unix>,v1=<hex>`) ด้วย `crypto.timingSafeEqual` และบังคับเวลาห้ามเกิน ±300 วินาที
   - ตรวจสอบลายเซ็นก่อนบันทึก event (เพื่อป้องกันผู้ไม่หวังดีส่ง `eventId` ปลอมมาอุดช่อง Deduplication) จากนั้นตรวจสอบ Replay ซ้ำด้วย `(provider, event_id)` และตรวจความตรงกันของ `amountThb`
3. **PayPal Checkout v2 (`paypal`)**:
   - Server สร้าง Order ผ่าน PayPal OAuth2 (`v2/checkout/orders`, สกุลเงิน `THB`) แล้ว Redirect ผู้เล่นไปอนุมัติ จากนั้น Redirect กลับมาที่ `/user/donate?paypal_order=...` เพื่อให้ Server เรียก Capture และตรวจสอบ `status === "COMPLETED"` พร้อมยอด `THB` ตรงเป๊ะ
4. **Dev Sandbox (`dev_sandbox`)**:
   - เปิดใช้ได้เฉพาะเมื่อ `NODE_ENV !== "production"` และ `ENABLE_DEV_TOPUP_SANDBOX=true` หากเป็น production จะถูกบังคับปิดตลอด (`loadConfig` เซ็ต `enableDevTopupSandbox = false`)

## 3. การส่งมอบ Credits + WCoinC แบบ Idempotent
เมื่อออเดอร์ผ่านการยืนยันเงินใน `fulfillPaidOrder()`:
1. Transaction แรกใน PostgreSQL ล็อกแถว `topup_orders`, ตรวจไม่ให้ใช้ `provider_transaction_id` ซ้ำข้าม Order, เพิ่ม Credits ลง `wallet_accounts` และ `wallet_ledger` (`idempotency_key = 'topup-credit:<orderId>'`), เปลี่ยนสถานะเป็น `FULFILLING`
2. ส่ง `POST /api/accounts/{loginName}/cash-shop/grants` ไปยัง OpenMU ด้วย `reference = 'webtopup:<orderId>'` เมื่อสำเร็จจึงเปลี่ยนสถานะเป็น `FULFILLED`

