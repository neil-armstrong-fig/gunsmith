import alchemy from "alchemy";
import {DurableObjectNamespace, EmailSender, RateLimit, Worker} from "alchemy/cloudflare";
import type {Bindings, D1Database} from "alchemy/cloudflare";
import {siteOrigin} from "@src/api-worker/site/SiteOrigin";
import {workspacePath} from "@src/paths/WorkspacePath";
import {secrets} from "@src/secrets/Secrets";

export async function buildApiWorker(apiDatabase: D1Database): ReturnType<typeof Worker> {
  const origin = siteOrigin();

  return Worker("api", {
    name: "gunsmith-api",
    cwd: workspacePath("api"),
    entrypoint: workspacePath("api/src/ApiWorker.ts"),
    compatibilityDate: "2026-11-01",
    compatibilityFlags: ["nodejs_compat"],
    crons: ["0 4 * * *"],
    adopt: true,
    url: false,
    previewSubdomains: false,
    observability: {
      enabled: true,
      logs: {enabled: true, invocationLogs: false},
      traces: {enabled: false},
    },
    bindings: {
      ...optionalSecret("ACCOUNT_DIGEST_KEY"),
      ...optionalSecret("ANTHROPIC_API_KEY"),
      DB: apiDatabase,
      MATCHES: DurableObjectNamespace("matches", {className: "Match", sqlite: true}),
      CREDITS: DurableObjectNamespace("credits", {className: "CreditLedger", sqlite: true}),
      SPEND: DurableObjectNamespace("spend", {className: "SpendLedger", sqlite: true}),
      LOGIN_LIMITER: RateLimit({namespace_id: 2001, simple: {limit: 10, period: 60}}),
      ALERT_MAIL: EmailSender(),
      ALERT_FROM_ADDRESS: "alerts@neilarmstrong.dev",
      ALERT_TO_ADDRESS: alchemy.secret(secrets.ALERT_TO_ADDRESS),
      ALLOWED_ORIGINS: origin.origin,
      GOOGLE_OAUTH_CLIENT_ID: alchemy.secret(secrets.GOOGLE_OAUTH_CLIENT_ID),
      GOOGLE_OAUTH_CLIENT_SECRET: alchemy.secret(secrets.GOOGLE_OAUTH_CLIENT_SECRET),
    },
  });
}

/**
 * A secret the Worker runs without: unset or blank in the deploy environment, the binding is left out. Without
 * `ANTHROPIC_API_KEY` the generation routes stay off and nothing is spent (`api/` `IsWeaponPipelineAvailable`).
 */
function optionalSecret(name: string): Bindings {
  const value = process.env[name];
  if (!value?.trim()) {
    return {};
  }

  return {[name]: alchemy.secret(value)};
}
