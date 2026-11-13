import http from "node:http";
import { loadConfig } from "./config.mjs";
import { PostgresStore } from "./db/postgresStore.mjs";
import { InMemoryWebStore } from "./db/inMemoryStore.mjs";
import { createHandler } from "./app.mjs";

try {
  process.loadEnvFile?.();
} catch {
  // Optional .env file may not exist when environment variables are injected externally.
}

const config = loadConfig();
const store = config.databaseUrl ? new PostgresStore(config.databaseUrl) : new InMemoryWebStore();

await store.init();

const { handler, walletService } = createHandler(config, { store });
const server = http.createServer(handler);

const reconcileInterval = setInterval(() => {
  walletService.reconcilePendingExchanges().catch((error) => {
    console.error("[reconcilePendingExchanges]", error?.message || error);
  });
}, 30_000);
reconcileInterval.unref();

server.listen(config.port, () => {
  console.log(
    `[OpenMU-Web BFF] Listening on http://0.0.0.0:${config.port} (env=${config.nodeEnv}, store=${
      config.databaseUrl ? "postgres" : "in-memory-dev"
    })`
  );
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, async () => {
    clearInterval(reconcileInterval);
    server.close();
    await store.close();
    process.exit(0);
  });
}
