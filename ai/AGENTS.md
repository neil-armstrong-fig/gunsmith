# AGENTS.md: ai

The LangChain / LangGraph pipeline that turns a player's words into a weapon or an arena, and the evals that steer it.
Root `AGENTS.md` still applies. Why it runs inside the Worker: `docs/ai-hosting.md`. The pipeline's design: `docs/ai-pipeline.md`.

## Layout

- `src/pipeline/` the pipeline (`generateWeapon(input, deps)`), one folder per node (`precheck/`, later `moderation/` ...). **Workers-safe:**
  no Node-only APIs, and never import `@langchain/ollama` or `langsmith/vitest` (ESLint blocks it). Models arrive as `deps`.
- `src/graph/` the first one-node proof (kept for `langgraph dev` and the Worker spike). `src/worker/` spike Workers.
- `evals/` the evals. `types/`, `evaluators/` (pure, unit-tested in `pnpm checks`), `weapons/` (cases and the `*.eval.ts` runner),
  `models/` (the three tiers), `reporting/`, `results/` (`*-latest.json` is git-ignored).

## Eval-driven development (the way work is done here, like ATDD but with evals)

1. **Write the case first** in `evals/weapons/WeaponEvalCases.ts`, with a comment naming the failure it catches.
2. **Run it and watch it fail for the right reason** (`pnpm evals:local`; `evals:fake` proves only the harness).
3. **Build the smallest node or prompt change** that turns it green. Core logic is also unit-tested first as usual.
4. **Mutation proof:** degrade the prompt, drop a node or swap in a weaker model; the score must fall. If it does not, the eval
   measures nothing.
5. Only then validate on the paid tier, once per turn at most, if the change could behave differently on Haiku.

## Rules

- **Few evals, each useful** (the user's rule): about 10 cases a suite or fewer. Add one only for a real failure.
- **Binary, deterministic evaluators first**, written independently of the code they check (the caps in `WithinCaps.ts` are not
  imported from the pipeline). A model judge comes later, calibrated on about 10 labelled pairs.
- **Local model facts (checked 2026-11-12, Ollama 0.40.16):** `qwen3.5:9b` answers a call in 0.3 to 1.1 s, peaks near 7.5 GiB. Its
  `format` (schema and JSON mode) fails with "structured output is unavailable". **Cause:** the model is not at fault; it is the
  Homebrew `ollama` formula, whose MLX runner (what the default NVFP4 tag uses; `ollama ps` shows `mlx`) is built without the
  xgrammar library (Homebrew/homebrew-core issue 302645, open). GGUF tags (`-q4_K_M`) run on llama.cpp and are reported to
  support `format`; so does the official app or `ollama-binary` cask. Either way, ask for structure with
  `withStructuredOutput(schema, {method: "functionCalling"})`, always with `think: false`; it does not enforce the schema's limits.
- **Three tiers behind one `deps` argument:** `fake` (checks, free), `local` (Ollama `qwen3.5:9b`, free, the working loop),
  `paid` (Haiku 5.5, locked until the key and spend guard exist; total ceiling $1 for now, ask before raising it).
  **Scores do not transfer between tiers.**
- **Tracking is off by default** (`LANGSMITH_TEST_TRACKING=false`): eval traces share the free plan's 5,000 a month with
  production. Set `EVAL_TRACK=1` for a deliberate baseline run only.
- Model output is `unknown` until zod has parsed it; the AI proposes, the engine disposes.
- Schemas and caps here are **drafts** local to `ai/` until `build` freezes the contracts in `HANDOFF.md`; do not touch `shared/`.

## Commands

`pnpm --filter @gunsmith/ai checks` (the gate), `... evals:fake`, `... evals:local`, `... evals:paid`, `... dev` (Agent Server and Studio).
