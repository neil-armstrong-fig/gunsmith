# Architecture

Gunsmith uses a pnpm TypeScript workspace. Local play, private-room online play, Google sign-in, the account library and AI generation work today, deployed to Cloudflare.

## Existing packages

| Package | Responsibility | Workspace imports |
| --- | --- | --- |
| `engine/` | Deterministic simulation, movement, combat, vision, stairs, ring, opponent, rating and balancing | shared |
| `webapp/` | Vite, React, react-three-fiber, Zustand, HUD, input, rendering and sound | shared, engine |
| `ai/` | Weapon and arena generation (LangGraph, model adapters), validation and evals | shared, engine |
| `shared/` | Base tooling and the read-only snapshot contract used by browser acceptance tests | none |
| `api/` | Sign-in, the library, generation routes, private rooms, authoritative fog-filtered matches and credit/spend Durable Objects | shared, engine, ai |
| `infra/` | Deployment of the Workers, D1 and Durable Objects with Alchemy | none |
| `acceptance-tests/` | Playwright acceptance DSL and specifications | shared |
| `webapp/audio/` | Offline synthesis, approved masters, codec studies and verification | none |

Packages consume engine/shared TypeScript directly. ESLint enforces import boundaries. Shared contracts move into `shared/` only when a second package genuinely imports them. See [AGENTS.md](../AGENTS.md).

## Local game

The engine advances a seeded world at a fixed timestep. The browser loop stores that world once per frame in Zustand. Drawing reads frame values directly; React subscribes only to slow derived readouts. See [state management](state-management.md).

The game fills the window. Menus are added only when needed. Browser acceptance tests use a tiny read-only snapshot and screenshot checks for what is actually drawn; they never recompute expectations with the engine.

## Online system

Cloudflare Workers serve the static webapp at `gunsmith.neilarmstrong.dev` and the API at `gunsmith-api.neilarmstrong.dev`. The API allows credentialed requests from the exact webapp origin and keeps session cookies on the API hostname. A Match Durable Object runs the same engine authoritatively at 60 Hz with 30 Hz snapshots; clients predict local movement and interpolate the opponent. Player snapshots must omit hidden opponents, and hidden sounds expose only quantised direction. See [netcode](match-netcode.md).

The API imports `ai/` in-process using Workers-compatible LangChain/LangGraph. D1 holds accounts, sessions, the library and private generation history; match history is planned. The sign-in design is in [sign-in](sign-in.md). CreditLedger and SpendLedger Durable Objects hold credits and spend counters. Private recording storage is a future fair-play capability, not an existing binding.

The release workflow in `infra/` uses Alchemy for D1, the API Worker and its Durable Objects, and the static webapp Worker. Releases are manual for now ([manual setup](../MANUAL-SETUP-STEPS.md#first-deploy)); live acceptance against production is still open. Forks need their own domain and manual setup.

## Decisions and unresolved measurements

- [AI hosting](ai-hosting.md): in-process Worker execution is chosen; production CPU and trace flushing still need measurement.
- [Costs](cost-and-budget.md): free versus Workers Paid depends on real match/AI measurements and authorization.
- [Privacy](privacy-and-data.md): minimal identities, closed-event logs and private evidence.
- [Manual setup](../MANUAL-SETUP-STEPS.md): external accounts and settings are not implied by local installation.
