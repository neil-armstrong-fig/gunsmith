import {baseConfig} from "@gunsmith/shared/config/eslint.base.js";

// `api/` may import the shared vocabulary, the engine (it runs the authoritative match) and `ai/` (the pipeline runs in this
// Worker, `docs/ai-hosting.md`). Nothing imports `api/`: the webapp and the acceptance specs reach it over HTTP and WebSocket.
const allowedPackages = ["@gunsmith/shared", "@gunsmith/engine", "@gunsmith/ai"];

export default [...baseConfig({tsconfigRootDir: import.meta.dirname, allowedPackages})];
