import {vitestBaseConfig} from "@gunsmith/shared/config/vitest.base.js";
import {defineConfig} from "vitest/config";

// `pnpm evals:local`, `pnpm evals:paid`: the evals. They call a model, so `pnpm checks` leaves them out.
// LangSmith tracking is off unless `EVAL_TRACK=1`, because eval traces count against the free plan's 5,000 a month.
export default defineConfig({
  ...vitestBaseConfig,
  resolve: {tsconfigPaths: true},
  test: {
    ...vitestBaseConfig.test,
    include: ["src/evals/**/*.eval.ts"],
    // The report is the point: every `then` on its own line under its `given` and `when`, pass or fail.
    reporters: ["tree"],
    environment: "node",
    testTimeout: 180_000,
    // A `when` calls the model in a `beforeAll`: up to three trials of up to three calls each, and the first call may have to
    // load the model. Vitest's default hook timeout is 10 s, and a timed-out `beforeAll` skips every `then` beneath it.
    hookTimeout: 180_000,
    // One spec file at a time: they share one local model, and each writes its own results file.
    fileParallelism: false,
    env: {LANGSMITH_TEST_TRACKING: process.env.EVAL_TRACK === "1" ? "true" : "false"},
  },
});
