# HANDOFF

Current ownership, contracts and cross-session dependencies. Follow [TODO.md](TODO.md) for startup; each owner maintains its own resume and status row. Completed session narratives are kept outside the public documentation.

## The personas

Ownership follows the assigned persona. Models below are defaults; no application/model settings are changed. The old build role is retired.

| Persona | Model | Checklist | Responsibility |
| --- | --- | --- | --- |
| play | Claude | [TODO-play.md](TODO-play.md) | Combat feedback, HUD/inventory, camera and runtime audio; close M1 playtest. |
| engine | Claude | [TODO-engine.md](TODO-engine.md) | Bot pickup-seeking; extend merged routing, cross-level engagement/cover, validators and balancing. |
| ai | Claude | [TODO-ai.md](TODO-ai.md) | Fake-eval failures fixed and integrated; renderer, calibration and arena generation next. |
| server | Claude | [TODO-server.md](TODO-server.md) | First authoritative two-browser slice after M1; auth, persistence and online privacy. |
| budget | Claude | [TODO-budget.md](TODO-budget.md) | Production ledger/spend boundaries with server/AI; credits, refunds, tracing and kill switch. |
| art | Codex | [TODO-art.md](TODO-art.md) | Ring-damage loop approved by user; use WAV to avoid WebKit MP3 padding. Renderer review awaits AI S3. |
| ship | Codex | [TODO-ship.md](TODO-ship.md) | Repository tooling/CI now; infra/release when bindings and authorization exist. |

### Start prompts

"You are play|engine|ai|server|budget|art|ship, continue the TODO. Follow the startup protocol in TODO.md; read applicable instructions before editing."

Read shared status/handoff and your own current checklist, not all seven backlogs. Check dependencies and reserve concrete files before overlapping another session. An old thread name is not an active reservation.

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

**ship — documentation cleanup ready for review:** uncommitted in the ship worktree. Documentation and repository archive exclusion only; no runtime reservations.
**engine → ai (2026-11-17):** engine owns the arena validator: `validateArena(arena: Arena): readonly ArenaProblem[]` in `engine/src/arena-validation/ValidateArena.ts` (built in worktree `engine`, awaiting the user's commit and integration). It never throws and returns every problem (`{kind: "noFloor" | "disconnected", reason, tile}`). Not covered yet: bounds/size limits, wall density, single-tile corridors, start reachability, ring escape. Reserved with engine and not started: (b) spawn placement and symmetric finalisation (changes the `Arena` shape; engine will say when it is decided), (c) the built-in arena pool as one engine list, (d) an arena limits constant. ai keeps its interim check behind one function and writes nothing under `engine/`.

**Integrated 2026-11-17:** play’s damage events, crunch audio and sound manifest are in main. Play’s next HUD/feedback slice, engine’s additional hit events, AI’s generated-pickup renderer and server’s online slice remain unfinished in their own worktrees; preserve their indexes and working files. Owners sync committed main when clean before continuing.

**Art → play, ring-damage loop delivered:** [WAV/MP3 and reproduction guide](webapp/audio/studies/ring-damage/README.md), key `sfx-ring-damage-loop`. WAV loops exactly at 48/44.1 kHz in Chromium/WebKit. MP3 seam checks pass but WebKit adds 40 ms padding; use WAV for the ring loop or handle/listen to MP3 bounds before integration. The user approved the sound in Visual Studio Code. Play owns registration, start/stop, ~100 ms fades and acceptance coverage; ring damage no longer uses crunch/onset. No runtime files reserved by art.

**Art → AI, pickup review:** [review checkpoint](docs/art/concepts/top-down-oddities/README.md#runtime-pickup-review-checkpoint--2026-11-17) prepared. Supply the S3 production-preview URL, exact source state and all six `DrawingAGeneratedWeapon` results with red/mutation evidence. S0–S2 are present in AI’s worktree; S3 drawing is absent at inspection. Art has no runtime reservation or visual verdict; renderer changes stay with AI.

- **ship → budget + ai (user request, 2026-11-17): research an eval automation strategy.** Budget evaluates cost/cadence with AI owning cases, baseline and regression/capability gating. Compare fake harness checks on AI changes, a small paid regression selection, and full baseline runs on explicit authorization; include per-run/monthly costs, trials/retries, cancellation, trace quota, result-cache policy and a cumulative spend guard safe across CI runners. Reconcile existing spend across checkouts before proposing any paid automation; the current $1 cumulative ceiling is unchanged. Verify the integrated fake-tier fixes before proposing a fake gate, and never describe fake scores as model-quality evidence. Return a concrete recommended trigger/gate/budget policy for review; ship implements the agreed workflow afterward. Research only: no paid calls, ceiling changes or live settings are authorized by this request.
- **ship → budget performance follow-up:** four acceptance shards and combined reporting are implemented. Local build/test profiling is in Operations.md; first hosted run still needs setup/artifact/merge overhead, total runner minutes and elapsed time. Compare with the earlier 6.3-minute local baseline without treating different-load measurements as hosted speedup.

## Contracts between sessions

| Contract | Current state / writer |
| --- | --- |
| Canvas state hook | play writes the read-only browser hook, with engine owning simulation meanings and all affected consumers reviewing shared snapshot changes. Existing seeded pickup/inventory data is consumed; no write seams |
| Combat events | engine owns World.events for a local simulation step: `fireRefused` (empty click) and, delivered by play 2026-11-17 to unblock slice 2 (the user allowed touching engine), `damageTaken {cause: "bullet" \| "ring", amount}`: the health the local player actually lost, bullet first then ring, so the amounts never exceed the health they had; one event per cause per step, the ring's every step the player is outside it (a fraction of a point); never about the opponent (`EventsRequest.damage` is the player's alone). play consumes each tick; frozen steps clear events. **`hitLanded {on: "opponent" \| "dummy"}`** (engine, committed `91b06c9`, merged with main 2026-11-17): one per player's bullet that landed, only when the target is in sight (`visibleToPlayer`) with both fighters as they stand after their turns this step; never a position, a hidden target emits nothing, the opponent's bullets never emit. Order in `World.events`: `fireRefused`, bullet loss, ring loss, hits. play: review and consume; this is not the network sound contract |
| Asset/sound manifest | art owns keys/loading; play agrees integration needs. MP3 `sfx-empty-click` and `sfx-damage-crunch` are integrated; crunch comes from art’s 180 ms mono 48 kHz master via the existing MP3 recipe. `sfx-hit` remains unregistered. The approved continuous `sfx-ring-damage-loop` WAV/MP3 study is delivered ([guide](webapp/audio/studies/ring-damage/README.md)); use WAV or address documented WebKit MP3 padding. Play owns registration, start/stop and ~100 ms fades. The ring remains silent until runtime integration. Safari audio is accepted; combat masking/fatigue remains open. |
| AI hosting and adapter | API imports AI in-process, Workers-safe. ai owns generation outcomes; server owns API wiring; budget owns production spend/tracing guards |
| Stats/appearance | Merged separate stages, five calls maximum, one repair per stage, disclosed appearance fallback. ai owns remaining renderer consumer; schema moves require a real second consumer |
| Initial engine balancing | Merged rating/balancer and eight property tests are implementation evidence. engine and ai still owe calibration/probes; labels and AI-chosen omitted-stat policy are approved |
| Planned M2 contracts | Domain writers: engine weapon/arena constraints, ai adapter, budget ledger/credit configuration, art asset manifest, server wire messages. Freeze only with real consumers and affected owner review |

Before changing a consumed contract, record the proposal and affected owners here. Existing decisions remain in [SessionDecisions](docs/agent-reference/SessionDecisions.md); future proposals are not runtime contracts.

## Ready handovers and preserved decisions

- Empty-click game-event cadence passes in Chromium/WebKit, including repeats shorter than decoded buffers. [Timing findings](webapp/audio/qa/runtime-playback/README.md#runtime-onset-and-cadence-follow-up--2026-11-17) retain WebKit’s approximately 12 ms main-transient offset without applying a trim. The user accepted Safari audio as good enough on 2026-11-17, closing native listening follow-up without new device measurements. AI/play: runtime weapon-shot audio is still needed before art can assess combat masking/fatigue and levels.

- Art reviewed the existing orange rifle shot on 2026-11-17; the user selected the matching team silhouette. Keep its file, `#FF9B54`, scale and tip (49, 32). The earlier redraw request is closed; later weapon classes still need both colours. No manifest or gameplay contract changed.

- [Inventory](docs/art/concepts/inventory-display/README.md) and [combat feedback](docs/art/concepts/combat-feedback/Handover.md) are approved: play implements behavior, engine supplies events/data, art supplies manifest assets. Preserve punchy/crunch and retained shake; tune empty-click levels with other sounds.
- [Fair arenas](docs/art/arena-fairness-research.md): engine owns matching spawns, transformed geometry/stairs, clearance and paired playtests; random ring centres remain unchanged.
- [AI integration](docs/ai-visual-generation.md#accepted-constraints) is merged; [stat balancing](docs/ai-stat-balancing.md) and [preference brief](docs/ai-stat-preference-probe.md) guide calibration. Preserve deliberate weakness and cumulative paid spend; no new budget/paid authorization is implied.
- [Fair play](docs/art/fair-play-research.md) belongs to server; [asset reference](docs/art/asset-reference/README.md) belongs to art. Historical references to build route through the ownership table above.

## What is ready for the others

- [ ] M1 playtest verdict: play coordinates; engine completes rule/bot dependencies. Existing duel/crouch/click have been tried by the user.
- [ ] Consumer-reviewed M2 contracts/manifest: domain writers above coordinate; withdrawn drafts stay withdrawn.
- [ ] Full arena validity/caps/property coverage: engine extends the merged initial rating/balancer.
- [ ] Real adapter/API, accounting and fallbacks: ai, server and budget each deliver their side.
- [ ] Production art/audio and live release: art/play integrate their domains; ship validates release.

## Delivery log
- 2026-11-17, engine (`worktree-engine`, merged main `2d7c568` as `994dc7c`): merged main's `damageTaken` (play's, `damage-taken/`) with my committed `hitLanded` and `visibleHits` (`91b06c9`), keeping main's names (`EventsRequest.damage`) and a named `DamageCause`. Built `validateArena` (uncommitted): `arena-validation/{ValidateArena,regions/OpenRegionsOf,types/}` with 14 engine tests and `webapp/src/game/built-in-arenas/BuiltInArenas.test.ts` (4) proving the duel, heights, practice and terraced arenas valid; no `Arena` shape change. Watched red first (module missing), 5 mutants killed and restored, `pnpm checks` green (engine 1086, webapp 330, ai 541), 10 sound acceptance specs pass on a preview build after the merge. Also six property tests for `validateArena` (`engine/src/arena-validation/property-tests/`, listed in `engine/vitest.config.ts`, run by `pnpm test:properties`: 100 and 2000 cases pass; 4 mutants killed, e.g. a walker that cannot step west). They do not cover stair or height rules.
**Art → play, terrain candidates delivered:** [review sheet and integration notes](docs/art/terrain/README.md). Three floor levels and solid wall, 64×64 SVGs at 64 pixels/tile, centre (32,32); filenames l1/l2/l3 correspond to engine levels 0/1/2. User approval pending. No runtime reservation, renderer or manifest change.

## Latest ship delivery

Self-contained README/contributor/index and technical docs; obsolete narratives archived locally, active persona workflow preserved. `pnpm checks` passes: lint/format/types and 2,250 tests, one slow audio render skipped. Production compile passes with a chunk-size warning. Archive exclusion is red/green and mutation-proved; Markdown links/anchors, archive hashes, ignore behavior and diff whitespace pass. Root/shared/AI/engine/webapp/React/audio/acceptance instructions reread; standards and folder/caller audit complete, with no new code helpers/types/folders. Sandbox audio run stalled; rerun with local-server access passed. No gameplay acceptance or paid eval run; no cleanup commit, push or publication.
