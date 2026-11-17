# HANDOFF

Current ownership, contracts and cross-session dependencies. Follow `TODO.md` for startup;
use the owner checklists for tasks. Long implementation/test narratives are historical references.

## The personas

Ownership follows the user's assigned persona, not the product or model. Existing sessions
use build, ai and art; user-directed maintenance follows its explicit scope.

| Persona | Checklist | Responsibility |
| ------- | --------- | -------------- |
| build | `TODO-build.md` | Game/runtime, shared contracts, project tooling and infrastructure |
| ai | `TODO-ai.md` | AI pipeline, evals, credit/spend integration and AI research |
| art | `TODO-art.md` | Authored assets/audio, copy and art research; build integrates runtime changes |

### Start prompts

"You are build|ai|art. Follow the startup protocol in TODO.md, then continue your
current resume section. Read applicable instructions and references before editing."
Check active ownership before overlapping work; old thread/worktree names are not current reservations.

## Contracts between sessions

| Contract | Current state / owner |
| -------- | --------------------- |
| Canvas state hook | Build-owned, tiny and read-only; shared snapshot types have real webapp/acceptance consumers. Includes seeded pickup visibility/inventory data. Do not add write seams. |
| Combat events | Build-owned `World.events` covers one local-player step; currently empty-fire refusal. Frozen steps clear events. It is not a network snapshot or sound-state hook. |
| Sound keys | Plain-WAV `sfx-empty-click` is integrated. `sfx-damage-crunch` and `sfx-hit` are agreed for the next slices but not registered. Codec approval remains open. |
| AI hosting | API will import AI in-process in the Worker. Keep the graph host-agnostic/Workers-safe; only API imports AI runtime. |
| Stats/appearance integration | Accepted design: separate stages, five calls maximum, one repair per stage, disclosed appearance fallback; implementation and renderer consumer remain open. |
| Planned M2 contracts | Weapon/arena schemas and fixtures, adapter/fake, ledger, credit config, asset manifest, wire messages, power rating/caps and arena validity are introduced with real consumers and owner review. Do not build against withdrawn drafts. |

Before changing a contract another persona consumes, record it here and identify affected owners.
Future proposals are not existing runtime contracts. Detailed planned responsibilities and credit/ledger
requirements remain in [the snapshot](docs/history/2026-11-17-compaction/Handoff.md#contracts-between-sessions)
and the linked design documents.

## Ready handovers and preserved decisions

- [Inventory](docs/art/concepts/inventory-display/README.md): user-approved two icons and selected name; build owns data/hook/manifest agreement and implementation.
- [Combat feedback](docs/art/concepts/combat-feedback/Handover.md): punchy/crunch and retained shake. Empty click is committed as `8acad87`; damage, outgoing hit and shake remain open. Tune the click's abrasive/loud impression with other sounds.
- [Fair arenas](docs/art/arena-fairness-research.md): matching spawns and unchanged random ring centres; symmetrical geometry/stairs and paired playtests remain implementation work.
- [AI integration](docs/ai-visual-generation.md#ai-session-handoff-2026-11-15) and [stat balancing](docs/ai-stat-balancing.md): integration first; preserve actual cumulative spend, deliberate weak weapons and open omitted-stat policy.
- [Fair play](docs/art/fair-play-research.md) and [asset reference](docs/art/asset-reference/README.md): implementation/production approval remains with the relevant owners.
- [Earlier mechanics/appearance decisions](docs/agent-reference/SessionDecisions.md): stairs-only height transitions, no arena level labels, weapon-owned forward vision, crouch tradeoff, proposed visual grammar and shelved kit experiment.

## Folder ownership

| Path | Owner |
| ---- | ----- |
| `TODO-build.md`, `shared/`, `engine/`, `webapp/src/`, `api/` (except the AI parts), `acceptance-tests/`, `infra/`, `.github/workflows/ci.yml`, `property-tests.yml` | `build` |
| `TODO-ai.md`, `ai/`, `.github/workflows/evals.yml`, `api/src/ai/` (credits spend, gateway client, kill switch), `docs/ai-pipeline.md`, `docs/ai-hosting.md`, `docs/cost-and-budget.md` | `ai` |
| `TODO-art.md`, `webapp/public/assets/`, `webapp/audio/`, `docs/art/`, `docs/focused-case-study.md` (illustrations) | `art` |
| `AGENTS.md`, `TODO.md` (shared path), `HANDOFF.md`, `MANUAL-SETUP-STEPS.md`, other `docs/` | whoever changes the thing the doc describes; say so in your summary |

## What is ready for the others

`build` updates this list. `ai` and `art` start from the first row that is true.

- [ ] A fun, playable game first (full-screen canvas, built test-first; `TODO-build.md`). Menus are added around it afterwards
- [ ] Weapon and arena schemas and fixtures in `shared/`. **Withdrawn 2026-11-12:** deleted, to return test-first when a second package needs them
- [ ] `AiAdapter`, `CreditLedger` interfaces and their fakes. **Withdrawn 2026-11-12:** deleted with the fake world; they return when the game is fun and the AI is next
- [ ] Asset manifest with placeholders and `docs/art/` stubs complete
- [ ] Power rating, caps and the arena validator in `engine/`
- [ ] Real `AiAdapter` swapped in behind the same interface (`ai`)
- [ ] Art delivered and wired in (`art`, then `build`)

## Delivery log

- 2026-11-17, `build/tooling`: documentation compaction. Kept active standards, ownership, current decisions and unfinished work; archived complete prior versions of 13 documents. Removed stale scaffold/probe tasks and duplicate completed-feature narratives. Source code and assets are unchanged. `pnpm checks` and `checks:repository` pass; local links/anchors, folder/reference review and diff whitespace pass. No gameplay suite or paid eval was rerun for this documentation-only change.

- 2026-11-17, `build/tooling`: Codex settings/startup verified; ESLint cleanup left to Claude. Full checks and 166 production-preview acceptance tests passed before this documentation-only compaction. No inference/model-quality parity is claimed by those gates.
- 2026-11-17, `build`: empty click committed (`8acad87`); pickups are in `7298b1e`. Current behavior, limitations and next slices are in the build checklist and handovers above.

[Full pre-compaction handoff](docs/history/2026-11-17-compaction/Handoff.md),
[earlier deliveries](docs/history/HandoffDeliveries.md) and
[initial Codex audit](docs/history/CodexTuningInitial.md) preserve detailed measurements,
mutations and superseded working-tree status. Append concise current deliveries here;
put long session narratives in history.
