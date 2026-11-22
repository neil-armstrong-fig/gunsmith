# AGENTS.md: shared

`@gunsmith/shared`: the bottom of the workspace graph. It imports no other workspace package. It holds only the
tool config in `config/` (ESLint, Prettier, tsconfig and vitest bases), and **nothing else until a second package needs it**:
no pre-emptive types, schemas or constants. A shape moves here when another package imports it. Runtime consumers share `src/state-hook/` (the snapshot types, in `types/`, and the name of the read-only hook the webapp
puts on `window` and the acceptance specs read) and `src/appearance/`: the generated-weapon appearance schema (`schema/`, strict zod, the 64 by 64 limits), its colour/detail/preset vocabularies (`vocabulary/`) and the code-owned stand-in (`fallback/`), moved unchanged from `ai/` on 2026-11-17 because the webapp renders what `ai/` produces. `zod` is this package's one dependency (the catalog pin `ai/` uses). `ai/` owns the checks that need geometry (`validateAppearance`); the webapp must parse with the schema before it draws. `src/online/friend-code/` defines the room code alphabet, length and exact validation for the API and webapp.

Change a lint, format or compiler rule in `config/`, never in a package.

`config/standards/` holds the local TypeScript ESLint plugin. Its independently named rules survive package syntax overrides. Node 26 loads these `.ts` modules directly; shared's tsconfig checks them and permits their explicit `.ts` imports. Its tests run through real package configurations.
`config/repository/CheckRepository.ts` powers root `pnpm checks:repository`: instruction-chain size, current instruction links, stale startup wording and art-script validation. Frozen HTML is syntax-checked only; this is not browser/usability coverage. Keep archives outside startup reading and preserve current owner work when editing shared status files.
