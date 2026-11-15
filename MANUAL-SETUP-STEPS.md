# Manual setup steps

Everything that lives outside the repository, in order, and why. Update it in the same pass as any change that creates,
renames or removes one. **Never put an account id, token, secret or personal address in this file.** Modelled on janggi's
`MANUAL-SETUP-STEPS.md`. Status: planned; nothing has been done yet.

| # | Step | Why | Who | Done |
| - | ---- | --- | --- | ---- |
| 1 | Pick the subdomain `gunsmith.neilarmstrong.dev` (one label below the registrable domain) | A deeper name has no free certificate | User | [ ] |
| 2 | Create a **Google OAuth client** (web application). Authorised redirect URI: the Worker's `/api/auth/google/callback` on the domain, and `http://localhost:8787/...` for local. Note the client id and secret | Google lets nobody create a client from code | User | [ ] |
| 3 | Create a **Cloudflare API token** for deploys: Workers admin, D1 edit; no zone permissions. Use `alchemy util create-cloudflare-token` (see janggi `infra/AGENTS.md`). Store as `CLOUDFLARE_API_TOKEN` (and `CLOUDFLARE_ACCOUNT_ID` only if the token reaches several accounts) | CI deploys | User | [ ] |
| 4 | Choose an `ALCHEMY_PASSWORD` (long random string) | Encrypts secrets in Alchemy's state | User | [ ] |
| 5 | First `pnpm --filter @gunsmith/infra provision` on a **throwaway Cloudflare account**, then on the real one | Alchemy adopts resources by name; the first real deploy is the test | `build` with the user | [ ] |
| 6 | Attach the Worker's custom domain in the Cloudflare dashboard | Whose domain it is, and where its DNS lives, is the owner's | User | [ ] |
| 7 | Create the **AI Gateway** and its **spend-limit rules** (per `user_id`, plus a global one) in the dashboard or API; enable caching and rate limits | Layer 2 of the cost controls (`docs/cost-and-budget.md`) | `ai` with the user | [ ] |
| 8 | Create the **LLM provider key** with its own **hard spend cap** a little above the monthly ceiling. Store as a Worker secret | Layer 1 of the cost controls | User | [ ] |
| 9 | Create a **LangSmith** account in the **EU region** (done 2026-11-12; sign in at `eu.smith.langchain.com`), a project (`gunsmith-dev`), and an API key made in that region (free tier; traces expire after 14 days). Store as a secret, and set `LANGSMITH_ENDPOINT=https://eu.api.smith.langchain.com` (no trailing slash) wherever the key is used. The free tier is enough: the pipeline runs in the Worker (`docs/ai-hosting.md`), so the Plus plan, which a hosted deployment needs, is not required | Tracing and evals | User | [ ] |
| 10 | Set **Cloudflare budget alerts** (email) for $10, $16 and $20 of usage-based spend | The last line; they do not stop anything | User | [ ] |
| 11 | Add the **GitHub secrets**: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` (if needed), `ALCHEMY_PASSWORD`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, the provider key, the LangSmith key | CI deploy and evals | User | [ ] |
| 12 | Create the **GitHub repository** (private for now) with remote named as the user prefers; no branch protection requiring the property tests or evals | Janggi's rule: non-deterministic checks must not gate by the back door (evals gate only changes under `ai/`) | User | [ ] |
| 13 | Create the local `api/.dev.vars` (git-ignored) with the Google client and the redirect URI for `wrangler dev` | Local real sign-in | User (the agents never read it) | [ ] |
| 14 | Run the **shutdown drill** once against the live Worker with a tiny budget | Proves the kill switch | `ai` with the user | [ ] |
| 15 | **Pre-publication scrub** before the repo or the case study goes public. Includes moving the system-prompt canary (`ai/src/pipeline/prompts/SystemPromptCanary.ts`) out of the source and into a Worker secret | The repo is private for now; a canary that is public in the source is known to attackers, so the leak check would prove nothing | `build` with the user | [ ] |
| 16 | Before public matchmaking, configure a **Turnstile widget** for the intended production host and onboarding action; store its validation secret server-side and use test keys locally. Final binding names belong to API scaffolding | Suspicious-onboarding friction; server verification required, not proof of unique identity | `build` with the user | [ ] |
| 17 | Before hosted recording, enable **R2** with the user's billing approval, review deploy-token storage permissions, and provision a private recording bucket through infra. Keep public domains and `r2.dev` off; add lifecycle backstops for ordinary and flagged prefixes | Bounded recordings; app enforces exact access expiry and erasure separately. Nothing was provisioned by the research pass | `build` with the user | [ ] |
| 18 | Before fair-play enforcement, provision a server-only **identity-digest key**, private versioned policy values and moderator access; document rotation, retention basis, deletion and manual-correction procedures. Include required secrets in deployment configuration when API/infra names are fixed | Minimal post-deletion restriction continuity, private production thresholds and controlled evidence access; see `docs/art/fair-play-research.md` | `build` with the user | [ ] |
