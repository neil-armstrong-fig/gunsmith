# Gunsmith

A 1v1 top-down 2D shooter with fog of war, where the players **write the weapons and the arena** before the match.

Each player starts with a middling assault rifle. Before a match both players describe, in plain words, the weapons
that will lie around the arena and the arena itself. An AI judge picks the more interesting arena prompt; code
enforces the rules. The catch: weapons are a shared pool at random spots, so a wildly overpowered weapon you ask for
can end up in your opponent's hands.

- **Play:** WASD to move, mouse to aim, Ctrl or C to crouch, 1 and 2 to switch weapon.
- **Stack:** React 19, react-three-fiber, Zustand, Tailwind v4; Cloudflare Workers, Durable Objects and D1;
  LangChain, LangGraph and LangSmith for the AI pipeline.
- **Method:** acceptance-test driven, modelled on [janggi](../janggi). It is also a case study in cost-controlled,
  eval-driven AI engineering (`docs/focused-case-study.md`).

**Status: M1, a playable local game; online play and production integration remain in progress.** Start with `HANDOFF.md` (who does what) and `TODO.md` (the shared north-star path); each persona also has its own checklist.

| File | What it is |
| --- | --- |
| `AGENTS.md` | Standards, commands and rules, adapted from janggi |
| `TODO.md` | The shared north-star path, status board and blockers |
| `TODO-<persona>.md` | Seven owner checklists: play, engine, ai, server, budget, art, ship; read your own current tasks |
| `HANDOFF.md` | Personas, ownership, contracts and integration handoffs |
| `MANUAL-SETUP-STEPS.md` | Everything done outside the repo |
| `docs/game-design.md` | The rules of the game, the glossary and the tunables |
| `docs/architecture.md` | Packages, hosting, and where this differs from janggi |
| `docs/match-netcode.md` | Server-authoritative play, fog filtering, rooms, matchmaking |
| `docs/schemas.md` | The weapon and arena data the AI produces (draft) |
| `docs/ai-pipeline.md` | The LangGraph pipeline, credits, judges, evals |
| `docs/ai-hosting.md` | Where the pipeline runs: the comparison to settle |
| `docs/cost-and-budget.md` | The layers of cost control and the kill switch |
| `docs/privacy-and-data.md` | What is stored, traced and deleted |
| `docs/focused-case-study.md` | Research on Focused and the case-study outline |
| `docs/art/` | The art, copy and audio briefs for `art` |

Development happens in persistent persona worktrees. The main checkout integrates reviewed commits and validates the combined result; worktrees merge updated main before continuing. See [the workflow](docs/agent-reference/Operations.md#development-worktrees-and-the-integration-checkout).
