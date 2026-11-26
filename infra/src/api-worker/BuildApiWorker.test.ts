import {Scope} from "alchemy";
import * as cloudflare from "alchemy/cloudflare";
import {unstable_readConfig} from "wrangler";
import {buildApiDatabase} from "@src/api-database/BuildApiDatabase";
import {buildApiWorker} from "@src/api-worker/BuildApiWorker";
import {workspacePath} from "@src/paths/WorkspacePath";

vi.mock("alchemy/cloudflare", async importOriginal => ({
  ...(await importOriginal<typeof cloudflare>()),
  D1Database: vi.fn(),
  Worker: vi.fn(),
}));

vi.mock("@src/secrets/Secrets", () => ({
  secrets: {
    GOOGLE_OAUTH_CLIENT_ID: "fake-client",
    GOOGLE_OAUTH_CLIENT_SECRET: "fake-secret",
    ALERT_TO_ADDRESS: "alerts@example.com",
  },
}));

it("declares the API bindings and keeps the webapp assets off the API Worker", async () => {
  vi.stubEnv("SITE_ORIGIN", "https://gunsmith.example");
  vi.stubEnv("ACCOUNT_DIGEST_KEY", "test-account-digest");
  vi.stubEnv("ANTHROPIC_API_KEY", "test-anthropic-key");

  try {
    const scope = new Scope({scopeName: "test", stage: "test", phase: "up", parent: null, noTrack: true});
    vi.mocked(cloudflare.D1Database, {partial: true}).mockResolvedValue({id: "test-database"});
    vi.mocked(cloudflare.Worker, {partial: true}).mockImplementation(async () => {
      expect(Scope.current).toBe(scope);
      return {name: "gunsmith-api"};
    });

    const apiDatabase = await scope.run(buildApiDatabase);
    const apiWorker = await scope.run(() => buildApiWorker(apiDatabase));
    const manifest = unstable_readConfig({config: workspacePath("api/wrangler.jsonc")});

    expect(apiWorker.name).toBe(manifest.name);
    expect(manifest.triggers.crons).toEqual(["0 4 * * *"]);
    expect(cloudflare.Worker).toHaveBeenCalledExactlyOnceWith(
      "api",
      expect.objectContaining({
        name: manifest.name,
        entrypoint: manifest.main,
        compatibilityDate: manifest.compatibility_date,
        compatibilityFlags: manifest.compatibility_flags,
        url: false,
        crons: manifest.triggers.crons,
        bindings: {
          ACCOUNT_DIGEST_KEY: expect.objectContaining({type: "secret"}),
          ANTHROPIC_API_KEY: expect.objectContaining({type: "secret"}),
          DB: apiDatabase,
          MATCHES: expect.objectContaining({className: "Match", sqlite: true}),
          CREDITS: expect.objectContaining({className: "CreditLedger", sqlite: true}),
          SPEND: expect.objectContaining({className: "SpendLedger", sqlite: true}),
          LOGIN_LIMITER: {type: "ratelimit", namespace_id: 2001, simple: {limit: 10, period: 60}},
          ALERT_MAIL: {type: "send_email"},
          ALERT_FROM_ADDRESS: manifest.vars["ALERT_FROM_ADDRESS"],
          ALLOWED_ORIGINS: "https://gunsmith.example",
          ALERT_TO_ADDRESS: expect.objectContaining({type: "secret"}),
          GOOGLE_OAUTH_CLIENT_ID: expect.objectContaining({type: "secret"}),
          GOOGLE_OAUTH_CLIENT_SECRET: expect.objectContaining({type: "secret"}),
        },
      }),
    );
    expect(cloudflare.Worker).not.toHaveBeenCalledWith("api", expect.objectContaining({assets: expect.anything()}));
  } finally {
    vi.unstubAllEnvs();
  }
});

it("leaves the generation key off the API Worker when the deploy has none, so generation stays off", async () => {
  vi.stubEnv("SITE_ORIGIN", "https://gunsmith.example");
  vi.stubEnv("ANTHROPIC_API_KEY", " ");

  try {
    const scope = new Scope({scopeName: "test", stage: "test", phase: "up", parent: null, noTrack: true});
    vi.mocked(cloudflare.D1Database, {partial: true}).mockResolvedValue({id: "test-database"});
    vi.mocked(cloudflare.Worker, {partial: true}).mockResolvedValue({name: "gunsmith-api"});

    const apiDatabase = await scope.run(buildApiDatabase);
    await scope.run(() => buildApiWorker(apiDatabase));

    expect(cloudflare.Worker).toHaveBeenLastCalledWith(
      "api",
      expect.objectContaining({bindings: expect.not.objectContaining({ANTHROPIC_API_KEY: expect.anything()})}),
    );
  } finally {
    vi.unstubAllEnvs();
  }
});
