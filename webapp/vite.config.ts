import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import {defineConfig} from "vite";

export default defineConfig({
  server: {
    port: 3000,
    strictPort: true,
  },
  preview: {
    port: 3000,
    strictPort: true,
  },
  build: {
    outDir: "build",
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [react(), tailwindcss()],
});
