# AGENTS.md: shared

`@gunsmith/shared`: the bottom of the workspace graph. It imports no other workspace package. Today it holds only the
tool config in `config/` (ESLint, Prettier, tsconfig and vitest bases). The vocabulary, wire types and zod schemas arrive
with the contracts (M2). Stub: `build` writes the full file in Phase C.

Change a lint, format or compiler rule in `config/`, never in a package.
