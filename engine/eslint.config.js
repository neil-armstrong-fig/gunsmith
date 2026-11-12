import {baseConfig} from "@gunsmith/shared/config/eslint.base.js";

// Pure TypeScript: no React, no DOM, no clock, no I/O. It may import itself by its own name (as janggi's engine does: it
// is compiled as raw source by whichever package imports it, so an `@src` alias would resolve into that package's tree).
// Nothing but `webapp` and, later, `api` and `ai` may import it. It is not in `shared/` because `acceptance-tests/`
// may import anything there, and a spec that recomputed its expectation from the engine would agree with it whatever
// the engine did.
export default baseConfig({
  tsconfigRootDir: import.meta.dirname,
  allowedPackages: ["@gunsmith/engine"],
});
