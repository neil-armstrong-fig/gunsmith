# Design decisions and proposals

Current owners and consumer contracts are in [HANDOFF.md](../../HANDOFF.md). These decisions guide future acceptance criteria; they do not freeze speculative interfaces.

## Game and visibility

- Build a fun full-screen local game first. Add menus and services when the game needs them, through acceptance specs.
- Only stairs connect height levels. Both landings must be readable; walls and non-stair height boundaries are impassable. Do not label terrain L1/L2/L3 during play.
- Terrain outside the rotating forward vision cone remains dim. Hidden opponents, pickups and exact-position effects remain absent. Weapon vision and crouch affect the cone; the server must enforce visibility in outgoing snapshots.
- Crouch trades slower movement for longer forward vision, quieter movement and cover protection. Tune values through play.
- Code finalises arenas and validates stair routes, spawns, pickup access and ring escape. Built-ins need the same fairness standard. Preserve random ring centres.

## Making and choosing (the user, 2026-11-18; [concept](../selection-concept/README.md))

- Making happens in the **workshop** (the practice arena plus a panel, no timer), never in a match. The pre-round only chooses from the shelf and the built-ins. Build order: workshop, a tutorial, then the pre-round's choosing, the arena pick and the reveal.
- Any made weapon or prompt can be saved whether or not it was liked or used; saved items work with the AI off (only making pauses). Weapons and arenas have separate shelf limits set by the server, and paid extra spaces are possible later.
- A made weapon is one click from **Try it** in the practice arena. Prompt limits are shown in characters (600 weapon, 1,000 arena). Rating is shown before Use; Try again edits the last result for 1 credit.
- Play owns this end to end. Cosmetic recoil and the muzzle flash wait until after the MVP.

## Generated weapons

- Code owns range clamps, power budget and deterministic downward balancing. Preserve deliberately weak weapons and unused budget; overall weakness need not mean every stat is weak.
- AI chooses values/trade-offs for unspecified stats. Distinguish these inferences from explicit player preferences. Preference labels v1 are approved; encoding comparisons and calibration remain research.
- Stats and appearance use separate generation stages with one repair each and five calls at most. Invalid stats skip appearance; drawing failure retains stats and discloses a validated stand-in.
- Visual identity must remain prompt-malleable but cannot change runtime code, hitboxes, visibility, rules or audio limits. Art fixtures are readability targets, not proof of new mechanics.

## Generated arenas

- **Credits follow what the request cost us (the user, 2026-11-20):** "I still paid for the model usage, so what is there to refund? We only refund if the prompt is rejected before hitting the model", and no one is to add a massive spend. Credits and dollars are separate ledgers: the global dollar spend is always settled at the model calls made, so a credit refund never refunds our cost, it only gives the player a free retry. So only a request that cost us nothing, or that failed through our fault, is free. Arena prices (10 credits a day; weapon and arena 1, rejected 0.5):

| What happened | Model calls | Cost to us | Credit charged (new) | Was |
| --- | --- | --- | --- | --- |
| Length pre-check turn-away | 0 | $0 | **0** (refunded) | 0.5 |
| Moderation rejection, or the moderation call itself failed | 1 | about $0.00015 | 0.5 | 0.5 |
| Arena created, first try or after a repair | 2 or 3 | about $0.00034 to $0.00055 | 1 | 1 |
| **Invalid arena** (no playable arena after the one repair; no built-in is given, 2026-11-21) | 2 or 3 | about $0.00055 | **0.5** | 0 (refunded) |
| Our failure: timeout, exception, result cannot be kept | any | up to the reservation | 0 (refunded) | 0 (refunded) |

  An invalid arena (which ended as a built-in fallback until 2026-11-24) is charged the rejected price, 0.5, because it costs us more than a created arena. A failed moderation call stays at 0.5 (the user chose no change). `ArenaOutcome.refunded` is true exactly when `modelCalls` is 0 (the pre-check); every other charge is the route's. Whether weapons follow the same rule is open.
- **Weapons, the same principle (the user, 2026-11-20: "likely the same yes - about avoiding too many sneaky costs", then "make the changes"); applied by `ai` in `api/` at the user's go:** the weapon route refunds an `invalid` weapon today and charges 0.5 for any rejection. The weapon outcome has no `refunded` flag, so the route reads `status === "rejected" && modelCalls === 0`.

| What happened | Model calls | Cost to us | Credit charged | Was |
| --- | --- | --- | --- | --- |
| Length pre-check turn-away | 0 | $0 | **0** (refunded) | 0.5 |
| Moderation rejection, or the moderation call itself failed | 1 | about $0.00015 | 0.5 | 0.5 |
| Weapon created (stats 2 calls, then its drawing, with or without the stand-in) | 3 to 5 | about $0.001 | 1 | 1 |
| **Invalid: no valid weapon after the one repair** (nothing is drawn) | 3 | about $0.0006 | **0.5** | 0 (refunded) |
| Our failure: timeout, exception, result cannot be kept | any | up to the reservation | 0 (refunded) | 0 (refunded) |

- **Code repairs an arena before the validator judges it (the user, 2026-11-20; `engine/src/arena-repair/`):** the model's own repair fixed none of 7 sealed rooms on Haiku, code's fixed all of them. Stairs stay the model's to draw; code only drops an illegal one or adds one where a platform cannot be reached. Study: [ai-arena-research](../ai-arena-research.md).

## Proposals and unfinished decisions

- Weighting strong pickups toward contested central space is a placement proposal, not a fixed spawn rule. Current local pickup placement uses seeded route fairness.
- Bounded visual primitives/palette roles are accepted as a direction. Consumer-reviewed schema moves wait for a real renderer; the authored parts-kit experiment is shelved.
- Real shields and other unsupported mechanics need engine/play decisions and acceptance coverage. A generated numeric stand-in is not the mechanic.
- Online storage, atomic accounting and recording contracts remain planned; domain owners must agree actual consumers before freezing them.

## Operational constraints

The existing cumulative paid-eval ceiling is $1. Reconcile ledgers across checkouts before authorized calls; never treat a missing ledger as zero. Production budgets and credit prices are unchanged. Follow [Operations](Operations.md), [cost and budget](../cost-and-budget.md), and root authorization rules.
