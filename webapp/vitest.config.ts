import {vitestBaseConfig} from "@gunsmith/shared/config/vitest.base.js";
import {configDefaults, defineConfig} from "vitest/config";

/**
 * The property tests, which `pnpm test` (and so `pnpm checks`) deliberately leaves out, as the engine's are: a fresh seed each run means a
 * failure is not reproducible from the same commit. They run through `vitest.properties.config.ts` (`pnpm test:properties`). Listed by path.
 */
export const PROPERTY_TESTS = ["src/online/property-tests/*Invariants.test.ts"];

/**
 * **node, not jsdom.** Building a DOM is the most expensive thing a run does and almost nothing here needs one:
 * reducers, selectors and pure functions are plain. Components are covered by the acceptance specs, not unit tests.
 */
export default defineConfig({
  ...vitestBaseConfig,
  resolve: {tsconfigPaths: true},
  test: {
    ...vitestBaseConfig.test,
    environment: "node",
    exclude: [...configDefaults.exclude, ...PROPERTY_TESTS],
  },
});
