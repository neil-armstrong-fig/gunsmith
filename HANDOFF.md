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
| Sound keys | Plain-WAV `sfx-empty-click` is integrated. `sfx-damage-crunch` and `sfx-hit` are agreed for the next slices but not registered. Human browser review confirms MP3 for compressed assets; Safari onset/cadence and production mappings remain open. |
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
- [Preference-probe brief](docs/ai-stat-preference-probe.md): twelve proposed human-label rows, three encoding arms and paired omitted-stat illustrations. User chose compare both first; labels/policy review and AI-inference/engine-balancing owner agreement remain pending. This is research documentation, not a production contract or model result.
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

- 2026-11-17, `art/research 1`: removed the completed listening HTML and seven one-off JSON files at the user's request. Kept a concise [format decision/build handoff](webapp/audio/qa/runtime-playback/README.md), approved audio and existing codec tools/reports. Updated active references; no runtime/audio/index changes. Earlier delivery entries describe artifacts present at delivery time. `pnpm checks` exits 0 (one slow audio render skipped); local links, diff whitespace and root/webapp/audio standards/folder review pass.

- 2026-11-17, `art/research 1`: MP3 confirmed. Removed the temporary diagnostic workspace and stopped its local server; retained the requested listening page, WAV masters, candidates and frozen QA evidence. Updated the active queue to MP3 integration/Safari timing, superseding Ogg correction and undecided-codec wording. No runtime/assets/index changes. Folder/reference and standards review completed; no new folders/helpers/types. `pnpm checks` exits 0 (one slow audio render skipped); frozen evidence, 62 original audio/report hashes, links and diff whitespace verified.

- 2026-11-17, `art/research 1`: recorded [human browser listening](webapp/audio/qa/runtime-playback/README.md#human-listening-review--2026-11-17). Firefox/Chrome sounds equivalent; Safari Ogg hit/ring-warning/UI-click degraded, MP3 repeats slower but preferred. MP3 is the compressed direction; build should validate Safari onset and event cadence before replacing short WAV feedback or agreeing production mappings. Perceived clipping/slowness is not claimed as measured clipping/playback-rate change. Audio, runtime and frozen evidence unchanged. Documentation-only validation: `pnpm checks` exits 0 (one slow audio render skipped); local links, diff whitespace and folder/reference review pass under root/webapp/audio instructions.

- 2026-11-17, `art/research 1`: [live audio diagnosis and listening page](webapp/audio/qa/runtime-playback/README.md). Native/Chromium pass 38 candidates; WebKit reproduces 23 failures. Live/offline PCM matches at 48/44.1 kHz; ten original/substituted game-playback cases start in running contexts. User-requested local page compares WAV/Ogg/MP3, previews loop joins and exports notes. Seven probe checks, six production-preview empty-click acceptance tests, and Chromium/WebKit page checks pass after recorded red cases. Approved audio and delivered reports preserved. Firefox/native Safari listening, physical output, masking and codec/manifest approval remain open. Standards review: root/webapp/audio instructions and folder/reference audit completed. Final `pnpm checks` exits 0: repository checks, lint, formatting, strict types and unit suites pass (one slow audio render skipped). The sandboxed run stalled at audio server tests; an intermediate final run caught new evidence JSON formatting, which was fixed before the passing rerun. No paid calls or runtime changes.

- 2026-11-17, `art/research 2`: delivered the [preference-probe brief](docs/ai-stat-preference-probe.md), including twelve proposed human-label rows, three encoding arms, scorecard and numerical policy illustrations. User chose compare both first; label approval, policy selection, owner agreement, actual probes and calibration remain open. Inspected active sessions before shared edits; session 1 is on audio QA. Updated the study link and research/shared checklists only; no model call, runtime/schema/asset change or git write.
  Validation: new-brief formatting, 50 local links/anchors, twelve unique prompt rows and diff whitespace pass. Re-read root instructions and completed the folder/reference audit (new brief has five referring documents; no code helpers/types/folders added). First `pnpm checks` passed lint/types and shared 52, AI 421, engine 842 and webapp 270 tests, but audio failed on sandbox `listen EPERM`. Unrestricted rerun passed audio 270 tests with one slow render skipped, then failed webapp formatting on four concurrently generated session-1 `audio/qa/runtime-playback/evidence/` JSON files; left these with their owner. The full gate is not green. No gameplay acceptance or model eval was run for this documentation-only delivery.

- 2026-11-17, `build/tooling`: documentation compaction. Kept active standards, ownership, current decisions and unfinished work; archived complete prior versions of 13 documents. Removed stale scaffold/probe tasks and duplicate completed-feature narratives. Source code and assets are unchanged. `pnpm checks` and `checks:repository` pass; local links/anchors, folder/reference review and diff whitespace pass. No gameplay suite or paid eval was rerun for this documentation-only change.

- 2026-11-17, `build/tooling`: Codex settings/startup verified; ESLint cleanup left to Claude. Full checks and 166 production-preview acceptance tests passed before this documentation-only compaction. No inference/model-quality parity is claimed by those gates.
- 2026-11-17, `build`: empty click committed (`8acad87`); pickups are in `7298b1e`. Current behavior, limitations and next slices are in the build checklist and handovers above.

[Full pre-compaction handoff](docs/history/2026-11-17-compaction/Handoff.md),
[earlier deliveries](docs/history/HandoffDeliveries.md) and
[initial Codex audit](docs/history/CodexTuningInitial.md) preserve detailed measurements,
mutations and superseded working-tree status. Append concise current deliveries here;
put long session narratives in history.
