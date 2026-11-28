# AI hosting

## Decision

Run LangChain.js and LangGraph.js inside the planned API Worker. The API will import `@gunsmith/ai`; the pipeline remains Workers-safe and host-agnostic. Hosted LangGraph and self-hosted containers were considered but are not provisioned. A hosted deployment requiring an additional subscription was declined.

The Worker spike that proved the graph runs in a Worker (`weaponProof`, with a LangSmith trace-flush Worker) was removed on 2026-11-27, once `api/` ran both pipelines. The local LangGraph Studio setup was kept, at the user's request (2026-11-27): `ai/langgraph.json` names `weaponSmith` and `arenaSmith`, the real graphs on canned models (`ai/src/studio/`), which `pnpm dev` in `ai/` serves with no key and no network.

## Evidence and limits

Local workerd measurements recorded the real graph at 2908.92 KiB uncompressed / 541.20 KiB gzipped and response wall times of 75 ms cold, then 10 and 9 ms. These are historical local measurements, not CPU usage, provider latency or evidence of free-plan fit. Re-measure the current graph before choosing a production plan. **Re-measured 2026-11-20 (dry-run bundle, `wrangler deploy --dry-run`, no CPU):** a Worker entry holding the production adapter (`ai/src/adapter/`, `@langchain/anthropic` included) and both pipelines (`generateWeapon`, `generateArena`, with engine's built-in arenas) bundles to 3540.15 KiB uncompressed and 668.66 KiB gzipped.

## Integration requirements

- Keep Node-only eval clients outside runtime imports; use the Workers compatibility configuration in `api/wrangler.jsonc`.
- Supply tracing configuration explicitly where environment discovery is unavailable. Validate trace delivery with real authorized integration.
- Flush callbacks on every request path using `ctx.waitUntil(awaitAllCallbacks())`; unfinished callbacks can be lost or interfere with later requests.
- Avoid streaming until its Worker behavior is verified.
- Do not treat in-memory checkpoints as durable storage.
- Measure CPU, wall time, cold start, bundle size and trace failure behavior for the real graph. Budget/server own production call and storage boundaries.

Local commands and eval controls are in [ai/AGENTS.md](../ai/AGENTS.md). Production setup and authorization remain in [manual setup](../MANUAL-SETUP-STEPS.md).
