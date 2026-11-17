# Design decisions and proposals

Current owners and consumer contracts are in [HANDOFF.md](../../HANDOFF.md). These decisions guide future acceptance criteria; they do not freeze speculative interfaces.

## Game and visibility

- Build a fun full-screen local game first. Add menus and services when the game needs them, through acceptance specs.
- Only stairs connect height levels. Both landings must be readable; walls and non-stair height boundaries are impassable. Do not label terrain L1/L2/L3 during play.
- Terrain outside the rotating forward vision cone remains dim. Hidden opponents, pickups and exact-position effects remain absent. Weapon vision and crouch affect the cone; the server must enforce visibility in outgoing snapshots.
- Crouch trades slower movement for longer forward vision, quieter movement and cover protection. Tune values through play.
- Code finalises arenas and validates stair routes, spawns, pickup access and ring escape. Built-ins need the same fairness standard. Preserve random ring centres.

## Generated weapons

- Code owns range clamps, power budget and deterministic downward balancing. Preserve deliberately weak weapons and unused budget; overall weakness need not mean every stat is weak.
- AI chooses values/trade-offs for unspecified stats. Distinguish these inferences from explicit player preferences. Preference labels v1 are approved; encoding comparisons and calibration remain research.
- Stats and appearance use separate generation stages with one repair each and five calls at most. Invalid stats skip appearance; drawing failure retains stats and discloses a validated stand-in.
- Visual identity must remain prompt-malleable but cannot change runtime code, hitboxes, visibility, rules or audio limits. Art fixtures are readability targets, not proof of new mechanics.

## Proposals and unfinished decisions

- Weighting strong pickups toward contested central space is a placement proposal, not a fixed spawn rule. Current local pickup placement uses seeded route fairness.
- Bounded visual primitives/palette roles are accepted as a direction. Consumer-reviewed schema moves wait for a real renderer; the authored parts-kit experiment is shelved.
- Real shields and other unsupported mechanics need engine/play decisions and acceptance coverage. A generated numeric stand-in is not the mechanic.
- Online storage, atomic accounting and recording contracts remain planned; domain owners must agree actual consumers before freezing them.

## Operational constraints

The existing cumulative paid-eval ceiling is $1. Reconcile ledgers across checkouts before authorized calls; never treat a missing ledger as zero. Production budgets and credit prices are unchanged. Follow [Operations](Operations.md), [cost and budget](../cost-and-budget.md), and root authorization rules.
