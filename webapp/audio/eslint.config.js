import {baseConfig} from "@gunsmith/shared/config/eslint.base.js";

export default [
  ...baseConfig({
    tsconfigRootDir: import.meta.dirname,
    allowedPackages: ["@gunsmith/audio-studies", "@gunsmith/shared"],
    allowedConsoleMethods: ["log", "warn", "error"],
  }),
  {
    // The check page's script runs in the browser under test, not in Node: plain JavaScript, so no return types can be
    // written, and with the page's globals rather than Node's.
    files: ["generator-scripts/browser/page/*.js"],
    languageOptions: {
      globals: {window: "readonly", document: "readonly", navigator: "readonly", OfflineAudioContext: "readonly"},
    },
    rules: {
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
    },
  },
];
