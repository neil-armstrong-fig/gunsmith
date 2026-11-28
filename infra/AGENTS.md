# AGENTS.md — infra

Ship owns the Cloudflare release. `src/Infrastructure.ts` declares the Alchemy app, D1 database and both Workers.
Alchemy opens the production stage when the entry point calls `alchemy(...)`. Resource builders use that stage.
The returned app handle finalizes the deployment.

- `src/secrets/Secrets.ts` validates deploy credentials before provisioning. The `gunsmith-alchemy-state` Worker
  stores deployment state.
- `src/api-database/BuildApiDatabase.ts` declares the named D1 database and the API's SQL migrations.
- `src/api-worker/BuildApiWorker.ts` declares the API Worker and its bindings. Match locally used bindings
  in `api/wrangler.jsonc`. Alchemy manages the deployed Durable Object migrations and Worker secrets.

- `src/webapp-worker/BuildWebappWorker.ts` declares the static webapp Worker (adopted `gunsmith-webapp`). It uploads
  `webapp/build` as assets, `_headers` included; its stub script answers only paths no asset matches, with a noindex 404.

CI compiles the frontend and writes its commit marker into the artifact; `provision` deploys it. Paths resolve from the
workspace. Both custom domains stay attached in the Cloudflare dashboard, not declared here.
Runtime code imports no other Gunsmith package.

Run `pnpm --filter @gunsmith/api exec wrangler deploy --dry-run` to check the API bundle. The package tests check the
Alchemy declarations. The `provision` command deploys both Workers through Alchemy and requires authorization. It
uploads whatever is in `webapp/build`, so it needs a fresh, stamped build: locally, release with `pnpm deploy:fromLocal`.
See [manual setup](../MANUAL-SETUP-STEPS.md#first-deploy) for credentials, the custom domain, OAuth and rollout.
