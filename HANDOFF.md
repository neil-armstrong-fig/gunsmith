# HANDOFF

How the three sessions work together without colliding. Read this at the start of every session, and update it when a
contract changes or a delivery lands.

## The personas

Start a session by clearing context and saying: **"You are build, continue the TODO."** (or `ai`, or `art`).

**Every fresh session reads all of this file, `TODO.md` (the shared north-star path and status board) and all three persona
checklists (`TODO-build.md`, `TODO-ai.md`, `TODO-art.md`),** so each persona knows what the other two are doing, waiting
on or blocking. Then it says so in a few lines before starting (the sync protocol is at the top of `TODO.md`).

| Name    | Session           | Tool        | Owns                                                                                                                        | Does not touch                          |
| ------- | ----------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| `build` | 1. Game / project | Claude Code | Everything until the contracts exist: scaffold, `shared/`, `engine/`, `webapp/`, `api/`, `acceptance-tests/`, `infra/`, CI, every `AGENTS.md` | Real LLM calls; art and sound files     |
| `ai`    | 2. AI             | Claude Code | `ai/`, its evals and datasets, AI parts of `api/` (credits, kill switch, gateway), LangSmith, budgets, `docs/ai-*.md`       | Engine rules; webapp screens; art       |
| `art`   | 3. Art and text   | Codex       | `TODO-art.md`, `webapp/public/assets/`, `docs/art/`, copy text, logo and icons, static sounds                                              | Anything under `src/`; schemas; configs |

Rules for all three: read `AGENTS.md`, this file, `TODO.md` and all three persona checklists first; stay in your own folders; tick off your own checklist as you
finish; ask before commits, dependencies, spending money or changing live infrastructure; never read secrets.

### Start prompts (paste after clearing context)

- **build:** "You are build. Read `AGENTS.md`, `HANDOFF.md`, `TODO.md`, `TODO-build.md`, `TODO-ai.md`, `TODO-art.md` and
  `docs/fuzzy-frontend.md` in the gunsmith repo, say what the other two personas are up to, then continue `TODO-build.md`
  from the first unchecked item. The fuzzy frontend comes first: get a clickable whole game
  fast, then bring each area into focus test-first. Tick items off in `TODO-build.md` as you finish them, update your row in `TODO.md`, and update
  `HANDOFF.md` whenever a contract that `ai` or `art` plugs into changes. Ask before committing."
- **ai:** "You are ai. Read `AGENTS.md`, `HANDOFF.md`, `TODO.md`, `TODO-build.md`, `TODO-ai.md`, `TODO-art.md`,
  `docs/ai-pipeline.md`, `docs/ai-hosting.md` and `docs/cost-and-budget.md`, say what the other two personas are up to,
  then continue `TODO-ai.md` from the first unchecked item. Start with the costed hosting
  comparison. Use only the contracts below (the zod schemas and `AiAdapter`), never change `engine/` rules, and keep
  evals out of `pnpm checks`. Tick items off in `TODO-ai.md` and update your row in `TODO.md`. Ask before anything that spends money."
- **art:** "You are art. Read `HANDOFF.md`, `TODO.md`, `TODO-build.md`, `TODO-ai.md`, `TODO-art.md`, `docs/art/README.md`,
  `docs/art/asset-manifest.md`, `docs/art/copy.md` and `docs/art/audio.md`, say what the other two personas are up to,
  then continue `TODO-art.md`. Write only under the asset folders named below, follow the
  manifest's keys, sizes and formats exactly, use the flat-vector neon geometric palette, and list what you delivered in
  the delivery log at the bottom of this file and tick `TODO-art.md`."

If the user runs two sessions in one checkout, or copies work between checkouts, follow the concurrency rules in
`AGENTS.md` and keep each persona's output inside its own paths so a copy-back is trivial.

## Contracts between sessions

These are what the other sessions plug into. **`build` creates them first (during the fuzzy frontend, shaped as the real
thing).** Changing one means editing this section in the same change and telling the user.

| Contract | Lives in | Who owns it | Used by | Notes |
| -------- | -------- | ----------- | ------- | ----- |
| Weapon and arena zod schemas | `shared/` (draft in `docs/schemas.md`) | `build` | everyone | Includes the weapon's `sound` block. The hard caps are enforced in `engine/`, not in the schema alone. |
| Fixture weapons and arenas | `shared/` | `build` | `ai`, tests | Valid, over-powered, boundary and invalid examples. `ai` seeds its datasets from them. |
| `AiAdapter` interface | `shared/` | `build` (shape), `ai` (real implementation) | webapp, api, tests | Generate a weapon, generate an arena, judge two arena prompts, report pipeline-progress events, return the credit cost. Failures are typed (rejected, timed out, AI off). A **fake adapter** returns fixtures with simulated delay and failures. No acceptance test calls a real one. |
| `CreditLedger` interface | `shared/` | `build` | api, `ai` | Balance, atomic spend, refund, daily reset at 00:00 UTC. An in-memory fake and a D1 implementation pass the same contract suite. |
| Credit prices and limits | one config in `shared/` | `build` | `ai`, webapp | 10 a day; weapon 1, arena 1, edit 1, rejection 0.5. Prompt token limits: weapon 150, arena 250. |
| Kill-switch flag | `api/` (KV or D1) read through one function | `ai` (writes), `build` (reads in UI) | webapp, api | When on: no new generation, the AI-off banner, built-in pool only, game still plays. |
| Power rating and caps | `engine/` | `build` | `ai`, webapp | The `rate` node in the AI graph calls it. The AI never decides balance. |
| Arena validator | `engine/` | `build` | `ai`, webapp | The `validate` node calls it. |
| Output moderation (names, descriptions) | `engine/` or `shared/` | `build` | `ai` | Deterministic blocklist and length/charset limits. |
| Canvas state hook | `webapp/` | `build` | acceptance DSL | A read-only, tiny object on `window` exposing what specs need (player positions, health, round, visible entities). Not for writing state. |
| Asset manifest | `webapp/src/assets/manifest` | `build` (structure), `art` (fills files) | webapp, `art` | Stable key, size, format and a placeholder for every sprite, tile, icon and sound. |
| Wire messages | `shared/` | `build` | webapp, api | Client inputs and fog-filtered server snapshots (`docs/match-netcode.md`). |
| AI service client (provisional) | `shared/` | `build` (client), `ai` (the service it calls) | api | If the pipeline runs as a LangGraph deployment (`docs/ai-hosting.md`), `api/` calls it over HTTP through this client and never imports `ai/`. Not needed yet: the fake adapter comes first. Do not write it until the user approves the hosting choice. |

## Folder ownership

| Path | Owner |
| ---- | ----- |
| `TODO-build.md`, `shared/`, `engine/`, `webapp/src/`, `api/` (except the AI parts), `acceptance-tests/`, `infra/`, `.github/workflows/ci.yml`, `property-tests.yml` | `build` |
| `TODO-ai.md`, `ai/`, `.github/workflows/evals.yml`, `api/src/ai/` (credits spend, gateway client, kill switch), `docs/ai-pipeline.md`, `docs/ai-hosting.md`, `docs/cost-and-budget.md` | `ai` |
| `TODO-art.md`, `webapp/public/assets/`, `docs/art/`, `docs/focused-case-study.md` (illustrations) | `art` |
| `AGENTS.md`, `TODO.md` (shared path), `HANDOFF.md`, `MANUAL-SETUP-STEPS.md`, other `docs/` | whoever changes the thing the doc describes; say so in your summary |

## What is ready for the others

`build` updates this list. `ai` and `art` start from the first row that is true.

- [ ] Fuzzy frontend demo-able end to end (`docs/fuzzy-frontend.md` ledger shows what is still rough)
- [ ] Draft weapon and arena schemas and fixtures in `shared/`
- [ ] `AiAdapter`, `CreditLedger` interfaces and their fakes
- [ ] Asset manifest with placeholders and `docs/art/` stubs complete
- [ ] Power rating, caps and the arena validator in `engine/`
- [ ] Real `AiAdapter` swapped in behind the same interface (`ai`)
- [ ] Art delivered and wired in (`art`, then `build`)

## Delivery log

Newest first. One line each: date, who, what, where.

- 2026-11-12, `build`: Phase 0 scaffold. pnpm workspace with `shared/` (tool config only) and `webapp/` (Vite, React 19,
  Tailwind v4, Redux Toolkit, react-three-fiber; a top-down canvas with a WASD-moved square). No contract changed and
  nothing for `ai` or `art` to wire yet. Note for `ai`: dependencies are exact-pinned in `pnpm-workspace.yaml`'s `catalog:`.
- 2026-11-12, `ai`: O1 desk research. Hosting comparison and a **provisional** recommendation (option 1) in
  `docs/ai-hosting.md`; budget arithmetic and fixed-spend figures in `docs/cost-and-budget.md`. Nothing deployed, no
  dependencies installed, nothing spent. Option 2 forces Workers Paid (see `TODO.md` blockers).
