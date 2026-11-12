import {vitestBaseConfig} from "@gunsmith/shared/config/vitest.base.js";
import {defineConfig} from "vitest/config";

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
  },
});
