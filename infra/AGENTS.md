# AGENTS.md — infra

Ship owns the Cloudflare release. `src/ApiInfrastructure.ts` declares the Alchemy app, D1 database and Worker.
Alchemy opens the production stage when the entry point calls `alchemy(...)`. Resource builders use that stage.
The returned app handle finalizes the deployment.

- `src/secrets/Secrets.ts` validates deploy credentials before provisioning. The `gunsmith-alchemy-state` Worker
  stores deployment state.
- `src/api-database/BuildApiDatabase.ts` declares the named D1 database and the API's SQL migrations.
- `src/api-worker/BuildApiWorker.ts` declares the API Worker and its bindings. Match locally used bindings
  in `api/wrangler.jsonc`. Alchemy manages the deployed Durable Object migrations and Worker secrets.

CI compiles the frontend and writes its commit marker into the artifact. Wrangler serves the artifact through the static Worker declared in `webapp/wrangler.jsonc`. Paths resolve from the workspace.
Runtime code imports no other Gunsmith package.

Run `pnpm --filter @gunsmith/webapp compile`, then
`pnpm --filter @gunsmith/api exec wrangler deploy --dry-run` and
`pnpm --filter @gunsmith/infra exec wrangler deploy --dry-run --config ../webapp/wrangler.jsonc` to check both Workers. The package tests check the Alchemy declarations. The `provision` command deploys
through Alchemy and requires authorization.
See [manual setup](../MANUAL-SETUP-STEPS.md#first-deploy) for credentials, the custom domain, OAuth and rollout.
