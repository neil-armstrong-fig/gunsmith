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

