import {baseConfig} from "@gunsmith/shared/config/eslint.base.js";

export default baseConfig({
  tsconfigRootDir: import.meta.dirname,
  allowedPackages: ["@gunsmith/audio-studies", "@gunsmith/shared"],
  allowedConsoleMethods: ["log", "warn", "error"],
});
