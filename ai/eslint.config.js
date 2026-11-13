import {baseConfig, restrictedImports} from "@gunsmith/shared/config/eslint.base.js";

// It may import itself by its own name, as `engine/` does: `api/` compiles it as raw source, so an `@src` alias would resolve
// into `api/`'s tree. It may also import the shared vocabulary and the engine (to validate and rate its output). Only `api/`
// imports it. (`evals/` is never imported by anyone, so it keeps its own `@evals` alias.)
const allowedPackages = ["@gunsmith/ai", "@gunsmith/shared", "@gunsmith/engine"];

const criteriaMapping = "@evals/eval-criteria-mapping/EvalCriteriaMapping";

// The evals have the three layers `acceptance-tests/` has, and imports only run downwards:
//   tests -> eval-criteria-mapping -> dsl
// The mapping is the setup (the model tier, the trials, the results file) and so is the only layer that touches a model or a test
// runner; the DSL is what a test may say and the checks behind it, and knows neither. Each block below is self-contained because
// flat config replaces a rule for a file rather than merging it.
const notUpwards = "Imports run tests -> eval-criteria-mapping -> dsl, never back up.";

const dslModelMessage =
  "The DSL runs the pipeline through its driver interface and checks it with evaluators; it never reaches a model or a test runner.";

const modelPackages = ["vitest", "langsmith/vitest", "@langchain/core", "@langchain/ollama"];

function noModelPackages(message) {
  return modelPackages.map(name => ({name, message}));
}

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
  {
    // Tests see the mapping and nothing else, which keeps them readable as the criteria they state: no pipeline, no evaluator,
    // no model, no vitest.
    files: ["evals/tests/**"],
    rules: {
      // A `thenExpect` states one criterion and checks it. Asking the weapon smith is what its `when` already names, in a
      // `beforeAll`, once, for all the criteria beneath it.
      "no-restricted-syntax": [
        "error",
        {
          selector: 'CallExpression[callee.name="thenExpect"] CallExpression[callee.property.name="ask"]',
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
            group: ["@evals/eval-criteria-mapping/**", `!${criteriaMapping}`, "@evals/dsl/**", "@evals/tests/**"],
            message: `A test may import only '${criteriaMapping}'. Anything else belongs on the mapping's exports, or on the DSL reached through its fixtures.`,
          },
        ],
      }),
    },
  },
  {
    // The mapping is setup: it chooses the tier, builds the models and the driver, wires the DSL into Vitest and LangSmith, and
    // writes the results. It reaches down to the DSL itself and never past it to its evaluators or trial folding, which are the
    // DSL's `expect` methods, and never back up to the tests.
    files: ["evals/eval-criteria-mapping/**"],
    rules: {
      "no-restricted-imports": restrictedImports({
        allowedPackages: ["@gunsmith/ai"],
        patterns: [
          {group: ["@evals/tests/**"], message: notUpwards},
          {
            group: ["@evals/dsl/pipeline/**", "@evals/dsl/errors/**"],
            message:
              "The mapping does not run checks. They are the DSL's `expect` methods; import the DSL (or its types), not what is behind it.",
          },
        ],
      }),
    },
  },
  {
    // The DSL is what a test may say, and the checks behind it. It reaches the pipeline only through the driver interface it owns,
    // so it never touches a test runner or a model, and its own tests need neither.
    files: ["evals/dsl/**"],
    rules: {
      "no-restricted-imports": restrictedImports({
        allowedPackages: ["@gunsmith/ai"],
        paths: noModelPackages(dslModelMessage),
        patterns: [{group: ["@evals/tests/**", "@evals/eval-criteria-mapping/**"], message: notUpwards}],
      }),
    },
  },
  {
    // A `*Dsl` only wraps, as in `acceptance-tests/`: each method is a `try` / `catch` that rethrows a `DslError` naming what was
    // attempted. Asking the weapon smith, holding its answers and checking them are done beneath it, by the pipeline, in `pipeline/`. (Repeats the block above,
    // because flat config replaces a rule for a file rather than merging it.)
    files: ["evals/dsl/*Dsl.ts"],
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
        allowedPackages: ["@gunsmith/ai"],
        paths: noModelPackages(dslModelMessage),
        patterns: [
          {group: ["@evals/tests/**", "@evals/eval-criteria-mapping/**"], message: notUpwards},
          {
            group: ["@evals/dsl/pipeline/evaluators/**", "@evals/dsl/pipeline/trials/**"],
            message:
              "A *Dsl does not check anything itself. Call the WeaponSmithPipeline beneath it, which uses the evaluators.",
          },
        ],
      }),
    },
  },
  {
    // The lower level catches nothing and wraps nothing: it throws a plain sentence, and the DSL above it says what was attempted.
    files: ["evals/dsl/pipeline/**"],
    rules: {
      "no-restricted-imports": restrictedImports({
        allowedPackages: ["@gunsmith/ai"],
        paths: noModelPackages(dslModelMessage),
        patterns: [
          {group: ["@evals/tests/**", "@evals/eval-criteria-mapping/**"], message: notUpwards},
          {
            group: ["@evals/dsl/errors/**", "@evals/dsl/*Dsl"],
            message:
              "The lower level wraps nothing and never looks up at the DSL. It throws a plain Error; the *Dsl puts it in words.",
          },
        ],
      }),
    },
  },
];
