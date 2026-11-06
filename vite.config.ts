import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: "0.0.0.0",
      port: 3000,
      proxy: env.DEV_API_TARGET ? { "/api": { target: env.DEV_API_TARGET, changeOrigin: true } } : undefined,
    },
    resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  };
});
