import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import {defineConfig} from "vite";

// The dev server and preview pass `/api` and WebSockets to `api/`'s local Worker (`pnpm api:dev`, port 8787).
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
