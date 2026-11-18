import {vitestBaseConfig} from "@gunsmith/shared/config/vitest.base.js";
import {defineConfig} from "vitest/config";

// `pnpm test` (inside `pnpm checks`): unit tests for `src/`, including `src/evals/` (the evaluators, the DSL and the mapping). The
// evals themselves are `*.eval.ts`, run only by `vitest.evals.config.ts`, because they call a model.
export default defineConfig({
  ...vitestBaseConfig,
  resolve: {tsconfigPaths: true},
  test: {
    ...vitestBaseConfig.test,
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
