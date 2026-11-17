# HANDOFF

Current ownership, contracts and cross-session dependencies. Follow [TODO.md](TODO.md) for startup; each owner maintains its own resume and status row. Completed session narratives are kept outside the public documentation.

## The personas

Ownership follows the assigned persona. Models below are defaults; no application/model settings are changed. The old build role is retired.

| Persona | Model | Checklist | Responsibility |
| --- | --- | --- | --- |
| play | Claude | [TODO-play.md](TODO-play.md) | Combat feedback, HUD/inventory, camera and runtime audio; close M1 playtest. |
| engine | Claude | [TODO-engine.md](TODO-engine.md) | Bot pickup-seeking; extend merged routing, cross-level engagement/cover, validators and balancing. |
| ai | Claude | [TODO-ai.md](TODO-ai.md) | Generated pickup renderer and fake-tier arena pipeline integrated; art readability review, judge, engine-validator adoption and calibration next. |
| server | Claude | [TODO-server.md](TODO-server.md) | Initial private-room networking integrated; prediction/interpolation ongoing, then match flow/auth/persistence. |
| budget | Claude | [TODO-budget.md](TODO-budget.md) | Production ledger/spend boundaries with server/AI; credits, refunds, tracing and kill switch. |
| art | Codex | [TODO-art.md](TODO-art.md) | Approved ring loop awaits play integration; generated pickup renderer is ready for readability review. |
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

**ship delivery ready for review — free eval gate:** root `package.json`, `.github/workflows/ai-evals.yml`, eval-policy and ship coordination/manual-setup docs. AI retains selection, paid guard and evidence implementation; no AI source files reserved by ship.

**Integrated 2026-11-17:** ship’s documentation cleanup, engine’s local hit events and structural arena validator, AI’s generated-pickup renderer and fake-tier arena pipeline, play’s screen damage feedback, and server’s initial private-room networking are on main. Engine’s symmetry/spawn work and server’s prediction/interpolation remain unfinished in their worktrees. Owners sync main when clean.

**engine → ai:** `validateArena(arena): readonly ArenaProblem[]` is integrated (`noFloor`, `disconnected`, every problem at once). AI still uses its interim `ArenaProblems` check; replace it in AI’s worktree. Bounds/size limits, wall density, corridors, spawn reachability, ring escape, symmetric finalisation and the engine-owned built-in pool remain open.

**AI renderer delivered:** ground pickups draw a scenario-selected generated weapon or the code-owned stand-in. Schema, limits, vocabularies and fallback now live in `shared/src/appearance/`, consumed by AI and webapp; geometry checks stay in AI. No appearance field on engine weapons or snapshots exists yet. Art’s S4 readability review, held-weapon anchors and the library/adapter link remain open. Coordinate `Pickup.tsx` changes with AI.

**Art → play, ring-damage loop delivered:** [WAV/MP3 and reproduction guide](webapp/audio/studies/ring-damage/README.md), key `sfx-ring-damage-loop`. WAV loops exactly at 48/44.1 kHz in Chromium/WebKit. MP3 seam checks pass but WebKit adds 40 ms padding; use WAV for the ring loop or handle/listen to MP3 bounds before integration. The user approved the sound in Visual Studio Code. Play owns registration, start/stop, ~100 ms fades and acceptance coverage; ring damage no longer uses crunch/onset. No runtime files reserved by art.

**Art → AI, pickup review:** [checkpoint](docs/art/concepts/top-down-oddities/README.md#runtime-pickup-review-checkpoint--2026-11-17). S3 renderer and six `DrawingAGeneratedWeapon` criteria are integrated; art can now review readability using the committed scenario fixtures and inherited mutation evidence in `c11dc27`. No art verdict or runtime pickup-diamond integration is implied.

- **ship → AI + budget: eval policy settled by user, implementation handoff.** See [eval policy](docs/agent-reference/EvalPolicy.md). Free full fake harness on relevant changes; paid manual/local only, three fresh trials, $5 per UTC month replacing the $1 lifetime ceiling, $0.10 regression/$0.25 full run caps. Every paid run leaves dated Git-eligible outputs and scores; no reply caching. AI owns execution filtering, one shared locked local ledger and evidence, with paid execution disabled until November Console spend is reconciled. Arena paid evals still require their separate cost review. Ship implements only free CI/root mechanics here; no paid call, secret, ledger initialization or live change.

- **ship → budget performance follow-up:** four acceptance shards and combined reporting are implemented. Local build/test profiling is in Operations.md; first hosted run still needs setup/artifact/merge overhead, total runner minutes and elapsed time. Compare with the earlier 6.3-minute local baseline without treating different-load measurements as hosted speedup.

**AI arena generation delivered through A3:** fixed graph: precheck, moderation, generate, code validation, one repair, then an injected built-in arena with a refund; three model calls at most. Fake-tier criteria and unit tests only. Judge A4, model-quality evidence, engine validator adoption, limits and built-in-pool ownership remain open. No paid arena tier or new spend authorization.

**Server initial online slice delivered:** `api/` owns private-room HTTP/WebSocket routing and an authoritative Match Durable Object. Engine’s `stepFighters` shares `PlayStep`; `viewOfSeat` filters snapshots before transmission. Browser room setup/client and received-frame privacy criteria are integrated. Prediction/interpolation is ongoing in the server worktree; round/match flow, reconnect and online combat events remain open.
**Online ownership:** server owns `webapp/src/online/` and the online branch of `UseGameLoop.ts` (prediction, reconciliation, interpolation and input-on-change); play owns its local path and the remaining loop. Coordinate before overlapping. New API tooling uses the user-approved pinned Workers types. Storage/account/AI-call boundaries needed by budget remain open.

## Contracts between sessions

| Contract | Current state / writer |
| --- | --- |
| Canvas state hook | play writes the read-only browser hook, with engine owning simulation meanings and all affected consumers reviewing shared snapshot changes. Existing seeded pickup/inventory data is consumed; no write seams |
| Combat events | engine owns World.events for a local simulation step: `fireRefused` (empty click) and, delivered by play 2026-11-17 to unblock slice 2 (the user allowed touching engine), `damageTaken {cause: "bullet" \| "ring", amount}`: the health the local player actually lost, bullet first then ring, so the amounts never exceed the health they had; one event per cause per step, the ring's every step the player is outside it (a fraction of a point); never about the opponent (`EventsRequest.damage` is the player's alone). play consumes each tick; frozen steps clear events. **`hitLanded {on: "opponent" \| "dummy"}`** (engine, committed `91b06c9`, merged with main 2026-11-17): one per player's bullet that landed, only when the target is in sight (`visibleToPlayer`) with both fighters as they stand after their turns this step; never a position, a hidden target emits nothing, the opponent's bullets never emit. Order in `World.events`: `fireRefused`, bullet loss, ring loss, hits. play: review and consume; this is not the network sound contract |
| Asset/sound manifest | art owns keys/loading; play agrees integration needs. MP3 `sfx-empty-click` and `sfx-damage-crunch` are integrated; crunch comes from art’s 180 ms mono 48 kHz master via the existing MP3 recipe. `sfx-hit` remains unregistered. The approved continuous `sfx-ring-damage-loop` WAV/MP3 study is delivered ([guide](webapp/audio/studies/ring-damage/README.md)); use WAV or address documented WebKit MP3 padding. Play owns registration, start/stop and ~100 ms fades. The ring remains silent until runtime integration. Safari audio is accepted; combat masking/fatigue remains open. |
| AI hosting and adapter | API imports AI in-process, Workers-safe. ai owns generation outcomes; server owns API wiring; budget owns production spend/tracing guards |
| Stats/appearance | Merged separate stages, five calls maximum, one repair per stage, disclosed appearance fallback. ai owns the renderer consumer. The appearance schema, limits, vocabularies and stand-in moved unchanged to `shared/src/appearance/` on 2026-11-17 (user reviewed and approved; `zod` added to `shared/`); other schemas still need a real second consumer |
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

**Art → play, terrain candidates delivered:** [review sheet and integration notes](docs/art/terrain/README.md). Three floor levels and solid wall, 64×64 SVGs at 64 pixels/tile, centre (32,32); filenames l1/l2/l3 correspond to engine levels 0/1/2. User approval pending. No runtime reservation, renderer or manifest change.

## Latest ship delivery

2026-11-17, ship (`worktree-ship`, synced main `f744267`): root `pnpm evals` and independent free fake CI delivered, with the [user-approved paid policy](docs/agent-reference/EvalPolicy.md) handed to AI. Red: root command missing. Green: 170/170 full fake criteria despite conflicting inherited tier/gate/trial/tracking settings. Five stub-command mutants rejected; YAML/permissions and fourteen push/PR path-selection probes pass. Full `pnpm checks` passes outside sandbox: lint/format/types, 2,567 tests, one existing slow audio render skipped; sandbox audio stalled and that own check was stopped before rerun. Targeted formatting and diff whitespace pass. Re-read root/AI/shared instructions; standards and folder/caller audit complete (workflow entrypoints and referenced policy document, no helpers/types). No runtime change, gameplay acceptance, paid call, ledger initialization, commit, push or hosted verification. AI-owned paid filter/guard/samples are **not implemented by this delivery**; Console opening spend remains pending.

Documentation cleanup is integrated. Current decisions and unfinished tasks remain public; historical narrative removal does not imply licensing, publication or hosted verification.

## Integration follow-ups

- Ship: exclude generated `playwright-report/` JavaScript from the shared ESLint scan; the final gate after browser validation failed on 8,268 bundled-report lint errors, then the report was preserved in the temporary evidence directory and the unchanged final gate then passed.
- Ship/server: start a local Worker for each acceptance CI shard (or add managed Worker startup to the preview harness). The current workflow starts only Vite; the new online spec needs `/api/rooms` and WebSockets. Local combined validation supplies its own isolated Worker. Hosted CI has not been run.
- Engine/play: `ShootingAcrossLevels` remains a known timing flake; preserve its assertions and repair it in an owner worktree.
- Standards review (separate from the passing gate): 119 source folders listed with `ls`, root-file import callers counted with `grep`. Owner corrections remain: server’s `api/src/match/room/MatchRoom.ts` has a loose `withoutOneShots` helper beside the class; play’s `places-of-damage/TilesPerStudyPixel.ts` has one caller and should live in that caller; `BracketPlaces` has an unnamed `left | right` parameter type. These predate integration conflict resolution; fix through owner worktrees, preserving their unfinished changes. No standards-complete claim is made.
- Budget: `api/`, its instructions, tests and AI import allowance are now integrated. Credit/spend storage, account identity and an AI-calling route are still absent, so the complete budget unblock has not landed.

## Latest integration — 2026-11-17

Reviewed committed Git objects and merged these fixed tips, in dependency order. Source paths are `.claude/worktrees/<persona>`; locked sources were included in read-only review. Art `9c4e8e8` and budget `a056252` had no unique commits.

| Source | Reviewed tip | Merge on main |
| --- | --- | --- |
| ship | `4fbc847518be62e21c431438eca51ad4ac610cb7` | `a93f9d6` |
| engine | `ee95948985bae46a33c7f2dca3d10af5390b0006` | `cfed33d` |
| ai | `069986516c60503be9a19ffb32855d35286d2330` | `940f900` |
| play | `6ea36b7066b4c1d91cab88c0c7a0c14b3dc68adf` | `79ed900` |
| server | `a543dd1ddc105a8f3046773571bbc5ad12cb4269` | `9d33c98` |

Tested code/assets revision: `9d33c980f5d2b393ef83e7a05ad2eba88ded7472`. Full `pnpm checks` passes: lint, formatting, strict types and 2,567 tests (shared 60, acceptance helpers 12, audio 275, engine 1,117, AI 676, webapp 391, API 36); one existing slow audio render skipped. Properties: 14/14 at the default 100 cases each. Fake evals: 170/170; no local or paid model calls. Production compile passes with the existing chunk-size warning. Production-preview acceptance: 256 criteria complete, 255 first-pass and one `ShootingAcrossLevels` failure recovered on the configured retry; exit 0 in 4.4 minutes. This is a flaky result, not a retry-free pass. The private-room privacy criteria ran against a real local Worker. No hosted CI, deploy or push occurred.

Conflicts: retained ship’s documentation cleanup and current owner decisions; combined action-verb lint entries, HUD and room recorders, and local feedback with the online loop. Engine’s visible-hit calculation moved with the server’s shared `PlayStep` body so both step entry points retain it. No whole-file choice discarded a competing behavior. Stale uncommitted/reservation claims were reconciled in the status/checklists. The repository gate caught a restored link to a removed historical document; it was removed and the gate passes.

Standards review used root, engine, AI, API, shared, webapp, React, audio and acceptance instruction files, with nearby step/event, renderer, feedback and room tests as references. The folder/caller audit is separate from automated success; remaining owner corrections are listed above. Frozen installs first failed on offline cache/metadata misses, then succeeded with registry access using all 417/418 cached packages; no dependency version or lockfile rewrite was introduced by integration. Git emitted stale rerere warnings for absent `WhenBlock.ts`; all merges committed successfully and no tracked conflict remains.

Final source-tip check: every source tip is an ancestor of main and no committed delivery remains unmerged. AI/art/budget/play/ship statuses and index fingerprints match the initial inventory. Engine and server were already dirty; their existing changes were staged during the run, changing their fingerprints while their tips stayed fixed. Integration issued no write command in any source checkout and did not sync them. Their symmetry/spawn and networking work remains outside main. Temporary inventories, index hashes and detailed logs are under `/private/tmp/gunsmith-integration-20261117/` on the integration machine. Only the integration Worker and managed preview were stopped; ports 3478, 3479 and 9478 are closed. Owners merge final main when clean before resuming.
