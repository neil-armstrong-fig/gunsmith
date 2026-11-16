import {defineConfig} from "vitest/config";
import {vitestBaseConfig} from "./config/vitest.base.js";

export default defineConfig({
  ...vitestBaseConfig,
  test: {...vitestBaseConfig.test, include: ["src/**/*.test.ts", "config/**/*.test.{js,ts}"]},
});
