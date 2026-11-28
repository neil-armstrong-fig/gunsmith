import {vitestBaseConfig} from "@gunsmith/shared/config/vitest.base.js";
import {configDefaults, defineConfig} from "vitest/config";

/**
 * The property tests, which `pnpm test` (and so `pnpm checks`) deliberately leaves out, as the engine's are: a fresh seed each run means a
 * failure is not reproducible from the same commit. They run through `vitest.properties.config.ts` (`pnpm test:properties`). Listed by path.
 */
export const PROPERTY_TESTS = [
  "src/durable-objects/*/property-tests/**/*Invariants.test.ts",
  "src/router/routes/*/property-tests/**/*Invariants.test.ts",
];

/** `cloudflare:workers` is the Workers runtime's own module: in a test it is a stub whose `env` the tests fill (`src/shared/env/testing/`). */
export const API_RESOLVE = {
  tsconfigPaths: true,
  alias: {"cloudflare:workers": `${import.meta.dirname}/src/shared/env/testing/CloudflareWorkersStub.ts`},
};

/** What runs before every test file: clears the Worker's bindings, installs the mocks (`src/shared/testing/SetupApiTests.ts`). */
export const API_SETUP_FILES = ["./src/shared/testing/SetupApiTests.ts"];

/**
 * Plain node, as janggi's API: `@cloudflare/vitest-pool-workers` peers on vitest 4 and this workspace is on 5. What the Worker
 * decides is kept in plain functions and classes that take a `Request` or a value, so they run under node's own Web-standard
 * `Request`, `Response` and `crypto`. `ApiWorker.ts` and `durable-objects/match/Match.ts` are the only files that touch the Workers runtime:
 * keep them to wiring, and they are not unit tested.
 */
export default defineConfig({
  ...vitestBaseConfig,
  resolve: API_RESOLVE,
  test: {
    ...vitestBaseConfig.test,
    environment: "node",
    setupFiles: API_SETUP_FILES,
    exclude: [...configDefaults.exclude, ...PROPERTY_TESTS],
  },
});
