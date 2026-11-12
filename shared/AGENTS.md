# AGENTS.md: shared

`@gunsmith/shared`: the bottom of the workspace graph. It imports no other workspace package. It holds only the
tool config in `config/` (ESLint, Prettier, tsconfig and vitest bases), and **nothing else until a second package needs it**:
no pre-emptive types, schemas or constants. A shape moves here when another package imports it. Today the only thing besides config is `src/state-hook/`: the snapshot types (in `types/`) and name of the read-only hook the webapp
puts on `window` and the acceptance specs read, which is why it is shared. Stub: `build` writes the full file in Phase C.

Change a lint, format or compiler rule in `config/`, never in a package.
