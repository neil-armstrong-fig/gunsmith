import {PROPERTY_TESTS} from "./vitest.config";
import {vitestBaseConfig} from "@gunsmith/shared/config/vitest.base.js";
import {defineConfig} from "vitest/config";

/**
 * The property tests only (`vitest.config.ts` runs everything except these). `PROPERTY_TEST_RUNS` sets how many random inputs each
 * property is put through; the default suits a laptop and a scheduled run turns it up.
 */
export default defineConfig({
  ...vitestBaseConfig,
  resolve: {tsconfigPaths: true},
  test: {...vitestBaseConfig.test, environment: "node", include: PROPERTY_TESTS, testTimeout: 60_000},
});
