import {baseConfig, restrictedImports} from "@gunsmith/shared/config/eslint.base.js";

// It may import itself by its own name, as `engine/` does: `api/` compiles it as raw source, so an `@src` alias would resolve
// into `api/`'s tree. It may also import the shared vocabulary and the engine (to validate and rate its output). Only `api/`
// imports it. (`evals/` is never imported by anyone, so it keeps its own `@evals` alias.)
const allowedPackages = ["@gunsmith/ai", "@gunsmith/shared", "@gunsmith/engine"];

export default [
  ...baseConfig({tsconfigRootDir: import.meta.dirname, allowedPackages}),
  // `src/` is what the Worker bundles, so the eval-only packages must never reach it: a local model client and the LangSmith
  // test wrapper belong in `evals/`. (Call `restrictedImports` rather than writing the rule: flat config replaces, not merges.)
  {
    files: ["src/**/*.ts"],
    rules: {
      "no-restricted-imports": restrictedImports({
        allowedPackages,
        paths: [
          {
            name: "@langchain/ollama",
            message: "Eval-only: import it from `evals/`, never from `src/` (the Worker bundles `src/`).",
          },
          {name: "langsmith/vitest", message: "Eval-only: import it from `evals/`, never from `src/`."},
        ],
      }),
    },
  },
];
