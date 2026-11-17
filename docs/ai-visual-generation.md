# AI-generated weapon visuals: a very early look

Current ownership: ai owns pipeline/generated renderer; engine owns rules/balancing; art reviews visuals. The five-call integration is merged; remaining tasks live in the root persona TODOs. Historical build references route through HANDOFF.md.

Owner: `ai`. Dated 2026-11-13. Requested by the user via `art`: evaluate JSON-based weapon appearance generation before the
design freezes (complexity, reliability, safe code-owned defaults, repair and fallback, cost). **This is findings and
questions, not a contract.** The original local probe and later Haiku results are preserved below; scores do not transfer
between tiers. Appearance remains local to `ai/`; **since 2026-11-15 `generateWeapon` runs it as a second stage** (see "Integration, 2026-11-15" below).

## AI session handoff (2026-11-15)

**Owner and boundary.** The AI coding session implements the integration described here, coordinating with `build` on
consumers and contracts. Codex supplies this documentation and review only. The user limits Codex's code-writing scope to
explicitly requested audio generation or art assets; do not interpret this handoff as permission for Codex to change AI,
engine, webapp or API code. No implementation, schema or configuration changed with this handoff.

**Agreed call budget.** The user chose separate stats and appearance generation, allowing **five calls maximum**:
moderation, stats generation, one stats repair, appearance generation and one appearance repair. A clean request uses
three calls. This settles the earlier combined-versus-separate question; it does not change the current code's three-call
weapon criterion, which the AI session must update as part of integration.

**Cost concern to resolve with measurements.** The user explicitly asked whether this balloons cost. Recorded Haiku runs
measured approximately $0.00036 for a created weapon's stats and $0.0007 for a drawing, giving a combined estimate of
**$0.00106 per weapon, or $1.06 per 1,000 weapons**: roughly three times stats alone. These are separate historical runs,
not an integrated measurement or a current provider-price check. They exclude unmeasured arena generation and future
sound fields. At that estimate, $1 buys roughly 940 weapons rather than 2,800 stats-only weapons. Five calls is the worst
case; the drawing's larger output drives most of the increase. Measure combined tokens, calls, cost and end-to-end latency
before relying on the estimate. No increase to budgets or credit prices is approved. Sources:
[measured weapon costs](cost-and-budget.md#measured-on-haiku-2026-11-14-the-weapon-evals-on-the-paid-tier) and
[appearance results](#haiku-55-on-the-same-request-set-2026-11-13).

### Recommended implementation for the AI session

These are implementation recommendations, not newly frozen shared contracts. Follow the root and `ai/` instructions and
record any cross-persona contract change in `HANDOFF.md` before implementing it.

- Keep `generateWeapon` as the entry point, running screening and the existing stats checks first. Generate appearance
  only after stats pass validation and rating; rejected or invalid weapons make no appearance calls.
- Inject a separate `appearanceGenerator` through `WeaponPipelineDependencies`, preserving each generator's model
  settings. Add the existing `AppearanceOutcome` to `WeaponOutcome`, present on every `created` result. Keep generated
  payloads `unknown` until parsed; do not merge visual fields into the gameplay-stat schema.
- Return stats and appearance together after sequential generation. Preserve the validated stats when drawing fails,
  returning the existing validated stand-in with its fallback disclosure. Appearance must never change gameplay stats.
- Keep one repair per stage. Count both stages in the outer `modelCalls`; distinguish appearance nodes with an
  `appearance.` prefix while preserving the nested appearance outcome's own path, usage and disclosure.
- Keep schemas, completion and fallback in `ai/` until a renderer is a second consumer. Coordinate migration with `build`
  then; do not create a shared schema or renderer ahead of that consumer.
- Keep paid models behind the same spend guard and log every call in the combined request. Fail evals clearly on provider
  errors, spend stops or truncated answers, rather than presenting these as ordinary rejected requests or stand-ins.
- Preserve the accepted drawing prompts and strict geometry policy unless a demonstrated failure requires a change.
  Stat balancing, sound, shields, the real `AiAdapter` and renderer implementation remain separate work.

### Acceptance and verification

Add the integration criteria first, watch them fail for the right reason, then implement and mutation-prove them. Require
every created weapon to include a validated appearance and truthful fallback disclosure. Cover clean creation, code
completion, stats repair, appearance repair, both repairs, fallback and rejected/invalid stats skipping appearance.
Check stage order, one repair per stage, unchanged gameplay stats and the five-call ceiling. Extend player-visible safety
checks to the drawing. Mutants that skip appearance, hide fallback, miscount calls, repeat repairs or draw after rejection
must fail the relevant checks.

Run root `pnpm checks` and the appropriate package eval commands (`pnpm --filter @gunsmith/ai evals:fake` and
`pnpm --filter @gunsmith/ai evals:local`). Report the fake tier's eight documented failures and local appearance capability
failures separately; do not weaken criteria to make them green. Follow the existing approval rules before paid validation,
and keep it within the cumulative allowance. Report combined cost and latency, and complete the folder/caller and
standards review. No model call is needed to deliver this documentation.

**Spend continuity.** Inspection on 2026-11-15 found approximately **$0.4674 spent of the $1 cumulative eval allowance** in
`.claude/worktrees/ai-hosting-proof/ai/evals/results/paid-spend-latest.json`. Main has no corresponding ledger. Before a
paid run from main, reconcile and preserve the latest cumulative total; do not let a missing ledger restart accounting at
zero or create independent allowances in two checkouts. The older $0.458 checkpoint below is historical. Do not read or
print provider secrets, raise the ceiling, or run a paid probe merely to verify this handoff.

## Integration, 2026-11-15 (done by the AI session)

Done as the handoff recommends: `generateWeapon` runs `generateAppearance` after `validate`, `balance` and `rate`
(`ai/src/pipeline/weapon-drawing/DrawCreatedWeapon.ts`), with its own `appearanceGenerator` model; `WeaponOutcome.appearance` is present
on every `created` and no other outcome; the drawing's nodes follow the stats' own with an `appearance.` prefix; `modelCalls` adds both
stages (five at most); the stand-in stays disclosed and the weapon untouched when a drawing cannot be made; the weapon criterion's three-call
budget became five. The drawing prompts and strict geometry are unchanged. Proved test first (the `generateWeapon` tests, the path and drawing evaluator tests, a "created and drawn" criterion) and by 25 mutants of which 24 were killed (the survivor, a drawing that
changes a stat, cannot be seen by an eval that has no second run to compare with; the unit test kills it). **Measured on Haiku 5.5: $0.00105
and a median 5.9 s per created weapon, $1.05 per 1,000, against the $1.06 estimate** (`docs/cost-and-budget.md`). On the fake and local tiers
the weapon specs draw with a canned valid drawing (interim, to keep the local run near 85 s); `DrawingAWeapon` still tests real local drawings.

## What was built (all in `ai/`, uncommitted until the user reviews it)

- `ai/src/pipeline/appearance/`: `generateAppearance(input, dependencies)`. The model generates a drawing, code's `check` **fixes** it
  (unwraps JSON-encoded fields, fills absent ones) and then **validates** it strictly, at most **one repair** puts the previous answer
  and the faults back to the model as data blocks, and then a **disclosed stand-in** (`fallback`). The outcome says which of
  `valid | completed | repaired | fallback` happened, so the reveal can say so. It never touches stats.
- The strict schema and checks follow `docs/art/visual-schema-proposal.md`: a 64 by 64 design space, five primitives
  (`circle | ellipse | rect | polygon | polyline`), colour roles, palette tokens, impact and animation presets, detail tiers.
  The limits are art's proposals, **not measured caps**: 24 body parts, 8 projectile parts, 32 points per part, 384 points in
  all, 12 KiB compact JSON, stroke 0 to 4, opacity 0.2 to 1, rotation within 180. Bounds are stroke-inclusive and rotation is
  about the part's own `x`,`y`.
- All six `simple-machinery-04` fixtures and the twelve oddity fixtures pass the validator (read live from `docs/art/`), and
  art's invalid probes plus mine fail with a named reason.
- The same reply pattern as `generateWeapon`: a loose reply schema that keeps types without limits, then strict validation by
  code. A bounded schema in `withStructuredOutput` throws on the first out-of-range number and the faulty answer never reaches
  repair, so on a throw the recorded raw tool-call arguments are used instead.
- Evals in the standard form: `AppearanceDsl`, a DSL of its own beside `WeaponSmithDsl`, `given(...)` with `({appearance}) =>` in `evals/tests/appearance/DrawingAWeapon.eval.ts`
  with twelve `when`s. 368 `ai` unit tests, mutation-proved (see "What was proved").

## What the probe found (72 trials, 3 per request and arm, temperature 0.7)

Requests: the six oddity prompts, plus sparse ("a gun"), omitted, conflicting, excessive-geometry, unsupported-mechanic and an
injection request. Two arms: **zero-shot** (the schema only) and **one example** in the prompt.

| arm | strict first answer valid | valid | completed | repaired | fell back | calls | output tokens | seconds |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| primitives, zero-shot | 0 of 36 | 0 | 2 | 1 | **33** | 1.9 | 2375 | 36 |
| primitives, one example | 1 of 36 | 1 | 3 | 6 | **26** | 1.9 | 1924 | 28 |

"Completed" means code filled absent fields and the result was then valid; "valid" means no help was needed at all. A drawing
the model made itself (valid, completed or repaired) was shown in **3 of 36** and **10 of 36** trials respectively.

**How the first answers failed, most common first:**

1. **Stroke overshoot past the canvas.** Parts reach 0.5 to 9 units outside the 64 by 64 space once the stroke is counted.
   By far the largest class, and most are slight (65 to 66.5). The model does not count the stroke.
2. **Other kinds' fields on every part.** A `rect` carrying `radius`, `radiusX`, `radiusY`, `points`; 61 occurrences of one
   such error in the one-example arm alone. A flat tool schema invites it.
3. **Cut off at the 3000-token cap.** 12 of the calls (every trial of the excessive request, and its repairs). Output cost is dominated by
   geometry the model over-writes.
4. **`body` written as text** (a string, sometimes JSON inside the string, sometimes over 24 characters) instead of an array.
5. A missing whole `appearance`, `impact.colour` not a known role, a polygon with too few points, an unknown palette token.

**What code could recover, measured offline on the stored first answers (nothing is applied in the pipeline):** removing
foreign fields from each part and tolerating up to 2 units of overshoot would make **6 of 34** (zero-shot) and **15 of 32**
(one example) refused first answers acceptable. Those two steps are policy changes (a limit loosened, a field silently
dropped), so they are `build` and `art`'s call, not mine.

**Cost.** About 3,400 to 3,700 input tokens and 1,900 to 2,400 output tokens per request including the repair, 28 to 36 s on
the local model. That is a second model call's worth of work, not a free add-on to the stats call (see question 1).

**Not measured:** whether the drawings are *recognisable* as the prompt. That is the user's and `art`'s judgement.
The local drawings were judged by the user from a contact sheet (none came close). The tooling that made it is deleted; the raw 72 trials and
their summary stay in `ai/evals/results/appearance-probe/` (git-ignored). The Haiku drawings come with any run: `EVAL_KEEP_DRAWINGS=1`.
The badges and counts on a page are proxies, never identity.

## The eval, on the local model

`DrawingAWeapon` over the real local tier (first run: 13 minutes for the whole run at 3 trials; now the appearance spec runs **1 trial** and the whole local run takes **5 minutes 10 seconds**, `EVAL_TRIALS=3` brings the repeats back): **36 of 36 standing criteria pass** (what is shown is always
valid and inside the canvas, a stand-in is never passed off as the model's own, the path is fixed within two calls) and
**0 of 17 own criteria pass**: "the model's own drawing is shown" fails in every oddity `when`, "the first drawing needs no
repair" in all six, and the 3,000-token budget fails on the excessive request. Those 17 are `capability` cases (hills to
climb, not regressions), so the run exits 1 unless `EVAL_GATE=regression`. The weapon suites still pass 70 of 70, so
`generateWeapon` is untouched.

## What was proved (mutation)

Deterministic checks and the pipeline were broken on purpose and the right tests fell: about 190 appearance mutants in three
rounds, 33 pipeline mutants (one equivalent survivor), 17 eval-level and 7 combined-defect mutants. Gaps found along the way
(projectile 8 not 7, a narrow fallback body, a polygon origin, repair truncation, repair versus first-answer errors) each got a
test and the mutant then died. The one mutant that cannot be proved is "the pipeline asks once, not once per trial", which only
matters when trials differ.

## Candidate defaults (proposals for build and art to change)

- **Always show something valid.** Absent or partial appearance is completed by code; an unusable one becomes the disclosed
  stand-in: a modest neutral body on a deterministic palette, flagged so the reveal can say "stand-in". The model never
  decides whether a stand-in is shown, and a stand-in never changes a stat.
- **A stricter model call, a looser reading.** Ask for the bound the schema holds (stay 2 units inside the edge) but accept a
  small overshoot in code, then clamp or refuse. Today the strict bound refuses.
- **Per-kind tool schema** (a union by `kind`) instead of one flat part with optional fields, to remove the foreign-field
  fault at its source rather than pruning it afterwards.
- **A smaller ask.** The probe's heavy failures are long geometry. A recipe arm (the model picks from a small semantic
  vocabulary and parameters, code supplies the geometry) was **not built**: the primitives arm was the first slice, the
  results above justify trying it, and it needs a vocabulary `art` agrees to first.

## The user's verdict, and what to try next (research, 2026-11-13, not yet tried)

The user looked at the contact sheet: **none of the generated drawings came close to the prompt.** That is the identity result
and it outranks every validity number above. Two causes are mixed together and the probe cannot separate them: a 9B local model
is weak at placing coordinates it cannot see, and a flat "write the whole JSON" ask makes it worse. Most trials never reached
a drawing worth judging, because they failed on format first. So "the model is too weak" is plausible but **unproven**.

Ordered by how cheaply each one answers "is it the model or the method?":

1. **A stronger model on the same probe** (Haiku 5.5 first). The cheapest test and the one that separates the two causes. Needs
   a capped key from the user (the $1 a day ceiling stays locked until then); about 72 trials is a few dollars at most, and the
   budget is to be agreed before any run.
2. **Render, look, revise.** Render the JSON to a PNG and show it to a vision model that critiques it, then repair against the
   critique instead of only against our validation sentences. Published work uses exactly this loop (a generate, review, refine
   cycle in IntroSVG and GVR-Coder; a vision critic plus candidate generators in "Sorted"), and the Playwright render path already
   exists in this repo. **It is the big check:** extra calls and image tokens, a vision-capable model (whether `qwen3.5:9b` takes
   images is `(unverified)`), and a call budget well past five. Do it only after 1 shows the method can work at all.
3. **Drawing tools instead of one JSON answer.** The model calls small tools (`add_rect`, `add_ellipse`, `add_polygon`, with
   named anchors such as `grip` and `muzzle`) and sees the result of each, as tldraw's agent and SketchAgent (a model drawing
   stroke by stroke on a numbered grid) do. One tool per kind removes the foreign-field fault by construction, and the code can
   clamp or refuse each part as it arrives. Cost: many short calls, so latency and the call budget. Whether tool-call drawing
   beats a single JSON answer for a small model is **not established by anything I found**: it has to be measured here.
4. **The recipe or kit arm.** The model picks parts and parameters from a vocabulary of art's authored pieces (barrel, lantern
   body, kettle spout, fax tray) and code supplies the geometry and the palette. It trades range for reliability and is the arm
   most likely to look right with a weak model, but it needs art's kit first, and prompts outside the kit will look like the kit.
5. **Fine-tune a small model for it.** Published results suggest a small open model trained for SVG can close much of the gap
   (the VectorGym authors report this for an 8B model, their own result), but it is a project of its own and out of scope now.

What I found is background, not evidence for this game: a general gap between small open and frontier models on text-to-SVG
(the SVGenius benchmark, 2025 models), render-and-critique loops in several 2026 papers, and tool-driven canvases in tldraw and
SketchAgent. I did not find a head-to-head of tool-call drawing against JSON output on a small model. Sources: arXiv 2603.09312
(IntroSVG), 2607.28073 (GVR-Coder), 2508.15222 (Sorted), 2411.17673 (SketchAgent), 2506.03139 (SVGenius), 2603.29852
(VectorGym), and tldraw.dev/docs/ai.

**Recommended order:** 1 (Haiku on the existing probe, once a capped key exists), then 3 or 4 on the local model for what is
cheap to measure, and 2 only if 1 shows a stronger model can draw and 3 or 4 do not. Recognisability is judged by the user on the
contact sheet each time; no proxy of mine stands in for it.

## Haiku 5.5 on the same request set (2026-11-13)

`claude-haiku-5-5`, the twelve `DrawingAWeapon` requests, three trials each (36 drawings), the user having looked at the first
twelve: "way better, already nearly usable". Haiku 5.5 refuses `temperature`, so none is set.

| | before the prompt fix | after |
| --- | --- | --- |
| first drawing valid, no repair | 3 of 36 | **33 of 36** |
| repaired | 33 | 1 |
| fell back to the stand-in | 0 | **2** |
| model calls per drawing | 1.92 | **1.08** |
| output tokens per drawing | 1,474 | **870** |
| whole 36-drawing run | 202 s | **125 s** |
| cost of the run (our estimate) | about $0.047 | about $0.026 |

**What the prompt fix was.** In the first run, **79 of the first answers' faults were one thing**: `detail` is `structural` or
`fine`, and the prompt said only "detail (structural)", so the model wrote other words. Naming both tiers
(`GenerationPrompt.test.ts` pins it) took first-answer validity from 3 to 33 of 36 and almost halved calls, cost and time. The lesson
for the other 8 percent: read the faults before tuning, and the biggest one may be a prompt gap.

**What is left.** One fax drawing reached 2.24 units above the canvas (the stroke overshoot, fixed by one repair). Both
fallbacks are the **jellyfish lantern**: its tentacles hang to y 89 to 106 on a 64 unit canvas, 25 to 40 units out, and the
repair brought them back only to y 92 to 97. That is the model not holding the canvas for a long thin shape, not a tolerance
problem, so accepting 2 units of overshoot would not help it. One trial in twelve requests is the real figure to carry forward;
the drawings are on `ai/evals/results/drawings-paid-latest.html`. Latency per call was not logged; 125 s for 36 drawings is
about 3.5 s each.

**So.** Haiku draws. The tolerance and foreign-field changes are no longer needed to get drawings on this model (they were the
local model's faults). What remains is a prompt problem for long shapes, to climb red-first when `build` has what it needs from it.

## The kit arm on Haiku 5.5 (2026-11-14, art's kit 05)

The model does not draw shapes: it picks parts from `art`'s 18-part kit and says where they join (code removed afterwards, see the note below; the
expander reproduces art's 12 hand-expanded drawings exactly, and refuses art's 9 faulty recipes). Same six oddity prompts plus five
more, 3 trials each, same day, same `validateAppearance` for both arms, $0.031 for the kit run and $0.027 for the shapes run.

| | shapes arm | kit arm |
| --- | --- | --- |
| valid first time / repaired / stand-in (of 36 and 33) | 32 / 2 / 2 | 12 / 5 / 16 |
| model calls per request | 1.11 | 1.64 |
| input tokens per request (prompt included) | 3020 | 5382 (about 3.3 thousand a call, a catalogue of 18 parts) |
| output tokens per request | 915 | 792 |

- **When it works it reads well**: teapot (round chamber, open handle, spout, lens), jellyfish (bell, lens, conduits), bubblegum
  mortar and a plain gun are clean, with the part names to check identity against. Identity is checkable as part ids (`partsUsed`).
- **The dominant fault is overflow, not choice.** All 21 first refusals are a part reaching past the right edge: the model chains `front`
  anchors and cannot see how far they add up (the catalogue's "reaches" numbers were not enough). Duck and fax never reach the canvas.
  After the repair, 7 of the 16 stand-ins are still overflow and **9 are the model echoing `instances` back as a text string**
  (the repair prompt shows the first recipe as JSON text), which the primitive arm's `fix/unwrap` would have read.
- **Local `qwen3.5:9b`: 0 of 11 drawn**, all stand-ins (overflow, an invented anchor on a part, an invalid palette word).
- **The user's verdict (2026-11-14): the shapes arm is "way better"; the kit arm is shelved for now.** The code was then removed at the user's request (note below). The ideas below were not tried.
- **Cheap next steps, red first (not pursued)**: name the instance that overflows in the repair sentence (today it says `body.4`, an expanded shape
  the model never wrote); let `fix` read `instances` out of text; tell the model the horizontal budget (the weapon spans x 4 to 60) and
  how far each part sticks out. Not done; the comparison above is the baseline.
- **Not claimed**: whether the kit's pictures read better than the shapes arm's is for a person to judge from
  the two contact sheets, which the user compared (the kit's page went with its code). Identity-by-part-id is a
  proxy and does not check pose or muzzle alignment. 3 trials per request is thin.

### How the kit arm worked (code removed 2026-11-14, at the user's request; rebuild from this)

`art`'s `docs/art/concepts/weapon-parts-kit-05/` stays the spec: `Parts.json` (18 parts: anchors, sizes, shapes), `Assembly.md` (the exact
expansion rules), `recipes/` and `assemblies/` (12 recipes and their expected drawings), `RejectedRecipes.json` (9 faulty recipes).

- **Reply the model writes:** `{version: 1, id, name, palette: {accent, secondary}, instances: [{id, part, parent, anchor, ownAnchor,
  size, orientation, mirror, colourRole}]}`, strict (zod); palette words blue, orange, violet, mint, yellow, pink; size small, standard,
  large (0.8, 1, 1.2); orientation 0, 90, 180, -90 (absolute, clockwise); ids `^[a-z0-9-]{1,32}$`; 1 to 12 instances (my cap, art warns
  against a universal one). A loose, all-optional twin of it is the function-calling schema, as for the shapes arm.
- **Reference rules** (need the catalogue; one sentence each naming the instance, listing what is valid): unknown part, duplicate id,
  parent not `frame` or an *earlier* instance (forward and self references), anchor missing on the parent's part (or the frame's), own
  anchor missing, size, turn or mirror not offered by the part. The kit's parts all offer the same choices, so a test needs a hand-made
  catalogue to prove those checks.
- **Expansion** (`Assembly.md` step 3 and 4): per instance in order, `a = s cos t`, `b = s sin t`, `c = -s sin t * m`, `d = s cos t * m`
  (m = -1 when mirrored: the mirror flips local y *before* the turn), translation chosen so the part's own anchor lands on the parent's
  anchor resolved through the parent's full transform (frame: identity and `frameAnchors`). A child's size and turn are absolute, not
  multiplied by the parent's. Use exact cos and sin for the four turns. Ellipse radii and strokes scale by `s`; radii swap on a quarter
  turn. `colourRole` replaces only an `accent` fill (`orange` resolved to `edge`). Round every coordinate to 6 decimals (and `+ 0` to
  drop -0).
- **Adapter** into the shapes arm's `Appearance`: palette words to `weapon-*`, art's `secondary` to `accent-secondary`, polygons and
  polylines get `x: 0, y: 0`, every part `opacity: 1, rotation: 0`, empty projectile, `spark` impact, `none` animation. Then the *same*
  `validateAppearance` judges both arms (bounds are checked there, with no tolerance).
- **Prompt:** instructions (canvas, the reply's fields and choices, "start with one big body part", "never invent a part, build the
  closest mechanical weapon"), a catalogue generated from `Parts.json` (id, label, anchors with offsets, how far the part reaches from
  its origin, no drawing), one worked example (a plain pistol, held to the same check in a test). About 3.3 thousand input tokens a call
  on Haiku. The repair is the same prompt plus `<previous>` and `<problems>` data blocks.
- **Eval:** the same six prompts as the shapes spec; criteria drawn by the model, no repair, plus a deterministic identity proxy (the
  part ids that carry the cue: `duck-head-beak`, `paper-tray`, `kettle-spout` and `open-handle`, `spine-comb`, `bell-shell`,
  `bubble-cluster`). The fake tier used a model that answered with art's recipe picked by keyword in the request. The route check needed
  the kit's nodes (`generate, expand, adapt, validate`, and a recipe can stop after `expand`).
- **Proof that paid off:** expanding art's 12 recipes and comparing with their `assemblies/` to six decimals, and the 9 faulty recipes,
  caught most mistakes; but art's recipes never turn a part 90 degrees, so turn and radius-swap needed their own unit tests (mutation
  found it).
- **Why it failed, so a rebuild starts there:** the model cannot add up how far chained parts stick out, so it overflows the canvas
  (21 of 21 first refusals); give it part widths it can add, or let code place parts on a grid, before trying again.

## The jellyfish lantern (2026-11-14, Haiku 5.5, shapes arm)

**Red first.** The existing jellyfish `when` (`the model's own drawing is shown`, `the first drawing needs no repair`) already fell, for the
right reason: every recorded error was `reaches outside the 64 by 64 space`, tentacle polylines 30 to 40 units past the bottom or right edge,
and the one repair moved them 1 to 10 units at most (`95 to 96`, `101 to 100`, `105 to 100`; in the scoped baseline run `97 to 91`, `105 to 95`).
Baseline across the two days: 3 stand-ins in 9 trials.

**One change.** The overflow sentence now says what the shape is and how to fix it:
`body.2 (polyline): reaches outside the 64 by 64 space (bottom edge 97); pull it in by 33 so its bottom edge, stroke included, is at most 64`
(`OutsideErrors`, with `EdgeOutside` returning the crossing as data; 15 of 15 mutants killed, the existing tests that quoted the old sentence moved to the new one
first and fell for the wording only). Nothing clips, prunes or scales: the model still has to redraw it.

**Result.** 31 jellyfish trials after the change (3, 8 and 20): 29 valid first time, 2 repaired (both a 0.5 unit overshoot of one ellipse), **0 stand-ins**. The
full set at 3 trials: 35 of 36 valid first time, the disco cactus repaired once, no stand-ins (was 32 / 2 / 2); `$0.025`.

**What this does not prove (read before crediting the sentence).** The first draft's prompt did not change, and the first-draft overflow rate moved anyway
(5 of 9 the day before, 1 of 3 earlier the same day, 2 of 31 afterwards, both tiny), so most of the improvement is the model, not the sentence. A controlled
repair-only test (a fixed jellyfish draft with the tentacles 30 to 40 units over, 8 repairs per sentence, same hour) gave **7 of 8 repaired with the old sentence and
8 of 8 with the new one**, the old arm's miss being one unit over: not a difference to claim. The sentence is kept because it is cheap, tested and says what the
model needs; it is **unproven**. To prove it, replay real failing first drafts (the outcome does not keep the draft, only its errors) through both sentences. The
prompt line about long shapes was **not** added: no eval shows the model failing without it.

## Questions

**For `build` and the user:**

1. **Call budget, answered 2026-11-15.** Separate stats and appearance calls, five maximum. See the dated handoff above
   for the user's cost concern and the implementation recommendations; no credit-price change is approved.
2. **Where completion and fallback live.** `ai/` now (one package uses them), `engine/` or `shared/` only once a second package
   imports them. The renderer will need the stand-in drawn the same way.
3. **The tolerance policy.** May code prune foreign fields and accept up to 2 units of overshoot (then clamp), or must the
   answer be exact? This turns many fallbacks into drawings.
4. **The shield behaviour** `ai` still waits on from `build` (separate, still open).
5. Which renderer proof to start with (art suggests lantern, fax, kettle) so recognisability can be judged on screen.

**For `art`:**

6. Are the limits right? 24 parts is far more than the model writes (2 to 4 on average); the budget that matters is tokens, not
   parts. Is **8 to 12 parts** a better ask?
7. Anchors (grip, muzzle) and the palette roles: the model has to be told them in the prompt, and every added field was another
   way to fail.
8. Is a **recipe vocabulary** worth drafting? What are the 10 or so shapes a weapon is made from?

**For the user:**

9. Answered 2026-11-13: you looked at the contact sheet and none of the drawings came close (see "what to try next"). Look again after the next pass.
10. A Haiku re-probe needs a capped key. The $1 a day ceiling stays locked until you provide one.
11. The omitted-stat policy is separate: the user approved AI-chosen unspecified values/trade-offs on 2026-11-17 in the [preference brief](ai-stat-preference-probe.md). Visual defaults do not decide it; probes/calibration remain open.

## Not done (original local-probe checkpoint)

Historical status at the first probe; the later Haiku results and dated handoff above supersede this list.

No Haiku run, no human identity verdict, no recipe arm, no per-kind schema, no wiring into `generateWeapon`, nothing in
`shared/`. The four ideas in "Candidate defaults" are each a case to climb red-first in `DrawingAWeapon`.
