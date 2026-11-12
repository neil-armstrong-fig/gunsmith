import {defineConfig, devices} from "@playwright/test";

/** Which deployment the acceptance tests drive: a URL, nothing more. The scripts set it. */
const webappUrl = process.env["WEBAPP_URL"] ?? "http://localhost:3000";

const isCi = !!process.env["CI"];

export default defineConfig({
  testDir: "./src/tests",
  outputDir: "./test-results",
  fullyParallel: true,
  forbidOnly: isCi,
  retries: isCi ? 2 : 0,
  workers: isCi ? 2 : undefined,
  reporter: isCi ? [["github"], ["html", {open: "never"}]] : [["list"]],
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  use: {
    baseURL: webappUrl,
    actionTimeout: 5_000,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  // Desktop only: gunsmith is a desktop game.
  projects: [{name: "desktop", use: {...devices["Desktop Chrome"]}}],
});
