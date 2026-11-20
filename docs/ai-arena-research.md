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

## Sources

- [Structured outputs, Claude API docs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs)
- [Strict tool use, Claude API docs](https://platform.claude.com/docs/en/agents-and-tools/tool-use/strict-tool-use)
- [Level Generation Through Large Language Models](https://arxiv.org/pdf/2302.05817)
- [2D Map Generation with LLMs and Agent-Based Validation (undergraduate thesis, not peer reviewed)](https://rd.uffs.edu.br/bitstream/prefix/9395/1/BOIN.pdf)
- [Constraint-based level generation with LLMs (PCG workshop 2025)](https://pcgworkshop.com/archive/xu2025constraint.pdf)
- `@langchain/anthropic` 1.6.0, `chat_models.js` (the `strict` option), read in the installed package.
