import {afterEach, beforeEach, expect, it, vi} from "vitest";

beforeEach(() => {
  vi.resetModules();
  for (const key of ["API_URL", "PREVIEW_API_MODE", "PREVIEW_PORT", "PREVIEW_API_PORT", "WEBAPP_URL", "CI"]) {
    vi.stubEnv(key, undefined);
  }
  vi.stubEnv("PREVIEW_ACCEPTANCE", "1");
});

afterEach(() => vi.unstubAllEnvs());

it("manages an isolated Worker before the production preview", async () => {
  const {default: config} = await import("./playwright.config");
  expect(config.webServer).toMatchObject([
    {port: 8788, reuseExistingServer: false},
    {url: "http://127.0.0.1:3107", env: {API_URL: "http://127.0.0.1:8788"}, reuseExistingServer: false},
  ]);
});

it("starts the managed Worker for local use, so it trusts the pages the preview serves", async () => {
  vi.stubEnv("PREVIEW_API_PORT", "9587");
  const {default: config} = await import("./playwright.config");
  expect(config.webServer).toMatchObject([{command: expect.stringContaining("--var ALLOW_LOOPBACK_ORIGINS:true")}, {}]);
});

it("proxies to an explicit API without starting a Worker", async () => {
  vi.stubEnv("API_URL", "https://api.example.com");
  const {default: config} = await import("./playwright.config");
  expect(config.webServer).toMatchObject([{env: {API_URL: "https://api.example.com"}}]);
  expect(config.webServer).toHaveLength(1);
});

it("forces local mode despite an inherited API URL", async () => {
  vi.stubEnv("API_URL", "https://api.example.com");
  vi.stubEnv("PREVIEW_API_MODE", "local");
  vi.stubEnv("PREVIEW_API_PORT", "9587");
  const {default: config} = await import("./playwright.config");
  expect(config.webServer).toMatchObject([{port: 9587}, {env: {API_URL: "http://127.0.0.1:9587"}}]);
});

it.each([
  ["PREVIEW_API_MODE", "external", "API_URL"],
  ["PREVIEW_API_MODE", "other", "PREVIEW_API_MODE"],
  ["API_URL", "garbage", "API_URL"],
  ["API_URL", "ftp://api.example.com", "API_URL"],
  ["API_URL", "https://api.example.com/path", "API_URL"],
  ["PREVIEW_API_PORT", "0", "PREVIEW_API_PORT"],
  ["PREVIEW_API_PORT", "65536", "PREVIEW_API_PORT"],
  ["PREVIEW_API_PORT", "3107", "different"],
  ["PREVIEW_PORT", "1.5", "PREVIEW_PORT"],
])("rejects invalid %s=%s", async (key, value, message) => {
  vi.stubEnv(key, value);
  await expect(import("./playwright.config")).rejects.toThrow(message);
});

it("leaves externally served acceptance unmanaged", async () => {
  vi.stubEnv("PREVIEW_ACCEPTANCE", undefined);
  vi.stubEnv("WEBAPP_URL", "https://game.example.com");
  const {default: config} = await import("./playwright.config");
  expect(config.webServer).toBeUndefined();
  expect(config.use?.baseURL).toBe("https://game.example.com");
});

it("preserves explicit HTTP default ports in Worker startup", async () => {
  vi.stubEnv("PREVIEW_API_PORT", "80");
  const {default: config} = await import("./playwright.config");
  expect(config.webServer).toMatchObject([{port: 80}, {}]);
});

it("uses deterministic CI runner limits and reporting", async () => {
  vi.stubEnv("CI", "1");
  const {default: config} = await import("./playwright.config");
  expect(config).toMatchObject({
    forbidOnly: true,
    retries: 2,
    workers: 2,
    reporter: [["github"], ["html", {open: "never"}]],
  });
});

it("runs the online specs as a project of their own, a few at a time, and every other spec on the desktop", async () => {
  const {default: config} = await import("./playwright.config");
  const [desktop, online] = config.projects ?? [];
  expect(desktop).toMatchObject({name: "desktop", testIgnore: /online/});
  expect(online).toMatchObject({name: "online", testMatch: /online/, workers: 3});
  expect(online?.use).toEqual(desktop?.use);
});

it("keeps interactive runner defaults outside CI", async () => {
  const {default: config} = await import("./playwright.config");
  expect(config).toMatchObject({testDir: "./src/tests", forbidOnly: false, retries: 0, reporter: [["list"]]});
  expect(config.workers).toBeUndefined();
});
