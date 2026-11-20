import eslintReact from "@eslint-react/eslint-plugin";
import {baseConfig, restrictedImports} from "@gunsmith/shared/config/eslint.base.js";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

// The webapp may import the shared vocabulary and the engine. Inside `src/` the layers run react/ → store/ → game/, and
// an import may only point down: `game/` knows nothing of the store or of React, and `store/` knows nothing of React.
// `sound/` sits beside the store: the react/ layer uses it, and it uses neither React nor a store.
// The game store is held to more than that: see `gameStoreMayImport`.
const allowedPackages = ["@gunsmith/shared", "@gunsmith/engine"];

// Everything the game store (`src/store/game/`) may import: Zustand, the engine, the plain data beneath the store, and
// its own folder. Anything else fails, which is what keeps the game store holding the engine's `World` and nothing else:
// a menu, lobby, library or credits type has nowhere to be imported from. A regex rather than a `!` group, because a
// gitignore-style group cannot re-include a child of an excluded parent (`@gunsmith/engine/**`).
const gameStoreMayImport = "^(?!zustand$|zustand/|@gunsmith/engine(?:/|$)|@src/game/|@src/store/game/|\\./).+$";

// The feedback store (`src/store/feedback/`) is smaller still: Zustand and its own folder, no engine and no world.
const feedbackStoreMayImport = "^(?!zustand$|zustand/|@src/store/feedback/|\\./).+$";

// The workshop store (`src/store/workshop/`) holds what is written and the weapon last made: Zustand, the engine's types and its own folder.
const workshopStoreMayImport = "^(?!zustand$|zustand/|@gunsmith/engine(?:/|$)|@src/store/workshop/|\\./).+$";

// The shelf store (`src/store/shelf/`) holds the saved weapons and keeps them in the browser's storage: Zustand, zod (to read what the browser kept), the engine and its own folder.
const shelfStoreMayImport = "^(?!zustand$|zustand/|zod$|@gunsmith/engine(?:/|$)|@src/store/shelf/|\\./).+$";

// The pre-round store (`src/store/pre-round/`) holds where the pre-round stands and the weapons locked in: Zustand, the engine's types (and its weapons in a test), the page's ask for it, the picks' type and its own folder.
const preRoundStoreMayImport =
  "^(?!zustand$|@gunsmith/engine(?:/|$)|@src/game/pre-round/|@src/store/pre-round/|\\./).+$";

// The pre-round's memory (`src/store/pre-round-choices/`) holds the ids of what was last chosen and keeps them in the browser's storage: Zustand, zod (to read what the browser kept) and its own folder.
const preRoundChoicesStoreMayImport = "^(?!zustand$|zustand/|zod$|@src/store/pre-round-choices/|\\./).+$";

export default [
  ...baseConfig({tsconfigRootDir: import.meta.dirname, allowedPackages}),
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        ecmaFeatures: {jsx: true},
      },
    },
    plugins: {
      ...eslintReact.configs["recommended-typescript"].plugins,
      "react-hooks": reactHooks,
    },
    settings: eslintReact.configs["recommended-typescript"].settings,
    rules: {
      ...eslintReact.configs["recommended-typescript"].rules,
      ...reactHooks.configs.recommended.rules,
      // eslint-plugin-react-hooks owns these; letting both report would double up.
      ...eslintReact.configs["disable-conflict-eslint-plugin-react-hooks"].rules,
      "no-restricted-imports": restrictedImports({allowedPackages}),
    },
  },
  {
    // The bottom layer: plain data and logic. No React, no renderer, no store, and nothing from the layers above.
    files: ["src/game/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": restrictedImports({
        allowedPackages,
        patterns: [
          {
            group: ["@src/react/**", "@src/store/**"],
            message: "game/ is the bottom layer (react/ → store/ → game/): it may not import the store or React code.",
          },
          {
            group: [
              "react",
              "react/**",
              "react-dom",
              "react-dom/**",
              "three",
              "three/**",
              "@react-three/**",
              "zustand",
              "zustand/**",
            ],
            message: "game/ is plain data and logic: no React, no renderer and no state library.",
          },
        ],
      }),
    },
  },
  {
    // The middle layer: Zustand stores. They may use game/ and the engine, never React code.
    files: ["src/store/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": restrictedImports({
        allowedPackages,
        patterns: [
          {
            group: ["@src/react/**"],
            message: "store/ is below react/ (react/ → store/ → game/): a store may not import React code.",
          },
        ],
      }),
    },
  },
  {
    // The sounds: plain logic and the browser's audio. They may use the engine's events and the sound files, never React code
    // or a store (the loop hands them what a step reported, and the mute is passed in as a function).
    files: ["src/sound/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": restrictedImports({
        allowedPackages,
        patterns: [
          {
            group: [
              "@src/react/**",
              "@src/store/**",
              "react",
              "react/**",
              "react-dom",
              "react-dom/**",
              "zustand",
              "zustand/**",
            ],
            message:
              "sound/ is plain logic and the browser's audio: no React, no store. The loop passes it what a step reported.",
          },
        ],
      }),
    },
  },
  {
    // The game store holds the engine's `World` and nothing else. After the block above, which it replaces for these files.
    files: ["src/store/game/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": restrictedImports({
        allowedPackages: ["@gunsmith/engine"],
        patterns: [
          {
            regex: gameStoreMayImport,
            message:
              "The game store may import only zustand, the engine, @src/game/** and its own folder. Menus, lobby, library and credits state belong in the app store; a value worked out from the world is a selector.",
          },
        ],
      }),
    },
  },
  {
    // The feedback store holds the cues of the damage the player takes and nothing else. After the store block above.
    files: ["src/store/feedback/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": restrictedImports({
        allowedPackages: [],
        patterns: [
          {
            regex: feedbackStoreMayImport,
            message:
              "The feedback store may import only zustand and its own folder: it holds the cues of the damage taken, not the world and not a choice.",
          },
        ],
      }),
    },
  },
  {
    // The shelf store holds the saved weapons and nothing else. After the store block above.
    files: ["src/store/shelf/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": restrictedImports({
        allowedPackages: ["@gunsmith/engine"],
        patterns: [
          {
            regex: shelfStoreMayImport,
            message:
              "The shelf store may import only zustand, zod, the engine and its own folder: it holds the saved weapons and keeps them in the browser.",
          },
        ],
      }),
    },
  },
  {
    // The pre-round's memory holds three ids and keeps them in the browser's storage. After the store block above.
    files: ["src/store/pre-round-choices/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": restrictedImports({
        allowedPackages: ["zod"],
        patterns: [
          {
            regex: preRoundChoicesStoreMayImport,
            message:
              "The pre-round's memory may import only zustand, zod and its own folder: it holds the ids of what was last chosen.",
          },
        ],
      }),
    },
  },
  {
    // The pre-round store holds the phase and the picks and nothing else. After the store block above.
    files: ["src/store/pre-round/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": restrictedImports({
        allowedPackages: ["@gunsmith/engine"],
        patterns: [
          {
            regex: preRoundStoreMayImport,
            message:
              "The pre-round store may import only zustand, the engine, game/pre-round and its own folder: it holds where the pre-round stands and the weapons locked in.",
          },
        ],
      }),
    },
  },
  {
    // The workshop store holds the prompt and the weapon last made and nothing else. After the store block above.
    files: ["src/store/workshop/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": restrictedImports({
        allowedPackages: ["@gunsmith/engine"],
        patterns: [
          {
            regex: workshopStoreMayImport,
            message:
              "The workshop store may import only zustand, the engine's types and its own folder: it holds what is written and the weapon last made.",
          },
        ],
      }),
    },
  },
];
