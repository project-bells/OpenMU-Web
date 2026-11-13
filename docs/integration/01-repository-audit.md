# 01 - Repository Audit Report (`OpenMU-Origins` & `OpenMU-Web`)

**วันที่ตรวจสอบ**: 2026-11-12  
**ขอบเขต**: ตรวจสอบสถานะโค้ดจริง สคีมาฐานข้อมูล, API Contracts, ระบบความปลอดภัย, ระบบเวลาออนไลน์/เครดิต/WCoin และการทดสอบของทั้ง `C:\OpenMU\OpenMU-Origins` และ `C:\OpenMU\OpenMU-Web`

---

## 1. สถานะ Git, Toolchain และสภาพแวดล้อม

### 1.1 `C:\OpenMU\OpenMU-Origins`
- **Branch**: `integration/upstream-2026-11` (`7e435a45e merge: integrate upstream/master while preserving security customizations`)
- **Working tree**: สะอาด ไม่มีไฟล์ค้าง
- **Remotes**: `origin` (`project-bells/OpenMU-Origins.git`), `upstream` (`MUnique/OpenMU.git`)
- **Framework / Runtime**: `.NET SDK 10.0.204` (`net10.0`), ASP.NET Core + Blazor + Entity Framework Core (Npgsql)
- **Database Config**: [ConnectionSettings.xml](file:///C:/OpenMU/OpenMU-Origins/src/Persistence/EntityFramework/ConnectionSettings.xml) ชี้ไป PostgreSQL (`Server=localhost;Port=5432;Database=openmu`) โดยมี Role Separation (`admin`, `config`, `account`, `friend`, `guild`) และ Schema แยก (`data`, `config`, `friend`, `guild`, `admin` ตาม [SchemaNames.cs](file:///C:/OpenMU/OpenMU-Origins/src/Persistence/EntityFramework/SchemaNames.cs))

### 1.2 `C:\OpenMU\OpenMU-Web`
- **Branch**: `main` (`75ffe17 feat: add routing and admin API endpoints`)
- **Working tree**: สะอาด
- **Remote**: `origin` (`project-bells/OpenMU-Web.git`)
- **Framework / Runtime**: `Node.js v22.18.0` + `npm 10.9.3` (ไม่มี `node_modules` ติดตั้งอยู่ ณ ขณะตรวจสอบ ทำให้ `npm run lint` (`tsc --noEmit`) และ `vite build` ยังรันไม่ได้จนกว่าจะติดตั้ง dependencies)
- **Database Client / ORM**: **ยังไม่มี** (ไม่มี `pg` หรือ PostgreSQL driver ใดๆ ใน `package.json`)

### 1.3 สภาพแวดล้อมเครื่องโลคอล
- PostgreSQL 17 binaries มีอยู่ที่ `C:\Program Files\PostgreSQL\17`, **แต่** ไม่พบ Windows service หรือ process ที่ listen บนพอร์ต `5432`, `8080`, `3000`, `44405`, `55901` และไม่มี `docker` CLI ในระบบ ทำให้ E2E แบบ Live DB/GameServer บนเครื่องนี้ต้องตรวจแยกหรือจำกัดเฉพาะ Automated Test Harness (EF In-Memory + ASP.NET Core TestServer / Node HTTP Test) จนกว่าจะรัน PostgreSQL/GameServer จริง

---

## 2. การตรวจสอบ `OpenMU-Origins` (Game Server & AdminPanel API)

### 2.1 Entities, Migrations และ Persistence Layer
- **Account Entity** ([Account.cs](file:///C:/OpenMU/OpenMU-Origins/src/DataModel/Entities/Account.cs)):
  - มี `LoginName`, `PasswordHash` (BCrypt), `SecurityCode`, `EMail`, `State` (`AccountState`), `VipUntil` ([20261107141345_AddVipMembership.cs](file:///C:/OpenMU/OpenMU-Origins/src/Persistence/EntityFramework/Migrations/20261107141345_AddVipMembership.cs)), `RegistrationDate`.
  - **`OnlineTimeSeconds`** ([Account.cs#L112](file:///C:/OpenMU/OpenMU-Origins/src/DataModel/Entities/Account.cs#L112), [20261108004910_AddAuthoritativeOnlineTime.cs](file:///C:/OpenMU/OpenMU-Origins/src/Persistence/EntityFramework/Migrations/20261108004910_AddAuthoritativeOnlineTime.cs)): คอลัมน์ `bigint` ที่ **Game Server เท่านั้นเป็นผู้นับและบันทึก** แบบ monotonic (`Player.SetAccountAsync` บันทึกเวลาเริ่มต้น -> `Player.AccrueOnlineTime(DateTime.UtcNow)` เรียกใน `PlayerPersistence.SaveProgressAsync` [Player.cs#L679-L694](file:///C:/OpenMU/OpenMU-Origins/src/GameLogic/Player.cs#L679-L694), [PlayerPersistence.cs#L70](file:///C:/OpenMU/OpenMU-Origins/src/GameLogic/PlayerPersistence.cs#L70)).
  - **Cash Shop Currencies**: `WCoinC`, `WCoinP`, `GoblinPoints` ([Account.cs#L151-L173](file:///C:/OpenMU/OpenMU-Origins/src/DataModel/Entities/Account.cs#L151-L173)) — ห้ามบริการภายนอกแก้คอลัมน์ตรงๆ เพราะ Game Server อาจถือ `Account` อยู่ใน memory.
  - **หมายเหตุสำคัญ**: **ไม่มี** `Credits` (Web Credits) อยู่บนตาราง `Account` ของ Game Server.
- **CashShopCoinGrant** ([CashShopCoinGrant.cs](file:///C:/OpenMU/OpenMU-Origins/src/DataModel/Entities/CashShopCoinGrant.cs), [CashShopExtensions.cs](file:///C:/OpenMU/OpenMU-Origins/src/Persistence/EntityFramework/Extensions/ModelBuilder/CashShopExtensions.cs#L59-L67)):
  - รองรับ Idempotency ผ่านคอลัมน์ `Reference` (Unique index).
  - Game Server ใช้ `ApplyPendingCashShopCoinGrantsAsync()` ([CashShopCoinExtensions.cs#L65-L99](file:///C:/OpenMU/OpenMU-Origins/src/GameLogic/CashShop/CashShopCoinExtensions.cs#L65-L99)) ในตอน Login ([LoginAction.cs#L405](file:///C:/OpenMU/OpenMU-Origins/src/GameLogic/PlayerActions/LoginAction.cs#L405)), เปิด Cash Shop (`CashShopActions.cs`), และ Player Shop Exchange เพื่อบวกเหรียญและ stamp `AppliedAt`.
- **WebShopAccountOperation** ([WebShopAccountOperation.cs](file:///C:/OpenMU/OpenMU-Origins/src/DataModel/Entities/WebShopAccountOperation.cs), [20261107175716_AddWebShopAccountOperations.cs](file:///C:/OpenMU/OpenMU-Origins/src/Persistence/EntityFramework/Migrations/20261107175716_AddWebShopAccountOperations.cs)):
  - รองรับ `AddVaultMoney`, `CreateLevel400Character`, `RenameCharacter` แบบ idempotent ผ่าน `Reference` และประยุกต์โดย `WebShopAccountOperationExtensions` เมื่อผู้เล่น login.
- **CashShopItemGrant** ([CashShopItemGrant.cs](file:///C:/OpenMU/OpenMU-Origins/src/DataModel/Entities/CashShopItemGrant.cs)): ส่งไอเทมแพ็คเกจจาก config เข้า Cash Shop Storage แบบ idempotent.

### 2.2 AdminPanel HTTP APIs ที่มีอยู่จริง
ทั้งหมดควบคุมการเข้าถึงด้วย `ApiKeyAuthenticationHandler` (`X-Api-Key` / `Authorization: Bearer`) + Policy ตาม `AdminRoles` (`Viewer`, `Operator`, `Administrator`, `CashShop`):
1. `AccountController` ([AccountController.cs](file:///C:/OpenMU/OpenMU-Origins/src/Web/AdminPanel/API/AccountController.cs)):
   - `POST /api/accounts` (`AuthenticatedOperator`): สร้างบัญชีใหม่ด้วย `AccountWriteOperations.CreateAsync` (ตรวจ ASCII 3-10 login, 3-20 pass, hash ด้วย BCrypt).
   - `GET /api/accounts/{loginName}` (`Viewer`): อ่าน snapshot บัญชี (id, loginName, eMail, state, registrationDate, online, serverId, balance {WCoinC/WCoinP/GoblinPoints}, characters) โดยซ่อน credentials. **ช่องว่าง**: ยังไม่มี `OnlineTimeSeconds`, `PendingWCoinC`, `LevelUpPoints` / `PKState` และยังไม่มี `GET /api/accounts` สำหรับค้นหาบัญชีผ่าน REST!
   - `PUT /api/accounts/{loginName}/state` (`AuthenticatedOperator`): เปลี่ยนสถานะบัญชี (บังคับบัญชีต้อง Offline + ต้องมี audit reason).
   - `PUT /api/accounts/{loginName}/password` (`AuthenticatedOperator`): รีเซ็ตรหัสผ่านบัญชีที่ Offline โดย Admin (ไม่ตรวจรหัสเดิม และไม่อนุญาตกรณีบัญชีออนไลน์). **ช่องว่าง**: ยังไม่มี endpoint ตรวจสอบรหัสผ่านผู้เล่น (`authenticate`) เพื่อใช้กับ Website Login และ Self-service Change Password!
2. `CashShopController` ([CashShopController.cs](file:///C:/OpenMU/OpenMU-Origins/src/Web/AdminPanel/API/CashShopController.cs)):
   - `GET /api/accounts/{loginName}/cash-shop` (`AuthenticatedCashShop`): อ่าน `WCoinC`, `WCoinP`, `GoblinPoints` ที่ save แล้ว + `Grants` ล่าสุด 50 รายการ.
   - `POST /api/accounts/{loginName}/cash-shop/grants` (`AuthenticatedCashShop`): สร้าง `CashShopCoinGrant` แบบ idempotent ด้วย `Reference` (201 Created, 200 AlreadyGranted, 409 Conflict ถ้า Reference ถูกใช้โดยบัญชีอื่น, 404 NotFound).
   - `POST /api/accounts/{loginName}/cash-shop/item-grants` และ `POST .../vip-grants`.
3. `ServerController` ([ServerController.cs](file:///C:/OpenMU/OpenMU-Origins/src/Web/AdminPanel/API/ServerController.cs)):
   - `GET /api/status` (`Viewer`): คืนค่า JSON string ของ `{ state, players, uptime, antiCheat, playersList, realms }`.
   - `GET /api/is-online/{accountName}` (`Viewer`): คืน boolean.
   - `GET /api/rankings/characters` (`Viewer`): อ่านจาก DB จริง + ผสานรายชื่อตัวละครออนไลน์จริง (`Reset`, `Level`, `MasterLevel`, `ClassId`, `Guild`).
   - `GET /api/rankings/guilds` (`Viewer`): อ่านจาก DB จริง + Castle Siege owner/challenger status.
4. `CharacterController` ([CharacterController.cs](file:///C:/OpenMU/OpenMU-Origins/src/Web/AdminPanel/API/CharacterController.cs)):
   - `GET /api/characters/{name}` (`Viewer`): อ่าน snapshot ตัวละครเดี่ยว.
   - **ช่องว่าง**: ไม่มี REST endpoint สำหรับ Player-initiated Reset Character (`ResetCharacterAction`), Stat Reset (`ResetStatsAction`), Add Stats, หรือ PK Clear ใน `AdminPanel`! (`CharacterWriteOperations.cs` มีเฉพาะ Admin update/addItem ผ่าน Blazor/MCP ที่ต้องใช้ `AdminChangeConfirmation`).
5. `PlayerController` ([PlayerController.cs](file:///C:/OpenMU/OpenMU-Origins/src/Web/AdminPanel/API/PlayerController.cs)):
   - `POST /api/players/{loginName}/disconnect` (`AuthenticatedOperator`): เตะบัญชีออนไลน์ออกจากเซิร์ฟเวอร์.
6. `WebShopController` ([WebShopController.cs](file:///C:/OpenMU/OpenMU-Origins/src/Web/AdminPanel/API/WebShopController.cs)) & `WebShopAccountOperationController`:
   - `WebShopController` (`/webshop/...`) เป็น Blazor/MVC Cookie flow เฉพาะตัวของ AdminPanel ที่ผูกกับ PayPal Sandbox ใน `appsettings.json` (`WebShop:Enabled = false`) และแพ็คเกจ `THB50..THB500` ซึ่งคนละรูปแบบกับ `OpenMU-Web`.

---

## 3. การตรวจสอบ `OpenMU-Web` (Frontend & Node BFF)

### 3.1 Node BFF (`server/app.mjs`)
- **`POST /api/account/register`** ([app.mjs#L456-L487](file:///C:/OpenMU/OpenMU-Web/server/app.mjs#L456-L487)): เชื่อมต่อ OpenMU จริงผ่าน `POST /api/accounts` พร้อม rate limit และ `X-Api-Key` — **ใช้งานได้จริงและปลอดภัย** (หมายเหตุ: OpenMU-Web validation เดิมกำหนด Password 6-20 chars และอาจมี `personalCode`, ต้องตรวจความสอดคล้องกับ `AccountRegistration`).
- **`GET /api/server/status`, `GET /api/rankings/characters`, `GET /api/rankings/guilds`** ([app.mjs#L545-L651](file:///C:/OpenMU/OpenMU-Web/server/app.mjs#L545-L651)): proxy และ normalize ข้อมูลจาก OpenMU จริง — **ใช้งานได้จริง** (กรณี upstream ล่มจะคืน `state: "offline"` หรือ list ว่าง, ไม่ปั้นข้อมูลปลอม).
- **Endpoints ที่แตกหัก / เป็น Mock ปลอมทั้งหมด**:
  1. `POST /api/account/login` ([app.mjs#L489-L543](file:///C:/OpenMU/OpenMU-Web/server/app.mjs#L489-L543)): เรียก `POST /api/accounts/login` (ไม่มีอยู่จริงบน OpenMU) แล้วจับ error **คืน `200 { success: true }` ให้ทุก username/password พร้อมยอดเงินปลอม `testBalMap`!** แถมไม่มีการออก session cookie!
  2. `PUT /api/account/changepassword` ([app.mjs#L1102-L1129](file:///C:/OpenMU/OpenMU-Web/server/app.mjs#L1102-L1129)): เรียก `/api/account/changepassword` (path ผิดจาก `/api/accounts/{loginName}/password`) แล้ว fallback คืน `{ success: true }` ปลอม!
  3. `GET /api/characters/list` ([app.mjs#L653-L992](file:///C:/OpenMU/OpenMU-Web/server/app.mjs#L653-L992)): เรียก `/api/characters?account=...` (ไม่มีบน OpenMU) แล้ว fallback คืน `testCharMap` ปลอม!
  4. `POST /api/characters/reset`, `pkclear`, `addstats`, `resetStats` ([app.mjs#L994-L1100](file:///C:/OpenMU/OpenMU-Web/server/app.mjs#L994-L1100)): เรียก path ที่ไม่มีบน OpenMU แล้ว fallback คืน `{ success: true }` ปลอมทั้งหมด โดยไม่ตรวจ session หรือสถานะตัวละคร!
  5. `POST /api/admin/grant-balance` ([app.mjs#L1146-L1192](file:///C:/OpenMU/OpenMU-Web/server/app.mjs#L1146-L1192)): **ช่องโหว่ความปลอดภัยร้ายแรง** — ตรวจสิทธิ์แอดมินจาก `body.adminUser === "admin"` ที่ส่งมาจาก browser โดยตรง (spoof ได้ 100%) และ fallback คืนยอดปลอม `1000 + credits`!
  6. `POST /api/topup/donate` ([app.mjs#L1194-L1243](file:///C:/OpenMU/OpenMU-Web/server/app.mjs#L1194-L1243)): ไม่มีการตรวจการชำระเงิน ไม่มี state machine ไม่บันทึกลง DB และ fallback คืน `TXN-...` สำเร็จปลอมทุกครั้ง!
  7. `GET /api/users/search` ([app.mjs#L1131-L1144](file:///C:/OpenMU/OpenMU-Web/server/app.mjs#L1131-L1144)): คืนรายชื่อ hardcode 6 user เท่านั้น ไม่ถาม DB หรือ OpenMU และไม่ตรวจสิทธิ์ Admin!
  8. **ไม่มีเลยใน `server/app.mjs`**: `/api/rewards/online-exchange` (`GET` & `POST`) ซึ่ง `dbApi.ts` เรียกใช้อยู่!

### 3.2 Frontend (`src/`)
- **`src/services/dbApi.ts`**:
  - เกือบทุกฟังก์ชัน (`exchangeCreditsToWcoin`, `loginAccount`, `fetchAccountCharacters`, `resetCharacterAction`, `clearPkAction`, `addStatsAction`, `resetStatsAction`, `changePasswordAction`, `searchUsers`, `adminGrantBalance`, `topupDonate`) มี `catch { return { success: true, ... } }` ทำให้แม้ network ล้มเหลวหรือ API พัง UI ยังแสดง "สำเร็จปลอม"!
  - มี `TEST_ACCOUNTS` hardcode ใน bundle.
- **`src/context/UserDashboardContext.tsx`** ([UserDashboardContext.tsx#L1-L519](file:///C:/OpenMU/OpenMU-Web/src/context/UserDashboardContext.tsx)):
  - **ขาดการเชื่อมต่อ Backend โดยสิ้นเชิง**: หน้า `/login` (`UserLoginPage.tsx`), `/user/dashboard`, `/user/exchange` (`UserExchangePage.tsx`), `/user/overview` (`UserOverviewPage.tsx`), `/user/history` (`UserHistoryPage.tsx`) อ่านและเขียน state ใน `localStorage` (`egismu_players_shared_state_v2`) ปลอมทั้งหมด, auto-login เป็น `lorencia_pro`, และมีปุ่ม "รีเซ็ต Mock Data"!
- **`src/context/AdminAuthContext.tsx` & `src/pages/admin/*`**:
  - `AdminAuthContext.tsx` ([AdminAuthContext.tsx#L47-L78](file:///C:/OpenMU/OpenMU-Web/src/context/AdminAuthContext.tsx#L47-L78)): ตรวจสอบ `username === "admin" && pass.length >= 4` ใน React ฝั่ง browser และมี `quickAdminLogin()` Bypass ปุ่มเดียวเข้าหน้า Admin ได้เลย!
  - `AdminDashboardPage.tsx` & `AdminUsersPage.tsx`: อ่าน-เขียนเฉพาะ `UserDashboardContext` / `INITIAL_USERS` ใน memory ฝั่ง client ไม่ได้เชื่อม Backend หรือ OpenMU จริง!
- **`src/components/LoginModal.tsx`**:
  - ใช้แยกกับ `UserDashboardContext` (เรียก `dbApi.ts` แทน) ทำให้ state ของ Modal กับ Dashboard Page ไม่เชื่อมกันและไม่มี HttpOnly Session จริง.

---

## 4. สรุปสถานะการทดสอบพื้นฐาน (Baseline Verification)

| ชุดทดสอบ | คำสั่ง | ผลลัพธ์ |
|---|---|---|
| `OpenMU-Origins` GameLogic WebShop & OnlineTime | `dotnet test tests/MUnique.OpenMU.Tests --filter "FullyQualifiedName~WebShop\|FullyQualifiedName~OnlineTime"` | **Passed**: 4/4 |
| `OpenMU-Origins` AdminPanel WebShop / CashShop / Account | `dotnet test tests/MUnique.OpenMU.Web.Tests --filter "FullyQualifiedName~WebShop\|FullyQualifiedName~CashShop\|FullyQualifiedName~Account"` | **Passed**: 103/103 |
| `OpenMU-Web` Node BFF Tests | `npm test` (`node --test server/*.test.mjs`) | **Passed**: 12/12 (แต่ทดสอบ mock/hardcode responses) |
| `OpenMU-Web` Lint + Build | `npm run check` | **FAILED**: ไม่มี `node_modules` (`'tsc' is not recognized`) |

