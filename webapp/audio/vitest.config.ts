import {vitestBaseConfig} from "@gunsmith/shared/config/vitest.base.js";
import {defineConfig, mergeConfig} from "vitest/config";

/**
 * The audio tools' tests render sound with a native addon (`node-web-audio-api`) and start `ffmpeg` and browsers, so they
 * run in child processes, not worker threads, and a render may take longer than vitest's five seconds.
 */
export default defineConfig(
  mergeConfig(vitestBaseConfig, {
    test: {
      include: ["generator-scripts/**/*.test.ts"],
      pool: "forks",
      testTimeout: 120_000,
      hookTimeout: 120_000,
    },
  }),
);
