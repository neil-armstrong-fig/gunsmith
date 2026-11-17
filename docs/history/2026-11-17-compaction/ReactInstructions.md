# Historical snapshot: webapp/src/react/AGENTS.md

Captured 2026-11-17 before compaction. This is historical context, not active
instructions or a current task list. Relative Markdown links have been rebased.
Current source: [active document](../../../webapp/src/react/AGENTS.md).

# AGENTS.md: react

Components. The folder layout (`components/dom|three/<name>/`, hooks, helpers, types) is in `webapp/AGENTS.md`; this file
holds the two things the root `AGENTS.md` points here for, and the JSX conventions. Modelled on janggi's
`webapp/src/react/AGENTS.md`. They hold for DOM components and react-three-fiber elements alike.

- **Every component gets its own file, in its own folder**, however small it is or how few callers it has. This is the one
  place the root rule about declaring functions below their callers does not apply: that rule is for plain functions.
  Inline a component only where extracting it would be actively misleading, and say why in a comment.
- **A component's props interface is called `Props` and is not exported.** It stays in the component's file.
- **A blank line between sibling JSX elements**, in the DOM and in a react-three-fiber tree. The `<circleGeometry>` and
  the `<meshBasicMaterial>` inside a `<mesh>` are siblings, and so are three `<span>`s in a row. Two elements pressed
  together read as one block; a line between them shows the structure at a glance. Prettier keeps these lines but never
  adds one, and no lint rule here can insert them, so this is on you.
- **Two conditionals rather than a ternary** when choosing between JSX elements: `{loading && <Spinner />}` then
  `{!loading && <Done />}`, not `{loading ? <Spinner /> : <Done />}`. A ternary is for a plain value, as the root
  `AGENTS.md` says, and even then only as a last resort.
- **Per-frame values never go through React state.** A r3f component reads the world with `gameState()` inside `useFrame`;
  see the State section of `webapp/AGENTS.md`.
