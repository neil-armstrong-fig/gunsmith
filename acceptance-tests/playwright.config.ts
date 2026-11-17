import {defineConfig, devices} from "@playwright/test";
import {configurePreview} from "@src/configuration/preview/ConfigurePreview";
import {runnerOptions} from "@src/configuration/runner/RunnerOptions";

const preview = configurePreview(process.env);

export default defineConfig({
  ...runnerOptions(Boolean(process.env["CI"])),
  webServer: preview.webServers,
  testDir: "./src/tests",
  outputDir: "./test-results",
  fullyParallel: true,
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  use: {
    baseURL: preview.webappUrl,
    actionTimeout: 5_000,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  // Desktop only: gunsmith is a desktop game.
  projects: [{name: "desktop", use: {...devices["Desktop Chrome"]}}],
});
