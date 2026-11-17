# HANDOFF

Current ownership, contracts and cross-session dependencies. Follow [TODO.md](TODO.md) for startup; each owner maintains its own resume and status row. Historical delivery entries retain the names used at delivery.

## The personas

Ownership follows the assigned persona. Models below are defaults; no application/model settings are changed. The old build role is retired.

| Persona | Model | Checklist | Responsibility |
| --- | --- | --- | --- |
| play | Claude | [TODO-play.md](TODO-play.md) | Combat feedback, HUD/inventory, camera and runtime audio; close M1 playtest. |
| engine | Claude | [TODO-engine.md](TODO-engine.md) | Finish source-worktree cross-level bot work; extend merged routing, validators and balancing. |
| ai | Claude | [TODO-ai.md](TODO-ai.md) | Fix eight reported canned-response fake-eval failures; renderer, calibration and arena generation. |
| server | Claude | [TODO-server.md](TODO-server.md) | First authoritative two-browser slice after M1; auth, persistence and online privacy. |
| budget | Claude | [TODO-budget.md](TODO-budget.md) | Production ledger/spend boundaries with server/AI; credits, refunds, tracing and kill switch. |
| art | Codex | [TODO-art.md](TODO-art.md) | Production assets/presentation, Safari timing and combat masking; current sprites/MP3 are integrated. |
| ship | Codex | [TODO-ship.md](TODO-ship.md) | Repository tooling/CI now; infra/release when bindings and authorization exist. |

### Start prompts

"You are play|engine|ai|server|budget|art|ship, continue the TODO. Follow the startup protocol in TODO.md; read applicable instructions before editing."

Read shared status/handoff and your own current checklist, not all seven backlogs. Check dependencies and reserve concrete files before overlapping another session. Existing unfinished source-worktree changes remain with their current session until explicitly handed over; an old thread name is not an active reservation.

## Folder and contract ownership

| Domain / paths | Primary writer | Consumers / boundaries |
| --- | --- | --- |
| engine/; simulation events, rating/caps, arena validation; engine vocabulary in shared | engine | play consumes local events/data; ai proposes preferences; server runs authority |
| Webapp combat HUD, camera/input offsets, runtime sound playback and playtests | play | engine writes rules/events; art writes assets/loading/manifests |
| ai/; generated-appearance renderer; AI adapter result schema and eval workflow | ai | engine reviews rule constraints; server wires API; budget guards production calls |
| api/ application, auth, match, account/library/history storage; browser networking/prediction | server | Excludes budget-owned AI operations. Server owns shared API routing and common DB migration configuration |
| api/src/ai/ production credits/spend/Gateway/kill switch/tracing and domain storage/tests | budget | Coordinate credit schema/migration changes through server; ai retains its existing eval paid-spend guard |
| webapp/public/assets/, webapp/audio/, asset manifests/loading, authored styling/overlays, docs/art/ | art | play owns combat/HUD behavior; ai owns generated renderer and weapon-shot synthesis |
| infra/, general CI/property workflow, root scripts, shared/config/, manual setup and release evidence | ship | server/budget supply bindings; ai owns eval workflow semantics; no unauthorized live changes |
| acceptance-tests/ and consumed shared contracts | Feature owner | Reserve the feature's concrete files, including common DSL/hooks; domain owner writes shared contract changes after consumer review |
| AGENTS.md, TODO.md, HANDOFF.md and other shared docs | Owner of described change | Update only your row/section; reread immediately before editing |

Every TODO-<persona>.md belongs to its named persona. Future path assignments are ownership boundaries, not permission to scaffold before a real consumer exists. Overlapping webapp components/shared files have one writer per slice, recorded below; consumers request changes through the handoff rather than overwrite them.

## Integration workflow

Main is an integration checkout. All seven personas develop in their own worktrees and carry their TODO/status/handoff updates with their commits. The integration session reviews and merges committed deliveries one at a time, validates main, and records its resulting commit/checks. Each worktree then merges committed main before continuing; updates are explicit, not automatic. Record the worktree path/branch and last merged main commit in the persona resume. Keep persistent worktrees and unfinished legacy work; no automatic teardown, rebase or work transfer. Follow [Operations](docs/agent-reference/Operations.md#development-worktrees-and-the-integration-checkout); existing git permissions remain in force.

## Active reservations and requests

No new runtime file reservations are established by this migration. engine coordinates unfinished engagement/cover work, art coordinates unfinished projectile work, and ai coordinates remaining source-worktree improvements before taking those files. Record the persona, slice, concrete files, dependencies and handoff when reserving new work.

## Contracts between sessions

| Contract | Current state / writer |
| --- | --- |
| Canvas state hook | play writes the read-only browser hook, with engine owning simulation meanings and all affected consumers reviewing shared snapshot changes. Existing seeded pickup/inventory data is consumed; no write seams |
| Combat events | engine owns World.events for a local simulation step; currently empty-fire refusal. play consumes each tick; frozen steps clear events. Damage/hit additions remain open; this is not the network sound contract |
| Asset/sound manifest | art owns keys/loading; play agrees integration needs. MP3 sfx-empty-click is integrated; sfx-damage-crunch and sfx-hit remain agreed but unregistered. Safari timing is follow-up QA |
| AI hosting and adapter | API imports AI in-process, Workers-safe. ai owns generation outcomes; server owns API wiring; budget owns production spend/tracing guards |
| Stats/appearance | Merged separate stages, five calls maximum, one repair per stage, disclosed appearance fallback. ai owns remaining renderer consumer; schema moves require a real second consumer |
| Initial engine balancing | Merged rating/balancer and eight property tests are implementation evidence. engine and ai still owe calibration/probes; labels and AI-chosen omitted-stat policy are approved |
| Planned M2 contracts | Domain writers: engine weapon/arena constraints, ai adapter, budget ledger/credit configuration, art asset manifest, server wire messages. Freeze only with real consumers and affected owner review |

Before changing a consumed contract, record the proposal and affected owners here. Existing decisions remain in [SessionDecisions](docs/agent-reference/SessionDecisions.md); future proposals are not runtime contracts.

## Ready handovers and preserved decisions

- [Inventory](docs/art/concepts/inventory-display/README.md) and [combat feedback](docs/art/concepts/combat-feedback/Handover.md) are approved: play implements behavior, engine supplies events/data, art supplies manifest assets. Preserve punchy/crunch and retained shake; tune empty-click levels with other sounds.
- [Fair arenas](docs/art/arena-fairness-research.md): engine owns matching spawns, transformed geometry/stairs, clearance and paired playtests; random ring centres remain unchanged.
- [AI integration](docs/ai-visual-generation.md#ai-session-handoff-2026-11-15) is merged; [stat balancing](docs/ai-stat-balancing.md) and [preference brief](docs/ai-stat-preference-probe.md) guide calibration. Preserve deliberate weakness and cumulative paid spend; no new budget/paid authorization is implied.
- [Fair play](docs/art/fair-play-research.md) belongs to server; [asset reference](docs/art/asset-reference/README.md) belongs to art. Historical references to build route through the ownership table above.
- Source-worktree unfinished projectile, engagement/cover and AI improvements were not included by the committed merges. Preserve them and coordinate before overlapping.

## What is ready for the others

- [ ] M1 playtest verdict: play coordinates; engine completes rule/bot dependencies. Existing duel/crouch/click have been tried by the user.
- [ ] Consumer-reviewed M2 contracts/manifest: domain writers above coordinate; withdrawn drafts stay withdrawn.
- [ ] Full arena validity/caps/property coverage: engine extends the merged initial rating/balancer.
- [ ] Real adapter/API, accounting and fallbacks: ai, server and budget each deliver their side.
- [ ] Production art/audio and live release: art/play integrate their domains; ship validates release.

## Delivery log

- 2026-11-17, integration workflow: user selected integration-only main and persistent persona development worktrees, with explicit worktree → main → worktree merges. Updated startup/ownership guidance and all persona resumes. Existing staged migration and unfinished legacy worktrees preserved; no worktree, index or branch mutation performed. Validation: pnpm checks passes (lint/format/types and shared 59, acceptance helpers 9, engine 976, audio 270 with one slow render skipped, AI 507, webapp 296 tests). Repository gate, thirteen workflow/startup documents, 82 local references and diff whitespace pass. Re-read root instructions and Operations.md; standards/folder/caller review complete, with no new source files, helpers, types or folders. This is coordination guidance only; no runtime/acceptance/eval changes or paid calls.

- 2026-11-17, persona migration: split build/ai/art into play, engine, ai, server, budget, art and ship (five Claude, two Codex defaults). Preserved all 74 original checkbox tasks and source text in [migration history](docs/history/2026-11-17-persona-migration.md). Updated ownership/startup and registered all seven checklists. The new checker regression first failed for exactly the five new personas, then all eleven instruction-check cases passed. Final pnpm checks exits 0: lint/format/types and shared 59, acceptance helpers 9, engine 976, audio 270 (one slow render skipped), AI 507 and webapp 296 tests pass. Sandboxed audio first failed with listen EPERM; unrestricted rerun passed. Seven checklist structures, five Claude/two Codex assignments, 74 routing rows, 81 startup/checklist links and diff whitespace pass. Standards review re-read root/shared/AI/audio instructions and completed the folder/caller audit: no new code helpers/types/folders, root TODO entrypoints are intentional and the history snapshot is referenced by every persona. No gameplay acceptance or model eval was rerun for this docs/tooling change; earlier gameplay/model evidence remains explicitly inherited. No runtime feature, paid call or git write.


- 2026-11-17, integration: merged committed AI stats/appearance pipeline, LangGraph execution, initial engine rating/balancing, property tests and eval grouping from `worktree-ai-hosting-proof`. Preserved main’s separated type definitions and repository gate. Calibration/model evidence remains distinct from implementation; no uncommitted source-worktree changes or paid calls included. Validation: `pnpm checks` passes (shared 52, acceptance helpers 9, engine 976, audio 270 with one slow render skipped, AI 507, webapp 296); eight property tests and all 199 production-preview acceptance tests pass. Fake evals: 126 pass, eight fail because the canned moderator/generator approve non-weapon and armour requests; no model-quality claim or paid run. Standards review used root, AI, engine, webapp/React, acceptance and shared instructions; folder/caller audit completed and graph state types placed in `types/`. Initial offline install lacked registry metadata; frozen installation succeeded with 417 reused packages and no version changes.


- 2026-11-17, integration: merged committed stair-aware bot routing, stair-flank validation and terraced ring-climbing coverage from `worktree-build-3-reticle`. Uncommitted engagement/cover work remains in its source worktree. Combined validation follows the AI merge.


- 2026-11-17, integration: merged committed player/opponent and dummy art from `worktree-build-2-art`; preserved sprite anchors, fallback/readiness and visual acceptance coverage. Uncommitted projectile work remains in its source worktree. Combined validation follows the remaining merges.


- 2026-11-17, `art/research 1`: user authorized the runtime MP3 switch. Encoded selected `empty-tight` with existing LAME quality/rate settings; `sfx-empty-click` now imports a separate MP3 asset under the same key. Removed the redundant runtime WAV; preserved all 77 original audio/evidence hashes. Updated active format guidance and queues; Safari timing is follow-up QA. The new MP3 playback assertion failed against the WAV build first. Final production-preview acceptance: six Chromium and six WebKit cases pass. WebKit exposed back-to-back release/repress test input missing a simulation tick; the spec now advances game time after release. Runtime playback/latch code is unchanged. `pnpm checks` exits 0 (lint/format/types/unit tests); full `test:render` passes in 284.50 s. Native codec/decode, 222 local links and diff whitespace pass. Re-read root/webapp/audio/acceptance instructions; standards and folder/caller audit complete (one asset caller; no new folders/helpers/types). Initial sandbox browser/server attempts failed on permissions; unrestricted runs succeeded. No dependencies, paid calls or git writes.

- 2026-11-17, `art/research 2`: recorded user-approved label revision v1 and the selected AI-chosen omitted-stat policy in the [brief](docs/ai-stat-preference-probe.md) and [study](docs/ai-stat-balancing.md). Clarified overall deliberate weakness and the tactical bad-weapon rationale; updated art/shared status and AI-owner follow-ups. No runtime/schema/assets, model calls, spending or git writes. Validation: twelve unique unchanged prompts, 53 local links/anchors and diff whitespace pass. Re-read root `AGENTS.md`; standards and folder/reference audit complete (no new files/folders/helpers/types). `pnpm checks` exits 0 outside the sandbox: lint/format/types and shared 52, AI 421, engine 842, webapp 270 and audio 270 tests pass; one slow audio render skipped. Stopped the sandboxed run after it stalled in audio. No gameplay acceptance or model eval was run for this documentation-only delivery.

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
