# AGENTS.md: shared

`@gunsmith/shared`: the bottom of the workspace graph. It imports no other workspace package. It holds only the
tool config in `config/` (ESLint, Prettier, tsconfig and vitest bases), and **nothing else until a second package needs it**:
no pre-emptive types, schemas or constants. A shape moves here when another package imports it. Today the only thing besides config is `src/state-hook/`: the snapshot types (in `types/`) and name of the read-only hook the webapp
puts on `window` and the acceptance specs read, which is why it is shared.

Change a lint, format or compiler rule in `config/`, never in a package.

`config/standards/` holds the local TypeScript ESLint plugin. Its independently named rules survive package syntax overrides. Node 26 loads these `.ts` modules directly; shared's tsconfig checks them and permits their explicit `.ts` imports. Its tests run through real package configurations.
`config/repository/CheckRepository.ts` powers root `pnpm checks:repository`: instruction-chain size, current instruction links, stale startup wording and art-script validation. Frozen HTML is syntax-checked only; this is not browser/usability coverage. Keep archives outside startup reading and preserve current owner work when editing shared status files.
