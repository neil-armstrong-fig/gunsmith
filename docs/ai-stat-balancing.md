# Weapon stat balancing

Owner: engine for rating/balancing, ai for preference extraction. Initial balancing is implemented; coefficients and interpretation still need calibration. This document retains research candidates, not a frozen solver specification.

## Decisions and recommendation

The user's 2026-11-14 design is that the model returns inferred stat values and
the player's preferences; deterministic code balances the result. The power
ceiling was chosen on 2026-11-16; human review on 2026-11-17 settled the
omitted-stat policy and clarified deliberate weakness:

- The power budget is a **ceiling**, not an equal-power target. Preserve a
  deliberately weak weapon rather than spending its unused budget.
- Following the requested comparison, on 2026-11-17 the user selected AI-chosen
  values and trade-offs for unspecified gameplay stats. Keep inferred choices
  distinct from explicit preferences; deterministic code enforces limits.
- The user clarified that deliberate weakness can be tactical: players may put
  bad weapons in the arena. "Feeble" requires overall weakness, not low damage
  specifically or weakness in every stat. Preserve unused power headroom.

**Recommendation (inference):** start the preference probe with semantic
directions per stat; compare ranked priorities and numeric weights on the same
requests. For balancing, favour the smallest deterministic adjustment that meets
an engine-owned rating budget while protecting requested strengths and
weaknesses. Calibrate the rating before choosing a numerical solver. Keep hard
caps as independent final checks. Do not treat a sum of unlike raw stats, or
damage per second alone, as a complete power budget.

### Current implementation

The AI draft has a name and six numeric gameplay stats. It parses preferences, clamps ranges and invokes the engine’s deterministic downward balancer and rating backstop. The engine weapon also has vision angle/range; generating these fields remains a separate consumer decision. See [schemas](schemas.md) and [pipeline](ai-pipeline.md).

The alternatives below describe research comparisons. Existing balancing is implementation evidence, not proof of calibrated gameplay or faithful preference interpretation.

## Evidence and its limits

**Evidence:** Ian Schreiber describes costing benefits relative to a common
resource, including interactions, and cautions that new-game cost curves need
iteration and playtesting. **Application:** use dimensionless, code-owned costs
as a candidate rating representation; the source supplies no Gunsmith weights.
[Game Balance Concepts, cost curves](https://gamebalanceconcepts.wordpress.com/).

**Evidence:** Gravina and Loiacono generate Unreal Tournament III weapons using
simulation metrics and separately study preserving an existing weapon through
minimal changes. Their 35-person user study identified an aiming difficulty
that bots did not expose. **Application:** retain weapon identity as a separate
objective and validate simulated results with people. Their evolutionary search,
maps, bots and numerical coefficients are not a ready-made runtime algorithm
for Gunsmith.
[Procedural Weapons Generation for Unreal Tournament III, sections VI and VIII](https://re.public.polimi.it/retrieve/e0c31c09-691d-4599-e053-1705fe0aef77/07377225.pdf).

**Evidence:** Riot combines game data, player sentiment and design judgement,
and explicitly avoids seeking perfect 50/50 results everywhere.
**Application:** the rating can enforce a spending rule without proving equal
win rates across arenas, ranges and player skills.
[How we balance VALORANT](https://playvalorant.com/en-us/news/dev/how-we-balance-valorant/).

**Evidence:** Anthropic recommends deterministic graders where possible and
human calibration where model grading is necessary. **Application:** code checks
budget compliance; human-labelled prompts check interpretation. Do not ask a
model to certify its own balance or add an uncalibrated judge.
[Demystifying evals for AI agents](https://www.anthropic.com/research/demystifying-evals-for-ai-agents).

## Preferences and omitted stats

The following are candidate representations, not public interface definitions.
In every candidate, retain the inferred values separately from preferences.
Record whether a preference is explicit or inferred so the selected AI-inference
policy does not conflate a player's instruction with a model's guess.

| Candidate | Expressiveness | Main risk | Probe judgement |
| --- | --- | --- | --- |
| Per-stat semantic direction: favour, sacrifice, unspecified | States both strengths and weaknesses; ties are natural | Does not express which of two favoured stats matters more | Recommended starting point |
| Ordered stat priorities plus semantic direction | Makes trade-off order explicit | Invents order when the prompt expresses a tie | Compare on genuinely ranked requests |
| Bounded numeric importance weights plus direction | Supports graded strength of preference | Model-invented precision and unstable weights | Adopt only if it improves interpretation over simpler choices |

Use gameplay meanings, not ambiguous raw-number labels: faster firing means a
**smaller** firing interval; faster reload means **fewer** seconds. A preference
for low damage is a requested weakness, not permission to compensate it with
unrequested maximum projectile speed or vision. Do not interpret "heavy" as a
supported movement penalty: carrying weight is not an engine field today.

### Paired policy examples

These are illustrative interpretations, not model results or numerical presets.
Both policies must respect explicit preferences and preserve intentional
weakness. The user selected AI-chosen values and trade-offs on 2026-11-17 after
reviewing the numerical pairs in the brief. Retain this comparison as context;
it does not establish equal power or approve presets.

| Request | Modest code defaults | AI-chosen weaknesses |
| --- | --- | --- |
| "A rifle" | Fill unspecified fields from an agreed modest baseline | Infer a coherent rifle with model-selected limitations; no explicit preference |
| "Hits hard but fires slowly" | Favour damage, sacrifice firing cadence; default other fields | Preserve that pair; infer additional limitations only in unspecified fields |
| "Fires as fast as allowed but barely hurts" | Favour cadence, sacrifice damage; default the rest | Same explicit pair; inferred magazine/reload weaknesses may vary |
| "100 damage, 20 shots a second" | Record both desired strengths; reduce what the budget cannot support | Same, with inferred sacrifices; never interpret the request as a budget override |
| "High damage; reload speed matters most" | Preserve stated ranking while filling other fields predictably | Same ranking; infer which unspecified fields can pay for it |
| "A deliberately feeble pistol with one spare round" | Preserve overall weakness and exactly one reserve round even if under budget | Infer individual limitations while preserving overall weakness and exactly one reserve round |
| "Fast firing and slow firing, equally important" | Mark the same-stat conflict for an explicit policy; do not invent a priority | Same conflict; a model guess is not a resolved user preference |

Code defaults improve repeatability and make omissions explainable, but may
flatten identities and still need adjustment when an explicit strength exceeds
the budget. AI-chosen weaknesses offer more variation but introduce another
interpretation to validate; sparse wording can produce unexpectedly poor
weapons. Judge both on prompt fidelity, usefulness, clarity at reveal and
variation in future generated examples and playtests; the policy choice itself
is now settled.

## Rating and adjustment candidates

| Approach | Benefit | Limitation | Recommendation |
| --- | --- | --- | --- |
| Existing DPS ceiling plus repair | Cheap, implemented comparison baseline | Ignores reloads, ammunition, projectile speed and vision; repair may change intent | Retain only as baseline during research |
| Allocate a normalized stat-cost budget by preferences | Simple and explainable; code can bound every allocation | Additive costs can miss interactions; spending the full budget erases requested weakness | Compare, with no automatic budget filling |
| Adjust inferred targets under a rating constraint | Can preserve identity and minimize changes while meeting the ceiling | Needs a calibrated rating, deterministic tie-breaking and careful handling of integer fields | Preferred design direction to test, not an implemented solver |

For the third candidate, express closeness in comparable benefit units rather
than raw seconds, damage and rounds. Protect requested weaknesses as well as
strengths. First leave a legal under-budget result alone. For an over-budget
result, consider sacrificing unprioritized benefits before preferred ones; when
preferences conflict with feasibility, expose that compromise rather than
claiming every request was fulfilled. Do not promise that all preferred values
can be achieved together. Malformed model output still requires schema handling;
it must not become arithmetic input merely because a balancer exists.

The rating study must examine:

- Burst damage and hit-count thresholds against the current 100-health fighters;
  equal DPS can still mean different opportunities to react.
- Actual firing intervals, reload downtime and finite magazine/reserve. Measure
  across a fixed horizon with a stated reload/input policy; do not assume manual
  reload happens instantly or add automatic reload to gameplay.
- Projectile travel and hit opportunity at several distances. Faster projectiles
  are not merely an interchangeable amount of damage.
- Vision angle/range together with stance, walls and height. Do not score through
  occlusion or turn a crouch benefit into a generated stat.
- Sensitivity to arena layout, weapon switching and skill. Keep these as
  calibration scenarios rather than running match searches for every generation.

### Measured cadence caveat

Read-only probe on 2026-11-16: call the existing
[pullTrigger](../engine/src/weapon/TriggerPull.ts) for 600 steps per weapon and
timestep, starting at zero cooldown, holding fire, passing 999 rounds and
`reloading: false`, and carrying the returned cooldown into each next call.
Record the first five shot ticks and the differences between them. These are
trigger-only measurements, not sustained weapon DPS, hit probability or a duel.

| Weapon | Nominal damage/interval | At 1/60 s steps | At 1/20 s steps |
| --- | --- | --- | --- |
| Current rifle: 25 damage, 0.2 s | 125/s | 13 ticks between shots; 115.38/s | 5 ticks; 100/s |
| Current marksman: 50 damage, 0.6 s | 83.33/s | 36 ticks; 83.33/s | 13 ticks; 76.92/s |

Repeated floating-point subtraction and the discrete trigger check affect
cadence. The webapp currently steps at 60 Hz; 20 Hz is a planned server scenario,
not a measured live server. These observations are a calibration warning, not
authority to change cooldown behaviour. A future rating must state its timestep
and distinguish nominal formulas from the behaviour actually played.

## Probe and verification handoff

**AI interpretation probe, not run:** after integration, the AI coding owner
compares the three preference encodings on the paired requests above and the
existing shotgun/fast-pistol cases. Add sparse, multilingual, explicit-ranking,
tied-ranking and instruction-injection variants only to investigate specific
interpretation risks. Human-label desired directions, explicitness and ordering
before seeing outputs. Freeze those labels for all arms; do not regenerate the
reference with the model under test. Use the same model/settings and three
independent trials per prompt/arm. Report each arm's all-trials correctness,
parse validity, unsupported/invented preferences, tokens, latency and repairs.
Small-sample rankings are provisional, not production reliability estimates.

The inferred stats and preference must each parse independently. Keep preference
extraction in the existing stats generation call; this research authorizes no
extra inference call beyond the agreed five-call integration ceiling. New cases
start as capability evals; graduate only after measured repeated success.
Paid trials require the existing authorization and cumulative spend accounting;
no ledger reset, higher ceiling or new judge is included here.

**Deterministic code tests, for the balancer owner:**

- Every result obeys individual caps, integer ammunition constraints and the
  agreed rating ceiling, including at boundaries and after rounding.
- Same input/configuration gives the same output; the input is not mutated.
- An already legal under-budget weak weapon remains unchanged. Rebalancing a
  balanced result is idempotent.
- With inferred stats, other preferences and budget fixed, promoting one benefit
  never worsens that benefit. Require strict improvement and a compensating
  sacrifice only in fixtures with budget pressure and an available trade-off.
  At caps or on integer plateaus, equality is legitimate. For interval/reload
  fields, improvement means a smaller raw number.
- Do not require exact budget equality: this is a ceiling, and integer values
  may leave headroom. Quantify any comparison tolerance without allowing a
  tolerance to authorize exceeding the budget.
- Handle all-favoured, all-sacrificed, absent and contradictory preferences,
  impossible budgets, non-finite values and unsupported fields explicitly.
  No silent weakening of the schema to accept them.
- Mutants that bypass the rating, reverse interval direction, ignore preferences,
  refill an intentionally weak weapon's budget or exceed caps after rounding
  must fail the tests that claim to cover those properties.

Keep property tests in the package owning the balancer. The engine already has the property-test dependency and `pnpm test:properties`; preserve reproducible seed/counterexample output.
Human playtests should swap weapon and spawn assignments across fixed seeds and
include open, occluded and height-separated engagements. Report perceived
identity and usability alongside wins; bot victories alone cannot prove fairness.

## Ownership and next decisions

AI owns inference/preference parsing; engine owns rating and balancing. Coordinate consumed contracts in [HANDOFF](../HANDOFF.md). Current balancing exists; calibration, preference-probe evidence and generated vision reconciliation remain unfinished. Approved omitted-stat policy and v1 labels do not establish model performance.

The reveal should explain final stats and material compromises. Do not create a second AI rating formula to bypass engine calibration. Research candidates here do not replace the current implementation or authorize numerical budget changes.
