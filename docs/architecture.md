# Architecture

Gunsmith uses a pnpm TypeScript workspace. Local gameplay and private-room online play work today; authentication, persistence and deployment remain planned.

## Existing packages

| Package | Responsibility | Workspace imports |
| --- | --- | --- |
| `engine/` | Deterministic simulation, movement, combat, vision, stairs, ring, opponent, rating and balancing | shared |
| `webapp/` | Vite, React, react-three-fiber, Zustand, HUD, input, rendering and sound | shared, engine |
| `ai/` | Validated weapon stats and appearance, LangGraph, model adapters and evals | shared, engine |
| `shared/` | Base tooling and the read-only snapshot contract used by browser acceptance tests | none |
| `api/` | Private rooms, authoritative fog-filtered matches and credit/spend Durable Objects | shared, engine, ai |
| `acceptance-tests/` | Playwright acceptance DSL and specifications | shared |
| `webapp/audio/` | Offline synthesis, approved masters, codec studies and verification | none |

Packages consume engine/shared TypeScript directly. ESLint enforces import boundaries. Shared contracts move into `shared/` only when a second package genuinely imports them. See [AGENTS.md](../AGENTS.md).

## Local game

The engine advances a seeded world at a fixed timestep. The browser loop stores that world once per frame in Zustand. Drawing reads frame values directly; React subscribes only to slow derived readouts. See [state management](state-management.md).

The game fills the window. Menus are added only when needed. Browser acceptance tests use a tiny read-only snapshot and screenshot checks for what is actually drawn; they never recompute expectations with the engine.

## Planned online system

One Cloudflare Worker will serve static assets and `/api/*`, keeping session cookies same-origin. A Match Durable Object runs the same engine authoritatively at 60 Hz with 30 Hz snapshots; clients predict local movement and interpolate the opponent. Player snapshots must omit hidden opponents, and hidden sounds expose only quantised direction. See [netcode](match-netcode.md).

The planned API imports `ai/` in-process using Workers-compatible LangChain/LangGraph. D1 is planned for accounts, library and match history; the sign-in design is in [sign-in](sign-in.md). CreditLedger and SpendLedger Durable Objects hold credits and spend counters. Budget owns atomic spend enforcement and tracing; server owns routing and common storage configuration. Private recording storage is a future fair-play capability, not an existing binding.

`api/` exists locally; `infra/` remains planned. Alchemy deployment, Google sign-in, D1, matchmaking, AI generation routes and live acceptance await real consumers, reviewed contracts and provisioning authorization. Intended deployment is `gunsmith.neilarmstrong.dev`; forks will need their own domain and manual setup.

## Decisions and unresolved measurements

- [AI hosting](ai-hosting.md): in-process Worker execution is chosen; production CPU and trace flushing still need measurement.
- [Costs](cost-and-budget.md): free versus Workers Paid depends on real match/AI measurements and authorization.
- [Privacy](privacy-and-data.md): minimal identities, closed-event logs and private evidence.
- [Manual setup](../MANUAL-SETUP-STEPS.md): external accounts and settings are not implied by local installation.
