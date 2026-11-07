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

  return {
    name: "openmu-dev-api",
    configureServer(server: any) {
      // 1. Live Server Status API (proxied to server gateway)
      server.middlewares.use("/api/server/status", async (req: any, res: any) => {
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Cache-Control", "no-cache");

        const targetBase = process.env.OPENMU_GATEWAY_URL || "http://127.0.0.1:8080";
        try {
          const upstreamRes = await fetch(`${targetBase}${req.originalUrl || req.url}`);
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
          serverName: "MuOrigins S6E3",
          version: "Season 6 Episode 3",
          status: "ONLINE",
          onlineCount: 0,
          serverTime: `${utc7Time} (UTC+7 Bangkok)`,
          uptime: "0h 0m",
          antiCheat: "Origins GameGuard 100% Active",
          totalAccounts: registeredAccounts.size,
          realms: [],
          onlineExchange: {
            creditsPerHour: 10,
            creditToWcoinRatio: 0.5,
            ratioDescription: "100 Credits = 50 WCoin",
            minExchange: 100,
            status: "ACTIVE",
          },
        };

        res.statusCode = 200;
        res.end(JSON.stringify(data));
      });

      // 2. Rankings Characters API (proxied to server database only)
      server.middlewares.use("/api/rankings/characters", async (req: any, res: any) => {
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Cache-Control", "no-cache");

        const targetBase = process.env.OPENMU_GATEWAY_URL || "http://127.0.0.1:8080";
        try {
          const upstreamRes = await fetch(`${targetBase}${req.originalUrl || req.url}`);
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

      // 3. Rankings Guilds API (proxied to server database only)
      server.middlewares.use("/api/rankings/guilds", async (req: any, res: any) => {
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Cache-Control", "no-cache");

        const targetBase = process.env.OPENMU_GATEWAY_URL || "http://127.0.0.1:8080";
        try {
          const upstreamRes = await fetch(`${targetBase}${req.originalUrl || req.url}`);
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
