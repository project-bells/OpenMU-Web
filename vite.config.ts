import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function openMuDevApiPlugin() {
  const registeredAccounts = new Set(["admin", "test", "muonline"]);
  const ipRateMap = new Map<string, { count: number; resetTime: number }>();
  const MAX_BODY_BYTES = 10 * 1024; // 10KB limit

  // In-memory Character & Guild Database for OpenMU Dev Server
  const charactersDb = [
    { rank: 1, name: "xX_Khaos_Xx", classId: "dk", className: "Blade Master", classShort: "DK", level: 400, masterLevel: 250, resets: 98, grandResets: 4, guild: "VENDETTA", isOnline: true },
    { rank: 2, name: "SoulReaper", classId: "dw", className: "Grand Master", classShort: "DW", level: 400, masterLevel: 245, resets: 95, grandResets: 4, guild: "VENDETTA", isOnline: true },
    { rank: 3, name: "QueenElf", classId: "elf", className: "High Elf", classShort: "ELF", level: 400, masterLevel: 240, resets: 93, grandResets: 3, guild: "IronGuard", isOnline: true },
    { rank: 4, name: "LordViper", classId: "dl", className: "Lord Emperor", classShort: "DL", level: 400, masterLevel: 238, resets: 91, grandResets: 3, guild: "VENDETTA", isOnline: false },
    { rank: 5, name: "ComboMaster", classId: "dk", className: "Blade Master", classShort: "DK", level: 400, masterLevel: 230, resets: 89, grandResets: 3, guild: "Nemesis", isOnline: true },
    { rank: 6, name: "StormBringer", classId: "mg", className: "Duel Master", classShort: "MG", level: 400, masterLevel: 228, resets: 87, grandResets: 3, guild: "Immortals", isOnline: false },
    { rank: 7, name: "DarkIllusion", classId: "dw", className: "Grand Master", classShort: "DW", level: 400, masterLevel: 225, resets: 86, grandResets: 2, guild: "OldSchool", isOnline: true },
    { rank: 8, name: "FistOfDoom", classId: "rf", className: "Fist Master", classShort: "RF", level: 400, masterLevel: 220, resets: 84, grandResets: 2, guild: "Nemesis", isOnline: true },
    { rank: 9, name: "BloodCurse", classId: "sum", className: "Dimension Master", classShort: "SUM", level: 400, masterLevel: 218, resets: 82, grandResets: 2, guild: "IronGuard", isOnline: false },
    { rank: 10, name: "ArchangelDK", classId: "dk", className: "Blade Master", classShort: "DK", level: 400, masterLevel: 215, resets: 80, grandResets: 2, guild: "Phoenix", isOnline: true },
    { rank: 11, name: "LunarGoddess", classId: "elf", className: "High Elf", classShort: "ELF", level: 400, masterLevel: 210, resets: 79, grandResets: 2, guild: "OldSchool", isOnline: true },
    { rank: 12, name: "TitanLord", classId: "dl", className: "Lord Emperor", classShort: "DL", level: 400, masterLevel: 205, resets: 77, grandResets: 2, guild: "Immortals", isOnline: false },
    { rank: 13, name: "NovaIgnite", classId: "dw", className: "Grand Master", classShort: "DW", level: 400, masterLevel: 200, resets: 75, grandResets: 1, guild: "Phoenix", isOnline: true },
    { rank: 14, name: "BladeStorm", classId: "mg", className: "Duel Master", classShort: "MG", level: 400, masterLevel: 198, resets: 74, grandResets: 1, guild: "AfterLife", isOnline: false },
    { rank: 15, name: "IronKnuckle", classId: "rf", className: "Fist Master", classShort: "RF", level: 400, masterLevel: 195, resets: 72, grandResets: 1, guild: "Reborn", isOnline: true },
    { rank: 16, name: "HexWeaver", classId: "sum", className: "Dimension Master", classShort: "SUM", level: 400, masterLevel: 190, resets: 70, grandResets: 1, guild: "AfterLife", isOnline: false },
    { rank: 17, name: "DragonSlayer", classId: "dk", className: "Blade Master", classShort: "DK", level: 400, masterLevel: 185, resets: 68, grandResets: 1, guild: "Genesis", isOnline: true },
    { rank: 18, name: "StarGazer", classId: "elf", className: "High Elf", classShort: "ELF", level: 400, masterLevel: 180, resets: 66, grandResets: 1, guild: "DragonHeart", isOnline: true },
    { rank: 19, name: "AbyssWalker", classId: "dl", className: "Lord Emperor", classShort: "DL", level: 400, masterLevel: 175, resets: 65, grandResets: 1, guild: "Genesis", isOnline: false },
    { rank: 20, name: "ThunderSlash", classId: "mg", className: "Duel Master", classShort: "MG", level: 400, masterLevel: 170, resets: 63, grandResets: 1, guild: "DragonHeart", isOnline: true },
  ];

  const guildsDb = [
    { rank: 1, name: "VENDETTA", master: "LordViper", score: 58420, totalResets: 1480, members: "39/40", siegeStatus: "Castle Lord" },
    { rank: 2, name: "IronGuard", master: "QueenElf", score: 51200, totalResets: 1290, members: "38/40", siegeStatus: "Challenger" },
    { rank: 3, name: "Nemesis", master: "ComboMaster", score: 47800, totalResets: 1180, members: "40/40", siegeStatus: "Challenger" },
    { rank: 4, name: "Immortals", master: "StormBringer", score: 42300, totalResets: 1040, members: "37/40", siegeStatus: "Alliance" },
    { rank: 5, name: "OldSchool", master: "DarkIllusion", score: 38900, totalResets: 960, members: "36/40", siegeStatus: "Alliance" },
    { rank: 6, name: "Phoenix", master: "ArchangelDK", score: 35100, totalResets: 890, members: "35/40", siegeStatus: "Alliance" },
    { rank: 7, name: "AfterLife", master: "BladeStorm", score: 31400, totalResets: 810, members: "34/40", siegeStatus: "Alliance" },
    { rank: 8, name: "Reborn", master: "IronKnuckle", score: 28600, totalResets: 740, members: "32/40", siegeStatus: "Alliance" },
    { rank: 9, name: "Genesis", master: "DragonSlayer", score: 25400, totalResets: 690, members: "30/40", siegeStatus: "Alliance" },
    { rank: 10, name: "DragonHeart", master: "StarGazer", score: 22100, totalResets: 620, members: "28/40", siegeStatus: "Alliance" },
  ];

  return {
    name: "openmu-dev-api",
    configureServer(server: any) {
      // 1. Live Server Status API
      server.middlewares.use("/api/server/status", (_req: any, res: any) => {
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Cache-Control", "no-cache");

        const now = new Date();
        const utc7Time = new Intl.DateTimeFormat("en-GB", {
          timeZone: "Asia/Bangkok",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }).format(now);

        const data = {
          serverName: "MuOrigins S6E3",
          version: "Season 6 Episode 3",
          status: "ONLINE",
          onlineCount: 4892,
          serverTime: `${utc7Time} (UTC+7 Bangkok)`,
          uptime: "99.98%",
          antiCheat: "MHP GameGuard 100% Active",
          totalAccounts: 28420 + registeredAccounts.size,
          realms: [
            { name: "Origins-1 (PvP & Market)", loadPct: 86, online: 2420, max: 2500, status: "Normal" },
            { name: "Origins-2 (Non-PvP)", loadPct: 62, online: 1680, max: 2500, status: "Normal" },
            { name: "Origins-3 (Sub-Server)", loadPct: 41, online: 792, max: 2000, status: "Normal" },
          ],
          onlineExchange: {
            creditsPerHour: 10,
            creditToWcoinRatio: 0.5, // 100 credits = 50 WCoin
            ratioDescription: "100 Credits = 50 WCoin",
            minExchange: 100,
            status: "ACTIVE",
          },
        };

        res.statusCode = 200;
        res.end(JSON.stringify(data));
      });

      // 2. Rankings Characters API
      server.middlewares.use("/api/rankings/characters", (req: any, res: any) => {
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Cache-Control", "no-cache");

        const url = new URL(req.url, "http://localhost");
        const query = (url.searchParams.get("search") || "").toLowerCase();
        const classFilter = url.searchParams.get("class") || "ALL";

        let filtered = charactersDb.filter((c) => {
          const matchQuery = !query || c.name.toLowerCase().includes(query) || c.guild.toLowerCase().includes(query);
          const matchClass = classFilter === "ALL" || c.classShort === classFilter;
          return matchQuery && matchClass;
        });

        res.statusCode = 200;
        res.end(JSON.stringify({ total: filtered.length, characters: filtered }));
      });

      // 3. Rankings Guilds API
      server.middlewares.use("/api/rankings/guilds", (req: any, res: any) => {
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Cache-Control", "no-cache");

        const url = new URL(req.url, "http://localhost");
        const query = (url.searchParams.get("search") || "").toLowerCase();

        let filtered = guildsDb.filter((g) => {
          return !query || g.name.toLowerCase().includes(query) || g.master.toLowerCase().includes(query);
        });

        res.statusCode = 200;
        res.end(JSON.stringify({ total: filtered.length, guilds: filtered }));
      });

      // 4. Online-to-Credit & WCoin Exchange System API
      server.middlewares.use("/api/rewards/online-exchange", (req: any, res: any) => {
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("Content-Type", "application/json");

        if (req.method === "POST") {
          let body = "";
          req.on("data", (chunk: Buffer) => { body += chunk.toString("utf-8"); });
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

              res.statusCode = 200;
              res.end(JSON.stringify({
                success: true,
                account,
                deductedCredits: credits,
                wcoinReceived,
                message: `Exchanged ${credits} Credits into ${wcoinReceived} WCoin successfully! Sent to in-game Cash Shop & Web Shop balance.`,
              }));
            } catch {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: "Invalid JSON payload." }));
            }
          });
          return;
        }

        res.statusCode = 200;
        res.end(JSON.stringify({
          enabled: true,
          creditsPerHour: 10,
          rateFormula: "1 Hour Online = 10 Credits",
          exchangeRate: "100 Credits = 50 WCoin",
          minExchangeCredits: 100,
          webShopUrl: "https://webshop.muorigins.online",
          stats: {
            totalCreditsDistributed: 845200,
            totalWcoinExchanged: 395100,
            activeMiners: 3870,
          },
        }));
      });

      // 5. Account Registration API
      server.middlewares.use("/api/account/register", (req: any, res: any) => {
        // Enforce Security Headers
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");

        if (req.method !== "POST") {
          res.statusCode = 405;
          res.setHeader("Allow", "POST");
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "Method Not Allowed. Use POST." }));
          return;
        }

        // Basic sliding window rate limiting: 20 requests per minute per IP
        const clientIp = req.headers["x-forwarded-for"]?.toString().split(",")[0].trim() || req.socket.remoteAddress || "127.0.0.1";
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

            // Strict Server-Side Validation
            if (!rawUser || rawUser.length < 4 || rawUser.length > 10 || !/^[a-zA-Z0-9]+$/.test(rawUser)) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Username must be 4-10 alphanumeric characters." }));
              return;
            }

            if (!rawPass || rawPass.length < 8 || rawPass.length > 64) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Password must be between 8 and 64 characters." }));
              return;
            }

            const rawPersonalCode = (data.personalCode || data.securityCode || "").toString().trim();

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
