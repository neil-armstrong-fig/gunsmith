import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import {defineConfig} from "vite";

// In production one Worker serves the site and `/api/*` from the same origin. Here the page is static, so the dev server and the
// preview pass `/api` (and its WebSockets) to `api/`'s local Worker (`pnpm api:dev`, port 8787), as flash-cards' dev server does.
// `API_URL` points it at another port, so a session can run its own Worker beside another's.
const api = {"/api": {target: process.env["API_URL"] ?? "http://localhost:8787", ws: true, changeOrigin: true}};

export default defineConfig({
  server: {
    port: 3000,
    strictPort: true,
    proxy: api,
  },
  preview: {
    port: 3000,
    strictPort: true,
    proxy: api,
  },
  build: {
    outDir: "build",
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [react(), tailwindcss()],
});
