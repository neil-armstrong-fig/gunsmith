# HANDOFF

Current ownership, contracts and cross-session requests. Follow [TODO.md](TODO.md) for startup. Since 2026-11-27 sessions are ad hoc: ai and
netcode are the standing sessions, and any other work is done by whichever session meets it, from
[MVP-TODO.md](MVP-TODO.md) and [POSTMVP-TODO.md](POSTMVP-TODO.md). The delivery log and the closed sessions' requests up to 2026-11-27 are in
git: `git show 76f7374c:HANDOFF.md` (art's last entries: `git show 1127ff45:HANDOFF.md`).

## The sessions

| Session | Model | Checklist | Responsibility |
| --- | --- | --- | --- |
| ai | Claude | [TODO-ai.md](TODO-ai.md) | Arena screening, player selection and engine validation integrated. Owns model quality, fallback contrast and adapter coordination. |
| netcode | Claude | `TODO-netcode.md` (written by its first session) | How an online match feels and stays fair over a real connection: the browser's prediction and interpolation, the room's input intake and tick, lag compensation, the snapshot's size and the measuring bench. |

### Start prompts

"You are ai|netcode, continue the TODO. Follow the startup protocol in TODO.md and read applicable instructions before editing." An ad hoc
session names the item it takes from MVP-TODO.md.

## Folder and contract ownership

| Domain / paths | Primary writer | Consumers / boundaries |
| --- | --- | --- |
| ai/; generated-appearance renderer, shot synthesis, AI adapter result schema and eval workflow | ai | Engine reviews rule constraints, Server wires the API, and Budget guards production calls |
| `webapp/src/online/` prediction, interpolation, `socket/lag/` and `property-tests/`; the netcode parts of `OnlineMatch`; `api/src/durable-objects/match/tick/` and `MatchRoom`'s input intake and stepping (`setInput`, `inputsOfStep`, `countSteps`, `ack`); the online smoothness specs | netcode | Engine's `stepFighters` and seat view change only through a request here. `property-tests/simulated-network/PlayMatch.ts` models `MatchRoom`'s input handling: a change to either changes both in the same slice |
| acceptance-tests/ and consumed shared contracts | Feature owner | Reserve the feature's concrete files, including common DSL/hooks; domain owner writes shared contract changes after consumer review |
| AGENTS.md, TODO.md, HANDOFF.md and other shared docs | Owner of described change | Update only your row/section; reread immediately before editing |
| Everything else (`engine/`, the rest of `webapp/`, `api/`, `infra/`, `shared/`) | Whichever session meets the work | Read every `AGENTS.md` on the path first; record a consumed contract change in this file before making it |

## Active requests

Record a request to another session, or a contract change others consume, here: who to whom, the date, and what is asked. Remove it once
answered and built.

- **2026-11-28, to ai and netcode (user request): engine's arena and weapon families moved under `arena/` and `weapon/`.**
  `arena-limits/` → `arena/limits/`, `arena-picking/` → `arena/picking/`, `arena-repair/` → `arena/repair/`, `arena-rotation/` →
  `arena/rotation/`, `arena-symmetry/` → `arena/symmetry/`, `arena-validation/` → `arena/validation/`, `built-in-arenas/` →
  `arena/built-in/`, `weapon-balance/` → `weapon/balance/`, `power-rating/` → `weapon/power-rating/`, `built-in-weapons/` →
  `weapon/built-in/`; file names are unchanged. After merging main, a type-check names any file of yours still on an old path:
  rewrite only `@gunsmith/engine/<old>/` and `engine/src/<old>/` (api's own `durable-objects/match/arena-rotation/` stays).
  `TODO-ai.md`, `TODO.md`'s ai row and `SessionDecisions.md` keep the old paths (yours to update, or history). Remove this once merged.

## Contracts between sessions

| Contract | Current state / writer |
| --- | --- |
| Canvas state hook | play writes the read-only browser hook, with engine owning simulation meanings and all affected consumers reviewing shared snapshot changes. Existing seeded pickup/inventory data is consumed; no write seams |
| Combat events | engine owns World.events for a local simulation step: `fireRefused` (empty click) and, delivered by play 2026-11-17 to unblock slice 2 (the user allowed touching engine), `damageTaken {cause: "bullet" \| "ring", amount}`: the health the local player actually lost, bullet first then ring, so the amounts never exceed the health they had; one event per cause per step, the ring's every step the player is outside it (a fraction of a point); never about the opponent (`EventsRequest.damage` is the player's alone). play consumes each tick; frozen steps clear events. **`hitLanded {on: "opponent" \| "dummy"}`** (engine, committed `91b06c9`, merged with main 2026-11-17): one per player's bullet that landed, only when the target is in sight (`visibleToPlayer`) with both fighters as they stand after their turns this step; never a position, a hidden target emits nothing, the opponent's bullets never emit. Order in `World.events`: `fireRefused`, bullet loss, ring loss, hits. play consumed it 2026-11-17 (slice 3: `sfx-hit`, mint ticks; positions found webapp-side, no engine change); this is not the network sound contract. **`pickupTaken`** (ship's, `PickupTakenEvent`, no fields): the local player took the pickup this step, never the opponent's; **`Weapon.identity {key, name}`** is on the three built-in weapons (ship). Neither reaches the second seat: `mirrorSeats` drops `events`, and `viewOfSeat` tells a seat only `bullets, elapsedSeconds, opponent, player, round` (pinned by the key list in `ViewOfSeat.test`), so a hidden opponent's pickup cannot leak |
| Asset/sound manifest | Play owns keys and loading. MP3 `sfx-empty-click` and `sfx-damage-crunch` are integrated. Crunch comes from Art’s 180 ms mono 48 kHz master via the existing MP3 recipe. `sfx-hit` is registered for local visible-target hit confirmation from `6ab6340` via `9026bcd`. Online combat feedback remains open. Ship wired the approved `sfx-ring-damage-loop` WAV ([guide](webapp/audio/studies/ring-damage/README.md)) for local ring damage with one voice and 100 ms fades (`c372d86`). The user accepted Safari audio. Play owns combat masking and fatigue checks after AI's shot synthesis lands. |
| Arena cover | Engine writes `Arena.cover`, a subset of `solid`, drawn `c`. Play owns webapp tile drawing, AI owns the generation legend, and the server seat view uses `visibleToPlayer`. |
| AI hosting and adapter | API imports AI in-process, Workers-safe. ai owns generation outcomes; server owns API wiring; budget owns production spend/tracing guards |
| Stats/appearance | Merged separate stages, five calls maximum, one repair per stage, disclosed appearance fallback. ai owns the renderer consumer. The appearance schema, limits, vocabularies and stand-in moved unchanged to `shared/src/appearance/` on 2026-11-17 (user reviewed and approved; `zod` added to `shared/`); other schemas still need a real second consumer |
| Initial engine balancing | Merged rating/balancer and eight property tests are implementation evidence. engine and ai still owe calibration/probes; labels and AI-chosen omitted-stat policy are approved |
| Planned M2 contracts | Engine owns weapon and arena constraints, AI owns the adapter, Budget owns ledger and credit configuration, Play owns the asset manifest, and Server owns wire messages. Freeze with real consumers and affected owner review. |

Before changing a consumed contract, record the proposal and affected owners here. Existing decisions remain in [SessionDecisions](docs/agent-reference/SessionDecisions.md); future proposals are not runtime contracts.

## Ready handovers and preserved decisions

- Acceptance specs were flattened on 2026-11-28 (user request): no loops or branches in `acceptance-tests/src/tests` (rule in `acceptance-tests/AGENTS.md`). New DSL steps: `workshop.fillTheShelf(promptBeginning)` returns the shelf's items, `player.fireAndWatchTheShot(watch)` steps a held game and reports the shot, and `startSparringWithPickupDrawing` accepts `"built-in SMG"`. Test titles unchanged (783).
- The DSL was split on 2026-11-28 (user request), method names unchanged, so a spec's fix is the path only: `GunsmithDsl` holds only members and `begin`/`end`; openers and `?` options are `gunsmith.scenario.*`, `holdTheGame`/`runGameFor`/`waitForGameSeconds` `gunsmith.clock.*`, window, reload and reduced-motion preference `gunsmith.browser.*`; `room` gains `connection` (cut, route, reconnect waits), `frames` (`hasBeenTold*`, `hasReceived*`, `getChoicesSent`, `getArenasOffered`, `getEventsReceived`) and `smoothness`, sharing one page's frames through `wireOfPage`. `room/playwright/wire/hand-over/` moved to `wire/room-wire/hand-over/` (the ai worktree has an uncommitted `WithSavedWeapon.ts` edit there).

- Empty-click game-event cadence passes in Chromium and WebKit, including repeats shorter than decoded buffers. The timing findings retain WebKit’s approximately 12 ms main-transient offset. The user accepted Safari audio on 2026-11-17. Play takes device listening for combat masking, fatigue and levels once AI's runtime weapon-shot audio lands. [Timing findings](webapp/audio/qa/runtime-playback/README.md#runtime-onset-and-cadence-follow-up--2026-11-17).

- Art reviewed the existing orange rifle shot on 2026-11-17; the user selected the matching team silhouette. Keep its file, `#FF9B54`, scale and tip (49, 32). The earlier redraw request is closed; later weapon classes still need both colours. No manifest or gameplay contract changed.

- Play owns behavior and manifest assets for the approved inventory and combat feedback. Engine supplies events and data. Preserve punchy/crunch and retained shake, and tune empty-click levels with other sounds. [Inventory](docs/art/concepts/inventory-display/README.md) and [combat feedback](docs/art/concepts/combat-feedback/Handover.md).
- [Fair arenas](docs/art/arena-fairness-research.md): engine owns matching spawns, transformed geometry/stairs, clearance and paired playtests; random ring centres remain unchanged.
- [AI integration](docs/ai-visual-generation.md#accepted-constraints) is merged; [stat balancing](docs/ai-stat-balancing.md) and [preference brief](docs/ai-stat-preference-probe.md) guide calibration. Preserve deliberate weakness and cumulative paid spend; no new budget/paid authorization is implied.
- Server owns the fair-play work and Play owns the gameplay asset reference. [Fair play](docs/art/fair-play-research.md) and [asset reference](docs/art/asset-reference/README.md).
