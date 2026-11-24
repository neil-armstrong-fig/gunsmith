# AGENTS.md: react

Components. The folder layout (`components/dom|three/<name>/`, hooks, helpers, types) is in `webapp/AGENTS.md`; this file
holds the two things the root `AGENTS.md` points here for, and the JSX conventions. They hold for DOM components and react-three-fiber elements alike.

- **Every component gets its own file, in its own folder**, however small it is or how few callers it has. This is the one
  place the root rule about declaring functions below their callers does not apply: that rule is for plain functions.
  **Never a second component in a file**, not even a private one only that file uses (a `Side` or a `Row` under its
  parent's `Props`): it goes in `<parent folder>/components/<name>/<Name>.tsx` with its own `Props`. A file holds one
  component and its plain helper functions. Inline a component only where extracting it would be actively misleading,
  and say why in a comment. **Before finishing, check every `.tsx` you touched:** `grep -cE '^(export )?function [A-Z]' <file>`
  must say 1 (a plain helper is lowercase). Lint cannot see this one.
- **A component that chooses between branches keeps only the choosing.** A branch with more than a few elements, or its own
  state, is a child, and the parent holds the conditionals (`{locked && <ArenaLockedIn />}` then `{!locked && <ArenaChoosing />}`)
  with the detail in the children. A child reads what it needs from the store or its own hook and takes a prop only for what
  the parent alone knows (a list item, a slot). **Never pass a value down only for a deeper component to read (prop tunnelling).**
- **A component's props interface is called `Props` and is not exported.** It stays in the component's file.
- **A blank line between sibling JSX elements**, in the DOM and in a react-three-fiber tree. The `<circleGeometry>` and
  the `<meshBasicMaterial>` inside a `<mesh>` are siblings, and so are three `<span>`s in a row. Two elements pressed
  together read as one block; a line between them shows the structure at a glance. Prettier keeps these lines but never
  adds one, and no lint rule here can insert them, so this is on you.
- **Never a ternary in JSX, anywhere: not between elements, not in an attribute.** Choosing between elements is two
  conditionals, one per branch, each with the condition written out (`!condition` for the other):
  `{loading && <Spinner />}` then `{!loading && <Done />}`, not `{loading ? <Spinner /> : <Done />}`. Never `cond ? <A /> : null`
  either; that is `{cond && <A />}`. When a branch is more than one element, wrap them in a fragment inside the `&&`:
  `{picture && (<><planeGeometry /><meshBasicMaterial /></>)}`. When a branch grows past a few elements or has a name of its own,
  make it a component (`DummyPicture`, `DummyPlaceholder`) and write `{picture && <DummyPicture picture={picture} />}`. A value
  for an attribute (a `key`, a colour, a class) that depends on a condition comes from a small named `function` with early returns,
  below the component, never an inline ternary. A ternary is for a plain value outside JSX, as the root `AGENTS.md` says, and even
  there only as a last resort.
- **Per-frame values never go through React state.** A r3f component reads the world with `gameState()` inside `useFrame`;
  see the State section of `webapp/AGENTS.md`.
