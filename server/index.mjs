import { createServer } from "node:http";
import { existsSync } from "node:fs";
import { createHandler, loadConfig } from "./app.mjs";

if (typeof process.loadEnvFile === "function" && existsSync(".env")) {
  try {
    process.loadEnvFile(".env");
  } catch {
    // ignore if unreadable
  }
}

try {
  const config = loadConfig();
  const server = createServer(createHandler(config));
  server.requestTimeout = 15_000;
  server.headersTimeout = 20_000;
  server.listen(config.port, "0.0.0.0", () => console.log(`OpenMU Web listening on port ${config.port}`));
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
