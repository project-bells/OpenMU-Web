import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function openMuDevApiPlugin() {
  const registeredAccounts = new Set(["admin", "test", "muonline"]);
  const ipRateMap = new Map<string, { count: number; resetTime: number }>();
  const MAX_BODY_BYTES = 10 * 1024; // 10KB limit

  return {
    name: "openmu-dev-api",
    configureServer(server: any) {
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
              res.end(JSON.stringify({ error: `Account '${rawUser}' already exists in OpenMU database.` }));
              return;
            }

            registeredAccounts.add(lowerUser);
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                success: true,
                message: "Account created successfully in OpenMU database!",
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
  plugins: [react(), tailwindcss(), viteSingleFile(), openMuDevApiPlugin()],
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
