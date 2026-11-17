import type {PlaywrightTestConfig} from "@playwright/test";
import {defineConfig, devices} from "@playwright/test";

const previewAcceptance = process.env["PREVIEW_ACCEPTANCE"] === "1";
const webappUrl = webappAddress();

const isCi = !!process.env["CI"];

export default defineConfig({
  webServer: previewServer(),
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

function webappAddress(): string {
  if (!previewAcceptance) return process.env["WEBAPP_URL"] ?? "http://localhost:3000";

  const port = Number(process.env["PREVIEW_PORT"] ?? 3107);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PREVIEW_PORT must be an integer from 1 to 65535");
  }

  return `http://127.0.0.1:${port}`;
}

function previewServer(): PlaywrightTestConfig["webServer"] {
  if (!previewAcceptance) return undefined;

  const port = new URL(webappUrl).port || "80";
  return {
    command: `pnpm --filter @gunsmith/webapp preview --host 127.0.0.1 --port ${port} --strictPort`,
    url: webappUrl,
    reuseExistingServer: false,
    timeout: 60_000,
    gracefulShutdown: {signal: "SIGTERM", timeout: 5_000},
    stdout: "pipe",
    stderr: "pipe",
  };
}
