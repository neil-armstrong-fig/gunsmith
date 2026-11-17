import {vitestBaseConfig} from "@gunsmith/shared/config/vitest.base.js";
import {defineConfig} from "vitest/config";

/**
 * Plain node, as janggi's API: `@cloudflare/vitest-pool-workers` peers on vitest 4 and this workspace is on 5. What the Worker
 * decides is kept in plain functions and classes that take a `Request` or a value, so they run under node's own Web-standard
 * `Request`, `Response` and `crypto`. `ApiWorker.ts` and `match/Match.ts` are the only files that touch the Workers runtime:
 * keep them to wiring, and they are not unit tested.
 */
export default defineConfig({
  ...vitestBaseConfig,
  resolve: {tsconfigPaths: true},
  test: {...vitestBaseConfig.test, environment: "node"},
});
