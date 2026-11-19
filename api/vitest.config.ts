import {vitestBaseConfig} from "@gunsmith/shared/config/vitest.base.js";
import {configDefaults, defineConfig} from "vitest/config";

/**
 * The property tests, which `pnpm test` (and so `pnpm checks`) deliberately leaves out, as the engine's are: a fresh seed each run means a
 * failure is not reproducible from the same commit. They run through `vitest.properties.config.ts` (`pnpm test:properties`). Listed by path.
 */
export const PROPERTY_TESTS = [
  "src/match/property-tests/**/*Invariants.test.ts",
  "src/generation/property-tests/**/*Invariants.test.ts",
];

/**
 * Plain node, as janggi's API: `@cloudflare/vitest-pool-workers` peers on vitest 4 and this workspace is on 5. What the Worker
 * decides is kept in plain functions and classes that take a `Request` or a value, so they run under node's own Web-standard
 * `Request`, `Response` and `crypto`. `ApiWorker.ts` and `match/Match.ts` are the only files that touch the Workers runtime:
 * keep them to wiring, and they are not unit tested.
 */
export default defineConfig({
  ...vitestBaseConfig,
  resolve: {tsconfigPaths: true},
  test: {...vitestBaseConfig.test, environment: "node", exclude: [...configDefaults.exclude, ...PROPERTY_TESTS]},
});
