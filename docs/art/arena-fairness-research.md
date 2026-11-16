# Fair symmetrical arenas: art/research session 1

Delivered 2026-11-16. Build/AI handover; original diagrams and desk research,
with model-free measurements against the current engine. These arenas are
unplayed fixtures, not production content or evidence of equal win rates.

[Comparison sheet (PNG)](concepts/fair-arenas/ArenaComparison.png) ·
[Editable SVG](concepts/fair-arenas/ArenaComparison.svg)

## Decisions and recommendation

The user chose matching symmetrical spawn pairs, with player assignment
randomized. Weapon placement remains random. **Keep the current random ring
centres**, drawn from mutually reachable tiles; do not filter centres by equal
arrival time or silently reject an arena because a random centre favours a side.
These choices were confirmed while planning this study on 2026-11-16.

Recommend **180° rotational symmetry** as the first construction rule and
**A, the shared platform**, as the first playable fixture. Transform the whole
terrain, including wall/cover properties, height and stair direction. This makes
corresponding opportunities identical without requiring identical routes within
one player's half. It preserves the orientation of a player's approach relative
to their initial facing. Reflection is also viable; it reverses handedness and
needs its own aim/input transform checks. Neither has measured superiority here.

A shared platform creates a contest; B's paired perches risk two players waiting
on their own high ground. That is a hypothesis for play, not a reason to ban paired
platforms. C tests a reflected layout with two stairs on the same face. It also
changes platform position and approach length, so A versus C is **not** an isolated
experiment on symmetry type. D proves that symmetry and equal distance alone do
not remove a single campable entrance.

Fairness here means equivalent starting terrain and opportunities under matching
weapon, stance and input assumptions. Random pickups/rings can favour a side in
an individual round. Do not promise equal outcomes or compensate by altering
weapon stats. The existing duel starts one fighter centrally and the other near
an edge; it is a mechanic test arena, not this study's fairness reference.

## Evidence and limits

- **ARENA (2014):** the authors evaluate multiplayer shooter maps using connectivity
  and travel-distance differences to flags. This supports measuring traversable
  travel, rather than visual spacing. Its flag objectives and design criteria do
  not establish Gunsmith's stair count or balance thresholds. Consulted indexed
  full-text excerpts; the PDF fetch timed out.
  [Original paper](https://www.comp.nus.edu.sg/~bhojan/papers/ARENA-2014.pdf).
- **Togelius, Preuss and Yannakakis (2010):** their strategy-map research searches
  across partially conflicting objectives rather than treating one score as all
  of design quality. Application here: retain separate geometry, access, exposure
  and play observations. Do not copy RTS terrain costs into this shooter.
  [Institutional abstract and paper](https://www.um.edu.mt/library/oar/handle/123456789/81279).
- **Rupp, Eberhardinger and Eckert (2023):** their abstract describes balancing
  two-player tile levels through repeated simulation and win-rate feedback in
  Neural MMO. This is evidence for testing actual play after structural checks,
  not proof that their agents transfer to Gunsmith or that it needs RL tooling.
  [Author paper/abstract](https://arxiv.org/abs/2306.04429).
- The earlier [gameplay research](gameplay-research.md) supplies developer accounts
  and the stairs/pickup/ring experiments. This study narrows those into fixtures;
  it does not repeat them as newly measured results.

No source supplies a correct Gunsmith fairness tolerance. The recommendation and
fixtures below are original applications. No model call, game purchase or live
infrastructure change was made.

## Current engine and measurement method

References inspected: `engine/src/arena/ArenaFrom.ts`, `height/BlockedFrom.ts`,
`height/BlocksSightFrom.ts`, `vision/sight/HasClearLine.ts`,
`ring/centre/ReachableCentre.ts`, `ring/RadiusOfRing.ts`, and
`webapp/src/game/duel/DuelArena.ts`. Root `AGENTS.md`, handoff/checklists and the
art direction/manifest/copy/audio briefs govern this delivery; there is no nested
instruction file under `docs/art/`. No package code is edited.

The temporary Node probe transpiled the existing TypeScript modules in memory
with installed TypeScript, called `arenaFrom`, and breadth-first searched four
cardinal tile neighbours (east, north, west, south) using **the engine's
`blockedFrom`**. Rows below are
north first, exactly as `arenaFrom` expects. Coordinates are zero-based tile
indices with y increasing north; use `(x + 0.5, y + 0.5)` for a tile-centre point.
`#` is wall, `.` low floor, `1` raised floor, arrows climb toward the upper landing.
There is no penetrable cover in today's engine; the dark obstacles on the sheet
are walls. Future cover must preserve class, height and penetration behavior under
symmetry, not just position. These are full-information study overviews, not
screenshots of a player's cone/fog view. No dynamic entity outside vision is
proposed for disclosure.

All drawings are 21 × 13. Rotation maps a tile `(x,y)` to `(20-x,12-y)` and aim
`(dx,dy)` to `(-dx,-dy)`; swap `^/v` and `</>`. Reflection maps tiles to
`(20-x,y)` and aim to `(-dx,dy)`; swap `</>` and preserve `^/v`. On world points
use `(21-x,13-y)` or `(21-x,y)` instead. A starts facing east, B west in all four
fixtures. These transforms also apply to movement input when comparing plays.

Distances are shortest **cardinal tile-centre** routes, not optimal continuous
walking time. Divide by 6 tiles/s standing or 2.4 crouched for this route's nominal
travel time. Real collision, diagonal shortcuts, aim, fighting and stair denial
need gameplay verification. The current stair check validates the two landings,
but `blockedFrom` permits some lateral stair transitions. These fixtures put no
upper floor beside a stair's flank; build must close that loophole before treating
an arbitrary generated arena's route graph as authoritative.

## Reproducible fixture drawings

| Fixture | Symmetry | Spawn A / B | High-ground target A / B | Route steps A / B |
| --- | --- | --- | --- | --- |
| A | rotation | (2,6) / (18,6) | (10,6) / (10,6) | 8 / 8 |
| B | rotation | (2,3) / (18,9) | (5,8) / (15,4) | 8 / 8 |
| C | reflection | (2,3) / (18,3) | (10,8) / (10,8) | 13 / 13 |
| D | reflection | (2,3) / (18,3) | (10,8) / (10,8) | 13 / 13 |

A and B's nominal routes each take 1.33 s standing / 3.33 s crouched. C and D's
13 steps take 2.17 s / 5.42 s. For B these are corresponding home perches; for the
others both targets are the same shared point. Equal route length does not say
that two alternative approaches are equally exposed.

### A

```text
#####################
#...................#
#...................#
#...............#...#
#.......11111...#...#
#.......11111.......#
#......>11111<......#
#.......11111.......#
#...#...11111.......#
#...#...............#
#...................#
#...................#
#####################
```

### B

```text
#####################
#...................#
#...................#
#...111....#........#
#...111....#........#
#...111.............#
#....^.........v....#
#.............111...#
#........#....111...#
#........#....111...#
#...................#
#...................#
#####################
```

### C

```text
#####################
#...................#
#...................#
#.......11111.......#
#.......11111.......#
#.......11111.......#
#.......^...^.......#
#....#.........#....#
#...................#
#...................#
#...................#
#...................#
#####################
```

### D

```text
#####################
#...................#
#...................#
#.......11111.......#
#.......11111.......#
#.......11111.......#
#.........^.........#
#....#.........#....#
#...................#
#...................#
#...................#
#...................#
#####################
```

### Sightlines and choke points

The engine's wall/height ray test from A's spawn to its high-ground target is
blocked in all four fixtures. From the raised target back to A's spawn it is
clear in A/B and blocked by a wall in C/D. These are **unlimited-range geometric
rays**, not complete cone visibility: match weapon range, angle and aim before
asserting an entity is visible. No range bonus for high ground is assumed.

A has opposed stair approaches. C separates stairs by four tile columns but
approaches the same face; a defender may cover both with one cone. D funnels both
routes through `(10,6)`: replacing this stair by a wall disconnects the platform.
This is a topological cut, not a measured camper win rate. B has one stair per
perch: losing control of your own approach may strand you, even though starting
access is equal. The four fixtures deliberately distinguish these failure modes.

## Ring diagnostics: preserve random selection

Fixed diagnostic centres below are legitimate reachable candidates, not a new
selection rule. Ring timing is the current default: 45 s delay, 30 s closing,
final radius 2 tiles. Start radius is the farthest arena corner from the centre.
For a stationary spawn at distance `d > 2`, first boundary crossing is
`45 + 30 * (startRadius - d) / (startRadius - 2)` seconds from round start.
“Never” means the stationary spawn remains inside the final radius. This is the
geometric boundary time, not the first discrete damage tick or a death time.

| Fixture | Centre tile | Route to centre A / B | Stationary exposure A / B (s) |
| --- | --- | --- | --- |
| A | (10,6) | 8 / 8 | 57.61 / 57.61 |
| A | (2,6) | 0 / 16 | never / 51.15 |
| A | (18,6) | 16 / 0 | 51.15 / never |
| B | (10,6) | 11 / 11 | 56.03 / 56.03 |
| B | (2,3) | 0 / 22 | never / 50.92 |
| B | (18,9) | 22 / 0 | 50.92 / never |
| B | (5,8) | 8 / 18 | 67.67 / 53.88 |
| C | (10,6) | 11 / 11 | 56.03 / 56.03 |
| C | (2,3) | 0 / 16 | never / 52.66 |
| C | (18,3) | 16 / 0 | 52.66 / never |
| C | (10,8) | 13 / 13 | 55.62 / 55.62 |
| D | (10,6) | 11 / 11 | 56.03 / 56.03 |
| D | (2,3) | 0 / 16 | never / 52.66 |
| D | (18,3) | 16 / 0 | 52.66 / never |
| D | (10,8) | 13 / 13 | 55.62 / 55.62 |

Moving immediately from round start along the measured route reaches every
listed centre without ring exposure, standing or crouched. The probe sampled
interpolated tile-centre travel at 1/60 s through round second 75 using the actual
`radiusOfRing`. It is a sufficient scripted-route check, not a proof about every
position or departure time. The 45-second grace period makes these small fixtures
easy to escape when moving early. A ring on B's western perch still gives nominal
routes of 8 versus 18 steps and markedly different stationary exposure times.

Future diagnostics should replay late departures, holding a perch, stair denial,
dead-end detours and short query-configured timings. A static reachable centre
can still require crossing already-unsafe ground. Check the time-varying radius
along the entire legal route, not only the destination. Report exposure duration
and damage separately from reachability. Do not change the random selector or
promise damage-free escape from arbitrary late game positions.

## Deterministic finalisation and validator handover

Build owns these changes, with the same rules for built-ins and generated arenas.
AI proposes bounded layout data; code constructs/checks the arena. No production
API/schema is frozen by this document.

1. Construct a canonical half and apply the chosen transform, including stair
   directions and material properties. Resolve the centre seam explicitly:
   self-mapped cells must be invariant (a lone directed stair cannot sit at a
   rotation's fixed centre). Do not average incompatible heights or choose a
   random side to repair independently. Validate the result after construction.
2. Reject malformed stairs, blocked landings, lateral stair access, disconnected
   playable regions and missing fighter clearance. Include player radius at
   corners and stair approaches; tile-centre flood fill alone is insufficient.
3. Enumerate matching spawn pairs on equal levels, with equivalent clearance,
   corresponding high-ground routes and transformed initial aim. Require distinct
   starts and configured route spacing. Canonically order pairs, select from a
   seeded stream, then randomize player assignment separately. Report when no
   valid pair exists; never quietly accept an unmatched pair. Exact spacing is a
   build/play tunable, not an invented numeric contract here.
4. Preserve random weapon placement and existing minimum-spacing/access rules.
   Measure routes to each sampled weapon; no requirement that every random pickup
   be equidistant. Central strongest-weapon weighting remains the earlier separate
   playtest proposal, not approved behavior from this study.
5. Keep structural failures separate from tactical review. Flag a sole stair cut,
   multiple stairs sharing one narrow approach, long exposed routes and dominant
   firing positions for authoring/playtests. Do not equate a warning or the D
   counterexample with proof that every single-stair platform must be banned.
6. Keep ring selection unchanged. Produce diagnostic route/exposure observations
   without rejecting centres on fairness grounds. Reject genuinely disconnected
   starts via the structural checks, not through an implicit ring policy change.
   If generation cannot meet structural constraints, use a validated curated
   built-in; coordinate existing retry/refund policy with AI rather than inventing
   extra model calls here.

## Acceptance scenarios for build (unimplemented)

Write the spec before runtime changes and watch it fail for the intended reason;
then implement and mutation-prove. These sentences are a handover, not passing tests.

| Given / when | Expected observation |
| --- | --- |
| Same fixture and seed loaded again | Same geometry, chosen spawn pair and player assignment; random streams remain independent of bot/ring behavior |
| Matching players start on A | Equal level, transformed aim and equivalent legal high-ground access; neither can walk up a platform edge |
| Entire scene and recorded inputs transformed | Corresponding positions, routes and visibility agree with matching weapons and stance; transform pickups/ring too for this geometric comparison |
| Player identities swapped in the same random realization | Geometry/pickups/ring remain fixed; any side advantage changes owner, rather than being compensated away |
| One stair removed, one height changed, or a landing blocked | Symmetry/structural validation fails with a useful reason; a fallback is validated too |
| D remains perfectly symmetrical | Structural checks do not claim tactical balance; the shared-stair warning/playtest is retained |
| Opposing fighters aim across height | Low-to-high occlusion holds; high-to-low still obeys walls, cone and range; no reciprocal-visibility assertion |
| A spawn-adjacent ring centre or unequal random pickup is selected | Determinism and reachability hold; selection is not filtered for equal route lengths |
| Same arena supplied as built-in and generated data | Identical structural checks and diagnostic classification |

Use the existing read-only state hook for browser assertions; do not add a
write-state test seam or call an LLM. Build owns any minimum hook additions.

## Paired playtest protocol (not performed)

Start with A, then B/C; retain D as the single-stair pressure condition. Use the
same starting weapons for terrain tests, then swap contrasting weapons. Keep
crouch factors unchanged. Play five paired rounds per condition (ten rounds),
swapping players between the same spawns and retaining each pair's ring/pickup
realization. This is an initial qualitative screen, not a significance claim.

Record fixture, seed, starts/assignment, weapons, stance choices, first high-ground
arrival, first sighting/hit, which stair/approach was used, camping duration,
ring-centre/escape route, damage before escape and whether the loser could explain
the death. Compare matched players as well as the bot; bot pathfinding is not a
fairness oracle. Preserve failing seeds and input recordings when available.
For the isolated symmetry-method experiment, transform the **same** half-layout
by reflection and rotation and hold all other variables fixed; A/C alone cannot
answer it. Live testing and production acceptance remain build's next work.

## Delivery verification

The temporary probe used existing engine modules without editing them or adding
dependencies. All four parse; transformed tile/stair data and equal paired route
lengths pass. Actual engine movement edges and directed rays to the target
also agree under each fixture's transform (every interior non-wall tile, eye
levels 0 and 1). These are geometric checks, not complete cone or play tests.
Negative controls detect a removed stair, unequal height and blocked
landing; replacing D's only stair disconnects its platform. Controls alter copies
of art fixtures only; they are not runtime mutation coverage.

SVG and PNG are original artwork, with no external resources or font downloads.
The sheet was rendered in Chromium and inspected at full size in colour and
grayscale. Static terrain, both stair landings, spawn letters and routes remain
readable. Only the editable SVG, preview PNG and this brief are retained; temporary
authoring/measurement scripts are not shipped. The drawings and method above are
the reproducible source. No gameplay acceptance suite, human playtest, model eval
or audio re-render is claimed. Final workspace checks are recorded in the handoff.
