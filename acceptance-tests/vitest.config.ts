import {vitestBaseConfig} from "@gunsmith/shared/config/vitest.base.js";
import {defineConfig} from "vitest/config";

/** Unit tests for the DSL itself. The acceptance specs under `src/tests` are excluded. */
export default defineConfig({
  ...vitestBaseConfig,
  resolve: {tsconfigPaths: true},
  test: {
    ...vitestBaseConfig.test,
    include: ["src/**/*.test.{ts,tsx}", "playwright.config.test.ts"],
    exclude: ["**/node_modules/**", "src/tests/**"],
  },
});
