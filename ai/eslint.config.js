import {baseConfig, restrictedImports} from "@gunsmith/shared/config/eslint.base.js";

// It may import itself by its own name, as `engine/` does: `api/` compiles it as raw source, so an `@src` alias would resolve
// into `api/`'s tree. It may also import the shared vocabulary and the engine (to validate and rate its output). Only `api/`
// imports it. (`src/evals/` is never imported by anyone, and `package.json`'s `exports` hides it from `api/`, so it keeps its own
// `@evals` alias.)
const allowedPackages = ["@gunsmith/ai", "@gunsmith/shared", "@gunsmith/engine"];

const criteriaMapping = "@evals/eval-criteria-mapping/EvalCriteriaMapping";
const dslTypesATestMayName = [
  "@evals/dsl/appearance/AppearanceDsl",
  "@evals/dsl/arena/ArenaDsl",
  "@evals/dsl/arena-submission/ArenaSubmissionDsl",
  "@evals/dsl/weapon/WeaponDsl",
];

// The evals have the three layers `acceptance-tests/` has, and imports only run downwards:
//   tests -> eval-criteria-mapping -> dsl
// The mapping is the setup (the model tier, the trials, the results file) and so is the only layer that touches a model or a test
// runner; the DSL is what a test may say and the checks behind it, and knows neither. Each block below is self-contained because
// flat config replaces a rule for a file rather than merging it.
const notUpwards = "Imports run tests -> eval-criteria-mapping -> dsl, never back up.";

const dslModelMessage =
  "The DSL runs the pipeline through its driver interface and checks it with evaluators; it never reaches a model or a test runner.";

// What the mapping, and its setups, may not reach: the tests above it, and the checks behind the DSL.
const mappingPatterns = [
  {group: ["@evals/tests/**"], message: notUpwards},
  {
    group: ["@evals/dsl/**/pipeline/**", "@evals/dsl/shared/errors/**"],
    message:
      "The mapping does not run checks. They are the DSL's `expect` methods; import the DSL (or its types), not what is behind it.",
  },
];

const modelPackages = ["vitest", "langsmith/vitest", "@langchain/core", "@langchain/ollama"];

function noModelPackages(message) {
  return modelPackages.map(name => ({name, message}));
}

export default [
  ...baseConfig({tsconfigRootDir: import.meta.dirname, allowedPackages}),
  // `src/` is what the Worker bundles, so the eval-only packages must never reach it: a local model client and the LangSmith
  // test wrapper belong in `src/evals/`, which the Worker never imports (its entry points reach only what they import, and
  // `package.json` does not export `evals/`). (Call `restrictedImports` rather than writing the rule: flat config replaces, not merges.)
  {
    files: ["src/**/*.ts"],
    ignores: ["src/evals/**", "src/adapter/**"],
    rules: {
      "no-restricted-imports": restrictedImports({
        allowedPackages,
        paths: [
          {
            name: "@langchain/ollama",
            message: "Eval-only: import it from `src/evals/`, never from the rest of `src/` (the Worker bundles it).",
          },
          {name: "langsmith/vitest", message: "Eval-only: import it from `src/evals/`, never from the rest of `src/`."},
          {
            name: "@langchain/anthropic",
            message:
              "Build models in `src/adapter/` (one place, no retries); the pipeline is handed its models, never builds them.",
          },
        ],
      }),
    },
  },
  {
    // Tests see the mapping and nothing else, which keeps them readable as the criteria they state: no pipeline, no evaluator,
    // no model, no vitest.
    files: ["src/evals/tests/**"],
    rules: {
      // A `thenExpect` states one criterion and checks it. Asking (`ask`, `askWithPrompts`, …) is what its trial's scope already does, in a
      // `beforeAll`, once, for all the criteria beneath it.
      "no-restricted-syntax": [
        "error",
        {
          selector: 'CallExpression[callee.name="thenExpect"] CallExpression[callee.property.name=/^ask/]',
          message:
            "Ask in the beforeAll of the when, not inside a thenExpect. A criterion checks the answers; it does not make a request.",
        },
      ],
      "no-restricted-imports": restrictedImports({
        allowedPackages: [],
        paths: noModelPackages(
          "Tests talk to the mapping, never to a model or a test runner. Ask the DSL for what you need.",
        ),
        patterns: [
          {
            group: [
              "@evals/eval-criteria-mapping/**",
              `!${criteriaMapping}`,
              // Not `@evals/dsl/**`: that would exclude each DSL's folder, and a pattern cannot re-include a file under an excluded folder.
              "@evals/dsl/WeaponSmithDsl",
              "@evals/dsl/types/**",
              "@evals/dsl/shared/**",
              "@evals/dsl/*/*",
              ...dslTypesATestMayName.map(path => `!${path}`),
              "@evals/dsl/*/*/**",
              "@evals/tests/**",
            ],
            message: `A test may import only '${criteriaMapping}', and (as a type, to name the DSL a trial hands it) a DSL file. Anything else belongs on the mapping's exports, or on the DSL reached through its fixtures.`,
          },
        ],
      }),
    },
  },
  {
    // The mapping is setup: it chooses the tier, builds the models and the driver, wires the DSL into Vitest and LangSmith, and
    // writes the results. It reaches down to the DSL itself and never past it to its evaluators or trial folding, which are the
    // DSL's `expect` methods, and never back up to the tests.
    files: ["src/evals/eval-criteria-mapping/**"],
    rules: {
      "no-restricted-imports": restrictedImports({
        allowedPackages: ["@gunsmith/ai", "@gunsmith/shared"],
        patterns: mappingPatterns,
      }),
    },
  },
  {
    // A setup hands the pipeline what the game ships, so it may read the engine: the built-in arenas it falls back to are engine's
    // (`BUILT_IN_ARENAS`), as engine and shared are shared resources. It still runs no checks (the patterns above).
    files: ["src/evals/eval-criteria-mapping/setups/**"],
    rules: {
      "no-restricted-imports": restrictedImports({
        allowedPackages: ["@gunsmith/ai", "@gunsmith/shared", "@gunsmith/engine"],
        patterns: mappingPatterns,
      }),
    },
  },
  {
    // The DSL is what a test may say, and the checks behind it. It reaches the pipeline only through the driver interface it owns,
    // so it never touches a test runner or a model, and its own tests need neither.
    files: ["src/evals/dsl/**"],
    rules: {
      "no-restricted-imports": restrictedImports({
        allowedPackages: ["@gunsmith/ai", "@gunsmith/shared"],
        paths: noModelPackages(dslModelMessage),
        patterns: [{group: ["@evals/tests/**", "@evals/eval-criteria-mapping/**"], message: notUpwards}],
      }),
    },
  },
  {
    // A `*Dsl` only wraps, as in `acceptance-tests/`: each method is a `try` / `catch` that rethrows a `DslError` naming what was
    // attempted. Asking the weapon smith, holding its answers and checking them are done beneath it, by the pipeline, in `pipeline/`. (Repeats the block above,
    // because flat config replaces a rule for a file rather than merging it.)
    files: ["src/evals/dsl/**/*Dsl.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "ForStatement, ForOfStatement, ForInStatement, WhileStatement, DoWhileStatement",
          message:
            "A *Dsl wraps; a loop is logic. Put it in the class beneath, in `pipeline/`, and call that from a try / catch.",
        },
        {
          selector: "CallExpression[callee.property.name=/^(map|filter|flatMap|reduce|some|every|forEach)$/]",
          message: "A *Dsl wraps; folding or filtering is logic. Put it in the class beneath, in `pipeline/`.",
        },
      ],
      "no-restricted-imports": restrictedImports({
        allowedPackages: ["@gunsmith/ai", "@gunsmith/shared"],
        paths: noModelPackages(dslModelMessage),
        patterns: [
          {group: ["@evals/tests/**", "@evals/eval-criteria-mapping/**"], message: notUpwards},
          {
            group: ["@evals/dsl/**/evaluators/**", "@evals/dsl/shared/trials/**"],
            message:
              "A *Dsl does not check anything itself. Call the pipeline class beneath it (WeaponPipeline, AppearancePipeline), which uses the evaluators.",
          },
        ],
      }),
    },
  },
  {
    // The lower level catches nothing and wraps nothing: it throws a plain sentence, and the DSL above it says what was attempted.
    // It may read the engine, because an evaluator judges what the player is given by the engine's own rules (an arena is playable
    // as `arenaFrom` and its routes say), written apart from the pipeline's checks so a pipeline that stops checking is caught. Tech debt, to revisit when engine's `validateArena` lands: see `TODO-ai.md`.
    files: ["src/evals/dsl/**/pipeline/**"],
    rules: {
      "no-restricted-imports": restrictedImports({
        allowedPackages: ["@gunsmith/ai", "@gunsmith/shared", "@gunsmith/engine"],
        paths: noModelPackages(dslModelMessage),
        patterns: [
          {group: ["@evals/tests/**", "@evals/eval-criteria-mapping/**"], message: notUpwards},
          {
            group: ["@evals/dsl/shared/errors/**", "@evals/dsl/**/*Dsl"],
            message:
              "The lower level wraps nothing and never looks up at the DSL. It throws a plain Error; the *Dsl puts it in words.",
          },
        ],
      }),
    },
  },
];
