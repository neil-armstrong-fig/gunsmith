import {PROPERTY_TESTS} from "./vitest.config";
import {vitestBaseConfig} from "@gunsmith/shared/config/vitest.base.js";
import {defineConfig} from "vitest/config";

/**
 * The property tests only. `vitest.config.ts` runs everything except these, so between the two every test file is covered
 * exactly once.
 *
 * `PROPERTY_TEST_RUNS` sets how many random inputs each property is put through. The default suits a laptop; a scheduled
 * run turns it up, because the whole value of one is that it explores seeds nobody has tried.
 */
export default defineConfig({
  ...vitestBaseConfig,
  test: {...vitestBaseConfig.test, include: PROPERTY_TESTS, testTimeout: 60_000},
});
