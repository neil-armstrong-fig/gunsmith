# Where the AI pipeline runs

**Status: provisional recommendation (option 1), awaiting the user's approval of the spend and the one-node proof.** `ai`'s
first task (O1 in `TODO-ai.md`) is a costed, validated comparison of the three options below; this file records the result. The user favours options 1 and 2 and expects option 3 not to work in practice. The goal is to
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
| Studio and local dev | Studio against the deployment; `langgraph dev` locally | `langgraph dev` locally; Studio against our own server | `langgraph dev` runs a JS graph locally with the Studio link (verify the Studio claim in the proof); no hosted threads |
| Cold start and limits | Scale-to-zero on Serverless; cold start and run limits **unverified** | Container start time and sleep behaviour unmeasured | 1 s startup, 128 MB per isolate, 64 MiB uncompressed bundle. Bundle fit unmeasured |
| Tracing | LangSmith native, runs server-side | Same, but the container needs outbound access | Needs explicit client config and a flush in `ctx.waitUntil`; the streaming hang is reported |
| Worker gateway | HTTP to the deployment's API with an API key; the Worker keeps credits, the kill switch and AI Gateway | HTTP to the container through a Worker or Durable Object | In-process call, so `api/` imports `ai/` |
| `pnpm checks` stays offline | Yes, with a fake chat model | Yes | Yes |

Costs that apply whatever we choose: per-generation model cost is in `docs/cost-and-budget.md`. **The fixed subscriptions sit
on top of the $20 a month model ceiling.** Option 1's $39 is nearly twice that ceiling.

Sources: [Containers pricing](https://developers.cloudflare.com/containers/pricing/), [LangChain pricing](https://www.langchain.com/pricing),
[deployment options](https://docs.langchain.com/langsmith/deployments), [standalone server](https://docs.langchain.com/langsmith/deploy-standalone-server.md),
[Workers limits](https://developers.cloudflare.com/workers/platform/limits/), [Durable Object limits](https://developers.cloudflare.com/durable-objects/platform/limits/),
[local dev](https://docs.langchain.com/langsmith/local-dev-testing).

## Decision (provisional, needs the user's approval of the spend)

- **Chosen option and why:** recommend **option 1**. It is the closest to the Focused deployment story, gives a managed
  checkpointer and Studio, and keeps the Worker thin. **Option 2 is out for now:** it forces Workers Paid *and* needs an
  external Postgres and Redis *and* has an unverified licence, so it has the highest fixed cost and the most operations work
  for no extra capability. **Option 3 is the fallback** if the user will not pay for Plus: it needs Workers Paid (about $5)
  unless the 10 ms CPU limit proves workable, and gives up hosted threads.
- **Costs:** option 1 is $39 a month fixed on top of model spend; option 3 is about $5 or nothing. Per-generation cost:
  `docs/cost-and-budget.md` (Results).
- **What breaks, and what we do about it:** Serverless cold starts and run limits are unmeasured, and the pre-round has a
  timeout. The proof must time a cold and a warm call. If a cold start is too slow, keep one warm call at match start, or move
  to option 3.
- **Consequence for `api/` imports:** under option 1 the Worker calls the deployment over HTTP and **`api/` never imports
  `ai/`**. The client belongs in `shared/` (`build`'s), so this is a request to `build` in `TODO.md`, not something `ai`
  writes. `AGENTS.md` keeps `api/` denied from `ai/` until the user approves; under option 3 it would change.
- **Consequence for the cost posture:** option 1 does not force Workers Paid on its own (the Worker only waits on a fetch);
  that stays with `build`'s Durable Object spike. Option 2 would force it.
- **Build the graph host-agnostic either way:** a `langgraph.json` plus a graph that takes its model and `AiAdapter`
  dependencies as inputs, so moving between options 1 and 3 is a deployment change, not a rewrite.
- **Still owed before this is final:** the one-node proof (local `langgraph dev`, then real deploys once the user approves
  Plus or Paid), measured cold and warm timings, the LangSmith trace flush check, the Workers bundle size for option 3, and
  the licence answer from LangChain for option 2.
- **Date and who decided:** 2026-11-12, `ai` (recommendation only; the user decides).

## Sources

- [Deploy LangChain on Cloudflare Workers](https://docs.langchain.com/langsmith/deploy-cloudflare-workers)
- [LangGraph checkpointers](https://docs.langchain.com/oss/javascript/langgraph/checkpointers)
- Community D1 checkpointers: `@meridian-agent/langgraph-checkpoint-cloudflare-d1` (found 2026-11-12; untested)
- `langsmith-learning` module 07 (`deploy`)
