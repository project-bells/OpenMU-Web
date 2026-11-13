# 07 — ระบบแลกเปลี่ยนเครดิตเป็น WCoinC (P0-B: Credit Exchange)

## 1. อัตราแลกเปลี่ยนและการตรวจสอบ Input
- อัตรากำหนดฝั่งเซิร์ฟเวอร์ใน [`config.mjs`](file:///C:/OpenMU/OpenMU-Web/server/config.mjs):
  - `EXCHANGE_CREDITS_PER_BLOCK = 100`
  - `EXCHANGE_WCOINC_PER_BLOCK = 50`
- ปัจจุบันรองรับสกุลเงินปลายทาง `coinType = "WCoinC"` และบังคับจำนวน Credits ที่ต้องการแลกต้องเป็นจำนวนเต็มบวกที่เป็นทวีคูณของ `100` (`credits >= 100 && credits % 100 === 0`)

## 2. รูปแบบ Outbox & Two-Phase Transaction
เนื่องจากกระเป๋า Credits อยู่ใน PostgreSQL (`web` schema) ส่วนยอด WCoinC อยู่ใน OpenMU-Origins (`CashShopCoinGrant` ผ่าน `CashShopController`) ระบบจึงใช้ 2 ขั้นตอนเพื่อไม่ให้เงินหายหรือเสกเงินซ้ำ:

```
Player -> BFF [POST /api/exchange/credits-to-wcoin + Idempotency-Key]
   │
   ├─ Phase 1 (PostgreSQL TX + Row Lock):
   │     ตรวจ idempotency_key -> ล็อก wallet_accounts FOR UPDATE -> หัก Credits
   │     -> บันทึก ledger ('CREDIT_EXCHANGE_DEBIT')
   │     -> สร้างแถวใน web.credit_exchanges (status = 'PENDING_GRANT', openmu_reference = 'webex:<id>')
   │
   └─ Phase 2 (OpenMU API POST /api/accounts/{loginName}/cash-shop/grants):
         ├─ 200 OK -> อัปเดต web.credit_exchanges เป็น 'COMPLETED' + เก็บ openmu_grant_id
         ├─ 4xx (ยกเว้น 408/429) -> ทำ Auto-Reversal ใน TX: คืน Credits กลับ + บันทึก 'CREDIT_EXCHANGE_REVERSAL' + status='REVERSED' -> คืน HTTP Error
         └─ 5xx / 408 / 429 / Network Error -> คง status='PENDING_GRANT' -> คืน HTTP 503 ('EXCHANGE_PENDING_RETRY')
```

## 3. การกู้คืนกรณี OpenMU ขัดข้องชั่วคราว
- ใน [`index.mjs`](file:///C:/OpenMU/OpenMU-Web/server/index.mjs) มี Background Reconcile Loop รัน `walletService.reconcilePendingExchanges()` ทุก 30 วินาที
- หรือเมื่อผู้เล่นส่งคำขอซ้ำด้วย `Idempotency-Key` เดิม ระบบจะเรียก `grantExchangeOnOpenMu()` ต่อเนื่องโดยส่ง `openmu_reference = 'webex:<exchangeId>'` เดิม ทำให้ OpenMU ไม่สร้างรายการแจกซ้ำ (`Reference` เป็น unique key ใน OpenMU)

## 4. สถานะการทดสอบที่ยืนยันแล้ว
- ทดสอบจริงใน [`app.test.mjs`](file:///C:/OpenMU/OpenMU-Web/server/app.test.mjs):
  - แลก `100 Credits -> 50 WCoinC` สำเร็จ + บัญชี OpenMU รับ `WCoinC` เพิ่ม +50
  - Replay ด้วย `Idempotency-Key` เดิมได้ `idempotent: true` โดยไม่หัก/แจกซ้ำ
  - เมื่อ OpenMU ตอบ `400` ระบบคืน Credits กลับทันทีผ่าน `CREDIT_EXCHANGE_REVERSAL` (`REVERSED`)
  - เมื่อ OpenMU ตอบ `503` ชั่วคราว สถานะค้าง `PENDING_GRANT` และกู้คืนจน `COMPLETED` ได้สำเร็จโดยไม่หัก Credits ซ้ำ

