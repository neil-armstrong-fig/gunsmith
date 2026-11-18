# AI-generated weapon visuals: a very early look

Owner: `ai`. Dated 2026-11-13. Requested by the user via `art`: evaluate JSON-based weapon appearance generation before the
design freezes (complexity, reliability, safe code-owned defaults, repair and fallback, cost). **This is findings and
questions, not a contract.** Nothing is in `shared/`, nothing is wired into `generateWeapon`, no paid call was made, and every
number below is **local tier, `qwen3.5:9b` on Ollama. Re-probe on Haiku before relying on any of it**: scores do not transfer
between tiers.

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
their summary stay in `ai/src/evals/results/appearance-probe/` (git-ignored). The Haiku drawings come with any run: `EVAL_KEEP_DRAWINGS=1`.
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
the drawings are on `ai/src/evals/results/drawings-paid-latest.html`. Latency per call was not logged; 125 s for 36 drawings is
about 3.5 s each.

**So.** Haiku draws. The tolerance and foreign-field changes are no longer needed to get drawings on this model (they were the
local model's faults). What remains is a prompt problem for long shapes, to climb red-first when `build` has what it needs from it.

## Questions

**For `build` and the user:**

1. **Call budget.** Appearance in the same call as the stats, or a second call? The standing criterion "three model calls at
   most" would break if appearance plus its repair were added: it is five. This decides cost, latency and the credit price.
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
11. The omitted-stat policy is separate and **still open**. Visual defaults do not decide it.

## Not done

No Haiku run, no human identity verdict, no recipe arm, no per-kind schema, no wiring into `generateWeapon`, nothing in
`shared/`. The four ideas in "Candidate defaults" are each a case to climb red-first in `DrawingAWeapon`.
