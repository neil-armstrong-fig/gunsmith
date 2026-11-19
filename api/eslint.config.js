import {baseConfig, restrictedImports} from "@gunsmith/shared/config/eslint.base.js";

// `api/` may import the shared vocabulary, the engine (it runs the authoritative match) and `ai/` (the pipeline runs in this
// Worker, `docs/ai-hosting.md`). Nothing imports `api/`: the webapp and the acceptance specs reach it over HTTP and WebSocket.
const allowedPackages = ["@gunsmith/shared", "@gunsmith/engine", "@gunsmith/ai"];

// Where each outside library, and the Workers runtime, may be reached. Code gets the Worker's bindings by importing `workerEnvironment`
// (`env/WorkerEnvironment`), the one file that imports `cloudflare:workers`; Drizzle and D1 stay in `accounts/` alone and OAuth in
// `sign-in/` alone, so a route calls a plain function and never the library behind it.
const runtime = {
  group: ["cloudflare:workers"],
  message:
    "Import `workerEnvironment` from @src/env/WorkerEnvironment: it is the one file that imports the Workers runtime.",
};
const drizzle = {
  group: ["drizzle-orm", "drizzle-orm/*"],
  message: "Drizzle is for src/accounts/ alone: call the account functions, never the database.",
};
const oauth = {
  group: ["oauth4webapi"],
  message: "oauth4webapi is for src/sign-in/ alone: call googleAuthorizationUrl / googleSubjectOf.",
};
const database = {
  group: ["@src/accounts/Database"],
  message: "The D1 database is for the account functions in src/accounts/ alone.",
};

export default [
  ...baseConfig({tsconfigRootDir: import.meta.dirname, allowedPackages}),
  // The stand-in for the runtime's own module has the module's two exports (`env`, `DurableObject`).
  {files: ["src/env/testing/CloudflareWorkersStub.ts"], rules: {"gunsmith/single-export": "off"}},
  {
    files: ["src/**/*.ts"],
    ignores: ["src/accounts/**", "src/sign-in/**", "src/env/WorkerEnvironment.ts", "src/durable-objects/*/*.ts"],
    rules: {
      "no-restricted-imports": restrictedImports({allowedPackages, patterns: [runtime, drizzle, oauth, database]}),
    },
  },
  {
    files: ["src/accounts/**/*.ts"],
    rules: {"no-restricted-imports": restrictedImports({allowedPackages, patterns: [runtime, oauth]})},
  },
  {
    files: ["src/sign-in/**/*.ts"],
    rules: {"no-restricted-imports": restrictedImports({allowedPackages, patterns: [runtime, drizzle, database]})},
  },
  // The Durable Object classes extend the runtime's `DurableObject`; they reach nothing else of it.
  {
    files: ["src/durable-objects/*/*.ts"],
    rules: {"no-restricted-imports": restrictedImports({allowedPackages, patterns: [drizzle, oauth, database]})},
  },
];
