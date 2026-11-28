import {defineConfig, devices} from "@playwright/test";
import {configurePreview} from "@src/configuration/preview/ConfigurePreview";
import {runnerOptions} from "@src/configuration/runner/RunnerOptions";

const preview = configurePreview(process.env);
// Desktop only: gunsmith is a desktop game.
const DESKTOP = {...devices["Desktop Chrome"]};
// The online specs each run two or three browsers against the Worker and measure timing, and a full local run starved them of frames
// (2026-11-28: the smoothness spec drew too few to judge). Their own project caps them, and every other spec runs beside them.
const ONLINE_SPECS = /[\\/]tests[\\/]online[\\/]/;
const ONLINE_WORKERS = 3;

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
  projects: [
    {name: "desktop", testIgnore: ONLINE_SPECS, use: DESKTOP},
    {name: "online", testMatch: ONLINE_SPECS, workers: ONLINE_WORKERS, use: DESKTOP},
  ],
});
