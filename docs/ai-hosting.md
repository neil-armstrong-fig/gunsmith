# Where the AI pipeline runs

**Status: decided 2026-11-12 for now: option 3, inside the Worker** (the user declined LangSmith Plus, which option 1 needs).
`ai`'s first task (O1 in `TODO-ai.md`) is a costed, validated comparison of the three options below; this file records the result. The user favours options 1 and 2 and expects option 3 not to work in practice. The goal is to
showcase the whole lang stack (LangChain, LangGraph, LangSmith) with Cloudflare as a light layer in front.

## Options

1. **LangGraph server on LangSmith Deployment.** The graph is deployed with `langgraph.json`; Studio, managed checkpointers,
   `interrupt` and remote threads come with it (the learning repo's module 07 covers this). The Worker is a thin
   authenticated gateway holding credits, the kill switch and AI Gateway. Best showcase and closest to how Focused deploys.
   Hosted deployment probably needs LangSmith Plus `(unverified)`.
2. **Self-hosted LangGraph server on Cloudflare Containers.** The same graph and Studio story, but we run the container and
   own the checkpointer. Possibly cheaper at rest, more operations work. Containers is a newer product; whether it needs
   Workers Paid is `(unverified)`. Licensing for a self-hosted server on the free plan is `(unverified)`.
3. **Inside the Worker with LangChain.js.** One place, lowest cost. Against it: no Studio or managed checkpointer; Workers
   quirks (`nodejs_compat` and `nodejs_compat_populate_process_env`; env vars not read by LangSmith; background tracing; a
   reported streaming hang; no official Durable Object LangGraph checkpointer, only community D1 ones that are untested under
   `nodejs_compat`); bundle size and CPU limits `(unverified)`. LangChain publishes a Workers deployment guide that keeps
   state in a per-thread Durable Object and says `MemorySaver` is not durable.

## What to measure (per option)

| Criterion | Notes |
| --------- | ----- |
| Monthly fixed cost | LangSmith Plus seats; Workers Paid; container compute |
| Cost per generation | Model spend dominates; compare with the $1 a day soft cap and $20 a month ceiling |
| Free-tier fit | Can the whole thing run on the free plan? What breaks first? |
| Licensing | May a self-hosted LangGraph server run without an enterprise licence? |
| Latency | Cold start and end-to-end time for a weapon and an arena; the pre-round has a timeout |
| Limits | CPU time, wall time, memory, bundle size |
| State | Checkpointer choice, durability, replay |
| Tracing | LangSmith flush, background vs blocking, streaming |
| Studio and local dev | Can the pipeline be run and debugged with the same graph? |
| Gateway coupling | How the Worker calls it (SDK, HTTP), auth between them, how the kill switch is checked |
| Testability | Can `pnpm checks` stay free of network calls? |

## Proof to build

A one-node graph (echo a structured weapon from a fixed prompt) deployed to options 1 and 2, called from a Worker, traced in
LangSmith, with timings recorded. Do not build the full pipeline on an option before the proof passes.

## Findings (desk research, 2026-11-12; nothing deployed)

| Criterion | 1. LangSmith Deployment | 2. Self-hosted server on Containers | 3. Inside the Worker |
| --------- | ----------------------- | ----------------------------------- | -------------------- |
| Fixed monthly cost | **Plus, $39 per seat** (one seat). One Serverless (Small) deployment is included; more are metered in LSUs at $1 each | Workers Paid $5, plus container usage, plus **an external PostgreSQL and Redis (the server requires both)**, plus a licence key | Nothing extra on the free plan if it fits; otherwise Workers Paid $5 |
| Free-plan fit | Worker can stay on Free: it only makes an HTTP call, and time waiting on a fetch does not count as CPU | **No.** Containers show N/A on Free | Doubtful: Free allows 10 ms CPU per request; zod parsing, graph overhead and trace serialisation may exceed it. Paid defaults to 30 s |
| Licensing | A managed service; no licence question | **Unverified.** The server wants `LANGGRAPH_CLOUD_LICENSE_KEY`, checked once at startup against `beacon.langchain.com`. Sources conflict on a free allowance (100k nodes a month versus 1M a year), and the docs do not say what a Developer account gets | Open-source libraries only |
| State and checkpointer | Managed (Postgres behind the deployment) | We run and pay for Postgres and Redis | No durable checkpointer on Workers: `MemorySaver` is lost across isolates. Community D1 savers untested; LangChain's guide uses a Durable Object per thread |
| Studio and local dev | Studio against the deployment; `langgraph dev` locally | `langgraph dev` locally; Studio against our own server | `langgraph dev` runs the JS graph locally with the Studio link (verified: the Agent Server runs it); no hosted threads |
| Cold start and limits | Scale-to-zero on Serverless; cold start and run limits **unverified** | Container start time and sleep behaviour unmeasured | 1 s startup, 128 MB per isolate, 64 MiB uncompressed bundle. One-node bundle 2.79 MiB; one request 2.3 to 3.5 ms wall-clock in workerd (real graph unmeasured) |
| Tracing | LangSmith native, runs server-side | Same, but the container needs outbound access | Needs explicit client config and a flush in `ctx.waitUntil`; the streaming hang is reported |
| Worker gateway | HTTP to the deployment's API with an API key; the Worker keeps credits, the kill switch and AI Gateway | HTTP to the container through a Worker or Durable Object | In-process call, so `api/` imports `ai/` |
| `pnpm checks` stays offline | Yes, with a fake chat model | Yes | Yes |

Costs that apply whatever we choose: per-generation model cost is in `docs/cost-and-budget.md`. **The fixed subscriptions sit
on top of the $20 a month model ceiling.** Option 1's $39 is nearly twice that ceiling.

Sources: [Containers pricing](https://developers.cloudflare.com/containers/pricing/), [LangChain pricing](https://www.langchain.com/pricing),
[deployment options](https://docs.langchain.com/langsmith/deployments), [standalone server](https://docs.langchain.com/langsmith/deploy-standalone-server.md),
[Workers limits](https://developers.cloudflare.com/workers/platform/limits/), [Durable Object limits](https://developers.cloudflare.com/durable-objects/platform/limits/),
[local dev](https://docs.langchain.com/langsmith/local-dev-testing).

## Proof results (local, 2026-11-12; no deploy, no model call, no spend)

A one-node graph (`generate`: a fake chat model returns a fixed reply, zod parses it as `unknown`) lives on the throwaway
branch `worktree-ai-hosting-proof`, in `ai/` (package, `langgraph.json`, a proof Worker and a `wrangler.jsonc`).

- **It works offline.** `pnpm lint`, `format:check`, `type-check` and `test` pass for the package. The test was
  mutation-checked: a reply with `damage: 1000` fails with zod's `too_big` (maximum 100), and restoring it passes.
- **Option 3's bundle fits.** `wrangler deploy --dry-run` builds the graph, `@langchain/core` and `@langchain/langgraph`
  with `nodejs_compat` at **2.79 MiB (526 KiB gzipped)**, well under the 64 MiB uncompressed limit.
- **Option 3 runs in the Workers runtime, and is fast for one node.** `wrangler dev --local` (workerd, `nodejs_compat`) served
  the graph; three requests took 2.3 to 3.5 ms wall-clock each, curl round trip included, so CPU time was under that and far
  under the free plan's 10 ms. This is a fake model and one node: the real pipeline adds several nodes, zod parsing, trace
  serialisation and a real model client (whose waiting time does not count as CPU), so **re-measure with the real graph**
  before relying on the free plan.
- **The real eight-node graph, measured 2026-11-16 on canned fake models** (`createWeaponGraph`, drawing included, from a
  throwaway Worker outside the tree). `wrangler deploy --dry-run`: **2908.92 KiB, 541.20 KiB gzipped**, against **2790.17 KiB,
  526.11 KiB** for the one-node proof measured the same way, so the real pipeline adds about 119 KiB (the two figures were
  written "MiB" above, but 2790 KiB is 2.72 MiB; the comparison is unaffected). In `wrangler dev` (workerd) three requests
  took 75 ms (cold), then 10 and 9 ms wall-clock as wrangler logged them, for a created and drawn weapon (three canned model
  calls, nine nodes in the trail); this is wall time, not CPU, so the free plan's 10 ms CPU limit is **still not measured** (a real model's waiting
  does not count as CPU, but zod, the engine's balancer and trace serialisation do). Re-measure CPU with the deployed Worker
  before relying on the free plan.
- **`langgraph dev` works for a LangGraph.js graph.** `langgraphjs dev --no-browser` started the in-memory Agent Server,
  registered the `weaponProof` assistant, and `POST /runs/wait` returned the validated weapon over HTTP with no key and no
  network call. So the "no Studio" point against option 3 is overstated: the same graph gets the local Studio URL
  (`https://smith.langchain.com/studio/?baseUrl=http://localhost:2024`). The server's own log says the in-memory server is
  for development and points to LangSmith Deployment for production.
- **Studio, verified 2026-11-12 on the EU account** (the user signed in on the Playwright browser; free account, no key).
  `https://eu.smith.langchain.com/studio/?baseUrl=http://localhost:2024` connected to the local server, drew the graph
  (`__start__` → `generate` → `__end__`), built the input form from the state schema (`prompt`, `weapon` with `name`,
  `damage`, `rateOfFire`), and a submitted run (`prompt: "a mild rifle"`) returned `Proof Rifle`, 20, 6 in the Interact panel.
  The page shows "Not seeing LangSmith runs: API key missing", as expected with no key set, so **traces were not sent**; the
  Trace tab and the project view are not exercised until a key exists. Before sign-in the page was blank (403s). Also seen:
  a "free chat credits" pop-up, dismissed (not opened, so nothing spent), and "Plus" labels on Engine, Insights, Deployments
  and LLM Gateway. Server-side checks that came first: the CORS preflight succeeds (`access-control-allow-origin: *`),
  `/info`, `/assistants/search` and `/assistants/{id}/graph` all answer. The login persisted across closing and reopening
  the page in the same browser session; across Claude sessions is unknown. Two gotchas from the first attempt: the server binds to `::1` only, so use `http://localhost:2024`, **not** `127.0.0.1`
  (that gave "Failed to fetch"); and its CORS answer carries no private-network header, so a browser that enforces it for
  public-to-localhost calls (Safari blocks http localhost from an https page) may refuse. `langgraph dev` also warns that
  `@langchain/langgraph-checkpoint` reports version `0.0.0` against a required `^1.2.0`; it ran fine, but note it.
- **LangSmith trace flush on Workers, checked 2026-11-12 against a local fake LangSmith endpoint** (a dummy key, a 300 ms
  reply, so no account and no spend; spike files `ai/src/worker/trace/TraceProofWorker.ts` and `ai/wrangler.trace.jsonc`, workerd via
  `wrangler dev`). "One shot" does not save you: the tracer's queue and batch live at module level, so they outlive a request
  and are shared by the next one. Four ways to end a request, each tried:
  - **No flush:** the response returns in 5 ms but **the trace is not sent** (nothing arrived). Worse, the orphaned batch then
    **hangs the next request that awaits a flush**: it stalled for 5 s (my timeout) in one run and 145 s in the first run, with
    workerd warning "a promise was resolved or rejected from a different request context". So a missing flush loses traces
    and can poison later requests.
  - **`ctx.waitUntil(awaitAllCallbacks())`:** works. The response returned in 5 ms and the trace arrived (one `POST
    /runs/multipart`, about 9.5 KB per invocation of the one-node graph). This is the one to use.
  - **`await awaitAllCallbacks()` before responding:** works, adds about 0.55 s (the fake endpoint's 300 ms plus overhead).
  - **`LANGCHAIN_CALLBACKS_BACKGROUND=false`** (with `LANGSMITH_TRACING_BACKGROUND=false`): works, no leak, but sends inline
    (two posts in sequence), adding about 1.1 s to every request.
  - Environment variables **are** read when `nodejs_compat_populate_process_env` is on (the tracer found the key, endpoint and
    project from bindings), so the `AGENTS.md` gotcha is corrected. Rule for `ai/`: flush with `ctx.waitUntil` on **every**
    path, error paths included (`try`/`finally`). Not tested: a real LangSmith endpoint (latency, auth, the 14-day expiry),
    streaming (still avoid), and a deployed Worker (`wrangler dev` is local workerd).
- **Supply-chain decisions (the user, 2026-11-12), applied in the proof's `pnpm-workspace.yaml`.** `chokidar@4.0.3`
  (a dependency of `@langchain/langgraph-cli`) is allowed by exact version in `trustPolicyExclude`. Evidence: the same sole
  maintainer as 4.0.0 and 4.0.1; the policy fires only because 4.0.0 and 4.0.1 carry npm provenance and the hand-published
  4.0.2 and 4.0.3 do not; the tarball has no install script, one dependency (`readdirp`, no advisory either), no network or
  process code and an MIT licence; OSV lists no advisory; the code change from 4.0.1 is a small event-argument fix. `workerd`
  is **denied** (`workerd: false`), as in `personal-site`: its postinstall only validates a binary the platform package
  already supplies, and `wrangler dev` ran without it. janggi and flashcards allow it (`true`), so both work; denial is the
  smaller grant.
- **Version pins were held back.** The newest `@langchain/langgraph` (1.7.0), `-sdk` (1.13.0) and `wrangler` (4.158.0) were
  inside the seven-day release-age window when the proof was built, so it pins 1.6.1, 1.12.10 and 4.157.0. Bump them in a
  later pass.
- **`pnpm install` and the root `pnpm checks` both exit 0** in the proof worktree with these settings.

## Decision (2026-11-12: option 3 for now; revisit option 1 when Plus is worth paying for)

The user declined LangSmith Plus for now ("let's avoid it for now"), which removes option 1 (a hosted deployment needs Plus)
and leaves option 3 as the only one with no new fixed cost. Option 2 stays out.

- **Chosen option and why:** **option 3, the graph inside the Worker with LangChain.js and LangGraph.js.** It is the only
  option with no new subscription, and the proof shows the one-node graph bundles to 2.79 MiB and runs in workerd. We keep the
  lang stack for the showcase (LangGraph graph, LangChain structured output and middleware, LangSmith tracing) and get Studio
  and the Agent Server API locally through `langgraph dev`. **Option 2 is out:** it forces Workers Paid *and* needs an
  external Postgres and Redis *and* has an unverified licence. **Option 1 is parked, not rejected:** revisit it if hosted
  threads, Studio against production, online evals or annotation queues become worth $39 a month.
- **Costs:** no new fixed cost. Model spend only, under the $20 a month ceiling (`docs/cost-and-budget.md`). Workers Paid
  ($5) arrives only if `build`'s Durable Object spike or a real-pipeline CPU measurement needs it.
- **State:** the pipeline is a fixed, short-lived graph per request, so it needs **no checkpointer** (`MemorySaver` being lost
  across isolates does not matter). Only the optional `interrupt` human-review queue would need durable state; add a
  Durable Object saver or a D1 one then, behind a spike.
- **What breaks, and what we do about it:** the free plan's 10 ms CPU per request is the risk, since the real graph does more
  than one node. Mitigations: measure the real graph (an owed item); keep per-request work small; put the slow parts (the model
  calls) in I/O, which does not count as CPU; trace flush goes in `ctx.waitUntil`. If it does not fit, take Workers Paid (30 s
  default CPU), which `build`'s spike may want anyway.
- **Consequence for `api/` imports:** **`api/` imports `ai/`**, so `@gunsmith/ai` joins `api/`'s `allowedPackages`
  (`AGENTS.md` table updated), and `ai/` must stay Workers-safe: no Node-only APIs, `nodejs_compat` only. The `AiAdapter` real
  implementation lives in `ai/` and `api/` calls it in-process. The provisional "AI service client" row in `HANDOFF.md`
  is withdrawn.
- **Consequence for the cost posture:** the free plan stays possible. Option 2 would have forced Paid.
- **Build the graph host-agnostic anyway:** a `langgraph.json` plus a graph that takes its model and `AiAdapter`
  dependencies as inputs, so moving to option 1 later is a deployment change, not a rewrite. The proof already has both.
- **LangSmith region: EU** (the user signed up 2026-11-12, for GDPR-style handling of player prompts). So the tracing endpoint
  is `https://eu.api.smith.langchain.com`, Studio is at `eu.smith.langchain.com/studio/?baseUrl=http://localhost:2024`, and the
  API key must be created in the EU region. The earlier Studio check used the US host.
- **The EU account's plan, read from its Plans and Pricing page on 2026-11-12 (read only, nothing changed):** Developer, Free,
  current plan. **5,000 traces a month** (4 used), with the button "Add card to remove trace limit": with no card the limit is
  a hard stop, and adding a card turns the overflow into pay-as-you-go spend. 1 seat, 1 workspace, unlimited agents, 7.5 LSU a
  month included for Fleet and 8.5 for Sandbox. **Deployment, Engine, Insights, Gateway Policies, RBAC and Team Training all
  "Requires upgrade"**, which confirms that a hosted deployment needs Plus. Plus is $39 a seat, 10,000 traces, one Serverless
  Small deployment included. Trace retention is not shown on the page (the 14 days in our docs is from the pricing docs).
  **Consequence:** the trace allowance is the binding limit, not the money: one pipeline run is one trace, so 5,000 a month is
  about 166 a day, roughly 16 full players a day (10 generations each), while the model budget would allow far more on Haiku.
  **Decided by the user (2026-11-12): trace everything early, no sampling; if the limit is reached the user upgrades.** What
  that obliges `ai/`: a rejected trace must never fail or slow a request (checked against a mock endpoint returning 429),
  and a trace counter alerts at 80% of the allowance.
- **Still owed:** CPU time per request for the real graph; the trace flush against a real LangSmith key once the account exists (the mechanism is
  verified locally); the licence answer from LangChain for option 2 (low priority now); the real deploys of options 1 and 2 are
  dropped unless the decision is reopened.
- **Date and who decided:** 2026-11-12, `ai`, on the user's decisions to avoid Plus for now.

## Sources

- [Deploy LangChain on Cloudflare Workers](https://docs.langchain.com/langsmith/deploy-cloudflare-workers)
- [LangGraph checkpointers](https://docs.langchain.com/oss/javascript/langgraph/checkpointers)
- Community D1 checkpointers: `@meridian-agent/langgraph-checkpoint-cloudflare-d1` (found 2026-11-12; untested)
- `langsmith-learning` module 07 (`deploy`)
