import {vitestBaseConfig} from "@gunsmith/shared/config/vitest.base.js";
import {defineConfig} from "vitest/config";

// `pnpm evals:local`, `pnpm evals:paid`: the evals. They call a model, so `pnpm checks` leaves them out.
// LangSmith tracking is off unless `EVAL_TRACK=1`, because eval traces count against the free plan's 5,000 a month.
export default defineConfig({
  ...vitestBaseConfig,
  resolve: {tsconfigPaths: true},
  test: {
    ...vitestBaseConfig.test,
    include: ["evals/**/*.eval.ts"],
    environment: "node",
    testTimeout: 180_000,
    env: {LANGSMITH_TEST_TRACKING: process.env.EVAL_TRACK === "1" ? "true" : "false"},
  },
});
