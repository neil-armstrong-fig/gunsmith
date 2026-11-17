import {baseConfig, restrictedImports} from "@gunsmith/shared/config/eslint.base.js";

const acceptanceCriteriaMapping = "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

const playwrightPackages = ["@playwright/test", "playwright", "playwright-core"];

const allowedPackages = ["@gunsmith/shared"];

const notUpwards = "Imports run tests -> acceptance-criteria-mapping -> dsl, never back up.";

export default [
  ...baseConfig({tsconfigRootDir: import.meta.dirname, allowedPackages}),
  {
    // Specs see the mapping and nothing else, which keeps them readable as acceptance criteria.
    files: ["src/tests/**"],
    rules: {
      // A `then` states one criterion and asserts it. Anything done TO the app before that assertion is the
      // arrangement its `given` or `when` already names, and belongs in a `beforeEach`. The DSL splits by name: an
      // action is a verb, a query is not. Adding an action to the DSL means adding it here too.
      "no-restricted-syntax": [
        "error",
        {
          selector:
            'CallExpression[callee.name="then"] CallExpression[callee.property.name=/^(resizeWindowTo|startWalking|stopWalking|walkFor|aimAtTile|fire|startFiring|stopFiring|reload|switchTo|startDuel|startLongDuel|startSparring|startSparringWithSeed|startSparringWithHeldPictures|releasePictures|startSparringWithMissingPictures|startHeights|startPickupRace|toggleMute|startClosingRing|startClosingDuel|nextRound|playAgain|holdTheGame|runGameFor|runUntilTheOpponentFires|createPrivateRoom|joinWithASecondBrowser)$/]',
          message:
            "Arrange in a beforeEach on the given or when, not inside a then. A criterion asserts; it does not set up.",
        },
      ],
      "no-restricted-imports": restrictedImports({
        allowedPackages,
        paths: playwrightPackages.map(name => ({
          name,
          message: "Specs talk to the DSL, never to Playwright. Ask for what you need as a fixture instead.",
        })),
        patterns: [
          {
            group: [
              "@src/acceptance-criteria-mapping/**",
              `!${acceptanceCriteriaMapping}`,
              "@src/dsl/**",
              "@src/tests/**",
            ],
            message: `A spec may import only '${acceptanceCriteriaMapping}'. Anything else belongs on the mapping's exports, or on the DSL reached through a fixture.`,
          },
        ],
      }),
    },
  },
  {
    // The mapping wires the DSL into Playwright, so it reaches down into `dsl/`, never back up.
    files: ["src/acceptance-criteria-mapping/**"],
    rules: {
      "no-restricted-imports": restrictedImports({
        allowedPackages,
        patterns: [{group: ["@src/tests/**"], message: notUpwards}],
      }),
    },
  },
  {
    // Playwright lives in `playwright/` folders and nowhere else. The one thing a `*Dsl` may name is `Page`, and only to
    // build its own counterpart with in its constructor; it may never keep it.
    files: ["src/dsl/**"],
    ignores: ["src/dsl/**/playwright/**"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: 'MemberExpression[object.type="ThisExpression"][property.name="page"]',
          message:
            "A *Dsl may not reach the page from a method. Take it in the constructor, build the *Playwright beside this file with it, and go through that.",
        },
        {
          selector: 'PropertyDefinition[key.name="page"], TSParameterProperty > Identifier[name="page"]',
          message:
            "A *Dsl may not keep the page. Take it as a plain constructor parameter, build the *Playwright beside this file with it, and let it go out of scope.",
        },
      ],
      "no-restricted-imports": restrictedImports({
        allowedPackages,
        paths: playwrightPackages.map(name => ({
          name,
          ...(name === "@playwright/test" ? {allowImportNames: ["Page"]} : {}),
          message:
            "Only a `playwright/` folder may import Playwright, apart from the `Page` a *Dsl constructor passes to its counterpart. Put the locator work in the *Playwright beside this file and call it from here.",
        })),
        patterns: [{group: ["@src/tests/**", "@src/acceptance-criteria-mapping/**"], message: notUpwards}],
      }),
    },
  },
];
