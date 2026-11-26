import {baseConfig, restrictedImports} from "@gunsmith/shared/config/eslint.base.js";

const acceptanceCriteriaMapping = "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

const playwrightPackages = ["@playwright/test", "playwright", "playwright-core"];

const allowedPackages = ["@gunsmith/shared"];

const notUpwards = "Imports run tests -> acceptance-criteria-mapping -> dsl, never back up.";

// What no part of the DSL may do with the page, shared by the two blocks that govern it.
const dslSyntax = [
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
];

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
            'CallExpression[callee.name="then"] CallExpression[callee.property.name=/^(resizeWindowTo|startWalking|stopWalking|walkFor|aimAtTile|fire|startFiring|stopFiring|reload|switchTo|startDuel|startDuelWithPreRound|startLongDuel|startSparring|startSparringWithSeed|startSparringWithPickupDrawing|startSparringWithHeldPictures|releasePictures|startSparringWithMissingPictures|startSparringWithMissingRifle|startHeights|startCover|startMutualKnockout|startPickupRace|startFairDuel|startOverwatch|toggleMute|startClosingRing|startClosingDuel|nextRound|playAgain|holdTheGame|runGameFor|runUntilTheOpponentFires|createPrivateRoom|joinWithASecondBrowser|slowTheConnectionBy|receiveOnlyEveryNthSnapshot|startRecordingTheShownFighters|walkUntilPast|keepTheCameraStill|askForReducedMotion|preferReducedMotion|startTerrain|joinAsAStranger|prepareToLoseTheConnection|cutTheConnection|keepTheConnectionDown|letTheConnectionBack|leaveTheRoom|returnToTheRoom|waitForTheMatchAgain|keepMovingUntilTheRoundIs|keepMovingUntilPlayAgainIsOffered|open|close|typeThePrompt|pasteThePrompt|make|tryIt|resetTheRange|holdTheMouseOnThePanel|reloadThePage|startBotGame|choose|lockIn|startTheMatch|save|tryItem|iterateItem|deleteItem|replaceItem|cancelReplace|loadWithoutOverride|pressSettings|pressEscape|chooseOptions|setStartupMenu|chooseWorkshop|resumePlay|rememberTheArenaCanvas|goBackInBrowser|goForwardInBrowser|useLegacyStartupPreference|pressBack|backToMainMenu|pressArenaAction|aimAwayFrom|arrangeSignedInArena|arrangeSignedInPlayer|arrangeSignedInWeapon|arrangeASavedWeaponForThisPlayer|arrangeASavedWeaponForTheOpponent|releaseWeaponMake|chooseBuiltInWeapon|runUntilHidden|runUntilSeen|runUntilNoneInTheAir|openTheOpponentWeapon|openTheSeededPracticeRange)$/]',
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
      "no-restricted-syntax": ["error", ...dslSyntax],
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
  {
    // Every method of a `*Dsl`, sync or async, is one `try` that rethrows a `DslError` naming the intention, so a failing spec says what it was doing.
    // Flat config replaces a rule rather than merging it, so the two selectors above are repeated here.
    files: ["src/dsl/**/*Dsl.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        ...dslSyntax,
        {
          selector:
            'MethodDefinition[kind=/^(method|get)$/] > FunctionExpression > BlockStatement:not([body.length=1][body.0.type="TryStatement"])',
          message:
            "A *Dsl method is one try/catch that rethrows a DslError naming what it was trying to do, even when it is not async, so a failing spec reads as an intention.",
        },
      ],
    },
  },
];
