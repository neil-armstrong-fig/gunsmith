# Research for the game session: readable surprises

Researched 2026-11-12 by `art`, at the user's request. This feeds the **game-first, test-first** direction in
`MVP-TODO.md` and `POSTMVP-TODO.md`: no menus, schema freeze or real model calls are prerequisites for these experiments.

This is documentary research from developer/publisher material and original technical work, not hands-on evaluation.
Source facts are labelled **Evidence**; **Application** and the experiments below are Gunsmith-specific inferences.
Store descriptions establish intended mechanics, not measured quality or balance. None of the suggestions changes an
agreed rule automatically. In particular, power remains capped rather than silently balanced, crouch increases range,
and height changes happen only at stairs.

## Comparable designs and what transfers

### ROUNDS: combinations can be the attraction

**Evidence:** Landfall describes a 1v1 shooter in which the losing player gains upgrades to counter the opponent,
including combinations of shotgun, rocket, homing and bouncing behaviour.
[Developer description](https://landfall.se/rounds).

**Application:** test a small number of radically different firing patterns before a large stat vocabulary. Use a
slow heavy shot, wide short-range burst and ricochet weapon as hand-authored fixtures. Ask whether a player can recognise
the threat and choose a response. Do not import ROUNDS' loser-upgrade system: Gunsmith's shared pool and fixed
best-of-three content create a different strategy. One behaviour per weapon is sufficient for the first fun test;
composable mechanics can be considered later if they add decisions rather than just combinations.

### Shotgun Farmers: your actions can arm your opponent

**Evidence:** its developer explains that missed shots grow weapons and that an opponent's sniper fire can provide
a sniper weapon for you. Weapons have recognisable vegetable identities.
[Official game page](https://www.shotgunfarmers.com/).

**Application:** Gunsmith's closest useful parallel is the reversal of ownership: creating a strong weapon is not the
same as receiving it. Test whether either spawn has a meaningful route to the desirable pickup, whether its arrival
creates a contest, and whether players understand that anyone may carry it. Do not adopt growing ammunition or remove
reload; those are different games' rules. The oddity concepts should convey behaviour as well as a joke.

### Noita: expressive combinations are compelling, but scope matters

**Evidence:** Nolla's description centres on player-created spells and a procedurally generated, physically simulated
world. It lists single-player play.
[Developer/publisher store description](https://store.steampowered.com/app/881100/Noita/).

**Application:** use this as an ambition for experimentation, not an engine specification. A JSON-driven weapon can
be visually bizarre while using a small implemented behaviour set. For later compound weapons, measure total child
projectiles, active lifetime and simultaneous effects across a match; individually capped fields do not establish a
safe combined workload. Single-player simulation freedom is not evidence that the same chaos will read fairly in 1v1.
Do not add pixel destruction, gravity or recursive spell programs to reproduce a screenshot.

### Due Process: generated geometry still needs design judgement

**Evidence:** the developer's store page explains that levels are procedurally assisted, edited by level designers
and distributed through updates; players plan before combat. These are not raw unreviewed maps created during matches.
[Developer/publisher description](https://store.steampowered.com/app/753650/Due_Process/).

**Application:** this does not validate an LLM-only arena pipeline. Start with a few understandable arenas and demand
that generated ones meet the same rules. Show stairs, connected routes and contested space clearly in the eventual
reveal. A reachability validator cannot replace human judgement about interesting duels; retain a small tested fallback
pool. There is no need for a separate planning UI in the current playable-core milestone.

### Heat Signature: build the systems before perfecting the generator

**Evidence:** Tom Francis describes difficulties controlling generated branching and separates layout generation from
placement of locks/keys. He cautions against tuning layout algorithms before the systems they support are fleshed out.
[Developer account](https://www.pentadact.com/2015-11-28-generating-locks-and-keys-in-heat-signatures-ships/).

**Application:** work in passes: arena topology and stair connections, traversability validation, then spawn/pickup
placement using reachable routes. Measure walking distance through stairs instead of straight-line distance across
height boundaries. Tune arenas against actual weapons and vision; a connected layout may still funnel both players
into a single hopeless stair approach. Do not port Heat Signature's generator or its locks/keys into Gunsmith.

### Visible properties beat an unexplained rating

**Evidence:** Francis argues for displaying properties through countable, directly observable elements, illustrating
weapons and systems in Heat Signature and FTL rather than relying on an abstract attack number.
[Developer essay](https://www.pentadact.com/2015-09-25-natural-numbers-in-game-design/).

**Application:** retain Gunsmith's power rating, but accompany it with a small observable demonstration: shot pattern,
range, reload and penetration. A duck-shaped projectile still needs an obvious bounce or impact motif. Avoid a visual
barrel count that appears to promise more damaging shots than the engine actually fires. Keep damage-critical cues
consistent while decorations vary. Test comprehension using silent clips before adding more effects or text.

## Visibility: two primary engineering references

**Evidence:** Amit Patel describes calculating visible regions and intersecting them with range shapes, including a
cone, and warns that his sample implementation has numerical-robustness limitations.
[Red Blob Games: 2D Visibility](https://www.redblobgames.com/articles/visibility/).

**Application:** conceptually separate occlusion from cone/range clipping and from decorative feathering. This is not a
mandate to copy that implementation. Add fixtures for cone edges, an occluding corner, a thin wall, aiming through the
angle wrap, and stair landings. Crouch extends distance without widening the cone or revealing through walls. Full
visibility is directional and height-dependent: do not assert A-sees-B implies B-sees-A. Symmetry can only be tested for
a separately defined geometric subproblem under matching assumptions.

**Evidence:** Riot's engineer describes withholding hidden enemy information, performance and late-reveal problems,
and restoring animation/effect state when actors become visible again.
[Riot: Demolishing Wallhacks](https://www.riotgames.com/en/news/demolishing-wallhacks-valorants-fog-war).

**Application:** test the disappearance and reappearance transitions, not just a still screenshot. A newly visible
opponent must have current pose, weapon and ongoing effects; a concealed one must leave no stale entity or cosmetic
trail that reveals their current position. Sound remains coarse direction-only under Gunsmith's contract. Riot's
tradeoffs do not authorise sending extra hidden positions here. Carry the local visibility cases into two-client
snapshot acceptance tests when multiplayer exists, including reload/fire effects crossing the visibility boundary.

## Generation: validity and enjoyment are different questions

**Evidence:** Smith, Whitehead and Mateas's Tanagra uses a player-movement model and geometry constraints to generate
playable 2D platformer levels while responding to design input. Its domain is platforming, not competitive shooters.
[Original AIIDE paper abstract, DOI 10.1609/aiide.v6i1.12379](https://ojs.aaai.org/index.php/AIIDE/article/view/12379).

**Application:** deterministic movement and reachability constraints belong outside the LLM's judgement. This supports
the existing propose/validate division, not adopting Tanagra's planner. Separately evaluate the accepted arenas for
route variety, first-contact time, cover readability, dominant perches and prompt identity. A high schema-pass rate
alone says little about duelling quality. Retain seeds and failed cases so a playtest failure becomes reproducible.

## User feedback after this research (2026-11-12)

This updates the hypotheses below without rewriting the source evidence:

1. Test weighting the highest-rated weapon towards contested central space. “Central” must respect fair walking
   routes through stairs; keep randomness and minimum spacing. No new weapon judge is implied.
2. Crouch already has its intended cost: **massively slower movement**, making the player a sitting duck. Evaluate
   the strength of that tradeoff rather than proposing an additional one before playing it.
3. Route fairness and ring escape belong to arena finalisation after player/AI definitions. Built-in arenas must
   pass the same checks and be carefully authored/playtested; they are the quality reference, not throwaway fallbacks.
4. **Corrected after the user's clarification:** the map remains dimly visible. The equipped weapon and stance define
   a cone rotating with aim through 360°; it reveals terrain detail and players/items within the unoccluded area.
   The test must cover terrain detail as well as dynamic visibility. This is not opaque darkness outside the cone.

## Five experiments for the next playable builds

These are hypotheses, not sourced balance facts. Use fixed fixtures first, introduce one variable at a time, and
record the seed, player/spawn assignment and a short observation after each round. About 10 short rounds per condition,
with sides swapped, is a cheap initial screen for obvious problems, not statistical proof of balance. No new analytics
service is needed.

| Experiment | Small setup | Observe | Decision it informs |
| --- | --- | --- | --- |
| **Crouch tradeoff** | Same flat arena and weapon; required longer crouch range plus substantial movement slowdown | Crouched time, vulnerability while repositioning, reasons to stand | Tune the intended speed/range tradeoff; do not add another penalty by assumption |
| **Shared weapon contest** | One clearly desirable custom weapon; test central placement weighting, replay seeds with player/spawn assignments swapped | Earliest arrival by valid walking route, first pickup, opportunities to deny or recover it | Placement fairness and whether sharing power creates interesting choices |
| **Stair pressure** | Two-level arena with a single stair connection, then a two-route variant | Ability to contest high ground, campers, successful flanks, confusion at either landing | Stair layout rules and whether height advantage is too absolute |
| **Ring with stairs** | Fixed ring centres and timings across both arena variants | Whether each player can reach safe space by a legal route before damage, deaths caused by blocked exits | Topology-aware centre selection or timing proposals; avoid Euclidean-only safety checks |
| **Comprehensible chaos** | Three contrasting fixture weapons, then swap their cosmetic oddity skins without changing gameplay | Can players identify behaviour and explain a loss; time to first sighting/hit/death and damage before the victim could respond | Which cues are mandatory and whether lethality plus fog leaves meaningful decisions |

A single unexpected loss does not establish unfairness; collect the input sequence and review what information the
player actually received. Treat recurring unexplained deaths or permanently dominant stances as reasons to revise a
fixture or test a rule change with the user. Do not silently normalise valid high-power weapons to force a win rate.

## Feed into later prompt/schema work, when the game needs it

- Preserve a clear separation between requested mechanics, visual identity and resolved generated values. When a prompt
  asks for unsupported gravity or glue, explain the supported interpretation instead of promising it through animation.
- Treat a named part or enum as a capability the renderer/engine must already implement. The visual proposal is a
  future data vocabulary, not runtime code. Revisit its complexity only after low-detail play proves the need.
- Compare terse and detailed prompts for the same intention using an eventual fake adapter, then the real pipeline.
  Record surprise caused by omitted defaults separately from exciting emergent interactions. This can inform the
  user's still-open choice between fixed modest defaults and AI-selected weaknesses; this research does not choose it.
- Use a corpus containing the six oddities, plain weapons, contradictory requests, maximum legal values and extreme
  visual clutter. Evaluate schema validity, recognisable identity, gameplay explanation and runtime workload separately.

## Handoff and limits

Priority: play the five experiments as their mechanics land; retain the useful cases as regression fixtures. Bring
multiplayer snapshot checks forward when networking arrives. Contracts and generator sophistication remain deferred
until there are actual consumers, consistent with the new game-first direction.

No comparable above combines all of Gunsmith's prompt generation, shared weapon pool, cone vision and multi-level
1v1 rules. No source establishes the right cone angle, range bonus, tick rate, ring schedule or power limits for this
game. Those require measurements and playtests. No games were purchased or installed, no real LLM calls were made,
and no copyrighted art or source code was copied.

Submission checks: all handoff links and nine source references recorded; whitespace review passed. `pnpm checks`
passed (lint, formatting, typecheck and 6 webapp unit tests; shared/acceptance have no unit tests). Browser acceptance
specs were not run for this documentation-only delivery.
