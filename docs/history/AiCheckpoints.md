## Earlier checkpoint (2026-11-14 night, after the jellyfish lantern)

**State.** Main is merged into the worktree (fast-forward to `ceb5063`; `build`'s uncommitted `SolidTilesOf` refactor in main's tree is not in it). **Jellyfish lantern, done red
first.** Baseline: 3 stand-ins in 9 trials, all `reaches outside the 64 by 64 space`, the repair moving tentacles 1 to 10 units. One change: `OutsideErrors` now writes
`body.2 (polyline): reaches outside the 64 by 64 space (bottom edge 97); pull it in by 33 so its bottom edge, stroke included, is at most 64` (`EdgeOutside` returns an
`EdgeCrossing` in `edge/types/`; tests moved to the new sentence first and fell for the wording; 15 of 15 mutants killed). **After: 0 stand-ins in 31 jellyfish trials, and 35 of 36
valid first time over the whole set (the disco cactus repaired once, so "the first drawing needs no repair" still falls for it, pass^k). Not proven to be the sentence:** the first-draft prompt is unchanged and its
overflow rate moved anyway; a repair-only A/B on a fixed bad draft gave 7 of 8 (old) against 8 of 8 (new). The generation-prompt line about long shapes was not added (no eval fails without it).
Details and the way to prove it (replay real failing drafts; outcomes keep only the errors, not the draft) are in `docs/ai-visual-generation.md`, "The jellyfish lantern".
`pnpm checks` exit 0 at the root (engine 630, `ai` 421, webapp 160); `evals:fake` shows exactly the 8 by-design failures; `evals:local` not re-run (nothing it covers changed).
Spend **$0.458 of the $1** (the sheet `ai/evals/results/drawings-paid-latest.html` is regenerated, git-ignored). All **uncommitted for the user's review**; the user judges the sheet.

**The user looked at the sheet (2026-11-14, night): "it all looks really good". The appearance drawing work is accepted; nothing more to climb on it.**

**Next turn, in this order:**
1. **Integrate appearance with `build`** (the user's earlier call: integrate first, tune from there). Follow the dated handoff above:
   separate calls, five maximum; measure combined cost and latency. Coordinate the schema's home with `build`
   (`shared/` once the webapp renderer imports it; not before). Wire `generateAppearance` beside `generateWeapon`
   (test first, evals first), keeping the disclosed stand-in visible to the player. The AI coding session owns implementation.
2. **The stat balancer** (the user's design, `O2` below): needs where it lives (probably `engine/`, with `ai/` using a local draft), the budget, the preference encoding, the no-preference default. Probe the model's preferences first.
3. Still waiting on the user and `build`: the shield behaviour, the omitted-stat policy, the real `StateGraph` and `AiAdapter` mapping.
4. Optional, only if the user wants the overflow sentence proven rather than kept on trust: keep the failing first draft in the outcome, replay real failing drafts through the old and new sentence (about $0.05).
Budget: the dated handoff above supersedes this checkpoint's **$0.458** figure; re-read the cumulative ledger before a paid run.
Ask before raising the ceiling. The existing weapon and appearance pipelines are merged into main through `11f7f45`;
integration remains unimplemented. Leave new work uncommitted for the user's review.

## Earlier checkpoint (2026-11-14, after the kit probe, which is removed)

**State.** Main is merged into the worktree (a fast-forward to `f456130`). **The kit-of-parts probe on `art`'s kit 05 was built, measured and then removed
at the user's request** ("no point keeping around bloat"); nothing of it is left in the tree except its note, `docs/ai-visual-generation.md` ("The kit arm
on Haiku 5.5" and "How the kit arm worked"), written so it can be rebuilt. **Result (Haiku 5.5, 3 trials, $0.031; spend $0.380 of the $1):** kit 12 valid / 5 repaired / 16
stand-ins of 33, shapes arm 32 / 2 / 2 of 36; 21 of 21 first refusals were overflow past the right edge; local model 0 of 11. **The user's verdict: the shapes arm is
"way better"; the kit is not going to work for now.** The only code change kept: the contact sheet shows input tokens as well as output tokens
(`DrawingsSheetHtml`). Everything else is as at the previous checkpoint (the weapon specs on Haiku). `pnpm checks` exit 0 (engine 570, `ai` 420, webapp 139);
`evals:fake` shows exactly the 8 by-design failures. All of it is **uncommitted for the user's review** (never commit `ai` code; the user has staged some of the doc
edits in VS Code, so touch only the working files and never the index).

**Was next (item 1 is done, see the checkpoint above):**
1. **Jellyfish lantern, red first** (the user's last open appearance item). Baseline = today's Haiku run, shapes arm, 3 trials: jellyfish **valid, stand-in, stand-in**
   (the disco cactus is repaired, valid, repaired; the other ten requests 3 of 3 valid): `ai/evals/results/drawings-paid-latest.html` (git-ignored; regenerate with
   `EVAL_TIER=paid EVAL_TRIALS=3 EVAL_KEEP_DRAWINGS=1 npx vitest run --config vitest.evals.config.ts evals/tests/appearance/DrawingAWeapon.eval.ts` from `ai/`).
   The fault: long thin tentacles run 25 to 40 units off the canvas and the one repair only half fixes them. First write the failing criterion (a `when` in
   `evals/tests/appearance/DrawingAWeapon.eval.ts`, or tighten the existing jellyfish one) and watch it fail for that reason; then try, one at a time: a prompt line
   about keeping long shapes inside the canvas (say how far a polyline may reach), naming the overflowing shape and the edge in the repair sentence (today
   `body.N`), and nothing that clips or prunes silently (art's rule: no silent clipping). Re-run on Haiku at 3 trials; the user judges the sheet. Budget: a run is about $0.03,
   **$0.380 of the $1 spent**, ask before raising the ceiling.
2. **Integrate appearance with `build`** once the user wants it: needs the call budget (about 1.1 calls per weapon, the same call as the stats or a second one) and where the
   schema lives (`shared/` once the renderer imports it). Do not move it before then.
3. Still waiting on the user and `build`: the stat balancer (needs where it lives, the budget, the preference encoding, the no-preference default; `TODO.md` blockers),
   the shield behaviour, the omitted-stat policy, the real `StateGraph` and `AiAdapter` mapping.

## Earlier checkpoint (2026-11-14, after merging main and the weapon evals going paid)

**State.** Main is merged into the worktree (`b276c64`, the one commit I made; conflicts only in `HANDOFF.md`, `TODO.md`, `TODO-art.md`,
resolved keeping both sides, `TODO-art.md` taken from main). Root `pnpm checks` exits 0 after the merge (engine 516, `ai` 394, webapp 127);
`evals:fake` shows exactly the 8 by-design failures; `evals:local` passes the weapon suites 70 of 70 and fails 13 appearance criteria on
the local model (the known state). **Everything after the merge is UNCOMMITTED for the user's review** (never commit `ai` code).

**Done this session: the weapon specs run on the paid tier** (`TODO-ai.md` "Next" #3 below, ticked). Test first, 25 new unit tests (`ai` 419),
18 mutants of the new code all killed. `tier/paid/key/LoadAnthropicKey` (the key loader, shared with appearance), `tier/paid/PaidModel`,
`weapon/models/PaidWeaponModels` (Haiku 5.5 for the generator and the moderator, both carrying the **one** `paidSpendGuard()`, `maxTokens` 2000),
`weapon/paid/RunPaidWeapon` (checks room first, then **fails the run in words** when a paid call errored or an answer stopped at `max_tokens`,
because the pipeline swallows both and they read as a bad weapon or a rejection; logs each request's calls to
`evals/results/paid-weapon-calls-latest.jsonl`, git-ignored, appends). `SpendGuard` now also records each call (`takeCalls`: tokens, stop
reason) and keeps a mid-request ceiling stop as a failure.
**Results (Haiku 5.5, weapon suites): 70 of 70 in a 1-trial smoke run and again in the 3-trial baseline**; 101 calls, all `tool_use`, none
cut off; $0.018 for the baseline; a created weapon costs about **$0.00036** measured (half the estimate; the draft weapon is only a name
and six numbers), median 2.7 s (`docs/cost-and-budget.md`). **Spend: $0.322 of the $1 total ceiling.**
**Prompt ablations on Haiku at 3 trials (`docs/ai-pipeline.md`).** First pass, all six survived 70 of 70, because nothing on Haiku
depended on the repair (the attack specs accept `invalid` as readily as `created`). **The user agreed to a criterion (2026-11-14), added
to the "maximum of everything" `when` in `evals/tests/weapon/TryingToBreakTheSmith.eval.ts`: a request for 100 damage and 20 a second
still ends `created`, inside the cap** (`when.capability`: reported always, only warned about under `EVAL_GATE=regression`). Green on all
three tiers. Re-run on Haiku: **repair skipped falls exactly that criterion** (the eval can fail); **dropping the `<previous>` block, the
"change as little" sentence, or both still passes 71 of 71** (the local model needed them). One case, three trials: thin, and the
balancer below will take over fixing stats, so nothing was dropped. Moderation's "say no" list and data-block paragraph, removed one at a
time, change no verdict on the current cases (kept as defence in depth). Spend now **$0.322 of the $1**.

**The user's balancing design is in O2 below** (the AI returns inferred stats plus a stat preference, code balances; four evals listed,
none satisfiable by maxing every stat; a line for `build` is in the `TODO.md` blockers). Its open questions (where it lives, the budget,
how a preference is encoded, the no-preference default) are the user's and `build`'s.

**Waiting on the user:** what to do next: **the kit-of-parts selection probe** (art is waiting, kit 05 is approved), the jellyfish lantern,
the balancer (needs the open questions settled; probe the model's preferences first), or integrating appearance with `build`.
**Next, in order:** the kit probe; the jellyfish lantern; integrate appearance with `build`; the real `StateGraph` and `AiAdapter` mapping; the
shield behaviour `build` owes; the omitted-stat policy (the user's). The older list below still applies after its item 3.

## Earlier checkpoint (2026-11-14, before the merge and the paid weapon tier)

**State.** Everything below is in the worktree `.claude/worktrees/ai-hosting-proof`, **uncommitted for the user's review** (the user
commits `ai/`; never commit it). `pnpm --filter @gunsmith/ai checks` exit 0: **394 unit tests in 59 files**. Run `git merge main` in
the worktree first when you next work there. Read `ai/AGENTS.md` (the layout and the evals sections are current) and
`docs/ai-visual-generation.md` (the findings) before anything else.

**What was done.**
- **Weapon visuals, a very early look (the user's 2026-11-13 request): done and judged.** `ai/src/pipeline/appearance/`:
  `generateAppearance` runs `generate` (`drafting/`), then `check/` (`fix/` unwraps text-encoded fields and fills what is left out,
  then `validate/` holds it to schema, budgets and bounds), at most one `repair`, then a disclosed `fallback` stand-in. Nodes read
  `generate, fix, validate, repair, fix, validate, fallback`. Folders mirror the weapon's (`weapon-drafting/`, `check/`). **Not wired
  into `generateWeapon`**, nothing in `shared/`.
- **Results.** Local `qwen3.5:9b`: 59 of 72 fell back, the user judged none close. **Haiku 5.5: "way better, already nearly usable"**:
  36 drawings, 33 valid first time after one prompt fix (the `detail` tiers), 2 stand-ins (both the jellyfish lantern, long tentacles
  run 25 to 40 units off the canvas), 1.08 calls and about $0.0007 each.
- **Paid tier for the appearance spec.** `@langchain/anthropic` 1.6.0 (new, pinned in the catalog; the user approved). Key in
  `ai/.env.local` (the user's; never read it, the code loads it). A spend ledger `evals/results/paid-spend-latest.json` caps **all paid
  runs at $1 total** (ask before raising); about **$0.116 spent**. Haiku 5.5 refuses `temperature`. Weapon specs still throw on the paid tier.
- **Evals refactor.** `AppearanceDsl` is its own DSL beside `WeaponSmithDsl`; **a `when` takes the DSL it uses** (`({weaponSmith}) =>` or
  `({appearance}) =>`), which decides its standing criteria (a `when` taking neither fails at load). Specs are `evals/tests/weapon/` and
  `evals/tests/appearance/` (an `arena/` comes later). The mapping is grouped by subject: `weapon/`, `appearance/`, `tier/`, with `fixtures/`,
  `gate/`, `reporting/`. The appearance spec runs **1 trial** locally by default (`EVAL_TRIALS=3` for more); the whole local run is
  about 5 minutes. `EVAL_KEEP_DRAWINGS=1` writes `evals/results/drawings-<tier>-latest.html` to look at.
- `generateWeapon` untouched; the weapon suites passed 70 of 70 locally. The fake tier shows **8 failures by design** (its moderator always
  says yes, so the rejection cases fail). **Decided by the user 2026-11-14: leave them**; a fake tier that stays red is a free check that
  the harness can still fail.

**How to run.** `pnpm --filter @gunsmith/ai checks`; `pnpm evals:fake`; `pnpm evals:local`; Haiku appearance:
`EVAL_TIER=paid npx vitest run --config vitest.evals.config.ts evals/tests/appearance` (add `EVAL_TRIALS=3 EVAL_KEEP_DRAWINGS=1`).
Mutation scripts are in the old session's scratchpad (gone); rebuild per `AGENTS.md` (one replacement, `grep`, restore, `cmp`).

**Next, in order.**
1. **Integrate with `build`** (the user's decision: integrate first, tune from there). Needs: the call budget (about one extra call per weapon,
   1.08 on average; same call as the stats or a second one, the user and `build` decide) and the schema's home (it moves to `shared/` once
   the webapp renderer imports it). Do not move it before then.
2. **Jellyfish lantern, red first (now item 1 of the top checkpoint):** long thin shapes (tentacles) run off the canvas and the repair only half fixes them. A prompt line
   or a case in `evals/tests/appearance/DrawingAWeapon.eval.ts`; the last Haiku run is the baseline.
3. ~~**Weapon on the paid tier** and a small Haiku weapon run, within the $1.~~ **Done 2026-11-14** (see the checkpoint above).
4. ~~**`art`'s kit of parts**: probe whether a model can pick parts and parameters from it.~~ **Done and removed 2026-11-14** (see the checkpoint at the top; the user shelved it).
5. Still open from before: the real `StateGraph` and `AiAdapter` mapping; the shield behaviour `build` owes; the omitted-stat policy (the user's).
6. Smaller: consider a 3-trial Haiku baseline before any prompt change. (The fake tier's 8 rejection failures stay: the user's call.)

## Earlier checkpoint (2026-11-13, after the eval refactor was committed)

**State.** O1 is closed, the eval harness is built, and the **moderation node is built, probed and committed** by the user on the
branch `worktree-ai-hosting-proof` (worktree `.claude/worktrees/ai-hosting-proof`): `02f0885` "Add moderation prompt / evals", then
`3abc33a` merging main (`678000c`, the zustand HUD; I resolved `pnpm-workspace.yaml` by keeping the one `zod` and adding
`zustand`, took main's lockfile and ran `pnpm install` to re-add `ai`). Tree clean at that commit. **Merged into main on 2026-11-12 by `build`** (`8c52f5f`, a merge of the branch's committed work; conflicts only
in `pnpm-workspace.yaml`, both sides kept, and the lockfile, taken from main and completed with `pnpm install`; root `pnpm checks`
exit 0 with `ai` 67, `engine` 324, `webapp` 82). The worktree's uncommitted edits were left alone. **Next time you work in the worktree,
run `git merge main` there first**: main now has the opponent bot, the health HUD and a `Bullet.shooter` field (`engine/`
changed; `ai/` imports `@gunsmith/engine`, so re-run `pnpm checks` and `pnpm evals:local`). This file and the other docs I edit
(`TODO.md`, `HANDOFF.md`) live as edits in the **main checkout**.
**Verified at `3abc33a`:** root `pnpm checks` exits 0 (`ai` 67 unit tests, `engine` 193, `webapp` 62); `pnpm evals:local` is
**21 of 21 strict**; the fake tier is 17 of 21 by design (its moderator always says yes, so the four cases that need a "no" fail).

**This session's work (loop 2), in the worktree and UNCOMMITTED for the user's review; main's `ai/` is still the older committed
state, byte-identical to the worktree's base `3abc33a`, so these edits apply cleanly on top of it.** The weapon pipeline is now
real end to end: `precheck`, `moderation`, `generate`, `validate` (zod only), `rate` (the one damage-per-second cap, 150, refuses and
never clamps), then at most one `repair` that is shown its first answer and the faults, then `validate` and `rate` again. A new
outcome status `invalid` means a weapon request that produced no valid weapon even after the repair. The draft weapon schema is
`name` plus the six numbers `engine/`'s `Weapon` plays with (`src/pipeline/weapon/`, limits in `WEAPON_LIMITS`), local to `ai/`.
Layout: `generate/`, `validate/`, `rate/`, `repair/`, `check/`, and shared `ask/` (the one model call, its loose reply schema
under `ask/reply/`), `blocks/` and `request/` (data blocks), `invalid/`. Evaluators moved to the new shape and `invalid`;
`nodePath` now fails a "created" weapon that was not validated and rated. **Verified:** `pnpm --filter @gunsmith/ai checks` exit 0
(134 unit tests, was 67); root `pnpm checks` exit 0 in the worktree (engine 193, webapp 62: the worktree's stale base, not main's
324 and 82); `pnpm evals:local` **21 of 21 strict**, also under `EVAL_GATE=regression`; `evals:fake` 17 of 21 by design.
**Red first:** with `generate` wired and nothing after it, 4 cases fell for the right reasons (stat override 2000 damage a
second; a pasted 56-character name; the reflective shield 200 a second; the bare shield 0 damage); the first attempt fell 12 of 21
for a wrong reason (an untyped reply schema made the model write numbers as text), which is why the reply shape keeps its types.
**Mutation:** 36 of 37 unit-test mutants killed by the right tests; two real test gaps (name pattern, name minimum) found and
fixed; one survivor, the repair prompt's sentence naming its two blocks, which no test or case steers. Eval-level: dropping
validate and rate falls 4 cases, dropping repair falls the 2 shield cases, and removing the first answer or the "change as little
as you can" sentence alone falls none (either is enough on `qwen3.5:9b`; both removed reproduces the original red). The `rate` tests
were written with the code, so they were proved by mutation, not watched red first. Findings are in `docs/ai-pipeline.md`
("What building generate, validate, rate and repair taught") and `ai/AGENTS.md`.

**The evals were restructured in the acceptance-test style (the user's request, two passes; uncommitted in the worktree).** A table
of 21 case rows scored by 7 generic evaluators in a loop became five test files in `evals/tests/` (`AskingForAWeapon`,
`TryingToBreakTheSmith`, `ShieldsAndArmour`, `NotAWeaponRequest`, `AnUnusableRequest`), each `given` / `when` / `thenExpect`, one
criterion per `thenExpect`. **Pass 2 (the user's foldering review): the root is now `tests | dsl | eval-criteria-mapping`, like
`acceptance-tests/`**, imports run only down, and lint enforces three layers. The user asked whether the order is `dsl → evaluators →
drivers` and whether drivers belong in the mapping: evaluators and the driver are *siblings* under the DSL (it checks with the
first, acts through the second), and the driver belongs to the mapping's setup. So: `dsl/` holds `WeaponSmithDsl`, `evaluators/`,
`trials/` and `types/` (including the driver *interface* the DSL owns, with no `tier`);
`eval-criteria-mapping/` holds `tier/` (the model tier, the trials and the real driver; the only place a model is built), `gate/`,
`reporting/` and `types/`. The DSL's tests therefore never need a model, and the mapping never reaches past the DSL to a checker.
Cleanups in the same pass: the fake tier has its own canned reply instead of importing a DSL test fixture; `EvalInputBuilder.ts`
(exporting `evalInput`) became `PassingEvalInput.ts` exporting `passingEvalInput`; the loose `evals/types/` folder was rehomed.
**Tests are now clean (also pass 2):** what holds for every request moved into the DSL as **standing criteria**
(`weaponSmith.standingCriteria()`: safe to show; the fixed path within three model calls), which the mapping adds under every
`when`, so a test states only what is special to its request and the tighter budgets stay explicit (`expectModelCallsAtMost(0|1)`).
Reversible in one line (`registerStandingCriteria` in the mapping). The count is **70** criteria, up from 64, for a reason, not
lost coverage: 28 written in the tests plus 2 standing criteria under each of 21 `when`s; the six rejected `when`s now also report
the standing "within three model calls" beside their tighter budget.
**Defaults I chose:** the request is asked once in a `beforeAll` (a model call costs time and money) and every criterion must hold
in all trials (pass^k); `when.capability(...)` carries the tag; one results file per test file
(`evals/results/<Test>-<tier>-latest.json`, generated output, git-ignored); the tree reporter prints given / when / then with a
failing criterion's sentence under it; the fixture is `weaponSmith` (the user's rename).
**Verified (after both passes):** `pnpm --filter @gunsmith/ai checks` exit 0 (152 unit tests after pass 3; the gate, the summary, the driver and the pure evaluators are
test-first; the DSL and `WeaponSmithPipeline` have no unit tests of their own, the evals are their test); `pnpm evals:local` **70 of 70**; `evals:fake` 62 of 70, the
8 failures being the 4 `when`s that need a real "no" (its moderator always says yes); root `pnpm checks` exit 0 after pass 1. The
local run took 237 s once, against 85 s earlier (the model was probably cold after a long mutation session; not investigated).
**Proved it can fail, on the moved and slimmed tree:** draft unchecked sinks the same four `when`s (stat override, instructions-as-name,
both shields), now naming the standing criterion; repair skipped sinks both shields; moderation fail-open sinks the 4 rejected `when`s;
a mapping that swallows a failure leaves the fake tier green where it should be red, one that never gates a capability criterion cuts
the failures from 8 to 2, and one that stops adding the standing criteria cuts the run from 70 criteria to 28; 12 forbidden imports
and "ask inside a thenExpect" are each reported by lint (an allowed import is not); 68 of 69 unit-level mutants are killed, the only
survivor being the repair prompt's wording sentence. Harness gotchas (in `ai/AGENTS.md`): a module exporting `then` is a thenable
(so it is `thenExpect`), `ls.test` works only directly under its own `ls.describe` (so `given` is a native `describe` and each
`when` an `ls.describe`), the default 10 s hook timeout silently skips every criterion under a slow `beforeAll` (now 180 s), and test
files run one at a time. Known gaps: LangSmith traces of the model calls are not attached to a criterion, because the calls run in the
`beforeAll` (tracking is off by default; revisit with the first `EVAL_TRACK=1` baseline), and `ls.test` appends a `test_id=` to each
name in the report, which cannot go without dropping the LangSmith wrapper.

**Committed by the user on 2026-11-13:** `4cc580a` "Cleanup evals to match acceptance test style" (on `e1dffc0` "Add weapon json generating
prompt"), so the worktree `.claude/worktrees/ai-hosting-proof` was clean after pass 4 and the pipeline, the evals and the refactors below
are all in that branch; **not yet merged into main** (main's `ai/` is still the older state) and the branch is not yet merged *from* main.
**Pass 4 (the user's last requests, committed above):** (a) the DSL and `WeaponSmithPipeline` have **no unit tests of their own** (the
evals are their test); tests stay only for pure helpers (the evaluators, `combineTrials`, `DslError`, the mapping's gate, summary and
driver), so `ai` has **152** unit tests, down from 193, and `ScriptedDriver` went with them. (b) The evaluators' test helpers moved to
`dsl/pipeline/evaluators/testing/` (`weapon/PassingWeapon`, `input/PassingEvalInput`, `input/types/EvalInputOverrides`); it holds test-only
code, hence the name. (c) The evaluators are grouped by what they read: `outcome/` (OutcomeMatches, NodePath, ModelCallBudget), `weapon/`
(SchemaValid, WithinCaps, NameHygiene) and `player-visible/` (NoPromptLeak, a one-file folder on purpose; fold into `weapon/` if the user
dislikes that). **Verified after it:** `pnpm checks` exit 0 in `ai` (152 tests, lint and Prettier clean) and `pnpm evals:local` **70 of 70**
(83 s); `evals:fake` was not re-run (only paths changed). The scratchpad mutation scripts are gone with the session, so the
84-of-85 unit-mutant figure belongs to the earlier tree; the eval-level mutants (draft unchecked, skip repair, fail-open moderation,
swallowed failure, never-gated capability, dropped standing criteria) carry the DSL and pipeline now and are worth one re-run
after the next change to them.

**Pass 3 (the user's request): the DSL is a thin wrapper, over one lower-level class.** Like `GunsmithDsl` over `GunsmithPlaywright` in
`acceptance-tests/`, `WeaponSmithDsl` holds only `try` / `catch` around a call below it and rethrows a `DslError` (`dsl/errors/`) that
names what was attempted, so a failed criterion reads `Expected a weapon to be created: outcomeMatches: failed in 1 of 3 trials:
expected created, got invalid`. The user then found the first cut spaghetti (an `Answers` class handed to a `Checks` class, wired
by the DSL) and asked what the Playwright of an eval is. **Answer: the system under test is the weapon smith's pipeline (LangChain /
LangGraph), so the layer is `dsl → pipeline`**: `dsl/pipeline/WeaponSmithPipeline` asks the pipeline through the driver, holds the
answers and runs the evaluators over them in every trial, throwing one sentence per failed check and catching nothing, as a
`*Playwright` throws from its `expect.poll` conditions; the evaluators are not a second layer but its helpers, beneath it
(`pipeline/evaluators/`, `trials/`, `types/`). LangChain is below it, behind the driver interface the DSL owns (the mapping supplies
the real driver, as fixtures supply the `Page`), so DSL tests never need a model. Lint holds the line: a `*Dsl` may not loop, filter or
fold, or import an evaluator; `pipeline/` may not import `DslError` or look up at the DSL; the mapping may not reach below the DSL.
**Verified:** `pnpm --filter @gunsmith/ai checks` exit 0 with **152** unit tests (the DSL and pipeline's own tests were dropped at the user's request: the evals prove them, so the 84-of-85 unit mutants below predate that and the eval-level mutants now carry the DSL and pipeline); root `pnpm checks` exit 0; `pnpm evals:local`
**70 of 70** (88 s); `evals:fake` 62 of 70 (the same 8 expected failures). **Proved it can fail:** 84 of 85 unit-level mutants are
killed (every check, the answers' replacement, `DslError`, and every DSL wrapper losing its intention; the only survivor is the repair
prompt's wording sentence), the draft-unchecked mutant sinks the same six criteria, and each lint rule fires on a throwaway file
while an allowed import does not.

**What is real:** the proofs (one-node graph in workerd, `langgraph dev`, Studio on the EU account, trace flush needs
`ctx.waitUntil`), the `ai/` package fitted to `engine/`'s conventions, the eval harness (now **acceptance-test style**, see
the paragraphs above: 21 `when`s in 5 test files, 7 deterministic evaluators behind a DSL, 3 model tiers, trials, a regression-only gate), the token pre-check, the
**moderation node** and now **generate, validate, rate and repair** (above). **What is still a draft:** the weapon schema and the
cap (`build`'s engine power rating replaces the cap), no `sound` block, no visual block, no shield behaviour, the pipeline is a
function and not yet a LangGraph `StateGraph`, and nothing has run on a paid model.

**Moderation rulings and findings.** The user ruled: no standalone shields or armour, but a weapon may itself be a directional
shield that reflects bullets (so a shield is accepted as a weapon, worn armour rejected). Loop 1b: 46 borderline probes found one
real failure (weapon keywords round an off-topic ask), now a case plus one prompt sentence. The "say no" rule and the data-block
paragraph change no verdict on `qwen3.5:9b` when deleted, so they are unproven defence in depth: re-probe on Haiku. Method in
`ai/AGENTS.md` (a throwaway `*.eval.ts` that writes to a file; `console.log` is swallowed; a probe run never "fails", so read its
WRONG lines).

**Machine state.** Ollama 0.40.16 (Homebrew formula, `brew services`) with `qwen3.5:9b`; its `format` fails ("structured output
is unavailable", the Homebrew MLX build lacks xgrammar), so use `withStructuredOutput(schema, {method: "functionCalling"})` with
`think: false`. LangSmith EU account exists and the Playwright MCP browser was logged in (may not persist); **no LangSmith key and no
provider key exist yet**. Paid ceiling: $1 total, locked until a capped key and a spend guard exist. Mutation runner: a scratchpad
script (gone with the session); the shape is in `TODO-build.md` "Gotchas learned" (back up, one exact replacement, `grep`, run,
restore and `cmp` in a `finally`; for evals read the failing case names, as a run can "pass" with a case red only in the report).

**Next, in order:** (0) **the user has committed the loop 2 work and the eval restructure (`4cc580a`)**; next is `git merge main` in the worktree (ask first: it is a git write) (main has the
bot, health HUD and `Bullet.shooter`; `ai/` imports none of it, but re-run `pnpm checks` and `pnpm evals:local`) and land it in main
with `build`; (1) a small Haiku run once the user makes a capped key, which re-probes moderation and decides whether the repair's
first-answer block and its "change as little" sentence both earn their place (the first answer echoes model output, which is a
small injection surface, so drop it if the sentence alone holds on Haiku); (2) offer the user the stat-direction criteria that
the restructure deliberately left out (new, probe-first, `when.capability`: "a shotgun that hits hard but fires slowly" fires
slower and hits harder than the default rifle; "the fastest, weakest pistol" is near both ends of the ranges), so the happy-path
`when`s say more than "valid and in the caps"; then the real `StateGraph` and the `AiAdapter` result
mapping (`invalid` is a typed failure there); (3) O3 cost control and the shutdown drill (needs `build`'s ledger); (4) arenas and the
judge (need the stairs and cone revision).

**New user request for the next planning/eval pass (2026-11-13):** assess the complexity and reliability of JSON-based
weapon appearance generation, including safe visual defaults, partial/invalid output and repair/fallback behaviour.
See the explicit task under M2 and `docs/art/concepts/simple-machinery-04/README.md`. This can inform the proposed
contract before it freezes; it does not require building a shared schema ahead of its consumers.

**Waiting on the user:** the cone-prompt owner and omitted-stat policy (from `art`); making the provider
key with its own cap; the canary moves to a secret before open-sourcing. **Waiting on `build`:** the weapon and arena contracts
(withdrawn; the schemas and caps in `ai/` are drafts), a root `pnpm evals` script, and a **shield behaviour** (directional,
reflects bullets) in the weapon vocabulary once the schema is drafted (`HANDOFF.md`).

**Working rules learnt:** the user reviews AI code in the VS Code git tool and commits it, so **never commit `ai` code**; leave it
uncommitted and say what changed (the one exception was a merge of main, explicitly asked for). No hard cap on evals (Anthropic,
Focused, Hamel Husain); a type read off a runtime value lives beside that value (`ai/AGENTS.md`). Read `ai/AGENTS.md` first.
**Names are written in full (the user, 2026-11-12):** no `deps`, `ctx`, `env`, `cfg`, `msg` and the like, in variables, parameters,
types, files or helpers; name a variable after its type (`weaponPipelineDependencies: WeaponPipelineDependencies`). Done across
`ai/` (the type and file were `WeaponPipelineDeps`; the spike worker's `ctx` and `_env` are now `executionContext` and
`_environment`). Left on purpose: `process.env` (Node's API) and the `Ms` suffix in `durationMs` and `graphMs` (a unit, and part of
the results JSON); ask before spelling those out. Sweep new code for abbreviations before reporting done.

