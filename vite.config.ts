import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getUpstreamTarget() {
  const base = (
    process.env.DEV_API_TARGET ||
    process.env.OPENMU_API_URL ||
    process.env.OPENMU_GATEWAY_URL ||
    "http://127.0.0.1:8080"
  ).replace(/\/+$/, "");
  const headers: Record<string, string> = { Accept: "application/json" };
  if (process.env.OPENMU_API_KEY) {
    headers["X-Api-Key"] = process.env.OPENMU_API_KEY;
  }
  return { base, headers };
}

function openMuDevApiPlugin() {
  const registeredAccounts = new Set([
    "admin",
    "lorencia_pro",
    "magic_wizard",
    "elf_archer",
    "dark_summoner",
    "rage_fighter",
    "test",
    "muonline",
  ]);

  const accountPasswords = new Map<string, string>([
    ["admin", "admin1234"],
    ["lorencia_pro", "user1234"],
    ["magic_wizard", "user1234"],
    ["elf_archer", "user1234"],
    ["dark_summoner", "user1234"],
    ["rage_fighter", "user1234"],
  ]);

  const accountBalances = new Map<string, { credits: number; wcoin: number; onlineHours: number }>([
    ["admin", { credits: 1500, wcoin: 800, onlineHours: 300 }],
    ["lorencia_pro", { credits: 450, wcoin: 200, onlineHours: 90 }],
    ["magic_wizard", { credits: 320, wcoin: 150, onlineHours: 64 }],
    ["elf_archer", { credits: 500, wcoin: 250, onlineHours: 100 }],
    ["dark_summoner", { credits: 280, wcoin: 100, onlineHours: 56 }],
    ["rage_fighter", { credits: 190, wcoin: 50, onlineHours: 38 }],
    ["test", { credits: 250, wcoin: 100, onlineHours: 50 }],
    ["muonline", { credits: 500, wcoin: 250, onlineHours: 100 }],
  ]);

  const characterDatabase = new Map<string, any[]>([
    [
      "admin",
      [
        {
          name: "GM_Ares",
          characterClassId: "00000040-0007-0000-0000-000000000000",
          className: "Blade Master",
          classShort: "BM",
          classId: "dk",
          lvl: 400,
          masterlvl: 200,
          resets: 50,
          levelUpPoints: 600,
          strength: 2200,
          agility: 1500,
          vitality: 1000,
          energy: 800,
          leadership: 0,
          currentMapId: "00000300-004f-0000-0000-000000000000",
          mapName: "Loren Market",
          pkState: 3,
          pkLevel: "Normal",
          isOnline: false,
        },
        {
          name: "GM_Zeus",
          characterClassId: "00000040-0011-0000-0000-000000000000",
          className: "Lord Emperor",
          classShort: "LE",
          classId: "dl",
          lvl: 400,
          masterlvl: 180,
          resets: 45,
          levelUpPoints: 500,
          strength: 1800,
          agility: 1200,
          vitality: 900,
          energy: 1100,
          leadership: 1500,
          currentMapId: "00000300-001e-0000-0000-000000000000",
          mapName: "Valley of Loren",
          pkState: 3,
          pkLevel: "Normal",
          isOnline: false,
        },
      ],
    ],
    [
      "lorencia_pro",
      [
        {
          name: "BladeKnight_X",
          characterClassId: "00000040-0007-0000-0000-000000000000",
          className: "Blade Master",
          classShort: "BM",
          classId: "dk",
          lvl: 400,
          masterlvl: 85,
          resets: 18,
          levelUpPoints: 140,
          strength: 1450,
          agility: 920,
          vitality: 580,
          energy: 350,
          leadership: 0,
          currentMapId: "00000300-0000-0000-0000-000000000000",
          mapName: "Lorencia",
          pkState: 3,
          pkLevel: "Normal",
          isOnline: false,
        },
        {
          name: "LordEmperor_TH",
          characterClassId: "00000040-0011-0000-0000-000000000000",
          className: "Lord Emperor",
          classShort: "LE",
          classId: "dl",
          lvl: 382,
          masterlvl: 45,
          resets: 12,
          levelUpPoints: 85,
          strength: 1200,
          agility: 750,
          vitality: 550,
          energy: 600,
          leadership: 750,
          currentMapId: "00000300-001e-0000-0000-000000000000",
          mapName: "Valley of Loren",
          pkState: 3,
          pkLevel: "Normal",
          isOnline: false,
        },
      ],
    ],
    [
      "magic_wizard",
      [
        {
          name: "ArchMage_Dev",
          characterClassId: "00000040-0003-0000-0000-000000000000",
          className: "Grand Master",
          classShort: "GM",
          classId: "dw",
          lvl: 400,
          masterlvl: 105,
          resets: 16,
          levelUpPoints: 210,
          strength: 650,
          agility: 800,
          vitality: 500,
          energy: 1850,
          leadership: 0,
          currentMapId: "00000300-0002-0000-0000-000000000000",
          mapName: "Devias",
          pkState: 3,
          pkLevel: "Normal",
          isOnline: false,
        },
        {
          name: "SoulMaster_99",
          characterClassId: "00000040-0002-0000-0000-000000000000",
          className: "Soul Master",
          classShort: "SM",
          classId: "dw",
          lvl: 350,
          masterlvl: 25,
          resets: 8,
          levelUpPoints: 95,
          strength: 450,
          agility: 600,
          vitality: 400,
          energy: 1300,
          leadership: 0,
          currentMapId: "00000300-0004-0000-0000-000000000000",
          mapName: "Lost Tower",
          pkState: 5,
          pkLevel: "Outlaw (Stage 1)",
          isOnline: false,
        },
      ],
    ],
    [
      "elf_archer",
      [
        {
          name: "WindArcher",
          characterClassId: "00000040-000b-0000-0000-000000000000",
          className: "High Elf",
          classShort: "HE",
          classId: "elf",
          lvl: 400,
          masterlvl: 92,
          resets: 19,
          levelUpPoints: 175,
          strength: 550,
          agility: 1920,
          vitality: 480,
          energy: 620,
          leadership: 0,
          currentMapId: "00000300-0003-0000-0000-000000000000",
          mapName: "Noria",
          pkState: 3,
          pkLevel: "Normal",
          isOnline: false,
        },
        {
          name: "MuseBuff",
          characterClassId: "00000040-000a-0000-0000-000000000000",
          className: "Muse Elf",
          classShort: "ME",
          classId: "elf",
          lvl: 365,
          masterlvl: 35,
          resets: 9,
          levelUpPoints: 60,
          strength: 380,
          agility: 500,
          vitality: 420,
          energy: 1550,
          leadership: 0,
          currentMapId: "00000300-0003-0000-0000-000000000000",
          mapName: "Noria",
          pkState: 3,
          pkLevel: "Normal",
          isOnline: false,
        },
      ],
    ],
    [
      "dark_summoner",
      [
        {
          name: "BloodQueen",
          characterClassId: "00000040-0017-0000-0000-000000000000",
          className: "Dimension Master",
          classShort: "DMS",
          classId: "sum",
          lvl: 400,
          masterlvl: 115,
          resets: 21,
          levelUpPoints: 310,
          strength: 520,
          agility: 750,
          vitality: 620,
          energy: 1780,
          leadership: 0,
          currentMapId: "00000300-0033-0000-0000-000000000000",
          mapName: "Elbeland",
          pkState: 3,
          pkLevel: "Normal",
          isOnline: false,
        },
        {
          name: "DuelMaster_Pro",
          characterClassId: "00000040-000d-0000-0000-000000000000",
          className: "Duel Master",
          classShort: "DM",
          classId: "mg",
          lvl: 375,
          masterlvl: 55,
          resets: 13,
          levelUpPoints: 110,
          strength: 1300,
          agility: 950,
          vitality: 510,
          energy: 1100,
          leadership: 0,
          currentMapId: "00000300-0008-0000-0000-000000000000",
          mapName: "Tarkan",
          pkState: 3,
          pkLevel: "Normal",
          isOnline: false,
        },
      ],
    ],
    [
      "rage_fighter",
      [
        {
          name: "FistMaster_K",
          characterClassId: "00000040-0019-0000-0000-000000000000",
          className: "Fist Master",
          classShort: "FM",
          classId: "rf",
          lvl: 395,
          masterlvl: 70,
          resets: 14,
          levelUpPoints: 160,
          strength: 1600,
          agility: 800,
          vitality: 950,
          energy: 320,
          leadership: 0,
          currentMapId: "00000300-0050-0000-0000-000000000000",
          mapName: "Karutan 1",
          pkState: 3,
          pkLevel: "Normal",
          isOnline: false,
        },
        {
          name: "DarkKnight_Nov",
          characterClassId: "00000040-0006-0000-0000-000000000000",
          className: "Blade Knight",
          classShort: "BK",
          classId: "dk",
          lvl: 330,
          masterlvl: 10,
          resets: 5,
          levelUpPoints: 45,
          strength: 980,
          agility: 600,
          vitality: 450,
          energy: 220,
          leadership: 0,
          currentMapId: "00000300-0007-0000-0000-000000000000",
          mapName: "Atlans",
          pkState: 3,
          pkLevel: "Normal",
          isOnline: false,
        },
      ],
    ],
  ]);
  const ipRateMap = new Map<string, { count: number; resetTime: number }>();
  const MAX_BODY_BYTES = 10 * 1024; // 10KB limit

  return {
    name: "openmu-dev-api",
    configureServer(server: any) {
      // 1. Live Server Status API (proxied to server gateway)
      server.middlewares.use("/api/server/status", async (req: any, res: any) => {
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Cache-Control", "no-cache");

        const { base, headers } = getUpstreamTarget();
        try {
          const upstreamRes = await fetch(`${base}${req.originalUrl || req.url}`, { headers });
          if (upstreamRes.ok) {
            const data = await upstreamRes.json();
            res.statusCode = 200;
            res.end(JSON.stringify(data));
            return;
          }
        } catch {
          // Fallback if gateway not running
        }

        const now = new Date();
        const utc7Time = new Intl.DateTimeFormat("en-GB", {
          timeZone: "Asia/Bangkok",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }).format(now);

        const data = {
          serverName: "eGiS-MU S6E3",
          version: "Season 6 Episode 3",
          status: "ONLINE",
          onlineCount: 0,
          serverTime: `${utc7Time} (UTC+7 Bangkok)`,
          uptime: "0h 0m",
          antiCheat: "eGiS-MU GameGuard 100% Active",
          totalAccounts: registeredAccounts.size,
          realms: [],
          onlineExchange: {
            creditsPerHour: 5,
            creditToWcoinRatio: 0.5,
            ratioDescription: "100 Credits = 50 WCoin",
            minExchange: 100,
            status: "ACTIVE",
          },
        };

        res.statusCode = 200;
        res.end(JSON.stringify(data));
      });

      // 2. Rankings Characters API (proxied to server database)
      server.middlewares.use("/api/rankings/characters", async (req: any, res: any) => {
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");

        const { base, headers } = getUpstreamTarget();
        try {
          const upstreamRes = await fetch(`${base}${req.originalUrl || req.url}`, { headers });
          if (upstreamRes.ok) {
            const data = await upstreamRes.json();
            res.statusCode = 200;
            res.end(JSON.stringify(data));
            return;
          }
        } catch {
          // Upstream unavailable
        }

        res.statusCode = 200;
        res.end(JSON.stringify({ total: 0, characters: [] }));
      });

      // 3. Rankings Guilds API (proxied to server database)
      server.middlewares.use("/api/rankings/guilds", async (req: any, res: any) => {
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");

        const { base, headers } = getUpstreamTarget();
        try {
          const upstreamRes = await fetch(`${base}${req.originalUrl || req.url}`, { headers });
          if (upstreamRes.ok) {
            const data = await upstreamRes.json();
            res.statusCode = 200;
            res.end(JSON.stringify(data));
            return;
          }
        } catch {
          // Upstream unavailable
        }

        res.statusCode = 200;
        res.end(JSON.stringify({ total: 0, guilds: [] }));
      });

      // 4. Online-to-Credit & WCoin Exchange System API (1 Hr = 5 Credits, 100 Credits = 50 WCoin)
      server.middlewares.use("/api/rewards/online-exchange", (req: any, res: any) => {
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("Content-Type", "application/json");

        if (req.method === "POST") {
          let body = "";
          req.on("data", (chunk: Buffer) => {
            body += chunk.toString("utf-8");
          });
          req.on("end", () => {
            try {
              const payload = JSON.parse(body || "{}");
              const credits = Number(payload.credits) || 0;
              const account = (payload.account || "").toString().trim();

              if (!account) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: "Account username is required." }));
                return;
              }

              if (credits < 100 || credits % 100 !== 0) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: "Credits must be a multiple of 100 (Minimum 100 Credits)." }));
                return;
              }

              const wcoinReceived = Math.floor(credits * 0.5);
              const lowerAcc = account.toLowerCase();
              const current = accountBalances.get(lowerAcc) || { credits: 300, wcoin: 100, onlineHours: 60 };
              current.credits = Math.max(0, current.credits - credits);
              current.wcoin += wcoinReceived;
              accountBalances.set(lowerAcc, current);

              res.statusCode = 200;
              res.end(
                JSON.stringify({
                  success: true,
                  account,
                  deductedCredits: credits,
                  wcoinReceived,
                  remainingCredits: current.credits,
                  newWcoinBalance: current.wcoin,
                  message: `Exchanged ${credits} Credits into ${wcoinReceived} WCoin successfully! Sent to in-game Cash Shop (X) balance.`,
                })
              );
            } catch {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: "Invalid JSON payload." }));
            }
          });
          return;
        }

        res.statusCode = 200;
        res.end(
          JSON.stringify({
            enabled: true,
            creditsPerHour: 5,
            rateFormula: "1 Hour Online = 5 Credits",
            exchangeRate: "100 Credits = 50 WCoin",
            minExchangeCredits: 100,
            stats: {
              totalCreditsDistributed: 845200,
              totalWcoinExchanged: 395100,
              activeMiners: 3870,
            },
          })
        );
      });

      // 5. Account Login API
      server.middlewares.use("/api/account/login", (req: any, res: any) => {
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Cache-Control", "no-store");

        if (req.method !== "POST") {
          res.statusCode = 405;
          res.setHeader("Allow", "POST");
          res.end(JSON.stringify({ error: "Method Not Allowed. Use POST." }));
          return;
        }

        let body = "";
        req.on("data", (chunk: Buffer) => {
          body += chunk.toString("utf-8");
        });
        req.on("end", () => {
          try {
            const data = JSON.parse(body || "{}");
            const rawUser = (data.loginName || data.username || "").toString().trim();
            const rawPass = (data.password || "").toString();

            if (!rawUser || !rawPass) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: "Username and password are required." }));
              return;
            }

            if (rawUser.length < 3 || rawUser.length > 20 || rawPass.length < 4) {
              res.statusCode = 401;
              res.end(JSON.stringify({ error: "Invalid username or password length." }));
              return;
            }

            const lower = rawUser.toLowerCase();
            const expectedPass = accountPasswords.get(lower);
            if (expectedPass && rawPass !== expectedPass && rawPass !== "user1234" && rawPass !== "admin1234") {
              res.statusCode = 401;
              res.end(JSON.stringify({ error: "Invalid password for this account." }));
              return;
            }

            if (!accountBalances.has(lower)) {
              accountBalances.set(lower, { credits: 250, wcoin: 100, onlineHours: 50 });
            }
            const bal = accountBalances.get(lower)!;

            res.statusCode = 200;
            res.end(
              JSON.stringify({
                success: true,
                account: rawUser,
                credits: bal.credits,
                wcoin: bal.wcoin,
                onlineHours: bal.onlineHours,
                creditsPerHour: 5,
              })
            );
          } catch {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: "Invalid JSON payload." }));
          }
        });
      });

      // 6. Character List API
      server.middlewares.use("/api/characters/list", (req: any, res: any) => {
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Cache-Control", "no-store");

        const url = new URL(req.url, "http://localhost");
        const account = (url.searchParams.get("account") || "Player").trim();
        const lower = account.toLowerCase();

        const chars = characterDatabase.get(lower) || [
          {
            name: `${account}_BM`,
            characterClassId: "00000040-0007-0000-0000-000000000000",
            className: "Blade Master",
            classShort: "BM",
            classId: "dk",
            lvl: 400,
            masterlvl: 85,
            resets: 15,
            levelUpPoints: 120,
            strength: 1420,
            agility: 880,
            vitality: 520,
            energy: 310,
            leadership: 0,
            currentMapId: "00000300-0000-0000-0000-000000000000",
            mapName: "Lorencia",
            pkState: 3,
            pkLevel: "Normal",
            isOnline: false,
          },
          {
            name: `${account}_LE`,
            characterClassId: "00000040-0011-0000-0000-000000000000",
            className: "Lord Emperor",
            classShort: "LE",
            classId: "dl",
            lvl: 388,
            masterlvl: 62,
            resets: 11,
            levelUpPoints: 85,
            strength: 1250,
            agility: 750,
            vitality: 600,
            energy: 700,
            leadership: 850,
            currentMapId: "00000300-001e-0000-0000-000000000000",
            mapName: "Valley of Loren",
            pkState: 3,
            pkLevel: "Normal",
            isOnline: false,
          },
        ];

        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, characters: chars }));
      });

      // 7. OpenMU Reset Character API (lvl 400 -> 1, resets +1)
      server.middlewares.use("/api/characters/reset", (req: any, res: any) => {
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("Content-Type", "application/json");

        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end(JSON.stringify({ message: "Method Not Allowed" }));
          return;
        }

        let body = "";
        req.on("data", (chunk: Buffer) => {
          body += chunk.toString("utf-8");
        });
        req.on("end", () => {
          try {
            const data = JSON.parse(body || "{}");
            const charName = (data.name || "").toString().trim();
            if (!charName) {
              res.statusCode = 400;
              res.end(JSON.stringify({ message: "Character name is required." }));
              return;
            }
            res.statusCode = 200;
            res.end(
              JSON.stringify({
                success: true,
                message: `Character ${charName} reset successfully! Level set to 1, Resets +1.`,
              })
            );
          } catch {
            res.statusCode = 400;
            res.end(JSON.stringify({ message: "Invalid JSON request." }));
          }
        });
      });

      // 8. OpenMU Clear PK API
      server.middlewares.use("/api/characters/pkclear", (req: any, res: any) => {
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("Content-Type", "application/json");

        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end(JSON.stringify({ message: "Method Not Allowed" }));
          return;
        }

        let body = "";
        req.on("data", (chunk: Buffer) => {
          body += chunk.toString("utf-8");
        });
        req.on("end", () => {
          try {
            const data = JSON.parse(body || "{}");
            const charName = (data.name || "").toString().trim();
            res.statusCode = 200;
            res.end(
              JSON.stringify({
                success: true,
                message: `PK status for ${charName || "character"} cleared to Normal!`,
              })
            );
          } catch {
            res.statusCode = 400;
            res.end(JSON.stringify({ message: "Invalid JSON request." }));
          }
        });
      });

      // 9. OpenMU Add Stats API
      server.middlewares.use("/api/characters/addstats", (req: any, res: any) => {
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("Content-Type", "application/json");

        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end(JSON.stringify({ message: "Method Not Allowed" }));
          return;
        }

        let body = "";
        req.on("data", (chunk: Buffer) => {
          body += chunk.toString("utf-8");
        });
        req.on("end", () => {
          try {
            const data = JSON.parse(body || "{}");
            const charName = (data.name || "").toString().trim();
            res.statusCode = 200;
            res.end(
              JSON.stringify({
                success: true,
                message: `Points added to ${charName || "character"} successfully!`,
              })
            );
          } catch {
            res.statusCode = 400;
            res.end(JSON.stringify({ message: "Invalid JSON request." }));
          }
        });
      });

      // 10. OpenMU Reset Stats API
      server.middlewares.use("/api/characters/resetStats", (req: any, res: any) => {
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("Content-Type", "application/json");

        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end(JSON.stringify({ message: "Method Not Allowed" }));
          return;
        }

        let body = "";
        req.on("data", (chunk: Buffer) => {
          body += chunk.toString("utf-8");
        });
        req.on("end", () => {
          try {
            const data = JSON.parse(body || "{}");
            const charName = (data.name || "").toString().trim();
            res.statusCode = 200;
            res.end(
              JSON.stringify({
                success: true,
                message: `All stat points for ${charName || "character"} have been reset to base 20 and refunded!`,
              })
            );
          } catch {
            res.statusCode = 400;
            res.end(JSON.stringify({ message: "Invalid JSON request." }));
          }
        });
      });

      // 11. OpenMU Change Password API
      server.middlewares.use("/api/account/changepassword", (req: any, res: any) => {
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("Content-Type", "application/json");

        if (req.method !== "PUT" && req.method !== "POST") {
          res.statusCode = 405;
          res.end(JSON.stringify({ message: "Method Not Allowed" }));
          return;
        }

        let body = "";
        req.on("data", (chunk: Buffer) => {
          body += chunk.toString("utf-8");
        });
        req.on("end", () => {
          try {
            const data = JSON.parse(body || "{}");
            if (!data.newPassword || data.newPassword.length < 6) {
              res.statusCode = 400;
              res.end(JSON.stringify({ message: "New password must be at least 6 characters." }));
              return;
            }
            if (data.newPassword !== data.repeatNewPassword) {
              res.statusCode = 400;
              res.end(JSON.stringify({ message: "Passwords do not match." }));
              return;
            }
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, message: "Password updated successfully!" }));
          } catch {
            res.statusCode = 400;
            res.end(JSON.stringify({ message: "Invalid JSON request." }));
          }
        });
      });

      // 12. Account Registration API
      server.middlewares.use("/api/account/register", (req: any, res: any) => {
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");

        if (req.method !== "POST") {
          res.statusCode = 405;
          res.setHeader("Allow", "POST");
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "Method Not Allowed. Use POST." }));
          return;
        }

        const clientIp =
          req.headers["x-forwarded-for"]?.toString().split(",")[0].trim() || req.socket.remoteAddress || "127.0.0.1";
        const now = Date.now();
        const rateRecord = ipRateMap.get(clientIp);

        if (rateRecord && now < rateRecord.resetTime) {
          if (rateRecord.count >= 20) {
            res.statusCode = 429;
            res.setHeader("Content-Type", "application/json");
            res.setHeader("Retry-After", "60");
            res.end(JSON.stringify({ error: "Too many registration attempts. Please wait 1 minute." }));
            return;
          }
          rateRecord.count += 1;
        } else {
          ipRateMap.set(clientIp, { count: 1, resetTime: now + 60000 });
        }

        let body = "";
        let bodySize = 0;
        let isTooLarge = false;

        req.on("data", (chunk: Buffer) => {
          bodySize += chunk.length;
          if (bodySize > MAX_BODY_BYTES) {
            isTooLarge = true;
            req.destroy();
            res.statusCode = 413;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Payload Too Large. Maximum allowed size is 10KB." }));
            return;
          }
          body += chunk.toString("utf-8");
        });

        req.on("end", () => {
          if (isTooLarge) return;

          try {
            const data = JSON.parse(body || "{}");
            const rawUser = (data.loginName || data.username || "").toString().trim();
            const rawPass = (data.password || "").toString();
            const rawEmail = (data.email || "").toString().trim();

            if (!rawUser || rawUser.length < 4 || rawUser.length > 10 || !/^[a-zA-Z0-9]+$/.test(rawUser)) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Username must be 4-10 alphanumeric characters." }));
              return;
            }

            if (!rawPass || rawPass.length < 6 || rawPass.length > 64) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Password must be between 6 and 64 characters." }));
              return;
            }

            const rawPersonalCode = (data.personalCode || data.securityCode || "1234567").toString().trim();

            if (!rawEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Valid email address is required." }));
              return;
            }

            if (!rawPersonalCode || !/^[0-9]{7}$/.test(rawPersonalCode)) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Character Deletion Code must be exactly 7 digits (0-9)." }));
              return;
            }

            const lowerUser = rawUser.toLowerCase();
            if (registeredAccounts.has(lowerUser)) {
              res.statusCode = 409;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: `Account '${rawUser}' already exists in database.` }));
              return;
            }

            registeredAccounts.add(lowerUser);
            accountBalances.set(lowerUser, { credits: 50, wcoin: 0, onlineHours: 10 });
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                success: true,
                message: "Account created successfully in database!",
                account: rawUser,
              })
            );
          } catch {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Invalid JSON payload." }));
          }
        });
      });

      // 13. Users Search API (Autocomplete for Admin GM)
      server.middlewares.use("/api/users/search", (req: any, res: any) => {
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Cache-Control", "no-store");

        const url = new URL(req.url, "http://localhost");
        const query = (url.searchParams.get("q") || "").trim().toLowerCase();

        const allUsernames = Array.from(
          new Set([...Array.from(registeredAccounts), ...Array.from(accountBalances.keys())])
        );

        const roleMap: Record<string, string> = {
          admin: "Admin GM",
          lorencia_pro: "PvP Veteran",
          magic_wizard: "Mage",
          elf_archer: "Guild Master",
          dark_summoner: "Curse Master",
          rage_fighter: "Brawler",
        };

        const list = allUsernames.map((u) => {
          const bal = accountBalances.get(u) || { credits: 0, wcoin: 0, onlineHours: 0 };
          return {
            username: u,
            role: roleMap[u] || (u === "admin" ? "Admin GM" : "Player"),
            credits: bal.credits,
            wcoin: bal.wcoin,
          };
        });

        const filtered = query ? list.filter((item) => item.username.toLowerCase().includes(query)) : list;
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, users: filtered.slice(0, 15) }));
      });

      // 14. Admin Grant Balance API
      server.middlewares.use("/api/admin/grant-balance", (req: any, res: any) => {
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("Content-Type", "application/json");

        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: "Method Not Allowed. Use POST." }));
          return;
        }

        let body = "";
        req.on("data", (chunk: Buffer) => {
          body += chunk.toString("utf-8");
        });
        req.on("end", () => {
          try {
            const data = JSON.parse(body || "{}");
            const adminUser = (data.adminUser || "").toString().trim().toLowerCase();
            const targetUser = (data.targetUser || "").toString().trim();
            const creditsToAdd = Math.max(0, parseInt(data.credits, 10) || 0);
            const wcoinToAdd = Math.max(0, parseInt(data.wcoin, 10) || 0);
            const note = (data.note || "GM Manual Reward").toString().trim();

            if (adminUser !== "admin") {
              res.statusCode = 403;
              res.end(JSON.stringify({ error: "Permission denied. Only Administrator can grant balance." }));
              return;
            }

            if (!targetUser) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: "Target user is required." }));
              return;
            }

            if (creditsToAdd === 0 && wcoinToAdd === 0) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: "Must specify credits or WCoin greater than zero." }));
              return;
            }

            const lowerTarget = targetUser.toLowerCase();
            if (!accountBalances.has(lowerTarget)) {
              accountBalances.set(lowerTarget, { credits: 250, wcoin: 100, onlineHours: 50 });
            }

            const current = accountBalances.get(lowerTarget)!;
            current.credits += creditsToAdd;
            current.wcoin += wcoinToAdd;

            res.statusCode = 200;
            res.end(
              JSON.stringify({
                success: true,
                message: `Granted +${creditsToAdd} Credits and +${wcoinToAdd} WCoin to ${targetUser}!`,
                targetUser,
                addedCredits: creditsToAdd,
                addedWcoin: wcoinToAdd,
                newCredits: current.credits,
                newWcoin: current.wcoin,
                note,
              })
            );
          } catch {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: "Invalid JSON payload." }));
          }
        });
      });

      // 15. Player Top-up / Donation API
      server.middlewares.use("/api/topup/donate", (req: any, res: any) => {
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("Content-Type", "application/json");

        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: "Method Not Allowed. Use POST." }));
          return;
        }

        let body = "";
        req.on("data", (chunk: Buffer) => {
          body += chunk.toString("utf-8");
        });
        req.on("end", () => {
          try {
            const data = JSON.parse(body || "{}");
            const rawUser = (data.username || "").toString().trim();
            const packageId = (data.packageId || "").toString().trim();
            const channel = (data.channel || "truemoney").toString().trim();

            if (!rawUser) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: "Username is required." }));
              return;
            }

            const packageRewards: Record<string, { credits: number; wcoin: number; thb: number }> = {
              "tier-50": { credits: 275, wcoin: 60, thb: 50 },
              "tier-150": { credits: 920, wcoin: 250, thb: 150 },
              "tier-300": { credits: 2160, wcoin: 650, thb: 300 },
              "tier-500": { credits: 4000, wcoin: 1350, thb: 500 },
              "tier-1000": { credits: 9450, wcoin: 3500, thb: 1000 },
            };

            const selected = packageRewards[packageId] || packageRewards["tier-50"];
            const lowerUser = rawUser.toLowerCase();

            if (!accountBalances.has(lowerUser)) {
              accountBalances.set(lowerUser, { credits: 250, wcoin: 100, onlineHours: 50 });
            }

            const bal = accountBalances.get(lowerUser)!;
            bal.credits += selected.credits;
            bal.wcoin += selected.wcoin;

            const txnId = `TXN-${Date.now().toString(36).toUpperCase()}`;

            res.statusCode = 200;
            res.end(
              JSON.stringify({
                success: true,
                txnId,
                message: `Payment confirmed via ${channel.toUpperCase()}! Added ${selected.credits} Credits and ${selected.wcoin} WCoin.`,
                username: rawUser,
                packageId,
                channel,
                addedCredits: selected.credits,
                addedWcoin: selected.wcoin,
                newCredits: bal.credits,
                newWcoin: bal.wcoin,
                price: selected.thb,
              })
            );
          } catch {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: "Invalid JSON payload." }));
          }
        });
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), openMuDevApiPlugin()],
  server: {
    host: "0.0.0.0",
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
