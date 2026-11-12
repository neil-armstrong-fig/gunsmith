import eslintReact from "@eslint-react/eslint-plugin";
import {baseConfig, restrictedImports} from "@gunsmith/shared/config/eslint.base.js";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

// The webapp may import the shared vocabulary and the engine (the engine arrives in Phase C). The full layering inside
// `src/` (react/ → redux/ → game/, audio/ beside redux/) is written in Phase C.
const allowedPackages = ["@gunsmith/shared", "@gunsmith/engine"];

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
];
