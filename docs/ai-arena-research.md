# Arena generation on Haiku: structured output and other routes (research, 2026-11-20, `ai`)

The user asked (2026-11-19) for a deeper study before the arena format is chosen: is there a tool or structured-output route that gives Haiku something it can work with and the code understands? Kept because losing it would mean re-deriving the shortlist. **The study itself was desk research; one probe (below) then spent $0.00136 on three real Haiku calls, and no production code uses strict output.**

## Where we are

Two formats, both one function call checked by code (zod, then engine's `validateArena`, one repair, then a built-in and a refund): `rows` (strings the model must keep equal in length) and `shapes` (a size and rectangles that `CompileArenaShapes` draws into rows). Haiku 5.5, 3 trials, 12 real arena trials each: rows fell back 2 of 12, shapes 0 of 12, at about the same cost (about $0.0004 an arena, 2 s). Large arenas are the gap: 3 of 4 fell back (rows 2 of 2, shapes 1 of 2). On a 9B local model the dominant failure was ragged rows, which shapes removed.

## 1. Anthropic structured outputs (strict tool use): usable, narrower than it sounds

- **Available.** The structured-outputs page lists `claude-haiku-5-5` among the supported models, stable on the Claude API. `strict: true` on a tool constrains token sampling to the schema, so the arguments always parse and match. `@langchain/anthropic` 1.6.0 (installed) passes it through: `withStructuredOutput(schema, {method: "functionCalling", strict: true})` (`strict` is refused for other methods).
- **What the schema may say** (the limits matter more than the guarantee): supported are the basic types, `enum` and `const`, `anyOf`, `$ref`, `required`, `additionalProperties: false`, array `minItems` of 0 or 1 only, and **`pattern`** (full-match, character classes, `*`, `+`, `?`, simple `{n,m}`). **Unsupported:** `maxItems` and any other array length, `minLength`/`maxLength`, `minimum`/`maximum`, `multipleOf`, `oneOf`, `not`, recursion. Using one is a 400, not a silent drop; the SDK's own zod helper strips such constraints and re-checks locally, which LangChain's path may not. Our current schemas use `.min()`/`.max()`, so strict is **not a flag**: the schema must be rewritten into the supported subset.
- **What it can fix here.** A row is a string, and a pattern can fix both its alphabet and its width: `^[#.cs0-9]{20}$` makes a ragged row or a stray character impossible by construction. The number of rows cannot be fixed with `maxItems`, but an object with `row1` to `rowH` as required properties (each with the pattern) can, because the property list is part of the grammar. So **a strict rows schema removes ragged rows, wrong heights and illegal tiles, but not design mistakes** (the floor cut in two, a platform with no stairs, which is what the repair loop and the validator are for). The catch: the size must be known before the schema is built, because a schema cannot depend on another field. Options: code picks a few size classes and the request asks for one (a new decision for play and engine), or a first cheap call picks the size.
- **Costs and unknowns (need one probe).** The first request with a new schema pays a grammar compilation (reported as significant latency; only the schema is cached, for 24 hours since last use), so a schema per size class multiplies cold starts. The visible docs did not give the limits on schema size or on strict tools per request, or how strict combines with a forced `tool_choice` (LangChain's `functionCalling` forces one). A pattern of width 40 across 30 required rows is the largest schema we would send, so the probe must try that one first.
- **Shapes with strict** gains little: shapes already cannot be ragged, and the numeric bounds (`x`, `y`, `width`) cannot be expressed, so `CompileArenaShapes` stays the check. It would give enums for `level` and stair direction and required fields, which zod already enforces.

## 2. A tool loop (the model builds the arena with small tools)

The model calls `addWall`, `addPlatform`, `addStairs`, `addCover` and `finish`, and code applies each, answering with what is wrong. This is the most literal reading of "a tool the AI can work with and code understands", and it is how the evidence says models do better: they read grids better than they write them, and a validate-and-retry loop recovers playable layouts (the PCG-with-LLMs thesis on 2D maps with agent-based validation found raw output unstable, with spatial blindness and poor counting, and the loop recovered playable layouts; a 2025 paper argues for an intermediate level description language for the same reason). Against our limits:

- **Calls.** Each step is a model call, so an arena becomes about 4 to 8 calls where today's ceiling is three (`modelCalls`, budget's `SettledArenaSpend` prices the calls by place in the pipeline, and `ARENA_SPEND` reserves 2,500 µ$ for three). At about 200 to 350 µ$ a call it fits the money (8 calls is about 2,000 µ$), but **it breaks the call-count contract and the 30 s limit is the real constraint**: at 2 s a call, 8 calls is 16 s before a repair, and the retries are off. Parallel tool calls in one reply would keep it to one or two calls, which makes it a shapes format again.
- Verdict: **do not build first.** Its benefit (feedback inside the loop) is mostly what one repair already gives, and it changes budget's and server's contracts.

## 3. Ideas that move work from the model to code

- **Mirrored half** (the model draws one half or one quarter, code mirrors it): fairness for free, which is engine's open symmetric finalisation, and half the tokens. It costs asymmetric designs and height variety, and the model still has to design a playable half. Worth it as a *finalisation* step in engine, not as the model's format.
- **Edit a built-in** (a small diff on Duel or Fair duel): safest to validate and cheapest, but the arenas would look alike; fit for a "make it like Duel but with…" request, not as the main route.
- **Rule-based or solver generation** (wave function collapse, grammar, constraint solver, as in the 2025 PCG constraint work) with the model supplying parameters (size, density, a theme, feature counts): fully deterministic and always valid, but the model then chooses from a menu, which is what the players did not ask for ("an arena with a raised platform reached by one flight of stairs" is a layout, not a parameter).
- **Fine-tuned small model:** a research route (a Zelda-level fine-tune on a 13 by 9 grid exists); no data here and a training cost, so no.

## 4. Large arenas

Four data points (40 by 30): the model's shape or row count falls apart, and 3 of 4 fell back. Nothing in the research says strict output fixes design quality, only well-formedness. A plausible fix is to ask the model for the *design* at a coarse grid (for example a 10 by 8 block grid that code scales up), which is a shapes variant; there is no evidence yet.

## Probe result (2026-11-20, three real Haiku 5.5 calls, $0.00136, the user's go)

One throwaway script (deleted after the run), `withStructuredOutput(plainJsonSchema, {method: "functionCalling", strict: true, includeRaw: true})`, the production 4,000-token cap, a schema of `name` plus `row1..rowH`, each `^[#c.12\^v<>]{W}$`, the rows prompt plus "exactly W columns by H rows". The tool definition seen at `handleChatModelStart` carried `strict: true` and the intact pattern, with a forced `tool_choice`, so **strict works together with the forced tool** that `functionCalling` sends.

| Call | Schema | Latency | Tokens in / out | Cost | Widths | `validateArena` |
| --- | --- | --- | --- | --- | --- | --- |
| 1, cold | 40 by 30 (31 properties) | 6.9 s | 2,424 / 834 | $0.00066 | 30 of 30 rows exact | passed |
| 2, cold | 20 by 12 | 3.8 s | 1,686 / 367 | $0.00035 | 12 of 12 exact | refused: 5 floor tiles cut off (a design fault) |
| 3, warm | 20 by 12, same schema again | 3.1 s | 1,686 / 365 | $0.00035 | 12 of 12 exact | passed |

- **Accepted, no 400.** The largest schema we would send (30 required rows, width 40) is taken. No limit on schema size or on strict tools was hit.
- **The guarantee held**: every row the right width and in the alphabet, three of three. Ragged rows are gone by construction, as predicted.
- **It does not make a good arena.** Call 2 is the predicted design fault (floor cut off), which the validator and repair loop still have to catch. Call 1 passed but is a bare 40 by 30 hall with two cover blocks and a few wall stubs: valid and dull. One reply measures acceptance and latency, not quality.
- **Cold start.** The first send of the small schema took 0.7 s longer than the second with about the same output. The large schema's cold call cannot be separated from its 834 output tokens (one cold sample, no warm call bought), so its grammar cost is unmeasured; 6.9 s in all is inside the 30 s limit but about three times shapes (2 s).
- **Cost.** The schema is part of the input (1,686 tokens in for the small one, 2,424 for the large, so a bigger schema costs more input, about 740 tokens more for 18 more rows); an arena is $0.00035 to $0.00066, in the range of rows and shapes.
- **Verdict.** Feasible and cheap. The open price is the fixed size (next section), plus a per-size-class cold start, not the cost or the schema's acceptance.

## Large-arena diagnosis (2026-11-20, 12 real Haiku 5.5 first drafts, $0.0071 of the user's $0.05)

Question: why did 3 of 4 large requests fall back, and would a coarse grid or strict rows fix it? A throwaway probe (deleted) called the generation step alone, with no moderation and no repair, and ran the validator on each first draft.

| Request | Format | First drafts | Refused | Why |
| --- | --- | --- | --- | --- |
| "the largest arena allowed, 40 columns wide and 30 rows tall, with several walled rooms joined by doorways, rings of pillars, low cover blocks, and a raised platform reached by stairs" | shapes | 9 | **7** | about 120 tiles of floor sealed off, at the same places every time (column 14, rows 10 and 29): a room whose "doorway" is closed by another wall. One run also had 4 stray tiles. |
| the same | rows | 1 | 1 | a row of 41 characters (a miscount) |
| "a huge open battlefield, as wide and as tall as you may make it, scattered with cover" | shapes | 1 | 0 | none |
| the same | rows | 1 | 0 | valid, but only 15 rows tall, not the "as tall as you may make it" asked for |

- **The failure is a design fault, not a scale or counting one.** Shapes never miscounts, and the 40 by 30 drawing was well formed every time. The model draws walled rooms and then closes the way into them. A coarse grid would not change that, and strict rows would only remove the miscount, which shapes already avoids. So **neither candidate targets the large-arena gap**; the earlier "3 of 4" was a mix of this (shapes) and the miscount (rows).
- **Not measured: the repair.** A request falls back only when the one repair fails too. Seven refusals were the same sentence about floor at one place; whether the repair opens a doorway is the number that decides the fall-back rate, and it is unmeasured. The repair is shown "N tiles of floor, starting at column 14, row 10, cannot be walked to" and the generation prompt never says that rooms need a doorway to the rest of the floor.
- One sample of the plain request does not make a rate; the 8 runs of the hard request do (7 of 8).

## Study: "AI parses, code generates" (web research, 2026-11-20, no model calls)

The user's question: can the model's job shrink to understanding the request, with code making the arena, so that results improve a lot instead of being tuned forever? Evidence below is split by how well it was checked. **Read in full:** Co-DSL abstract, the MILP level-repair paper, LatticeWorld. **Search snippets only (PDFs would not parse):** "Constraint Is All You Need" (PCG Workshop 2025), the metageneration paper, MarioGPT, Word2World, the floor-plan work. Nothing found compares, under control, a model writing a tile grid against a model writing a spec that code expands, for a connectivity-guaranteed 2D arena. **The evidence supports the direction; it does not give us a number.**

### What the literature says

- **Models write tile grids badly and read them well.** The metageneration paper's survey of the field and the maze benchmarks agree: spatial counting and connectivity are weak points, so the work around them moves them out of the model. This matches our two failures (rows miscount, sealed rooms).
- **The common pattern is "model writes a description, code or a solver builds the layout".** Co-DSL: the model states which spatial concepts hold (a concept graph) and a solver finds the layout. "Constraint Is All You Need": the model extracts constraints into a structured Game Level Description Language, an optimiser lays out the level, and agents play it to check; it reports 88% validity, in 3D, with an empirical not a formal guarantee. LatticeWorld: a fixed 32 by 32 symbol grid that a decoder expands (no accuracy numbers given). Floor plans: Graph2Plan and constraint-graph work build the plan from a room graph, and the adjacency-against-boundary trade-off is the known cost.
- **Generate, then repair by code is the best-measured recipe.** Level repair by mixed-integer programming turned a GAN's 24.3% playable Zelda levels into 100% (0.13 s a level), by minimising the tiles it moves; it is agnostic to how the level was made. Word2World runs the same idea as plain checks (row sizes, A* path) on a model's tile grid.
- **Solvers (ASP, SAT, WFC) guarantee validity but need formal constraints.** No source shows a model turning free text into an ASP or WFC specification reliably. WFC itself is weak at global properties such as playability.
- **Fine-tuned models are not the answer either:** MarioGPT had about 31% solvable levels.
- **Fairness work agrees with engine's plan:** designers rely on point symmetry, and the shooter-map work (ARENA, MAP-Elites) scores walkable area, symmetry and route length from the layout graph. Mirroring in code stays engine's finalisation step.

### The options, ranked for this game

1. **Code repair of what the model drew (the cheapest, aimed at the observed failure).** After shapes compile, code finds each cut-off region of floor and opens it with the shortest cut through the wall between it and the main floor (a breadth-first search over wall tiles; the MILP paper is the heavyweight form of the same idea). It costs no model call and would have fixed 7 of the 8 refusals above, which were all one sealed room each. Risks: it changes the model's design (a door the player did not ask for), and it must not defeat a request whose point is a closed layout ("cut in two by a wall nobody can cross"); the cap should be small (at most a few doors, never more than a share of the walls) and the arena says it was repaired.
2. **A feature vocabulary instead of raw rectangles** ("AI parses, code generates" proper). The model chooses from named pieces and places them by meaning: `room` (code draws the walls and **must be given a door**, so a sealed room cannot be written), `pillar_ring`, `platform_with_stairs` (one piece, so the stair rule cannot be broken), `cover_scatter` (density), `wall_line`, a size and a symmetry flag. Connectivity and the stair rules hold by construction, the model's output is smaller, and the fine placement stays the model's. Cost: a new format and a code library, and less freedom than rectangles (the earlier doc called a pure menu "not what players asked for"; a vocabulary with positions and parameters is between the two).
3. **A code-owned fallback instead of a built-in arena.** When the model's draft cannot be made valid, build an arena from the request's *parameters* (size, cover density, has-platform, has-rooms) with a seeded generator, so a failure still gives the player something of their own and the refund becomes rare. Lowest risk, no model change, but only a floor under the results, not a fix.
4. **Constraint solver or WFC with the model supplying constraints** (Co-DSL, GLDL pattern). The most principled and the heaviest: a solver in a Worker bundle (ASP or SAT as WASM), a specification language, and no evidence a small model writes the constraints reliably. Not first.
5. **Model writes generator code, executed by us.** Rejected: running model-written code in the Worker is a security and spend risk for no gain over option 2.
6. **Rows or shapes with strict output, a coarse grid:** these fix counting, not design (measured above), so they stay as they are.

### Proposed probes, cheapest first, with what would count as success

Success is set before the first call so the work cannot drift: **on Haiku, at least 90% of 36 or more first-draft arenas (12 varied requests, 3 trials each) are playable with no model repair, at no more than the present cost (about $0.0005 an arena).**

- **P0, free, offline (code only):** write option 1 as a throwaway on the 7 saved refused drafts (`scratchpad/large-probe-8.md`) and the validator's own examples; report how many it turns valid, how many tiles it changes, and what it does to the "cut in two" request. No model call.
- **P1, about $0.005:** run the present repair on those same 7 first drafts, so there is a measured baseline for what the repair already achieves; without it P0 has nothing to beat.
- **P2, about $0.015:** option 2's format on Haiku for the same 12 requests; compare first-draft validity with shapes on those requests (shapes's own first-draft rate on the 12 is the other half of the comparison, about $0.01).
- **P3, free:** option 3's generator, checked by the validator on 1,000 seeded parameter sets; measures whether it always produces a playable arena.

Total about $0.03 to $0.04 of the $0.05 the user allowed. The request set must include the cases that broke before (the two large ones, the platform with stairs, cut in two, a small box, pillars, cover) and at least four new ones that ask for a layout idea no probe has seen (a spiral, a cross, three rooms in a row, a bridge over a pit).

### Probe results (2026-11-20, Haiku 5.5, $0.0447 of the user's $0.05; ledger $0.0766 to $0.1213)

The probe code, every saved draft and the contact sheets are kept in the main checkout's `private-source/arena-probes-20261120/` (git-ignored; the probes were throwaway `*.eval.ts` files and are not in the repo). **P2 was run only in a lean form (the model draws no stairs and code places them); the full feature vocabulary (`room` with a required door, `pillar_ring`) was not built.**

| Probe | Result |
| --- | --- |
| **P1** today's one model repair on 7 refused first drafts of the 40 by 30 request | **0 of 7** fixed: the model redraws the same sealed rooms. In the pipeline today that request falls back about 7 times in 8. |
| **P0** code repair on those 8 drafts, then on 32 saved drafts (the 8 and 12 varied requests by 2) | raw 20 of 32 valid; after the repair 32 of 32. These drafts were used to build the repair, so this number is optimistic. |
| **Held-out**, 12 new layouts by 3 trials (36 drafts a variant; trial 3 is a fresh sample after the last repair change), **standard shapes** (the model draws the stairs) | raw **27 of 36** valid; after the repair **36 of 36**. |
| the same, **code places the stairs** (the model draws none) | raw 22 of 36; after the repair 36 of 36. |
| **P3** seeded code-only generator (size, rooms with doors, pillars, cover, an optional platform) over 1,000 random parameter sets | raw 649 of 1000 valid; after the repair **973 of 1000**. The repair as first written gave 999; the pocket-filling added later lowered it, because walling in a pocket spends floor on crowded arenas. All failures are crowded parameter sets (open floor under 25%) or one pocket; a real generator would clamp its parameters. |

The repair, as finally prototyped (a prototype of about 250 lines, no model call), runs on the compiled rows before engine's `validateArena`: (1) drop a stair that is illegal alone or read together; (2) a cut-off **raised** region gets a legal stair beside its edge, or is lowered a level if nowhere fits; (3) a cut-off **low-ground** region of at most 12 tiles or 3% of the floor is walled in; a larger one gets the cheapest path opened (a wall tile costs 1, a raised tile 2, found by a shortest-path search); (4) a rectangle with no area is dropped before the schema (the plus-sign draft had a 0 by 0 wall). Each step is re-checked by `arenaFrom` and the region count, and the engine validator stays the judge.

What the probes show:

- **The faults are of two kinds, each mechanically fixable, and the model's own repair fixed neither** (0 of 7). Sealed rooms and unreachable or illegal platforms were all the failures seen. The 40 by 30 request, which fell back about 7 times in 8, is valid every time after the repair.
- **Validity does not decide between leaving the stairs to the model and to code: both reach 36 of 36.** My first write-up of the held-out run (21 of 24 against 24 of 24) was wrong; the two split-level failures were a gap in the prototype (a one-tile strip of low floor boxed in by a plateau), not a weakness of model-drawn stairs. Fixing the gap closed it.
- **Fidelity favours the model's stairs.** On the countable requests: "two staircases" was drawn by the model 3 times in 3 and 0 in 3 when code placed the stairs; "stairs at each end" 3 of 3 drawn, 1 of 3 kept after the repair (it kept one stair where the model drew two), 0 of 3 with code stairs; "8 wide by 30 tall" 3 of 3 in both. Code-placed stairs also turn a request for several flights into one. So the hybrid is better: **keep the model's legal stairs, drop illegal ones, and add one only where a platform is unreachable.** (One step in the tested repair, "dropped 1 stair; added a stair", still replaces a stair the model drew wrongly with one code chose; a better version would move the model's stair, not replace it.)
- **Shape fidelity is the open weakness and no repair addresses it.** "An arena shaped like a plus sign" came back as an open rectangle in 0 of 3 with its corners walled; "an L-shaped arena" had its big wall block in 1 of 3 (standard) and 2 of 3 (code stairs). The probes count playability, not whether the arena is what was asked for; a person has to judge that (contact sheet: `private-source/arena-probes-20261120/held-contact-sheet-both.html`, standard on top, code-stairs below).
- **The success bar** (set before the run): 90% of 36 first drafts playable with no model repair, at no more than today's cost. Both variants met it with the repair (36 of 36 at about $0.0004 an arena, no repair call). The held-out prompts were looked at when the repair was fixed after trials 1 and 2, so trial 3 (fresh samples of the same 12 requests) is the cleanest figure, and a third request set would be cleaner still. One model, 12 requests.
- **Intent trap:** the repair turns "an arena cut in two by a wall nobody can cross" into a playable arena with a door. The present spec (never an unplayable arena; a built-in and a refund otherwise) allows that; whether a door is what the player wanted is a product call.
- **Not measured:** run time on a Worker (the prototype re-sorts a queue on every step; P3 ran about 1.3 ms an arena including generation and two validations), a weaker model, request types beyond 12, a person playing the repaired arenas.

### Verdict

**Best approach, validated on held-out data: keep shapes as the format, with the stairs left to the model, and repair the drawing in code before engine's `validateArena` judges it.** The model's own repair stays as the last resort (it fixed nothing in the one case measured, but may fix others, unmeasured). Rows, strict rows, a coarse grid and a full feature vocabulary are not needed to close the validity gap. Dropping the stair list gave no validity gain and cost fidelity.

### Built (2026-11-20, the user's go; uncommitted)

- **`engine/src/arena-repair/`** (the user chose engine, which owns arena legality): `repairArena(rows)` returns `{rows, edits}`. Its design changed in three ways while it was built, each from a test: a stair joins a platform only to floor that is part of the arena (a stair joining two cut-off pieces to each other was not progress and looped); **a cut-off piece is walled in only when it is a sliver (at most 12 tiles and a tenth of all the floor)**, because walling in the smaller half of a split arena left it under the 25% floor share, and a bigger piece is a room the model drew and gets a door; and **a platform is never cut through for a door** (a strip of floor beside a plateau is walled in instead of the plateau being lowered). The loop mends at most 100 pieces; a real drawing needs a few and a repair took 2 to 4 ms for a 40 by 30 arena with a sealed room (Node, a laptop). The worst case is unmeasured at this cap: a 40 by 30 drawing of nothing but faults took about 1 second when the cap was 200, and the cap was then halved, so about half a second is an extrapolation, not a measurement.
- **`ai`**: `validateArenaDraft` runs it between the row-length check and `validateArena` and hands on the repaired drawing; a rectangle with no size is dropped from shapes before the schema (`check/validate/empty-rectangles/`).
- **Credit rule (the user's decision, 2026-11-20): charge in proportion to what the request cost us.** A pre-check turn-away (no model call) is free; a moderation rejection stays at half a credit; a created arena is one credit; **a built-in fallback is half a credit** (it costs us about $0.00055, more than a created arena, so it is not refunded); our own failures stay refunded. `ArenaOutcome.refunded` is true exactly when `modelCalls` is 0. The routes and prices are server's and budget's (HANDOFF, `SessionDecisions.md`).
- **End-to-end check on every saved real Haiku draft through the shipped `validateArenaDraft`: 104 of 104 valid** (the 24 base drafts, the 8 of the 40 by 30 request, and the held-out 36 standard and 36 code-stairs). The base set was used to build the repair; the held-out set is the clean figure, though the design changes above were made after seeing its first two trials.
- Mutation proof on the final code: 20 engine mutants and 7 ai mutants killed by named tests (an earlier run found two equivalent guards, which the engine's own reading already made redundant, and they were deleted; one survivor, a stair test with a platform in the way, was fixed). Properties (3,000 cases a property): output keeps size and border, no cut-off piece left whenever the result is readable, a readable drawing stays readable, a one-piece drawing is unchanged, and the repair is finished after one pass.
- **Paid run through the shipped pipeline (2026-11-20, 3 trials, $0.0192): 324 of 324 criteria pass and all 24 arena requests, both 40 by 30 requests and cut-in-two included, are made in two calls with no model repair and no fallback** (before the repair: the 40 by 30 request fell back about 7 times in 8). A created arena costs $0.00052 on average. The 40 by 30 arena has real rooms with doorways and a platform with a stair; the cut-in-two arena has its door.
- **Not built:** the code-only generator as a fallback (changes the refund rule that budget and server settle on, and the user's rule now makes a built-in fallback chargeable, so it is a product question, not a decision for ai), shape fidelity (a "plus sign" still comes back as a rectangle), (the paid 3-trial run is done, above).

### Sources

- [Co-DSL: Human-LLM Co-design of Reusable Spatial Concepts for Layout Generation](https://arxiv.org/abs/2610.15290) (abstract read)
- [Video Game Level Repair via Mixed Integer Linear Programming](https://arxiv.org/html/2010.06627) (read)
- [LatticeWorld](https://arxiv.org/html/2509.05263v1) (read)
- [Constraint Is All You Need: Optimization-Based 3D Level Generation with LLMs](https://www.pcgworkshop.com/archive/xu2025constraint.pdf) (snippet)
- [Procedural Content Metageneration via Program Search and Continual Abstraction Discovery](https://arxiv.org/pdf/2608.17947) (snippet)
- [Word2World](https://arxiv.org/pdf/2405.06686), [MarioGPT](https://arxiv.org/pdf/2302.05981) (snippets)
- [Graph2Plan](https://www.researchgate.net/publication/343625455_Graph2Plan_learning_floorplan_generation_from_layout_graphs), [Generative Layout Modeling using Constraint Graphs](https://openaccess.thecvf.com/content/ICCV2021/papers/Para_Generative_Layout_Modeling_Using_Constraint_Graphs_ICCV_2021_paper.pdf), [LLM-Floor-plan](https://github.com/vencecai/LLM-Floor-plan) (snippets)
- [Learning Local Constraints for Reinforcement-Learned Content Generators](https://arxiv.org/html/2605.13570) (WFC and global properties, snippet)
- [ARENA: dynamic runtime map generation for multiplayer shooters](https://www.comp.nus.edu.sg/~bhojan/papers/ARENA-2014.pdf), [MAP-Elites for FPS maps](https://www.politesi.polimi.it/bitstream/10589/140194/3/An%20Online%20Framework%20for%20User-Based%20Analysis%20of%20Maps%20in%20First%20Person%20Shooters.pdf) (snippets)
- [maze-bench technical report](https://github.com/hehee9/maze-bench/blob/main/TECHNICAL_REPORT.md), [Lost in Aggregation](https://arxiv.org/pdf/2606.22219) (snippets)

## Size classes, in plain words (closed 2026-11-23: strict rows was dropped, so there are none)

Shapes needs no size classes: the model gives a width and a height and code draws. Strict rows is different: the schema must name every row and its width **before** the model answers, so the size has to be known first. Today a model picks any size from 8 to 40 wide and 5 to 30 tall (engine's `ARENA_LIMITS`, tunables for play); the built-ins are 20 by 12 and 21 by 13, the prompt defaults to about 20 by 12, and scenario fixtures are not held to the limits. Three ways to know the size first:

1. **Code offers a few classes** (for example small 16 by 10, medium 20 by 12, large 30 by 20) and the request or the UI picks one. A product decision for play and engine, and it costs a cold start per class.
2. **A first cheap model call picks the size.** One more call, which breaks the three-call contract (budget, server).
3. **Strict only at the default size** (20 by 12), and shapes for anything else. No product change, two paths to maintain.

Engine also has an open fairness item that interacts: online rooms start the second fighter at a fixed place and a generated, asymmetric arena has no fair-start fallback, so size classes should be decided together with the symmetric finalisation. None of this blocks the default of shapes.

## Comparison on Haiku 5.5 (2026-11-22, 3 trials, the same requests for every format, $0.06 in all)

Specs `ArenaFormatResearchSmall` (6 requests at about 20 by 12) and `ArenaFormatResearchLarge` (5 requests, two asking outright for 40 by 30), one format per run (`EVAL_ARENA_FORMAT`). Each trial is a real request: moderation, generation and at most one repair. "Created" means the model's own arena was given (no built-in fallback); "own design" means it is not a built-in drawn again.

| Format                  | Small: created | Large: created                | Cost per created arena | Latency (median) | Notes                                                                                                                                                            |
| ----------------------- | -------------- | ----------------------------- | ---------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `shapes` (default)      | 17 of 18       | 14 of 15                      | $0.00057               | 2.6 s / 3.0 s    | the one small fallback was two rooms and a corridor; the one large fallback was "the full 40 by 30 in several rooms"; large arenas came out 36 to 40 by 20 to 24 |
| `strictRows`            | 15 of 18       | n/a (20 by 12 only)           | $0.00070               | 3.2 s            | widths exact by construction; **the stairs-platform request fell back 3 of 3** (a design fault the pattern cannot stop); the others 3 of 3                       |
| `coarseShapes`          | n/a            | **6 of 15**                   | $0.00216               | 4.5 s            | worse than shapes: the model often drew a small arena and the several-rooms request fell back 3 of 3                                                             |
| `editBuiltIn` (2 bases) | 18 of 18       | n/a (the base fixes the size) | **$0.00051**           | 2.6 s            | one repair; its plus sign and corridor arenas were their own layouts (it clears the base), none a copy; cheapest because the answer is a few rectangles          |

(The call-log summary showed 17 for `editBuiltIn` because the kept-arenas file missed one repaired arena; the spec's criteria say 18.)

What it says:

- **Large arenas are not a gap for `shapes` on these requests** (14 of 15, against the 1 of 4 of 2026-11-19, which asked for rooms and a battlefield outright); only "several rooms, full size" still fails. The coarse-grid idea did not help and was deleted.
- **Strict rows removes the one fault it targets (ragged rows) and nothing else**; on Haiku shapes already has none, and strict rows is fixed at one size. Not worth the size-class decision: **the parked size-class question is closed, no size classes**.
- **`editBuiltIn` is the strongest small-arena result so far** (18 of 18, cheapest, fastest) but it is one sample of 18 against two bases, each request answered as a change to Duel or Fair duel; the contact sheets should be looked at for sameness before it is trusted (kept arenas are in the run archive, not yet reviewed by the user). Its size is the base's (20 by 12 or 21 by 13), so it cannot make a large arena.

## Decided (the user, 2026-11-23)

1. **`shapes` stays the default.**
2. **`editBuiltIn` is kept, not adopted.** Its code stays behind `ARENA_FORMATS` (`format/edit-built-in/`, with `ArenaFormatResearchSmall` to run it, `EVAL_ARENA_FORMAT=editBuiltIn`). **Profile it again when the built-in pool is bigger**: the 18 of 18 is against two bases, and the open question is whether 10 to 12 bases give variety or make the model copy (a base list of 12 arenas drawn out is about 1,200 input tokens, about $0.00012 a call). Growing the pool is engine's: a request in HANDOFF when the user wants it. Its arenas from this run are in `private-source/eval-results/20261123-013337-00b8dab-uncommitted/arenas-paid.html`.
4. **Both kept formats are offered to the player as a style (the user, 2026-11-23): Blue is `shapes`, Red is `editBuiltIn`**, named for a colour so the name says nothing about the method. A request may carry `style` (`blue` or `red`); absent, the default is shapes. Red keeps a built-in's standard size, so it cannot make a large arena, and there is no fall back to Blue (a fourth model call). The webapp's arena workshop has the choice; its Make is still a stand-in, so the real Make sends `style` when it is wired.
3. **`strictRows` and `coarseShapes` are deleted** (code, prompts, tests and the strict-output flag); the table above is what was learned. Strict tool use itself works on Haiku (the probe of 2026-11-20 above), so a later format with a fixed shape can use it again. Size classes are not needed.

## Sources

- [Co-DSL: Human-LLM Co-design of Reusable Spatial Concepts for Layout Generation](https://arxiv.org/abs/2610.15290) (abstract read)
- [Video Game Level Repair via Mixed Integer Linear Programming](https://arxiv.org/html/2010.06627) (read)
- [LatticeWorld](https://arxiv.org/html/2509.05263v1) (read)
- [Constraint Is All You Need: Optimization-Based 3D Level Generation with LLMs](https://www.pcgworkshop.com/archive/xu2025constraint.pdf) (snippet)
- [Procedural Content Metageneration via Program Search and Continual Abstraction Discovery](https://arxiv.org/pdf/2608.17947) (snippet)
- [Word2World](https://arxiv.org/pdf/2405.06686), [MarioGPT](https://arxiv.org/pdf/2302.05981) (snippets)
- [Graph2Plan](https://www.researchgate.net/publication/343625455_Graph2Plan_learning_floorplan_generation_from_layout_graphs), [Generative Layout Modeling using Constraint Graphs](https://openaccess.thecvf.com/content/ICCV2021/papers/Para_Generative_Layout_Modeling_Using_Constraint_Graphs_ICCV_2021_paper.pdf), [LLM-Floor-plan](https://github.com/vencecai/LLM-Floor-plan) (snippets)
- [Learning Local Constraints for Reinforcement-Learned Content Generators](https://arxiv.org/html/2605.13570) (WFC and global properties, snippet)
- [ARENA: dynamic runtime map generation for multiplayer shooters](https://www.comp.nus.edu.sg/~bhojan/papers/ARENA-2014.pdf), [MAP-Elites for FPS maps](https://www.politesi.polimi.it/bitstream/10589/140194/3/An%20Online%20Framework%20for%20User-Based%20Analysis%20of%20Maps%20in%20First%20Person%20Shooters.pdf) (snippets)
- [maze-bench technical report](https://github.com/hehee9/maze-bench/blob/main/TECHNICAL_REPORT.md), [Lost in Aggregation](https://arxiv.org/pdf/2606.22219) (snippets)

## Size classes, in plain words (for the user's decision, only if strict rows is chosen)

Shapes needs no size classes: the model gives a width and a height and code draws. Strict rows is different: the schema must name every row and its width **before** the model answers, so the size has to be known first. Today a model picks any size from 8 to 40 wide and 5 to 30 tall (engine's `ARENA_LIMITS`, tunables for play); the built-ins are 20 by 12 and 21 by 13, the prompt defaults to about 20 by 12, and scenario fixtures are not held to the limits. Three ways to know the size first:

1. **Code offers a few classes** (for example small 16 by 10, medium 20 by 12, large 30 by 20) and the request or the UI picks one. A product decision for play and engine, and it costs a cold start per class.
2. **A first cheap model call picks the size.** One more call, which breaks the three-call contract (budget, server).
3. **Strict only at the default size** (20 by 12), and shapes for anything else. No product change, two paths to maintain.

Engine also has an open fairness item that interacts: online rooms start the second fighter at a fixed place and a generated, asymmetric arena has no fair-start fallback, so size classes should be decided together with the symmetric finalisation. None of this blocks the default of shapes.

## Recommendation (at most two candidates)

1. **Strict, fixed-size rows** (a `row1`..`rowH` object with a width pattern per size class), as a third value of `ArenaPipelineDependencies.format` through the existing `arena-drafting/format/` seam. It targets the failure rows still has (2 of 12) and the one a small model has most (ragged rows), and the guarantee is by construction. **The probe is done (above): the largest schema is accepted. What is left is the size-class decision and a paired Haiku comparison with shapes on real requests.**
2. **Keep shapes as the production leaning** and add what the study found cheap: a coarse-grid variant for large arenas, tried only if the strict probe does not help.

Not recommended now: the tool loop, a fine-tune, or a solver. The user then chose (2026-11-20): shapes is the default now (`DEFAULT_ARENA_FORMAT`), and a later turn does a deeper study and tests a few approaches on Haiku before it is final.

## What the user decides

- Decided 2026-11-20: spend the probe (done), shapes is the default for now, and a later research turn tests a few approaches on Haiku.
- Still open: whether engine and play want fixed size classes for generated arenas (only if strict rows is chosen; the three options above), and the final default after the comparison.

## The watchtower regression, 2026-11-24 (Haiku 5.5, shapes, $0.0032 with the probe)

**2026-11-25 (3 trials, after the `floor` paragraph):** all created, but one trial's towers ended at level 1, so the case stays in progress as its own `given` in `AskingForAnArena` while the rest of that spec became a regression.

The user's live-workshop prompt of 2026-11-21 (two level-three watchtowers, a cover divider, a level-three bridge) is now a `when` in `AskingForAnArena`. **3 of 3 trials were created, first draft, no model repair** (2 calls, about 3,000 tokens in and 470 out, about $0.0005 each), so it no longer falls back: code's repair (`repairArena`, built after 2026-11-21's test) mends what failed then. **But none is what was asked for.** A probe that kept the raw drafts (3 more requests) shows why: the model draws each tower straight at level 2 with one stair from the ground (illegal: a stair climbs one level), and `repairArena` then drops that stair and **lowers** each unreachable platform to level 1 (2 to 7 edits a draft). So every tower comes out one level up, the bridge is drawn at level 1 or lost under cover, and the divider is broken into blocks. Validity hides a fidelity loss that code's repair causes. The prompt says a stair joins floors exactly one level apart, but its one example climbs a single level and never shows a landing. Fix candidates (not built; the user's call): (A) ai: a prompt sentence and an example of a two-stage climb (a level-1 landing beside a level-2 platform, a stair onto each); (B) engine: `repairArena` adds a landing and a second stair for a platform two levels above its neighbours instead of lowering it; with either, a criterion that reads the highest level of the arena given, so the case can fail.

**Both built (the user, 2026-11-24; two eval runs and a second probe, $0.0063, ledger $0.1483).** The spec reads `getHighestLevel()` and expects 2; the fake tier answers the watchtower request with Haiku's own raw draft, so it proves engine's fix end to end (with the landing switched off it reads 1). **B, engine (`stairs/AddLanding`):** with the repair alone, 3 of 3 Haiku trials kept both towers at level 2 (4 or 5 code edits each). **A, the prompts:** a rule line teaching a level-1 landing between two stairs (shapes: with coordinates; rows: `.>1>2`), each held by a test to a climb the validator accepts with no code edit. **A had no measured effect:** 0 of 3 raw drafts drew a landing (the second probe; the towers are still drawn at level 2 with none or one stair), and the 3-trial eval with A and B reached level 2 in 2 of 3. The one miss is a model that drew nothing tall: the second probe also had a draft with no shapes at all, an empty box that is valid and created; only the height criterion catches it. Engine's landing is doing the work; the prompt line cost about 130 input tokens a request. **Decided (the user, 2026-11-24): keep the engine fix only; the prompt line and its tests are removed.**


## The watchtower probe, 2026-11-25 (Haiku 5.5, shapes, 6 first drafts, $0.0022, ledger $0.2981)

The watchtower case held in 2 of 3 on 2026-11-25. A throwaway probe (deleted; drafts in the main checkout's
`private-source/watchtower-probe-20261125/`) kept six first drafts raw, compiled and repaired by engine's `repairArena`. **4 of 6 kept
level 2** (engine's landing did the work in three of them), so about 75% over the 12 drafts and trials since 2026-11-24. The two misses have
different causes, and neither is a repair bug:

- **The model drew nothing tall** (1 of 6): a flat arena, as on 2026-11-24. No code can restore what was not drawn, and the user ruled out
  a code refusal.
- **The model drew a tower too small to climb** (1 of 6): a 3 by 4 level-1 block with a 1 by 2 level-2 top, so the level-1 ring around the
  top is one tile thick. A stair onto level 2 needs level-1 floor behind it in line and no raised floor beside it, and no tile of that ring
  has both, so `addStair` correctly finds no place, `addLanding` (level 2 on the ground only) does not apply, and the repair lowers the
  top. A code fix would be an engine design change (grow a platform whose top cannot be climbed), not a bug fix.

The case stays `given.inProgress`. A prompt sentence about stairs already had no measured effect (2026-11-24).

## Shape fidelity, 2026-11-25 (built and run on Haiku 5.5, the user's go of $0.08; spent $0.0625, ledger $0.2109)

A layout request is valid and created but not what was asked: "an arena shaped like a plus sign" came back as an open rectangle in 3 of 3 shapes drafts and "an L-shaped arena" had its wall block in 1 of 3 (the probe of 2026-11-20 above). No validity check can see it, so the evals now read it: `getWalledCorners()` counts the corners whose block inside the border (a sixth of the inner width by a sixth of the inner height) is at least nine tenths wall; a plus sign has 4, an L exactly 1. A quarter-size block was tried first and read a plus with thick arms (corners 3 tiles wide) as 0, so the size was settled before any run; every one of the ~25 arenas kept from earlier paid and local runs (none a layout request) reads 0.

The shapes prompt never says that the walls must make the outline asked for. Two candidates, each the shapes prompt plus one paragraph with the same trigger ("when the request describes the arena's outline as some other shape"), neither naming a shape, both keeping the yard example:

- **`shapesRule` (A):** list wall rectangles that fill every part of the arena outside that outline.
- **`outlineShapes` (B):** give `floor`, rectangles that together make the open area; code walls every tile outside them, then draws the other shapes as before (`format/outline-shapes/`). The function the model sees has the `floor` field.

**Planned run (the user's cost go first):** for each of `shapes`, `shapesRule` and `outlineShapes`, `ArenaFormatResearchSmall` (7 requests, the plus and L included) at 3 trials, and `AskingForAnArena`'s two shape `when`s at 6 trials; about 33 requests a format at about $0.0005, so about $0.05 in all. Record created rate, walled corners, cost and latency here; the user picks the winner. Each run's arenas and call log are kept under the format's name (`EVAL_KEEP_ARENAS=1`; copy `arenas-paid-latest.*`, move the call log aside), because the next run overwrites them.

**Decision bar, set before the run:** the better candidate has more passing plus-sign and L trials (walled corners 4 and exactly 1) than `shapes` and than the other candidate, with no drop in created rate on the five other small requests; a tie goes to the cheaper one (fewer tokens a request). After the run, also read the corners at a quarter-size block (the sixth-size block is lenient at 20 by 12: a 3 by 1 wall in a corner counts), count walled corners on each format's non-layout arenas (a rule or `floor` used where no outline was asked for), and look at the contact sheets, not only the counts.

**Result (2026-11-25; each format: the small research spec at 3 trials and the two shape `when`s at 6, so 9 trials of the plus and 9 of the L; arenas and call logs in `ai/src/evals/results/arenas-paid-fid-<format>-<small|layout>-latest.*` and `paid-arena-calls-fid-…`, git-ignored, and the run archive):**

| Format | Plus sign (4 corners) | L (exactly 1) | Shape passes | Created (33 requests) | Model repairs | Generate tokens in / out (mean) | Cost a request | Median request |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `shapes` (today) | 2 of 9 | 2 of 9 | 4 of 18 | 33 | 0 | 1,807 / 278 | $0.000468 | 2.17 s |
| `shapesRule` (A) | 9 of 9 | 4 of 9 | 13 of 18 | 33 | 0 | 1,880 / 298 | $0.000485 | 2.13 s |
| `outlineShapes` (B) | 8 of 9 | 9 of 9 | 17 of 18 | 33 | 0 | 1,998 / 290 | $0.000493 | 2.12 s |

- Every one of the 99 requests was created, first draft, with no model repair; the five other small requests stayed created in every format, so neither candidate cost validity.
- The sixth-size and the quarter-size block gave the same reading on every arena, and no arena of a non-layout request had a walled corner in any format: neither the rule nor `floor` was used where no outline was asked for.
- A's 5 L misses were all 2 corners: a Z (two opposite corners walled), not an L. B's one plus miss is a true plus whose model also listed cover blocks that fell in its walled corners (B draws cover over the outline's wall), so a corner read 8 of 9 tiles wall: unreachable cover inside a wall, a drawing-order quirk of B, not a wrong shape.
- By the bar set before the run, **B wins** (17 of 18 against 13 of 18 and 4 of 18, no drop in created rate); it costs about 5% more a request than `shapes` (191 more input tokens). The user picks.

**Decision (the user, 2026-11-25: "go with the option that feels strongest"; to be tuned after release with more failing prompts): B, folded into `shapes`.** The shapes format now takes an optional `floor` list (its prompt paragraph as measured, the function's field, the strict draft schema, `compileArenaShapes`), with one change from the run: **cover drawn outside the floor is walled in**, since no fighter could reach it (B's one miss); a platform outside it is kept, because `repairArena` already joins or lowers a platform nobody can reach. An edit of a built-in refuses `floor` (the base fixes the outline). `shapesRule`, `outlineShapes` and `format/outline-shapes/` are deleted.
**Confirmation on the shipped default (2026-11-25, `AskingForAnArena`'s two shape `when`s at 6 trials, $0.0060):** the plus sign 6 of 6 with 4 corners, the L 6 of 6 with exactly 1, all 12 created first draft with no model repair; generate tokens 1,996 / 304 on average, requests 2.0 to 2.9 s (`ai/src/evals/results/arenas-paid-fid-confirm-latest.*`).
**Large arenas with the `floor` paragraph (2026-11-25, the user's go, `ArenaFormatResearchLarge` at 3 trials, $0.0088):** 15 of 15 created first draft with no model repair (14 of 15 before it, 2026-11-23), sizes 36 by 20 to 40 by 30, no walled corner on any (so `floor` was not used where no outline was asked for); generate tokens 2,011 / 468 on average, median request 2.7 s (`arenas-paid-fid-large-latest.*`).
**Promoted (the user, 2026-11-25):** the plus-sign and L cases are a plain `given` in `AskingForAnArena`, so they gate under `EVAL_GATE=regression`.
**Not measured:** outlines other than the plus and the L (a T, a U, a ring), and a `floor` used on a plain request where only a notch or a room's size would change (no corner check sees that).

## Sources

- [Structured outputs, Claude API docs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs)
- [Strict tool use, Claude API docs](https://platform.claude.com/docs/en/agents-and-tools/tool-use/strict-tool-use)
- [Level Generation Through Large Language Models](https://arxiv.org/pdf/2302.05817)
- [2D Map Generation with LLMs and Agent-Based Validation (undergraduate thesis, not peer reviewed)](https://rd.uffs.edu.br/bitstream/prefix/9395/1/BOIN.pdf)
- [Constraint-based level generation with LLMs (PCG workshop 2025)](https://pcgworkshop.com/archive/xu2025constraint.pdf)
- `@langchain/anthropic` 1.6.0, `chat_models.js` (the `strict` option), read in the installed package.
