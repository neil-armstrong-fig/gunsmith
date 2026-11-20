import alchemy from "alchemy";
import {Assets, DurableObjectNamespace, EmailSender, RateLimit, Worker} from "alchemy/cloudflare";
import type {D1Database} from "alchemy/cloudflare";
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
    adopt: true,
    url: origin.hostname.endsWith(".workers.dev"),
    previewSubdomains: false,
    assets: {run_worker_first: ["/api/*"]},
    observability: {
      enabled: true,
      logs: {enabled: true, invocationLogs: false},
      traces: {enabled: false},
    },
    bindings: {
      ASSETS: await Assets({path: workspacePath("webapp/build")}),
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
