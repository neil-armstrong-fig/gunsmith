# Manual setup steps

Everything that lives outside the repository, in order, and why. Update it in the same pass as any change that creates,
renames or removes one. **Never put an account id, token, secret or personal address in this file.** Status: external setup remains planned except where a row records completion. Repository CI and deployment automation are implemented. Hosting awaits provisioning.

| # | Step | Why | Who | Done |
| - | ---- | --- | --- | ---- |
| 1 | Pick the subdomain `gunsmith.neilarmstrong.dev` (one label below the registrable domain) | A deeper name has no free certificate | User | [ ] |
| 2 | Create a **Google OAuth client** (web application). Register `http://localhost:<port>/api/auth/google/callback` for local development and the Worker's `/api/auth/google/callback` on the production domain before release. Keep the client credentials in the configured secret stores | Google OAuth setup | User | [ ] Local client and callback verified 2026-11-19. Production callback pending. |
| 3 | Create an account-scoped **Cloudflare API token** for deploys with Workers Scripts Edit and D1 Edit. Set `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. Set a Workers subdomain on the account so the Alchemy state service can be reached | Provisioning and dashboard-managed custom domain | User | [ ] |
| 4 | Choose an `ALCHEMY_PASSWORD` and a separate `ALCHEMY_STATE_TOKEN`, both long random values. Keep them stable for subsequent deployments to that account | State encryption and state-service authentication | User | [ ] |
| 5 | Follow **First deploy** below on a throwaway Cloudflare account. Repeat on production after approval | Verify the Worker, D1 and migration behavior | Ship with the user | [ ] |
| 6 | Attach the Worker's custom domain in the Cloudflare dashboard | Whose domain it is, and where its DNS lives, is the owner's | User | [ ] |
| 7 | Create the **AI Gateway** and its **spend-limit rules** (per `user_id`, plus a global one) in the dashboard or API; enable caching and rate limits | Layer 2 of the cost controls (`docs/cost-and-budget.md`) | `ai` with the user | [ ] |
| 8 | Create the **LLM provider key** with its own **hard spend cap** a little above the monthly ceiling. Store as a Worker secret | Layer 1 of the cost controls | User | [ ] |
| 9 | Create a **LangSmith** account in the **EU region** (done 2026-11-12; sign in at `eu.smith.langchain.com`), a project (`gunsmith-dev`), and an API key made in that region (free tier; traces expire after 14 days). Store as a secret, and set `LANGSMITH_ENDPOINT=https://eu.api.smith.langchain.com` (no trailing slash) wherever the key is used. The free tier is enough: the pipeline runs in the Worker (`docs/ai-hosting.md`), so the Plus plan, which a hosted deployment needs, is not required | Tracing and evals | User | [ ] |
| 10 | Set **Cloudflare budget alerts** (email) for $10, $16 and $20 of usage-based spend | The last line; they do not stop anything | User | [ ] |
| 11 | Store `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `ALCHEMY_PASSWORD`, `ALCHEMY_STATE_TOKEN`, `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET` and `ALERT_TO_ADDRESS` as **GitHub Actions secrets**. Alchemy binds the OAuth and alert values as Worker secrets | Deployment and production sign-in | User | [ ] |
| 12 | Keep the private GitHub repo's Actions permissions read-only for contents, with repository read access to the allowed checkout/setup-node/upload-artifact/download-artifact and pnpm/action-setup actions. Use Checks and production-preview acceptance for required checks | PR CI uses zero deployment credentials. Property checks and AI evals run independently | User | [x] Repository created and hosted Actions runs verified |
| 13 | Put `GOOGLE_OAUTH_CLIENT_ID` and `GOOGLE_OAUTH_CLIENT_SECRET` in the root `.env.local` (git-ignored; `pnpm api:dev` loads it, and the redirect URI `http://localhost:<port>/api/auth/google/callback` must be registered with the client; no `api/.dev.vars`) | Local real sign-in | User (the agents never read it) | [x] Local Google round-trip verified in Chrome on 2026-11-19. |
| 14 | Run the **shutdown drill** once against the live Worker with a tiny budget | Proves the kill switch | `ai` with the user | [ ] |
| 15 | **Pre-publication scrub** before the repo or the case study goes public. Includes moving the system-prompt canary (`ai/src/pipeline/prompts/SystemPromptCanary.ts`) out of the source and into a Worker secret | The repo is private for now; a canary that is public in the source is known to attackers, so the leak check would prove nothing | `build` with the user | [ ] |
| 16 | Before public matchmaking, configure a **Turnstile widget** for the intended production host and onboarding action; store its validation secret server-side and use test keys locally. Final binding names belong to API scaffolding | Suspicious-onboarding friction; server verification required, not proof of unique identity | `build` with the user | [ ] |
| 17 | Before hosted recording, enable **R2** with the user's billing approval, review deploy-token storage permissions, and provision a private recording bucket through infra. Keep public domains and `r2.dev` off; add lifecycle backstops for ordinary and flagged prefixes | Bounded recordings; app enforces exact access expiry and erasure separately. Nothing was provisioned by the research pass | `build` with the user | [ ] |
| 18 | Before fair-play enforcement, provision a server-only **identity-digest key**, private versioned policy values and moderator access; document rotation, retention basis, deletion and manual-correction procedures. Include required secrets in deployment configuration when API/infra names are fixed | Minimal post-deletion restriction continuity, private production thresholds and controlled evidence access; see `docs/art/fair-play-research.md` | `build` with the user | [ ] |
| 19 | For the `ai` cheap-model benchmark only: create a **Cloudflare API token limited to Workers AI** (the Workers AI template, or Workers AI Read and Edit, no zone permissions, with an expiry) and put it in `ai/.env.local` (git-ignored) as `CLOUDFLARE_WORKER_AI_KEY`, with the account id as `CLOUDFLARE_ACCOUNT_ID`. Confirm the account is on **Workers Free**: its 10,000 neurons a day are then a hard cap (calls fail beyond it), whereas on Workers Paid a call beyond it is billed at $0.011 per 1,000 neurons, outside the $1 ledger | The benchmark runs the eval tiers on Workers AI models (`docs/cost-and-budget.md`, "Cheaper models"); the session never reads the file | User | [x] **Benchmark finished 2026-11-16, no open model chosen: no code uses the Workers AI token any more (the tier was removed), so it can be revoked or left to expire, and its two lines deleted from `ai/.env.local`.** Token made 2026-11-16; account confirmed on Workers Free 2026-11-16 (the user may move to Paid for development and release: put a neuron ceiling back in the eval tier first) |
| 20 | Confirm Email Routing on the zone and a verified destination. Provide `ALERT_TO_ADDRESS` as a deploy secret. The Alchemy Worker declares `ALERT_MAIL` and its sender. Verify the secret name is present after a redeploy, then test delivery in the authorized shutdown drill | `SpendLedger.alarm()` sends the 50, 80 and 100 percent spend alerts | User and Budget | [ ] |

## First deploy

1. After approval for the throwaway account, export its values from steps 3, 4 and 11 in your shell. Set `SITE_ORIGIN`
   to the HTTPS URL of `gunsmith-api` on that account's Workers subdomain. From the tested commit run
   `pnpm --filter @gunsmith/webapp compile` and `pnpm --filter @gunsmith/infra provision`.
2. Verify the site, the SQLite namespaces and the applied D1 migration in the dashboard. Use
   `WEBAPP_URL=<deployed-origin> pnpm acceptance-tests` against the whole deployed application. Run provision
   again with the same deploy secrets. Confirm the database and namespace IDs match the first run,
   the migration applied once, and the secret names are still present. Use a throwaway OAuth callback if testing sign-in.
3. After separate production approval, repeat provisioning with the production credentials and the default site origin.
   Attach the custom domain in the dashboard, register its Google callback and supply the production OAuth and alert secrets at deploy time.
   Run the acceptance suite against the domain and verify real sign-in before enabling automated deployments.
4. Set the repository Actions variable `GUNSMITH_DEPLOY_ENABLED=true` once production setup is verified and authorized.
   Trigger CI from `main` or let the next push start it. Record the deployed SHA, Worker version ID from the Cloudflare dashboard, deployed acceptance
   report and runner timings. Clear the variable to pause automated releases. For a compatible rollback, use
   `wrangler rollback <version-id> --name gunsmith-api` after approval and rerun live acceptance. Review migration
   compatibility before rolling back, since this restores a Worker version only. Fix forward when the previous Worker
   cannot use the current schema.

## Local paid-eval activation

[Eval policy](docs/agent-reference/EvalPolicy.md) replaces the $1 lifetime allowance with $5 per UTC month. Before any paid run, AI must deliver the shared locked local ledger, execution filter and dated evidence bundles. Supply November API Console Cost/Usage CSVs scoped to Gunsmith to reconcile the opening balance; omit credentials and billing details. Do not initialize at zero or use the legacy paid command as the new policy implementation. No paid CI secrets, schedule or local balance were configured here.
