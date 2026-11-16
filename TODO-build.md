# TODO: build (Session 1, game and project, Claude Code)

Your checklist. The shared path is `TODO.md`; read it and `TODO-ai.md` and `TODO-art.md` first, every fresh session
(the sync protocol is at the top of `TODO.md`). Decisions behind every item are in `docs/`.

**The order changed on 2026-11-12, at the user's request: build a fun game first, then build everything else around it.**
Three rules follow:

1. **Test first, from the first spec.** Every mechanic starts as an acceptance spec watched to fail (`AGENTS.md`). The
   fuzzy-frontend method was tried and dropped (`docs/fuzzy-frontend.md`, demo note).
2. **The game is the whole screen.** The canvas fills the window; menus appear over it only when needed. No page of
   menus, no side panels, no step jumper until a spec needs one.
3. **Nothing moves to `shared/` until a second package needs it.** No pre-emptive contracts: schemas, adapters and
   ledgers come back, test-first, when the game and the AI genuinely need the same shape.

**What the others are waiting for from you:** `ai` needs the weapon and arena shapes; `art` needs the asset manifest.
Both are withdrawn until the game is fun (`HANDOFF.md` delivery log, 2026-11-12). Say in `TODO.md` when they return.

## Phase 0: minimal scaffold. Done

- [x] `git init`, `.nvmrc` (26.13.1), `.editorconfig`, `.gitignore`, no LICENSE (private for now).
- [x] pnpm workspace with `webapp/` and `shared/` (tool config only), exact-pinned `catalog:`, 7-day release-age policy,
      TypeScript held at 6.0.3.
- [x] `webapp/`: Vite, React 19, strict TypeScript, Tailwind v4, react-three-fiber; a full-screen orthographic canvas with
      a square moved by WASD (now `src/react/components/three/arena-canvas/`, `DirectionFromKeys` unit-tested and mutation-proved).
- [x] `pnpm start` on port 3000 (verified on 3100 while janggi held 3000; re-confirm when it is free).
- [x] 2026-11-12: a fuzzy frontend (15 menu screens, a fake AI and ledger, schemas in `shared/`) was built, looked at and
      deleted at the user's request. The palette tokens in `src/index.css` survive.

## Phase 1: the game, test first. Milestone M1 (redefined: the game is fun)

### Resume here (written 2026-11-16, end of the ninth session; read this first)

**2026-11-16, ninth session: the aim reticle (uncommitted for the user's review; the ring was committed as `0ed80e1`).** The user chose it from the options (over the bot on stairs, fair-arena groundwork, a play-review pause). `art`'s 32 px precision crosshair is copied to `webapp/src/react/components/three/arena-canvas/reticle/AimReticle.png` with `AimReticleCursor.ts` (`url("...") 16 16, crosshair`, test beside it: hotspot tied to the PNG's real size from its header, fallback last), set as `style={{cursor}}` on the arena div in `ArenaCanvas.tsx` and **nowhere else**: the HUDs are `pointer-events-none` so they are no dead zone, and the banner is a sibling overlay so it keeps the ordinary pointer (a cursor on `body` would leak the reticle onto it). Spec `AimingWithAReticle` (6 criteria), written first and red for the right reason (the four arena criteria got no picture); DSL `gunsmith.arena.getCursorOver(place)` (`ArenaPlaywright`: the computed `cursor` of `document.elementFromPoint`, the picture's real size by loading it in the page; types in `arena/types/`). Webapp 242, root `pnpm checks` exit 0, **143 of 143** specs on a production build, the spec 60 of 60 at `--repeat-each=10`; **4 mutants killed** by the right tests (cursor on `body`, hotspot 0 0, fallback changed, `pointer-events-none` removed from the ammo HUD). **Not covered, plainly:** the native cursor on a real display (the user must look: `pnpm --filter @gunsmith/webapp exec vite --port 3100 --strictPort`, `http://localhost:3100/?scenario=duel&seed=42`, then `pkill -f "vite.*--port 3100"`), Retina softness (a 2x `image-set()` needs its hotspot verified; the 64 px export is unused), and "the picture fails to load" (Vite inlines a small PNG only in a production build; the fallback is a unit test only). **Open for the user:** visual approval of `Preview.png`, and whether to do the 2x path. A second build session (`worktree-build-3-reticle`) was started by accident and told to stand down; its worktree is the user's to remove. **Next:** the opponent on stairs and the stair-flank validator, then `art`'s juice study, empty click and fair arenas when delivered.

**Earlier, 2026-11-16, eighth session (written at its end):**

**2026-11-16, eighth session: the closing ring, slice 3 of 3, the bot walks inward (uncommitted for the user's review; slices 1 and 2 were committed as `4307864` and `07146c8`).** Planned in plan mode; **the user chose:** outside the ring and seeing the player, **walk in and keep firing**
(over "run in, no shooting" and "keep fighting where it is"), and **keep about 2 tiles inside the edge once the ring is closing** (over "only once outside the edge"). Engine (`opponent/shelter/`, test first): `ShelterFromRing(act, context)` runs after the state has acted;
once `closingProgress(ring) > 0` and the bot is farther from the centre than `radiusOfRing - DIFFICULTY.ringMargin` (2, a tunable), its walk becomes `walkToward` the ring's centre; `firing`, `reload` and (while it `sees` the player) `aimAt` come from the state, otherwise it aims where it walks; the brain is never touched; no ring
(`OpponentContext.ring`, new, absent in the practice range and unringed sparring) means no change. **The plan's contingency was needed:** the 20-seed test went red on seed 17, where the bot stood pressed against a pillar with the centre dead west (a straight walk does not slide off a face it meets square on), so `shelter/waypoint/WaypointToward`
(stateless, no random draw) walks to the centre if the line is clear and otherwise to the nearest of 16 directions at reaches 1.5 and 3 that it can walk to in a straight line, preferring one that sees the centre. `ThinkOpponentOverAMatch` gained three ring tests (20 seeds, the idle player given 100000 health so only the ring can hurt the bot: **its health stays 100 for 17 s of a 2 s + 10 s ring, it ends within the final 2 tiles, a replay agrees**).
Spec `TheOpponentStayingInTheRing` (the duel with `?ringDelay=1&ringClosing=6&ringDamage=10`, new DSL `startClosingDuel`; seeds 12 and 19, where a bot that ignored the ring ends with 10 and 0 health; 3 criteria each: the ring hurts more than the unboosted 20 a second, the opponent's health is exactly 100, it is inside the ring; **`?ringDamage=` was added at the user's request to make it faster: a ring that closes as usual and hurts N times as much, `RingTiming.damageScale`, so the file takes about 5 s, not 10**). **Order, honestly: the engine unit tests were red first (module missing), the spec was written after the code, so its red run is mutants** (shelter disabled: 4 of 6 fall; no margin 3; ring not passed to the bot 4; no detour 3).
Engine 783, webapp 233, `ai` 421, root `pnpm checks` exit 0; **137 of 137** specs on a production build, **710 of 710** at `--repeat-each=10` for the ring, duel, HUD and sparring specs. **Mutation: 15 unit mutants** (two survivors: the aim at the waypoint rather than the centre, a test gap now closed; a redundant open-floor check, removed since `hasClearLine` already refuses a point in a wall) and 4 browser mutants. `pnpm test:properties` does not exist yet, so it was not run.
**Measured, for the user's feel:** against an idle player at a 1 s delay and 6 s closing, a bot that ignores the ring is hurt in 14 of 40 duel seeds and a sheltering one in 1 (seed 10, 5 health: it detours round a pillar and the ring, 2.4 tiles a second, outruns the margin); at 1 s and 4 s, 18 of 40 against 3. Stated defaults, to be set by play: margin 2 tiles, the bot walks at its usual 70% speed, it does not shelter while the ring is only waiting to start.
**Not done:** the bot on stairs (a ring centre on a platform needs a stair route it does not know), a stair-flank or ring-escape arena validator, a bot that fights from the ring's centre rather than beside it, a draw rule.

**What next (none requested yet; ask or pick):** the opponent on stairs and the stair-flank validator (the rest of heights), then `art`'s four queued asks in `TODO-art.md` (reticle in place of the pointer, taking-damage game juice, an empty-weapon click, fair symmetrical arenas, the last of which wants the ring-escape check). Ask the user whether they have played slice 3 (`pnpm --filter @gunsmith/webapp exec vite --port 3100 --strictPort`, then `http://localhost:3100/?scenario=duel&seed=42&ringDelay=3&ringClosing=15`, and `pkill -f "vite.*--port 3100"` after).

### Earlier session (written 2026-11-15, end of the seventh session)

**2026-11-15, seventh session: the closing ring, slice 2 of 3, the ring and its damage (uncommitted for the user's review; slice 1 was committed as `4307864`).** The user had played slice 1 ("fine as is") and chose
the spec seam: **query parameters** (`?ringDelay=` and `?ringClosing=`, seconds; "useful for players too"), so `Ring` carries its own timing. **One deviation from their wording, for them to veto:** the spec runs on **sparring**, not the duel
(the duel bot kills a standing player in 2 to 9 s, so a short ring would be decided by the bot): the duel always has a ring, sparring has one only when the query asks for ring timing, the practice range and the heights arena never.
Engine (`ring/`, test first, red for the right reason): a `Ring` is now `{roundSeconds, centre, startRadius, timing}`; `StartRing(request)`; `centre/ReachableCentre` (a seeded draw on its own stream, `seed/RingSeedSalt`, among floor tiles every
fighter can walk to, by `reach/TilesReachableFrom`, a flood fill that honours `height/BlockedFrom`, so a platform without a stair is never chosen); `RadiusOfRing` (a pure function of the clock: the arena-covering radius, a straight line to 2 tiles over
the closing time, then fixed); `damage/RingDamageRate` (0, then 2 to 20 a second over the closing time, 20 after) and `damage/RingDamageOver`; `step` advances the ring then takes the damage off each fighter outside, at the rate at the end of the step, before `decideRound`
(both falling in one step is the opponent's win, `Step` tests). Bullets and dummies ignore it. Defaults (tunables): 45 s then 30 s (`DefaultRingTiming`). Webapp: `game/scenario/ring-timing/` (`RingTimingFromSearch`, `RingTimingOfPage`, `seconds/SecondsFromParameter`), `worldOfScenario(scenario, seed, ringTiming?)`,
`worldOfPage` and `nextRoundOfPage` carry the page's timing (round 2 keeps it and, with seed + rounds played, closes on a new place); the hook's `ring` gained `centre`, `radius` and `damagePerSecond` (`shared/`: `RingSnapshot`, `RingCentreSnapshot`); `ring-edge/` draws the ring (one
plane with a small shader: bright edge, faint red tint outside; **the radius uniform must be written through the material's own `uniforms`**, writing the object handed to `uniforms=` left it at 0 and tinted the whole arena, found by screenshot); `selectPlayerHealth` rounds up (`Math.ceil`) because ring damage is fractional, and
`hud.waitForHealthToMatchTheGame()` compares with the hook's health rounded up. **Order, honestly: the spec `TheClosingRing` was written first and watched red (sparring with ring timing had no ring); the engine unit tests were red before their code; the webapp tests for the health selector and the snapshot were written with their code, so their proof is mutation.**
Spec `TheClosingRing` (15 criteria over four `given`s): the ring is centred in the arena and reaches every corner at first and hurts no one; it says "Ring closing" once it starts (slice 1's text, now reachable); it shrinks and hurts; **a seed decides who is outside, so seed 26 leaves the opponent outside and the round is won (the first browser spec to win a round)
and seed 14 leaves the player outside and it is lost**; a slower ring (30 s) is still closing when it decides the round, and then it stops closing and stops hurting more. Delay 3 s so a slow page load cannot be late for "covers every corner". Seeds were measured over 0 to 39 in the engine. Engine 761, webapp 223, `ai` 421, root `pnpm checks` exit 0; **127 of 127** specs on a production build;
**90 of 90** at `--repeat-each=6` for the ring spec and **460 of 460** at 10 for the countdown, duel, HUD and sparring specs (the pinned duel seeds did not move). **Mutation: 27 engine mutants (3 survivors: two real gaps closed, a "no-stair arena" that had a wall instead of a drop and nothing pinning the salted stream; the third, the minimum damage constant, is a tunable the tests import) and 20 webapp mutants (1 survivor: the ring ignoring the opponent's start, equivalent in an arena where every start reaches every other; the multi-start rule is an engine test), plus 8 browser mutants, one of which (the ring's clock running after the round) survived the quick ring until the freeze criteria got a slow one.**
**Shaders, added the same day at the user's request:** the ring's shaders are `.glsl` files imported with `?raw` (commented for a reader new to GLSL); **`pnpm checks` now needs `glslangValidator` on the PATH** (`brew install glslang`, installed here at 16.6.0; `apt install glslang-tools` for CI), because `ring-edge/shaders/RingEdgeShaders.test.ts` compiles them with it (9 mutants killed); acceptance spec `DrawingTheClosingRing` (4 criteria) reads the real pixels from a screenshot and the console's shader errors (6 mutants killed); the decision not to unit-test shader maths in Node, and the research, are in `docs/shaders.md`. Formatting GLSL was skipped. Webapp 233 tests, 131 of 131 specs on a production build. `pnpm test:properties` does not exist yet, so it was not run. **Stated defaults, to be set by play:** 45 s delay, 30 s closing, final radius 2, damage 2 to 20 a second, centre uniform over reachable floor tiles (so it can fall close to one start: a fairness question for art's arena study, not solved here), no danger tint beyond the faint red. **Not done:** slice 3 (the bot walks inward; until then it stands outside the ring and takes the damage), a way to see the ring in the practice range, an escape-time arena check.

**2026-11-15, sixth session: the closing ring, slice 1 of 3, the round timer (uncommitted for the user's review).** Heights slice 3 was already committed by the user (`4250a66`), so the session began
by **planning the ring with them** (plan mode, three questions): **a shrinking circle that closes on a seeded point; the timer starts the ring and damage ramps until someone dies (no draws, no
new scoring rule); slices in the order timer, ring and damage, bot walks inward.** Slice 1 is the clock only: `engine/src/ring/` is new (`Ring {roundSeconds}`, `StartRing`, `AdvanceRing`,
`SecondsUntilRing`, `countdown/RingStartDelaySeconds` = 45 s, a tunable), `World.ring?` (the duel has one; sparring, the practice range and the heights arena do not), and `step` runs the ring's clock on
only while the round is `playing`, so it **stops when the round is decided** (`elapsedSeconds` still runs on, so a wait on it never hangs). Webapp: `selectSecondsUntilRing` (whole seconds, rounded up,
so it changes once a second), `ring-hud/RingHud` ("Ring in 0:43", under the score; "Ring closing" at 0, which only slice 2 makes true), the state hook's new optional
`ring {secondsUntilStart}` (`shared/`'s `RingSnapshot`, a contract change used by `webapp/` and `acceptance-tests/`; none for `ai`/`art`). Spec `CountingDownToTheRing` (10 criteria: the duel counts down
from about 45, falls as the round is played, stops when the round is lost, starts afresh in the next round, on the screen and in the hook; sparring and the practice range have no ring). **Order
honestly: the engine and webapp unit tests were red first; the spec was written after the code, so its red run is mutants.** Engine 700, webapp 191, `ai` 421, root `pnpm checks` exit 0; 112 of 112
specs on a production build, **460 of 460** at `--repeat-each=10` for the ring, duel, HUD and sparring specs. **Mutation: 22 unit mutants and 10 browser mutants, all killed by the right tests**
(a first control mutant proved the runner can fail). `pnpm test:properties` does not exist yet, so it was not run. **Stated defaults, to be set by play:** 45 s before the ring starts; the
countdown is a plain box under the score. No spec waits for the ring to start (45 real seconds is too long): slice 2 must decide how a spec reaches it (a seam would be needed, so ask).

**2026-11-15, fifth session: heights slice 3, bullets across levels (uncommitted for the user's review).** The `ai` worktree was merged again first (`11f7f45`; the `ai`
commit was `ai/` and docs only; `HANDOFF.md` and `TODO.md` conflicted, both sides kept; `art` had to commit its own edits before the merge could run). The user chose **line of fire = line of
sight**: a bullet takes the eye level of its shooter when fired and is stopped by `height/BlocksSightFrom` at that level, so a platform's face stops shots from the low ground and a platform's
shots fly out over it; the bot follows the same code. `Bullet` and `ShotRequest` gained `level`, `shootFighter(arena, shooter, turn)`, `EyeLevelAt` moved to `height/`. Spec `ShootingAcrossLevels`
(red first: the platform dummy took 25 damage), engine 690, webapp 179, `ai` 421, 102 of 102 specs on a production build, 120 of 120 at 30 repeats. 7 mutants killed; the opponent-on-a-flat-floor
one survived until a `Step` test was added. `pnpm test:properties` does not exist yet. Contract change for `ai`/`art`: none.

**(Slice 2 is done, above.) Next: slice 3 (the bot walks inward); the paragraph below is the design the ring was built from.** The approved design (stated defaults, all tunables): a circle whose **centre is drawn from the world's
seed (`random/NextRandom`) among floor tiles reachable from both fighters' starts** (flood fill that honours `height/BlockedFrom`, so it never closes on an unreachable platform); the **radius is a pure function
of the ring's clock** (the arena-covering radius until the start delay, a linear shrink to a final radius of about 2 tiles over about 30 s, then fixed), so a replay from seed and inputs agrees; **damage** to a
fighter outside it, ramping from about 2 to 20 a second over the closing time, through `health/TakeDamage` in `step` before `decideRound` (both falling in one step keeps its rule: the opponent's win);
bullets and dummies ignore it; drawn as a bright edge over the veil (canvas, checked by screenshot like the drop edges) and in the hook (`ring` gains the centre, radius and damage; `RingStartDelaySeconds`
moves to the `ring/` root once the radius also uses it). Then slice 3: the bot, outside the radius, makes the centre its goal (no pathfinder: it steers toward it and relies on `WatchForStuck`), keeps
fighting if it sees the player, over 20 seeds never dies to the ring while the player is alive and far away. **Out of scope:** the bot on stairs, the stair-flank validator, the arena-fairness / ring-escape
validator, cover with a height, a draw rule, a pause between rounds. Still open from heights: the opponent on stairs, a stair-flank validator, a longer reach for higher ground (an idea only), cover with a
height. `art` has queued four things for `build` in `TODO-art.md` (aim reticle in place of the pointer, a taking-damage "game juice" study, an empty-weapon click, and a fair symmetrical arena-generation
study with equivalent high ground); none is started, and the arena one touches the validator and the ring. **From `TODO.md` (Codex, 2026-11-15): the user settled the appearance call budget as separate
stats and appearance calls, five at most; `ai` implements, and the renderer/schema consumer is to be coordinated with `build`, with no premature shared schema.** Nothing for `build` to do on that yet.

**First thing next session, in order (superseded by the eighth session above; kept for the history):**
1. `git status --short` and `git log --oneline -3`: slice 1 of the ring (and these doc edits) are uncommitted until the user commits them; `art`, `ai` and Codex may have edited the tree since.
2. Ask whether the user has **played slice 2** (`pnpm --filter @gunsmith/webapp exec vite --port 3100 --strictPort`, open `http://localhost:3100/?scenario=duel&seed=42&ringDelay=3&ringClosing=15`, stand outside the closing circle and watch the health fall;
   `pkill -f "vite.*--port 3100"` after) and what they thought of the numbers (2 to 20 a second, 2 tiles at the end), the red edge and tint, and where the centre falls. Take their word before building slice 3. Also ask whether they accept the sparring-not-duel deviation for the spec.
3. Slice 3, test first: the bot, outside the radius, makes the ring's centre its goal (no pathfinder: it steers toward it and relies on `WatchForStuck`; read `engine/src/opponent/` and `ThinkOpponentOverAMatch.test.ts` first), keeps fighting if it sees the player, and over 20 seeds never dies to the ring while the player is alive and far away.

**State at the end of the fourth session** (the sections above supersede its "next"). Everything was committed by the user as `275255b`. A bright lip and a shadow on every drop edge of a platform
(`arena-heights/drops/`; the user: "the updated wall looks great"); `movement/PushOutOfWalls` split into `pushing/` helpers; `vision/` sub-foldered (`CanSeePoint` and `HasClearLine` in
`vision/sight/`); `HeightTilesOf` split into `tiles/positions/` and `tiles/drops/`.

**Loose ends.** The new browser-level mutation scripts are scratchpad-only (gone with the session). The drop-edge drawing has no spec (canvas): it was checked by screenshot, so a
future change to it should be looked at again. `docs/art/asset-reference/` is `art`'s. The `ai` row in `TODO.md` is `ai`'s to update. `pnpm test:properties` and a root `pnpm evals` script do not exist (the latter is owed to `ai`).

**2026-11-14, fourth session:** merged the `ai` worktree again (`ceb5063`: kit-arm notes and a drawings-sheet change; `HANDOFF.md` and `TODO.md` conflicts kept both
sides), then built **heights, slice 2: vision over height**, test first, left uncommitted for the user's review (the item below). Root `pnpm checks` exits 0 (engine 661,
webapp 161, `ai` 420); acceptance 98 of 98 on a production build, 520 of 520 at `--repeat-each=10` for the vision, arena, player and dummy specs.

**2026-11-14, third session:** merged the `ai` worktree (`f456130`: Haiku evals, docs conflicts resolved keeping both sides), then built
**heights, slice 1 (walking only)**, test first, left uncommitted for the user's review (see the item below). Root `pnpm checks` exits 0 (engine
618, webapp 160, `ai` 419); acceptance 93 of 93 on a production build, 120 of 120 at `--repeat-each=10` for the stair, walking and crouch-speed
specs. `?scenario=heights` opens it. **Not committed; the merge is.**

**2026-11-14, second session:** the `ai` worktree was merged (`c8269cf`), then crouch landed (see the crouch item below). The user
reviewed it, played it ("works well") and is committing it; earlier work was committed by the user too. Root `pnpm checks` exits 0
(engine 570, webapp 139, `ai` 394, `audio-studies` 254 with one slow render skipped); acceptance 89 of 89 on a production build.
Logged in `HANDOFF.md`: **best of three** (the duel only), **`engine/src/` sub-foldered** with a front door `Engine.ts`, the newest
**audio code cleaned** (`webapp/audio/`, `art`'s folder), the **forward cone** and **crouch**.

**Next, in order (none was requested yet; ask or pick the first):**
1. ~~The bot's tunables~~ **settled 2026-11-14:** the user played the duel with the cone and crouch and called the bot "fun to play
   against, easy to beat but it still needs a bit of moving and shooting". Leave `engine/src/opponent/Difficulty.ts` as it is.
2. **The closing ring and a round timer** (the user's choice, 2026-11-15; plan it with them first), then **heights, the rest** (slices 1 to 3 are done: walking, seeing, bullets): the opponent on stairs (it has no pathfinder and picks goals it can see); a stair-flank check (an arena validator); a longer reach for higher ground (an idea); cover with a height. Crouch is done.
3. Owed to `ai`: a root `pnpm evals` script (see "Owed to `ai`" below).
4. The `ai` row in `TODO.md` is stale (its worktree merged as `e40e9a1`): it is `ai`'s to update, so only mention it.

**Open questions for the user:** (a) add `"@playwright/test": "catalog:"` to `audio-studies` so its browser check stops borrowing
Playwright from `acceptance-tests/` (a dependency change, so it needs their say); (b) no browser spec *wins* a round (measured: a
win needs the aim at exactly 0.50 s, a timing window, not a seed), so winning is covered by unit tests only.

**Things that will bite you:**
- Another session may be editing the tree (`art` runs in Codex, `ai` elsewhere; the `ps` check does not see them): run
  `git status --short` first, attribute files outside your folders to their owner, and never run repo-wide `format`/`lint:fix`.
- `audio-studies`: **never run `pnpm encode` against the real `encoded-audio/`** to test something (Ogg bytes change on every
  encode, because the container has a random serial number, and it removes the three reports). Encode into a temp folder and
  compare MP3 by hash and Ogg by decoded audio. `verify:encoded` and `verify:browser` are *meant* to exit non-zero: `art`'s findings
  (13 native, the WebKit ones) are open, and a green run would mean a limit was loosened. See `webapp/audio/AGENTS.md`.
- Port 3000 may be held by janggi: use `vite --port 3100 --strictPort` (or `vite preview --port 3100`) and
  `WEBAPP_URL=http://localhost:3100`; stop it with `pkill -f "vite.*--port 3100"`. The production build goes to `webapp/build/`.
- Mutation proof uses scratchpad scripts that are **not in the repo**: write them again (backup, one exact replacement, `grep`,
  run, restore, byte compare).

### Where things stand (as of the 2026-11-12 sessions, counts brought up to date 2026-11-14)

The player walks (WASD, walls stop them), aims with the mouse and clicks to fire bullets that die on walls or on one of
three practice dummies, which are removed at zero health, all in a full-screen arena. **There is now a duel** (`?scenario=duel`,
2026-11-12): an opponent with a small state-machine brain (wander, engage, reload, search: it sees the player, waits a
reaction time, fires bursts with an aim that settles, circles at a good range, takes cover to reload; `engine/AGENTS.md`),
a health HUD, and a round that is won or lost with a "Play again" overlay. `?seed=42` replays a duel exactly.
`?scenario=sparring` is the same arena with an opponent who has no brain and cannot shoot, so it stands still; the practice range (no query) has no opponent, so the old specs are unchanged. The player carries two weapons (keys
1 and 2): a rifle (25 damage, 12 rounds) and a marksman rifle (50 damage, 5 rounds); R reloads, shots spend rounds, and the
ammunition shows in a plain-React HUD (`react/components/dom/ammo-hud/`). Five packages: `webapp/`, `engine/`, `acceptance-tests/`, `shared/` (tool
config plus the state-hook snapshot types) and `ai/` (merged in from `ai`'s worktree on 2026-11-12, `8c52f5f`; `ai` owns it, read
`ai/AGENTS.md` before touching it). `pnpm checks` is green for `build`'s packages: engine 516 unit tests, webapp 127, and 73 acceptance
specs (the weapon, HUD, dummy, sparring and duel specs pass at `--repeat-each=10`). Every spec and unit test has been mutation-proved. Read
`engine/AGENTS.md`, `webapp/AGENTS.md`, `webapp/src/react/AGENTS.md` and `acceptance-tests/AGENTS.md` first.

**The webapp's shape (settled with the user, 2026-11-12).** State is Zustand only (`docs/state-management.md`). Layers run
`react/` → `store/` → `game/`, lint-enforced. `store/game/` is the game store: `UseGameStore.ts` at the top (the slice-like
file, state `{world, setWorld}` and nothing else, pinned by a test and a lint allow-list), reads in
`selectors/<name>/` folders (`select-ammo-readout/`, `game-state/`). Components live in `react/components/dom/<name>/` or
`react/components/three/<name>/`; `three/arena-canvas/` hosts the `<Canvas>`, and everything beneath a top-level component
shares its kind, flat. JSX gets a blank line between sibling elements, DOM and r3f alike. The loop writes the world once a
frame; `useFrame` reads it with `gameState()`; the ammo HUD (`dom/ammo-hud/`) reads a selector with `useShallow`. A new
state-bearing feature (health, the round) goes into the engine's `World` first, and the HUD reads it through a new selector.

**Owed to `ai` (small, do it with the next root-script change):** a root `pnpm evals` script. `AGENTS.md` and `ai`'s TODO both
assume it; today only `ai`'s own `evals:fake|local|paid` exist, and root `package.json` has `checks` and no more. It should run
the evals outside `pnpm checks` (they cost money and are non-deterministic). Also: when `api/` is scaffolded, add `@gunsmith/ai`
to its `allowedPackages`. The `ai` package reads `@gunsmith/engine`, so an engine change can break `ai`'s `pnpm checks`: run the
root `pnpm checks`, not just the engine's, before saying a change is done.

**Starting a session.** Run `ps -axo command | grep -c "[p]ermission-prompt-tool"` (macOS `pgrep -a` does not show
arguments) and `lsof -i :3100` before starting a server. Re-read a shared doc right before editing it; other sessions
leave uncommitted edits in `TODO*.md`, `HANDOFF.md` and `docs/`.

**How to run the specs.** Port 3000 may be held by janggi, so use another:
`pnpm --filter @gunsmith/webapp exec vite --port 3100 --strictPort` in the background, then
`WEBAPP_URL=http://localhost:3100 pnpm acceptance-tests`, then `pkill -f "vite.*--port 3100"`. `pnpm install-browsers`
once. Repeat a suite with `pnpm --filter @gunsmith/acceptance-tests exec playwright test --repeat-each=15` to check for flakes.

**Shape of the work, one mechanic at a time:** engine unit tests first (red), then the engine code; the acceptance spec and
DSL next (red, for the right reason); then the webapp; then mutate the real code and confirm the right tests fall.
`engine/` is the rules (deterministic, no clock); the webapp's `useGameLoop` hook feeds it fixed 1/60 s steps; specs read
the game only through the state hook (`window.gunsmithState`, `shared/src/state-hook/`) and never sleep (they wait on
`elapsedSeconds`). Bring up any dependency that would replace code before writing it, with version and release age; the
likely ones are a seeded RNG (`pure-rand`), a visibility-polygon library (for the fog) and a grid pathfinder (for the
scripted opponent). `fast-check` is deferred at the user's request.

**Gotchas learned.**
- **zsh does not word-split an unquoted `$VAR`.** A mutation script that looped over `$FILES` silently failed to back
  anything up and left seven mutations stacked in the source. Use arrays or one file per call, and `cmp` after every
  restore. Never chain a `sed -i` ahead of `&&` on macOS (it needs `-i ''`); use `perl -pi` or Python.
- **A perl replacement string interpolates `@src`** as an empty array. Use Python for import rewrites.
- **A fast click cannot be reproduced by an acceptance spec** (Playwright's down then up spans a frame), so the click
  latch (`use-firing/trigger/FiringLatch.ts`) is covered by unit tests only.
- **A bullet is in the air for only 0.17 to 0.5 s.** `BulletsPlaywright` installs an in-page recorder at load so
  `waitForABullet` cannot miss one. Do the same for any other short-lived thing a spec must see.
- The MCP browser may be held by another session; `pnpm --filter @gunsmith/acceptance-tests exec playwright screenshot
  --viewport-size=1600,900 --wait-for-timeout=1500 <url> <file>` takes a picture with our own install.
- **Read and wait on the game through `BasePage`**: `readGameState()` and `waitForGameState(check)`. The check runs in the
  test (an `expect.poll`), so it can use anything in scope. A function given to `page.waitForFunction` or `evaluate` is
  serialised into the page and cannot see module constants, so reserve those for what must run in the page (the bullet
  recorder, which catches a state that comes and goes between two looks).
- **A wait must not be a spec's only assertion**: a helper that never waited would pass it. Assert the state after the wait
  (`FiringAShot` checks `bullets.count()` is 0 after `waitForNoBullets`). Mutate the helper to prove it.
- **Chained `fire()` clicks inside the 0.2 s cool-down are swallowed**: to shoot repeatedly, `startFiring()` (hold the
  button) and wait on game state, never on a count of clicks.
- **zsh and globs:** `grep --include=*.md` fails with "no matches found" because zsh expands the glob. Quote it
  (`--include='*.md'`) or walk the tree in Python. The user also stages changes in their editor, so `git status` shows `A`/`M`
  in the first column for your work: that is theirs, and you still never write to the index.
- **Mutation scripts** live in the scratchpad and are gone with the session; the shape that worked: back the file up, apply
  one replacement that must match exactly once, grep that it landed, run the tests, restore from the backup. One file per
  call; Python, not `sed -i`. **Check that the runner can fail before trusting it:** `vitest --reporter=json` writes to a
  file (`--outputFile=...`), not stdout, so a runner that parsed stdout reported every mutant as a runner error and then
  printed "No survivors". Run one mutant you know is caught, count runner errors in the summary, and write the file
  restore in a `finally` with a compare. For the browser suite use `PLAYWRIGHT_JSON_OUTPUT_NAME` the same way.

**Folder rule (user's, in `AGENTS.md` Code style).** Types go in `<domain>/types/`; a domain's entry points stay at its top;
a helper only one file uses sits in a subject-named subfolder beneath that file; something shared sits at its callers'
nearest common folder and no higher. The 2026-11-12 sweep (every import mapped, single-caller files and types checked)
left only the engine's domain entry points, deliberately, and `dsl/gunsmith/types/Point.ts`. The sweep script was a scratch
file and is not in the repo; recreate it, or turn it into a lint rule, before the codebase is much bigger.

**Known rough, not yet fixed.**
- Tunables are placeholders in one constant each: `PLAYER_SPEED` 6, `PLAYER_RADIUS` 0.4, `TICK_SECONDS` 1/60, the practice
  arena 24 by 14 with four pillars; every weapon number (fire interval, damage, bullet speed, magazine, reload, reserve) sits
  in `engine/src/weapon/weapons/Rifle.ts` and `MarksmanRifle.ts`. Set them by play.
- Colours are placeholders (the floor reads darker than the palette's). The player, barrel, bullets and dummies were
  looked at once in a screenshot (2026-11-12) and read fine. Console noise: a favicon 404 and a three.js `Clock`
  deprecation warning from react-three-fiber.
- `pnpm start` on port 3000 has not been confirmed (janggi held it).
- The player's reload is manual (there is no auto-reload: an empty magazine just stops firing until R), the two weapons share one
  cool-down, and the reserve cannot be refilled (no pickups yet). Dummies (100 health, radius 0.4, three in
  `PracticeDummies.ts`) do not move, do not block the player, and do not come back once shot, so reloading the page is the
  only way to restore them. `Dummies.tsx` (discs fading as they are hurt) has no spec, because the canvas is not in the DOM:
  the specs cover the state it draws from. The ammunition HUD is DOM, so it has its own spec (`AmmoOnTheScreen.test.ts`); only the reload fill animation (CSS) is
  unchecked by a spec.


Set-up, then one spec per mechanic. Each spec is watched to fail for the right reason, then made to pass, then
mutation-proved (`AGENTS.md`). The simulation lives in `engine/` from the start: deterministic, a fixed timestep, a seeded
RNG, no `Date.now()` or `Math.random()`. The webapp renders it and sends input.

- [x] **`acceptance-tests/`** (janggi's skeleton, three layers for now, `withDslOnly`, desktop only) with its `AGENTS.md`.
      `@playwright/test` 1.64.0 approved.
- [x] **`engine/`** package with its `AGENTS.md`, created by the walking spec. Bring up a seeded RNG, a visibility-polygon
      library and a grid pathfinder when each is needed. Property tests (`fast-check`) are deferred at the user's request.
- [x] **Canvas state hook** for the DSL: `data-ready` on the arena (read-only, tiny, shipped code). More arrive per spec.
- [ ] Specs, in this order (add or reorder as playing it shows what is fun):
  - [x] The practice arena fills the window (`FillingTheWindow.test.ts`, three window sizes; mutation-proved on the
        container and on the canvas; 15 of 15 on repeat).
  - [x] WASD moves the player; walls stop them (`WalkingAround.test.ts`; engine: 33 unit tests, all mutants caught; four
        game mutations each caught by the right spec). Fixed 1/60 s step, circle-vs-grid collision written by hand.
  - [x] Aiming with the mouse; clicking fires a shot (`AimingAtTheMouse.test.ts`, `FiringAShot.test.ts`; first pass: one
        bullet type, a fixed fire rate, bullets die on walls). Engine: 72 unit tests; webapp: 33; 22 acceptance specs.
  - [x] A practice dummy takes damage and dies (`ShootingADummy.test.ts`: one shot lowers its health, firing on removes
        it, the others untouched, a shot where there is no dummy hurts none). Engine: the bullet's flight decides hits
        (nearest of wall and dummy, an exact ray-against-circle test), `dummy/HurtDummies`; `dummies` in `World` and in
        the state-hook snapshot; DSL `gunsmith.dummies` and `player.startFiring`/`stopFiring`. About twenty engine mutants,
        three snapshot mutants and six browser mutants (game, hook and dummy size) were each caught by the right tests
        (one survivor, `alongRay <= 0` in `DistanceToCircle`, is equivalent: with the start outside the circle and
        `alongRay` at 0 the half-chord is already negative, so the result cannot change). The weapon was
        still a constant then (it is a `Weapon` now, below).
  - [x] Reload, magazine, reserve and weapon switching (`ReloadingTheWeapon.test.ts`, `SwitchingWeapons.test.ts`, 10 specs:
        firing on until the magazine is empty stops the bullets; a reload refills it after its time and not before, from
        the reserve; the emptied weapon fires again after reloading; reloading a full magazine does nothing; key 2 puts the
        marksman rifle in hand with its own ammunition, and it takes more health off a dummy than the rifle; the weapon left
        behind keeps its rounds; a switch mid-reload cancels the reload, and the first weapon is never refilled). Engine: a
        real `Weapon` type, `weapon/` (`TriggerPull`, `SpendRound`, `ReloadWeapon`, `weapons/Rifle`, `weapons/MarksmanRifle`)
        and `loadout/` (`SwitchWeapon`, `EquippedWeapon`, `WithEquippedWeapon`, `StartingLoadout`, `types/CarriedWeapon`); a
        `Bullet` carries its own damage and speed, so the loose `BULLET_DAMAGE`, `FIRE_INTERVAL_SECONDS` and `BULLET_SPEED`
        constants are gone. Decisions (stated, not asked, to be set by play): manual reload, no auto-reload; one cool-down
        shared by both weapons; a switch cancels a reload; when R and a switch arrive together the switch lands first and the
        reload is the new weapon's; a reload that finishes in a step lets the weapon fire in that step. Snapshot gained
        `weapon` (`slot`, `rounds`, `reserve`, `reloading`); DSL gained `gunsmith.weapon`, `player.reload()` and
        `player.switchTo(slot)`. Mutation: 45 of 46 engine mutants killed (the survivor, deleting `slot === undefined` in
        `SwitchWeapon`, is equivalent: `undefined - 1` is `NaN`, which the integer check rejects), 16 of 16 webapp unit
        mutants, 17 of 17 browser mutants (each by the right spec). Not covered by a spec, only by engine unit tests: firing
        while reloading, and an empty reserve leaving a reload with nothing to do. The specs were written after the webapp
        wiring, so they were proved by mutation, not watched red first.
  - [x] Health, a scripted opponent and a round win (2026-11-12; slices 1 and 2). `BeatingTheOpponent` (sparring: a hit
        lowers the opponent's health, shooting it to zero wins the round and shows "You won", "Play again" starts a fresh
        round), `FightingBack` (duel: the opponent's shots take the player's health, standing still loses the round, "You
        lost") and `HealthOnTheScreen` (the HUD matches the game's own account). Engine: `health/`, `round/`, `opponent/`
        (`OpponentInput` brain, `burst/`, `sight/HasClearLine`, `DisarmOpponent`), `game-loop/fighter/` (both fighters go
        through `PrepareFighter` and `ShootFighter`), `Bullet.shooter`, damage to each fighter returned by `advanceBullets`.
        Decisions (stated, to be set by play): both start at 100 health and the opponent carries the player's weapons with
        finite ammunition and reloads when dry; its aim is exact (no error yet), bursts are 0.5 s on and 1.5 s off; both
        falling in one step loses; a finished round freezes everything but the clock. Mutation: 28 + 31 engine, 17 webapp
        unit and 11 browser mutants killed by the right tests; survivors were equivalent (`disarmOpponent` twice is
        idempotent), and one real gap (`HasClearLine` with a flipped y direction) was closed with steep-angle tests. Not
        covered by a spec: the opponent disc's drawing and the health bar's width (CSS), like the reload fill.
  - [x] **A simple opponent AI** (slice 3, 2026-11-12; planned in plan mode after a web search. Sources: UT Austin cs354r and cs378 lecture notes on
        Quake-style bot FSMs, Glavin and Madden (arXiv 1806.05554) on bot aim handicaps, Valve's TFBot aim-error notes, the
        11th Dream AI write-up ("don't make it too good"), and devlogs on searching a last known position). A four-state
        machine in `engine/src/opponent/` (`wander`, `engage`, `reload`, `search`), its memory in `World.opponentBrain`
        (plain data, seed included), randomness from `engine/random/NextRandom` (mulberry32, no dependency), every tunable one
        field of `opponent/Difficulty.ts`. Stated defaults, to be set by play: 0.4 s reaction, bursts of 3 shots then 1 s rest,
        aim miss 0.12 rad settling to 0.03 over 1.5 s in sight, close in beyond 8 tiles, back off inside 4, circle between,
        walk at 70% of the player's speed, sight range 14 tiles, cover sampled 12 times within 8 tiles, search lingers 3 s.
        No pathfinder: goals are tiles it can see, and a stuck bot (under 0.5 tile in 1.5 s of walking) drops its goal or flips
        its strafe side. **An opponent with no brain takes no action** (sparring); `DisarmOpponent` also takes the brain away.
        Deviations from the plan: `giveOpponentBrain(world, seed)` instead of a fourth `startingWorld` parameter; the reload
        spec needed a fight long enough for the 12-round magazine to run out, which only 2 of 40 seeds give (a standing player
        is dead in 2.3 to 9.4 s; seeds 1 and 6 reload at about 5.4 s), so it has its own seed (`LONG_DUEL_SEED` 6: reload 5.5 s,
        refilled 7.0 s, player dead 9.4 s) and a `startLongDuel()`. Engine unit tests and `ThinkOpponentOverAMatch.test.ts` (20
        seeds: kills a standing player within 15 s, stays on open floor, replays exactly, wanders a minute without sticking)
        carry the rest. Webapp: `?seed=`
        (`game/scenario/seed/`), `worldOfPage()`; the state hook's opponent gained `rounds` and `behaviour` (a plain string,
        since `shared/` cannot read the engine's list). Specs: `AnOpponentWhoMoves` (engages, leaves its spot, magazine runs
        down), `AnOpponentWhoReloads` (reloads when dry, refills, goes back to the fight; the duel, HUD and sparring specs 960 of 960 at `--repeat-each=40`, after two racy assertions were removed: the browser re-reads state that keeps moving, so specs assert what survives a stalled page), a sparring spec that it stays put, `FightingBack`'s lost wait now 15 s (measured), `startDuel()` pins
        `DUEL_SEED`. Mutation: 128 engine mutants killed (the first pass found six weak tests and one blind spot in
        `strafeDirection`, all fixed), 13 of 14 webapp (one equivalent) and 12 of 15 browser mutants. The survivors: disarm-keeps-brain
        cannot show in the webapp (it builds sparring without a brain), "after a reload always wander" re-engages one step later
        so a browser cannot tell, and the never-search mutant of the first run, which the reload spec now kills only by changing
        the pinned fight's timing, so `search` has no assertion of its own in a browser. Not tested by feel yet: is it engaging, is it beatable, does it
        stick on pillars (the 20-seed test says not on the practice pillars). **The user played it (2026-11-14) and
        left the tunables as they are.**
  - [x] **Best of three** (2026-11-13; the duel only, first to two rounds). Engine: `match/` (`Match`, `StartMatch`, `ScoreRound`,
        `DecideMatch`, `NextRound`, `winning/RoundsToWin`) and an optional `World.match`, which `step` scores once in the step that
        decides a round (a simultaneous kill is the opponent's, as before). Webapp: the duel is a match; `RoundBanner` keeps
        "You won" / "You lost" for a round, adds the score and a **"Next round"** button, then "You won the match" / "You lost
        the match" and "Play again"; a `score-hud/` readout ("Round 2 · You 0 · Opponent 1"); `nextRoundOfPage` (a fresh
        duel, the score kept, seed = page seed + rounds played, so `?seed=` replays a whole match); the state hook gained an
        optional `match` (`shared/`'s `MatchSnapshot`). Decisions the user made: a button, not a timer; **full reset** each
        round (health, positions, magazines and reserve; only the score carries over); sparring and the practice range stay
        one endless round. **Found on the way: a click on the banner's button also pulled the trigger** (the latch listens
        on `window`), so "Next round", and "Play again" before it, fired a shot into the round they started; `PullsTheTrigger`
        now ignores a press on a `button`. Spec `PlayingABestOfThree` (12 criteria: nothing to nothing at the start; a lost round
        scores for the opponent and offers "Next round"; round 2 keeps the score, with both fighters restored (measured against the frozen end of round 1, since round 2 is live); two
        lost rounds lose the match and offer only "Play again"; "Play again" starts a fresh match), 200 of 200 at
        `--repeat-each=10` with the other duel specs. Mutation: 12 engine, 13 webapp and 7 browser mutants, all killed by the
        right tests. **Gap, measured:** no browser spec *wins* a round or a match. Over 60 seeds
        (idle for a start delay, aim at where the bot stands, hold fire) a round is won only when the aim is taken at exactly
        0.50 s of game time, the same for every seed (0 of 60 at 0.45 s or 0.55 s, also with up to 0.1 s of aim-to-fire lag): a
        timing window no spec can hit, not a seed property, and a spec-only way to win would be a seam. The win paths are
        covered by engine and webapp unit tests only.
        Not done: a round timer, the closing ring, a pause or countdown between rounds, random spawns.
  - [x] **`engine/src/` sub-foldered, and `Engine.ts` added** (2026-11-13, at the user's request: several entry points share a
        root only when they share the subject; a helper with one caller goes beneath it; `src/` has one entry file too). New
        `src/Engine.ts` (`engine = {startingWorld, step}`, type in `src/types/Engine.ts`, 4 tests, 2 mutants killed); the webapp's
        loop (`UseGameLoop`) and `worldOfScenario` call through it. Moved, with their tests and every import rewritten:
        `opponent/state/{Engage,Reload,Search,Wander}` to `opponent/state/acting/` (their helper folders with them), `opponent/aim/`
        to `state/acting/engage/aim/`, `opponent/cover/` to `state/acting/reload/cover/`, `StartingBrain` and `BrainStart` to
        `opponent/brain/`; `bullet/hit/{DistanceToCircle,DistanceToFighter,FirstContact,NearestDummyHit}` and `Reach` to
        `bullet/flight/meeting/`, `DummyHit` and (from `geometry/`) `Ray` to `bullet/flight/types/`. Left alone on purpose:
        `movement/` (a recorded decision), `opponent/{sight,steering,unstick}` (several callers), and the 8-file
        `opponent/types/` and 7-file `bullet/types/` (types are one folder by rule). No behaviour change: engine 516, webapp 127
        and `ai` 152 tests pass, 73 of 73 specs on the production build. There is no property-test suite yet (no
        `test:properties` script), so that step had nothing to run.
  - [x] **Newest audio code cleaned up** (2026-11-14, at the user's request; `webapp/audio/` is `art`'s folder, so this is logged in
        `HANDOFF.md`). `encoding/` split into named, tested units (no code in two places: it reuses `peakOf`, `AUDIO_FORMAT`,
        `MASTERING.maxLoopJump`, `wavHeader`); `qa/` replaced by `generator-scripts/browser/` (own local server, two controls, the
        page's limits injected from `VERIFICATION_LIMITS`); `AGENTS.md` and `README.md` updated. Output unchanged (MP3 hashes, Ogg
        decoded audio, both verification reports byte for byte). Asked: is there a library for the encoding? No: the encode is one
        `ffmpeg` call per file (about 65 lines); the rest is verification and safe publishing, `fluent-ffmpeg` is deprecated, and
        the JS encoders would change the bytes and the MP3 delay header the loop findings depend on.
  - [x] **Forward vision cone, slice 1 (2026-11-14; cone only).** `engine/src/vision/` (`ConeOf`, `CanSeePoint`, `VisibleToPlayer`,
        `VisibleArea`, with `cone/IsInCone` and `outline/ReachAlong` beneath), `Weapon.visionDegrees` and `visionRange` (90 degrees; rifle 12 tiles,
        marksman rifle 16, tunables), `HasClearLine` moved up from `opponent/sight/`. **The bot uses the same cone** (`CanSee` takes the opponent
        itself; `DIFFICULTY.sightRange` is gone), so it must turn to look (its wander and search already aim where they walk): the 20-seed
        match test and the duel specs pass unchanged; it has not been played by feel. Webapp: a dark veil with the cone cut out
        (`vision-overlay/`), opponent, dummies and the opponent's bullets drawn only where seen. Snapshot gained `vision`, `opponent.visible`,
        `dummy.visible`. Spec `SeeingOnlyWhatYouFace` (7 criteria). Engine 559, webapp 133 unit tests; 31 of 31 mutants killed (two survivors first,
        a test gap: both weapons were 90 degrees wide); browser mutants killed. **Open:** dummies vanish outside the cone in the practice range
        too (a stated default); the opponent's and veil drawing have no spec (canvas). Next: crouch (slice 2), then heights.
  - [x] **Crouch, slice 2 (2026-11-14), test first.** Hold C or either Control: the player walks at 0.4 of their speed
        (`player/walking/CrouchSpeedFactor`) and their cone reaches 1.5 times as far (`vision/cone/CrouchRangeFactor`), the angle and
        the aim unchanged; let go and both come back. Both factors are tunables, stated defaults to be set by play; the bot never
        crouches yet, and cover and quiet (the rest of the tradeoff) do not exist, so they are not in this slice. Engine:
        `Input.crouching` (optional, absent means standing), `Player.crouching`, `MovePlayer(arena, walk)` takes a `Walk` (it had
        four parameters), `ConeOf` reads the stance. Webapp: `use-held-keys/` is one hook that keeps the keys held and derives a value
        (the user asked for it: `use-wasd-movement` and the new `use-crouch-key` were repeating the same listeners), the snapshot's
        `vision.range` now comes from `coneOf` so it grows when crouched (it read the weapon's range directly; the veil already used the
        cone). The state hook gained nothing: the plan's `player.crouching` was dropped, since the range already shows it. Specs:
        `CrouchingToSeeFurther` (range grows, angle does not, stands up again, window losing focus stands the player up, an opponent
        beyond a standing view is seen crouched) and `CrouchingToWalkSlowly` (a measured speed: under 0.6 of standing, back to full
        after standing up), with DSL `player.crouch()`, `standUp()`, `loseFocus()` and `measureWalkingSpeed()`. Red first for the right reason
        (five of seven failed on the behaviour). Engine 570, webapp 139 unit tests; 89 of 89 specs on a production build, 220 of 220
        at `--repeat-each=10` for the crouch, vision and walking specs. Mutation: 18 engine and webapp mutants and 5 shared-hook
        mutants, all killed by the right tests; the first run found one survivor (the `blur` handler, which nothing exercised), closed with
        the focus spec. Not covered by a spec: the veil's drawing while crouched (canvas). **The user reviewed it and played it: "works well"**, so 0.4 and 1.5 stay until they say otherwise.
  - [x] **Heights, slice 1: levels and stairs, walking only (2026-11-14), test first.** The arena reads `1`/`2` as raised floor and an arrow
        `^ v < >` as a stair that climbs the way it points; `ArenaFrom` throws unless the stair has plain floor behind and ahead, the far
        one exactly one level higher (a landing at each end, enforced in code). `Arena` gained `levels` and `stairs`; new `engine/src/height/`
        (`BlockedFrom`: from a level a walker steps onto that level and onto a stair that joins it, from a stair onto either end, so a stair
        is the only way over a drop, and it judges from where they stood so one long step cannot jump a drop; `LevelAt`: the level, or
        half way on a stair); `PushOutOfWalls` now takes a `BlockedTiles` test (`movement/types/`) instead of an arena, and `MovePlayer` passes
        `blockedFrom`. Snapshot `player.level` (a `shared/` contract change; `levelAt`). Webapp: `?scenario=heights` (`game/heights/HeightsArena`,
        16 by 7: low ground, a platform from column 10, one stair on the player's row, no dummies or opponent) and `arena-heights/` drawing
        (a lighter floor per level from the palette's `floor-l1..l3`, each stair as four shaded bands, no labels). Spec `ClimbingAStair` (4
        criteria: begins on the low ground; walking east up the stair puts the player on the platform; the platform's edge stops them as a wall
        does; walking back west comes down). Red first for the right reason (`level` undefined; the edge did not stop the walk). Engine 618,
        webapp 160. **Mutation:** 22 engine mutants, 3 survivors first (a test of the walker judged from the wrong tile, error messages that
        both said "stair", and edge tests whose neighbouring tile was a wall) closed with tests, one equivalent left (`[level - 1, level,
        level + 1]`: no tile is below level 0); 14 webapp mutants, 2 survivors first (a stair at level 1 counted as floor, closed; a lower clamp
        a `??` fallback already covers, removed); 6 browser mutants (no stair, hook stuck at 0, floor never blocks, heights ignored, stair
        reaches one level, stair unusable from the platform), each caught by the right criterion. **Stated defaults, to be set by play:** a stair is one
        tile wide and long, one tile of landing each end, two levels in the first arena, a stair is `level + 0.5` for the snapshot. **Known
        gap:** a stair's flanks are not checked (a raised tile beside a stair's middle can be entered from it), so arenas keep stairs between
        walls or low ground until a validator exists. Not covered by a spec: the drawing (canvas). Next: vision over height, bullets and cover across levels,
        the opponent on stairs, then the ring.
  - [x] **Heights, slice 2: vision over height (2026-11-14), test first.** The user chose the simple level rule and **descoped the range bonus**
        ("add that as an idea to explore later"). A viewer's **eye level** is the level of their ground, or the upper level on a stair
        (`EyeLevelAt`, now in `height/`); **a tile blocks sight if it is a wall or on a level higher than the eye** (`height/BlocksSightFrom`). So from the low
        ground a platform and everything on it is hidden, and its edge hides what is behind it; from a platform the low ground below and the platform show;
        walls still block. `Cone` gained `eyeLevel`; `coneOf(arena, fighter)` takes the arena; `CanSeePoint` and `VisibleArea` pass `BlocksSightFrom(arena,
        cone.eyeLevel)`, so `VisibleToPlayer`, the snapshot's `visible` flags, the opponent's `CanSee` and the dim veil's cut-out all follow. The line samplers
        take a `BlockedTiles` test instead of an arena (`distanceToWall`, `reachAlong`, `hasClearLine`; `BlockedTiles` moved to `arena/types/`, and
        `arena/SolidTilesOf` is the walls-only test the opponent's walking goals use, and bullets did until slice 3). `?scenario=heights` gained a dummy on
        each level (`game/heights/HeightsDummies`). Spec `SeeingAcrossLevels` (5 criteria; DSL `gunsmith.dummies.isSeenAt`). No `shared/` change. Engine 661,
        webapp 161, `ai` 420; 98 of 98 specs on a production build, 520 of 520 at `--repeat-each=10` for the vision, arena, player and dummy specs. **Mutation:**
        21 of 22 engine mutants killed (the survivor, `Math.ceil` to `Math.round` in `EyeLevelAt`, is equivalent: levels are whole numbers or n + 0.5); 3 browser
        mutants (eye level fixed at 0, sight by walls only, the platform dummy moved down) each killed by the right criteria. The spec was written after the engine
        code (its unit tests were red first), so its red run is the mutant "levels ignored", which fails exactly the "does not see it" criterion. **Stated defaults, to be set by
        play:** a stair's eye level is its upper level; no sloped line of sight; the opponent inherits the rule through `CanSee` but its walking goals still use walls
        only, so it does not know a stair from a drop. Not covered by a spec: the veil's drawing over height (canvas). **After the first look, at the user's word the platform's edge was hard to see:** every drop edge now has a bright lip and a shadow (`arena-heights/drops/`); looked at in a screenshot, not specced (canvas). The same session split `movement/PushOutOfWalls` into `pushing/` helpers (19 mutants killed, two gaps closed) and moved `CanSeePoint` and `HasClearLine` to `vision/sight/`. **Idea, not built:** a longer reach for higher
        ground ("extends vision"); and "sees over lower cover" once cover has a height.
  - [x] **Heights, slice 3: bullets across levels (2026-11-15), test first.** The user chose **line of fire = line of sight** (over "a drop blocks both ways" and "leave bullets alone").
        A `Bullet` has a `level`, the eye level of its shooter when fired (`ShootFighter` reads `height/EyeLevelAt(arena, position)`, so a stair gives the upper level), and `MeetBullet`
        asks `distanceToWall(blocksSightFrom(arena, bullet.level), ...)` instead of walls only: a bullet stops at a wall or at ground higher than where it was fired from and flies over lower
        ground. From the low ground a platform's face is cover and stops your shots; from a platform your shots fly out over the low ground; the bot's follow the same code. `ShotRequest` gained
        `level`, `shootFighter` takes the arena, `EyeLevelAt` moved from `vision/cone/` to `height/` (two domains use it). No `shared/` change (`BulletSnapshot` is still `{x, y}`).
        Spec `ShootingAcrossLevels` (4 criteria, existing DSL only): red first (the platform dummy 100 to 75 from the low ground), then green. **A first version flaked 2 in 10 at
        `--repeat-each=10`:** the player walked at full speed past the platform dummy before the browser stopped the walk, so that dummy stood in the line of fire; it now climbs crouched
        (2.4 tiles a second) and stops at 10.6. 120 of 120 at 30 repeats with 6 workers. Engine 690, webapp 179, `ai` 421, 102 of 102 specs on a production build. **Mutation, 7 killed:**
        `FireBullet` level fixed at 0, shooter level fixed at 0, `Math.ceil` to `Math.floor` in `EyeLevelAt`, `MeetBullet` blind to height (level 99) and fixed at 0, `>` to `>=` in
        `BlocksSightFrom`, and the opponent's shot judged on a flat floor (**survived first**: nothing covered the opponent's path, so two `Step` tests were added, one each side); browser
        mutants 3 of 3 killed by the right criteria. **Stated defaults, to be set by play:** a bullet's level is fixed at the moment it is fired (it does not follow a stair); no cover with a
        height; the bot's walking goals and cover search still use walls only. `pnpm test:properties` does not exist yet, so it was not run.
  - [x] Dim arena (original item, now complete): dim arena outside a detailed forward cone, set by equipped weapon and standing/crouched stance, rotating
        with aim through 360 degrees, revealing terrain detail and players/items only in the unoccluded cone, with height blocking sight (slice 2). Cone ownership is settled.
  - [x] **The closing ring (planned with the user 2026-11-15; a shrinking circle on a seeded reachable point, the timer starts it, damage ramps until someone dies).** Slices:
        - [x] 1. **The round timer** (2026-11-15, unit tests first, spec after and proved by mutation, uncommitted): `engine/src/ring/` clock, `World.ring?` (the duel only), the ring's clock stops with the round, `RingHud` ("Ring in 0:43"),
          the hook's `ring.secondsUntilStart`, spec `CountingDownToTheRing` (10 criteria). Engine 700, webapp 191, 112 specs, 460 of 460 at 10 repeats, 22 unit and 10 browser mutants killed.
        - [x] 2. **The ring and its damage** (2026-11-15, uncommitted): seeded reachable centre, radius from the clock, damage 2 to 20 a second, the edge drawn over the veil, the hook's `centre`/`radius`/`damagePerSecond`, ring timing in the query (`?ringDelay=`, `?ringClosing=`), spec `TheClosingRing` on sparring (15 criteria; one round won, one lost). Engine 761, webapp 223, 127 specs, 27 engine, 20 webapp and 8 browser mutants. See "Resume here".
        - [x] 3. **The bot walks inward** (2026-11-16, uncommitted): once the ring is closing, a bot nearer the edge than `DIFFICULTY.ringMargin` (2 tiles) walks to the centre, still firing and aiming at the player it sees; `opponent/shelter/` with a stateless `waypoint/WaypointToward` round pillars; engine 783, 137 specs. See "Resume here".
  - [ ] Pick up and drop a custom weapon; rough Web Audio gunshots.
- [ ] **Demo checkpoint:** when the core is playable, tell the user it is ready for a first look. Agree what to cut or add
      before menus. Record the reaction in `docs/fuzzy-frontend.md`'s demo notes (kept for the history).

### Research-informed playtests (as each mechanic lands)

Source facts, hypotheses and five small setups: `docs/art/gameplay-research.md`. These support Phase 1, not a new
up-front architecture phase; use hand-authored fixtures and keep rule changes as proposals until played/reviewed.

- [ ] Tune the user's intended crouch tradeoff: substantially slower movement in exchange for longer vision,
      quieter movement and cover protection. Verify vulnerability while repositioning and reasons to stand.
- [ ] Play contested pickups with swapped player/spawn assignments; compare legal walking routes through stairs,
      not straight-line distances. Test central weighting for the highest-rated weapon, retaining random placement
      and minimum spacing. Test single-stair camping against a two-route arena.
- [ ] Finalise/validate arenas after player/AI definitions: legal routes, stair connections, spawn/pickup access and
      ring escape time, including blocked/dead-end approaches. Apply the same checks to built-ins and hand-author/
      playtest them as the quality reference. Compare contrasting weapons and oddity skins for explainable deaths.
- [ ] When vision lands, cover weapon/stance changes, cone edges, a full turn/angle wrap, walls and height. Check dim
      terrain outside versus detailed terrain/entities inside the cone; visibility is directional, not globally
      symmetric. Multiplayer checks retain current state/effects and exclude hidden entity/effect data. Preserve
      failures as reproducible fixtures.

## Phase 2: menus around the game (after the user has played it)

Overlays on the full-screen canvas, each added test-first when the game needs it. Likely first: pause and settings,
the round end and match end overlays. Then the pre-round (prompt, generation, reveal), library, account, rooms. The old
screen map is in `docs/fuzzy-frontend.md` for reference only; do not rebuild it wholesale.

- [ ] Contracts for `ai` and `art` (schemas, `AiAdapter`, `CreditLedger`, asset manifest), drafted test-first, only once the
      game needs them. Ask `ai` and `art` to review (M2).

## Phase C: full project standards. Milestone M3

- [ ] Add the remaining packages: `api/` and `infra/` (`ai/` arrived on 2026-11-12, merged from its worktree; `api/` adds `@gunsmith/ai` to its `allowedPackages`), with the interfaces from `HANDOFF.md` for `ai`
      (`engine/` and `acceptance-tests/` arrive in Phase 1).
- [ ] `shared/config/`: ESLint base with `restrictedImports` (the table in `AGENTS.md`), Prettier, tsconfig base, vitest
      base; copy janggi's and adapt. Pin TypeScript per the gotcha in `AGENTS.md` (check TS 7 and typescript-eslint first).
- [ ] Per-package `AGENTS.md` files and the nested webapp ones (`react/`, `store/`), copied from janggi and adapted; strip
      what does not apply (language/Messages, Pages, PWA, bot, push).
- [ ] Root scripts from `AGENTS.md`: `checks`, `format`, `lint:fix`, `start`, `start:preview`, `acceptance-tests`,
      `install-browsers`, `api:dev`, `test:properties`.
- [ ] GitHub Actions: `ci.yml` (checks, then acceptance against a production build, then deploy, then acceptance against
      live) and `property-tests.yml`. `evals.yml` is `ai`'s.
- [x] The layering inside `webapp/src`: `react/` → `store/` → `game/` (Zustand, not Redux; lint-enforced, 2026-11-12), with
      `audio/` beside `store/` when it arrives. The game store holds only the engine's `World`; per-frame values are read with
      `gameState()` and never bound to React. An app store (UI, lobby, library, credits) comes when a screen needs it.

## Phase D: the engine, hardened. Milestone M3

The engine is born in Phase 1, test-first. This phase hardens it as the game settles; these rows are what has to be true by
the end, ticked as Phase 1 reaches them.

- [ ] Simulation rules live in `engine/`: fixed timestep, seeded RNG, no wall clock or `Math.random`.
- [ ] Movement and circle-vs-grid collision; projectile and hitscan weapons for each behavior in the enum; damage, health,
      reload, ammo and reserve; round and match logic; the closing ring.
- [ ] **Visibility:** line of sight against walls and three height levels, with crouch, shared by the server (what to send)
      and the client (what to draw). Wall classes: indestructible walls no weapon passes, cover some weapons penetrate.
- [ ] Even-spaced random spawn and pickup placement from a seed.
- [ ] **Power rating** (deterministic, visible on the reveal screen) and **hard caps** per stat, in code; no nerfing inside the caps.
- [ ] **Arena validator:** bounds, spawn reachability by flood fill, minimum open space, wall and height limits.
- [ ] **Output moderation in code:** length and charset limits plus a blocklist for AI-written names and descriptions.
- [ ] `pnpm test:properties`: fast-check properties for the validator, caps and visibility (directional cone/height cases;
      symmetry only for geometric subproblems with matching assumptions; no leaks through indestructible walls).
- [ ] Final zod schemas for weapon (with `sound` block) and arena in `shared/`, replacing the draft; keep `docs/schemas.md`
      in step. Tell `ai` and `art` if anything they use changed.

## Phase E: API and multiplayer. Milestone M4

- [ ] Worker as plain functions with a thin runtime edge (`ApiWorker.ts`, `WorkerEnvironment.ts`), following janggi's
      `api/AGENTS.md`; one Worker with static assets and `run_worker_first: ["/api/*"]`.
- [ ] Google OIDC with PKCE (`oauth4webapi`, `openid` scope only), hashed opaque session tokens, `/api/me`, log out, delete
      account, rate limiters. Guests can play with the built-in pool.
- [ ] D1 + Drizzle: accounts, sessions, credit ledger (atomic decrement), library with per-account slot limits, match history,
      ratings. Wrangler applies migrations; Drizzle only generates them.
- [ ] `Match` Durable Object, one per match: 20 Hz fixed tick, input validation, **fog-filtered snapshots**, coarse
      directional sound events, 30 s reconnect window and idle forfeit, alarm cleanup. Client prediction and interpolation
      in the webapp (`docs/match-netcode.md`).
- [ ] Private rooms with up to 8 spectators on a host-set delay; a **singleton `Matchmaker` Durable Object** for the public
      queue (FIFO with a widening rating window; D1 holds only ratings and history).
- [ ] **Free-plan spike (spike):** measure Durable Object duration, requests and storage for a 1v1 match, record the result in
      `docs/cost-and-budget.md`, and decide free vs Workers Paid with `ai`.
- [ ] Acceptance specs for: join by code; hidden opponent absent from snapshots and revealed by line of sight; hearing
      range; disconnect and forfeit; spectator delay; public-queue pairing.
- [ ] Keep `docs/match-netcode.md` in step with what is built.

## Phase F: wiring the real AI, art, infrastructure and release. Milestones M5 to M7

- [ ] Swap the real `AiAdapter` (from `ai`) in behind the same interface; wire the AI-off banner, refunds and the timeout
      fallback to the built-in pool.
- [ ] Wire `art`'s deliveries through the manifest until no placeholder is left.
- [ ] `infra/` with Alchemy 0.x: Worker with static assets, D1, Durable Object namespaces, rate limiters. Pinned names and
      `adopt: true` as janggi does. `wrangler.jsonc` for local dev only, kept in sync by hand.
- [ ] `MANUAL-SETUP-STEPS.md` followed once on a throwaway Cloudflare account, then the real domain.
- [ ] Pre-publication scrub checklist (the repo is private for now): secrets, git history, `.claude/settings.local.json`,
      personal paths and addresses.
- [ ] Tuning pass on the tunables (`docs/game-design.md`). Milestone M8.
