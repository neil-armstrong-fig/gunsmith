# AGENTS.md: ai

The LangChain / LangGraph pipeline that turns a player's words into a weapon or an arena, and the evals that steer it.
Root `AGENTS.md` still applies. Why it runs inside the Worker: `docs/ai-hosting.md`. The pipeline's design: `docs/ai-pipeline.md`.

## Layout and imports

Laid out like `engine/` (read its `AGENTS.md`): one folder per subject, entry points at the top, every interface and type
alias in that folder's `types/`, a tunable constant in a file of its own, and a helper only one file uses in a subfolder beneath it.
**One exception (the user, 2026-11-12): a type read off a runtime value lives in the same file as that value**, so the two cannot
drift apart: a `z.infer` type beside its zod schema (`graph/WeaponProof.ts`), and an `as const` list beside the union derived
from it (`pipeline/types/WeaponOutcome.ts`, `evals/models/types/EvalTier.ts`).

**Imports.** `api/` will import this package as raw source (`exports: {"./*": "./src/*.ts"}`), so inside `src/` a file imports
another by the package's own name, `@gunsmith/ai/pipeline/GenerateWeapon`, never an `@src` alias (it would resolve into
`api/`'s tree). Checked 2026-11-12 to resolve in `tsc`, vitest, ESLint, `wrangler deploy --dry-run` (esbuild) and
`langgraphjs dev`. `evals/` is imported by nobody, so it keeps its own `@evals/*` alias.

- `src/pipeline/` the pipeline (`generateWeapon(input, deps)`), one subfolder per node (`precheck/`, `moderation/`, later `generate/` ...),
  plus `limits/`, `prompts/` and `types/`. **Workers-safe:** no Node-only APIs, and never import `@langchain/ollama` or
  `langsmith/vitest` (ESLint blocks it). Models arrive as `deps`.
- `src/graph/` the first one-node proof (kept for `langgraph dev` and the Worker spike). `src/worker/` spike Workers
  (`wrangler.jsonc`, `wrangler.trace.jsonc`).
- `evals/` the evals: `evaluators/` (pure, unit-tested in `pnpm checks`; `outcome/`, `safety/`, `schema/`, the list in
  `WeaponEvaluators.ts`), `weapons/` (cases and the `*.eval.ts` runner), `models/` (the three tiers), `reporting/`,
  `types/`, `results/` (`*-latest.json` is git-ignored).

## Eval-driven development (the way work is done here, like ATDD but with evals)

1. **Write the case first** in `evals/weapons/WeaponEvalCases.ts`, with a comment naming the failure it catches.
2. **Run it and watch it fail for the right reason** (`pnpm evals:local`; `evals:fake` proves only the harness).
3. **Build the smallest node or prompt change** that turns it green. Core logic is also unit-tested first as usual.
4. **Mutation proof:** degrade the prompt, drop a node or swap in a weaker model; the score must fall. If it does not, the eval
   measures nothing.
5. Only then validate on the paid tier, once per turn at most, if the change could behave differently on Haiku.

## Rules

- **Suite size follows the research, not a cap** (Anthropic: 20 to 50 tasks from real failures is a great start; Focused: 7 to
  start, 50 to 100 for production). Add a case only for a real or probed failure, never to pad. Tag every case `regression`
  (near 100%, gates CI) or `capability` (a hill to climb). One deterministic evaluator per failure mode, no cap.
- **Binary, deterministic evaluators first**, written independently of the code they check (the caps in `WithinCaps.ts` are not
  imported from the pipeline). A model judge is **deferred** until a real failure needs one, then calibrated on about 50 human-rated examples.
- **Local model facts (checked 2026-11-12, Ollama 0.40.16):** `qwen3.5:9b` answers a call in 0.3 to 1.1 s, peaks near 7.5 GiB. Its
  `format` (schema and JSON mode) fails with "structured output is unavailable". **Cause:** the model is not at fault; it is the
  Homebrew `ollama` formula, whose MLX runner (what the default NVFP4 tag uses; `ollama ps` shows `mlx`) is built without the
  xgrammar library (Homebrew/homebrew-core issue 302645, open). GGUF tags (`-q4_K_M`) run on llama.cpp and are reported to
  support `format`; so does the official app or `ollama-binary` cask. Either way, ask for structure with
  `withStructuredOutput(schema, {method: "functionCalling"})`, always with `think: false`; it does not enforce the schema's limits.
- **What moves the moderation score (measured 2026-11-12, loop 1b).** ~45 borderline probes against `qwen3.5:9b` found one real
  failure, weapon words stuffed round an off-topic ask (now a case); the "say no" rule and the data-block paragraph changed no
  verdict when deleted, because the property name `isWeaponRequest` carries most of the decision, so they are unproven defence in
  depth (they may matter on Haiku; re-probe on the paid tier). Replacing the task and removing the "weapon words alone" sentence
  both make evals fall. A case joins only from a probe that fails; probe with a throwaway `*.eval.ts` that writes to a file
  (`console.log` is swallowed), and remember a probe run never "fails", so read its WRONG lines, not the exit code.
- **Three tiers behind one `deps` argument:** `fake` (checks, free), `local` (Ollama `qwen3.5:9b`, free, the working loop),
  `paid` (Haiku 5.5, locked until the key and spend guard exist; total ceiling $1 for now, ask before raising it).
  **Scores do not transfer between tiers.**
- **Tracking is off by default** (`LANGSMITH_TEST_TRACKING=false`): eval traces share the free plan's 5,000 a month with
  production. Set `EVAL_TRACK=1` for a deliberate baseline run only.
- **`ls.describe` in a `*.eval.ts` is not a unit-test `describe`.** It defines the LangSmith dataset and is how the wrapper
  works, so the "no top-level `describe`" rule (root `AGENTS.md`) is for unit tests only. In an eval file, import `expect`
  from `vitest` (the global one is shadowed inside `ls.test`). Unit tests, including the evaluators', stay flat `it(...)`.
- Model output is `unknown` until zod has parsed it; the AI proposes, the engine disposes.
- Schemas and caps here are **drafts** local to `ai/` until `build` freezes the contracts in `HANDOFF.md`; do not touch `shared/`.

## Commands

`pnpm --filter @gunsmith/ai checks` (the gate; 67 unit tests), `... evals:fake`, `... evals:local`, `... evals:paid`, `... dev` (Agent Server and Studio).
Environment for the evals: `EVAL_TIER` (`fake`, `local`, `paid`), `EVAL_TRIALS` (runs per case; default 3 local, 1 otherwise),
`EVAL_GATE=regression` (only `regression` cases fail the run; what CI will use), `EVAL_TRACK=1` (sync to LangSmith).
