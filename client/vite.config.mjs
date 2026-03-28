import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const hmrHost = env.VITE_HMR_HOST?.trim();
  const hmrClientPort = env.VITE_HMR_CLIENT_PORT
    ? Number(env.VITE_HMR_CLIENT_PORT)
    : undefined;

  return {
    plugins: [react()],
    server: {
      host: true,
      port: 5173,
      hmr: {
        host: hmrHost || undefined,
        protocol: env.VITE_HMR_PROTOCOL === "wss" ? "wss" : "ws",
        clientPort: Number.isFinite(hmrClientPort) ? hmrClientPort : undefined,
      },
    },
    build: {
      outDir: "dist",
    },
  };
});
