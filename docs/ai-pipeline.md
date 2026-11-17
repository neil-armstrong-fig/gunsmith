# AI pipeline

Owner: ai. Weapon stats and appearance generation are implemented in `ai/`; production API integration and arena generation remain planned. Player text is data inside delimited blocks. Model output stays `unknown` until parsed.

## Implemented weapon path

`precheck → moderation → generate → validate → balance → rate`, with one stats repair when needed, followed by appearance generation with its own validation, one repair and disclosed fallback.

The graph is deterministic in its control flow; nodes do not choose tools autonomously. A clean request uses three model calls (moderation, stats, appearance). The maximum is five, including one repair per generation stage. Rejected/invalid stats skip drawing.

- Precheck rejects oversized prompts before a model call.
- Moderation returns a structured decision. The fake adapter tests harness behavior, not live moderation quality.
- Generation uses a loose reply shape with field types, allowing invalid values to reach code-owned validation and repair.
- Validation checks shape and numeric validity. Finite values outside stat ranges are clamped in code before balancing; missing fields, wrong types, fractional magazines and stray fields are not arithmetic input.
- The engine owns power rating, damage caps and deterministic downward balancing. The budget is a ceiling, not a target: deliberate weakness and unused headroom survive.
- Repair sees the previous answer and bounded faults as data. A failed repair produces a typed outcome rather than repeated calls.
- Appearance cannot alter gameplay stats. A failed drawing retains the weapon and discloses the validated stand-in.

See [schemas](schemas.md), [balancing](ai-stat-balancing.md), and [visual generation](ai-visual-generation.md). Source entry points are `ai/src/pipeline/GenerateWeapon.ts` and `ai/src/pipeline/appearance/GenerateAppearance.ts`.

## Eval and safety boundaries

Specs use the mapping/DSL rather than models or pipeline internals. Each request runs once per trial; criteria inspect the same result, and every trial must satisfy a criterion. Plain `given` cases are regression coverage; `given.inProgress` tracks capability work. Deterministic evaluators come first; introduce a model judge only for a demonstrated failure and calibrate it with human labels.

Fake, local and paid tiers measure different things. Scores do not transfer. Provider errors, spend stops and truncated output must fail paid validation explicitly rather than masquerading as legitimate rejection. Mutation evidence must name which criterion fell. The detailed commands and constraints live in [ai/AGENTS.md](../ai/AGENTS.md).

Paid models share one spend guard and cumulative ledger. The existing $1 eval ceiling must not reset when changing checkouts; reconcile spend before an authorized run. Trace tracking is off by default because evals share the trace quota. No acceptance test or ordinary check calls an LLM.

## Planned production integration

Server supplies the API adapter; budget supplies atomic credit reservations/refunds, kill switch and production tracing. Account/library commits are not part of the current pipeline. Credit prices and limits remain defined in [cost and budget](cost-and-budget.md).

Arena comparison will randomize prompt order and parse a structured verdict. Geometry, stairs, spawn/pickup access and ring escape remain engine-owned validity constraints. Built-ins require the same quality checks. Do not pre-create shared contracts before a real consumer exists.

[Hosting](ai-hosting.md) records the in-process Worker decision. Preserve a host-agnostic graph and validate real CPU and callback flushing during integration.
