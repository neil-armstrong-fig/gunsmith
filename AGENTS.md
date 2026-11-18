# AGENTS.md

Gunsmith is a deterministic 1v1 top-down shooter: players use AI to define weapons and arenas.
The project is on M1: build a fun full-screen game first, acceptance-test first; add menus and contracts when needed.
Packages: webapp, engine, acceptance-tests, shared, ai and a minimal api (private rooms and the match) exist; infra remains planned.
Use pnpm. Design decisions are in `docs/`; add research only when losing it would require re-deriving a decision.
Read [operational reference](docs/agent-reference/Operations.md) for command details, worktrees, environment gotchas, planned deployment and manual setup.

## The seven personas

Work is split into **play, engine, ai, server, budget, art and ship**. Each has a TODO-<persona>.md feeding the shared TODO.md board; restart with "You are engine, continue the TODO." Claude defaults: play, engine, ai, server, budget. Codex defaults: art, ship. Ownership follows the persona, not the product/model, and HANDOFF.md defines concrete boundaries. The old build role is retired. Keep consumed contract changes in HANDOFF.md first and coordinate shared-file writers.

**Every fresh session follows the startup protocol in `TODO.md`:** read current shared status and handoff, then your own current checklist and task references. The other checklists and historical archives are read only for dependencies. Before coding, explicitly read every applicable package and nested instruction file; they are not guaranteed to be preloaded. Recover truncated reads before continuing.
At the end, update your checklist, status and a concise handoff delivery.

## Checkout workflow

**Main is integration-only; develop in persona worktrees.** This includes code, tests, assets, tooling and development docs. Check your checkout at startup, merge committed main into your clean persona branch before new work/delivery, and carry TODO/status/handoff updates with that work. Integrate reviewed commits into a clean main checkout, validate, then have each persona merge main back before continuing. Worktrees persist across slices; never remove/rebase/repurpose another session's work. Main permits merge conflict resolution, combined validation and integration records, not feature/fix development. Follow [the worktree flow](docs/agent-reference/Operations.md#development-worktrees-and-the-integration-checkout) and existing git-write authorization rules. To integrate persona branches into main, use the `integrate-worktrees` skill ([`.agents/skills/integrate-worktrees/SKILL.md`](.agents/skills/integrate-worktrees/SKILL.md), shared by Claude and Codex).
**Every fresh turn in a persona worktree (any model) starts with `git log --oneline HEAD..main`.** If main moved, merge it before any work, resolve the conflicts yourself (shared docs keep both sides, code is merged by meaning), re-run the affected checks and commit the merge unasked as `chore: merge main into <branch>`; that merge is the one commit made without being asked. Stop and ask only when the two sides disagree on behaviour, not on wording; never stash or discard to make it possible.

## Before changing code

1. Identify every package in scope and read each applicable package `AGENTS.md` in full before
   planning — root, package, and any nested one on the path to the file you're editing.
2. Inspect the nearest existing implementation and test that establish the local structure and
   naming. If none exists, say so (for a new package, identify the existing workspace pattern you are following).
3. Before editing, say which instruction files and reference implementations you used,
   the behavior in scope, and which failing test or check will demonstrate it. Work in
   small, independently reviewable changes; validate each before expanding the change.
4. Before finishing, re-read the applicable instructions and perform a standards-only review of
   the diff. Fix deviations that lint and tests cannot detect before reporting completion.
   **The folder rule is the one most often missed** (a new domain folder with everything loose at its root, types
   beside code, a helper with one caller beside it): for every folder you created or added to, `ls` it, count the
   callers of each root file with `grep`, and move the one-caller helpers beneath their caller and the types to
   `types/` *before* you run the final checks. Say in your summary that you did it.

## How work is done here

This project is Acceptance Test Driven. **Write the acceptance test first**, watch it fail for the
right reason, then make it pass. See `acceptance-tests/AGENTS.md` for its DSL and specification rules.

Build the playable game before menus or surrounding contracts: the canvas fills the screen, overlays appear only when needed, and every mechanic starts as an acceptance spec. Do not build screens or fakes ahead of the game.

**Nothing goes in `shared/` until a second package needs it.** No pre-emptive schemas, adapters or constants. Code
lives in the one package that uses it, and moves to `shared/` only when another package genuinely imports it.

**A passing test proves nothing until you have watched it fail.** For a test written after the code,
or cover you inherited, the way to prove it is **mutation**: break what the test claims to cover, run
it, confirm it fails, and fails for the right reason. This has repeatedly caught tests that asserted
nothing. Two things worth knowing while doing it: **`grep` the file after mutating** (Prettier has
twice silently reflowed a multi-line mutation away, giving a false-green run), and **note which tests
fell** (the wrong ones, or too many, means the cover is in the wrong place). For an eval the same rule
holds: degrade the prompt or use a weaker model, and the score must fall.

**Do not wrap a unit test file in a top-level `describe`.** The filename already names the single
export it covers; write `it(...)` at the top level. Reach for `describe` only where it earns its
keep — ask **does the `describe` name say something the `it` names would otherwise each have to
say?** Yes for a subject with states (`beforeEach` narrowing per step) or genuinely different setups;
no for a plain function (a flat list of `it(...)`) or as a filing cabinet with nothing in `beforeEach`.

This governs unit tests only — acceptance specs are the opposite case, their `given`/`when` nesting
**is** the specification. See `acceptance-tests/AGENTS.md`.

### Rules specific to this game

- **The engine is deterministic.** A fixed timestep, a seeded random generator, no `Date.now()` or `Math.random()`
  inside `engine/`. A match is reproducible from its seed and recorded inputs. This is what makes the property tests,
  the replay stretch goal and the server/client agreement possible.
- **Fog is enforced on the server.** A snapshot sent to a player never contains an opponent they cannot see, and a
  sound event carries only a quantised direction (about 8 sectors), never a position. This is an acceptance criterion,
  not a rendering detail. See `docs/match-netcode.md`.
- **Model output is `unknown` until zod has parsed it.** Code, never the model, enforces stat caps, arena validity
  and wall rules. The AI proposes; the engine disposes. See `docs/ai-pipeline.md`.
- **No acceptance test calls an LLM or spends credits.** They run against the fake AI adapter (`HANDOFF.md`).
- **State is Zustand, and the game store holds the engine's `World` and nothing else.** The loop writes the world to the
  game store once a frame; `useFrame` reads it with `gameState()`, which causes no render; a component reads only slow
  values worked out from it, through a selector (`useGameStore(useShallow(selectAmmoReadout))`). Per-frame values never go
  through React state. Menus, lobby, library, credits and meta state belong in a separate app store (built when a screen
  needs it), never in the game store: lint allows the game store to import only Zustand, the engine and `game/`, and a test
  pins its keys. See `webapp/AGENTS.md` and `docs/state-management.md`.
- **Player text is data, never instructions.** Prompts reach a model inside delimited data blocks, in randomised
  order where two are compared, and the judge's output is a schema, not prose.

## Code style

- Keep import declarations contiguous, with no blank lines between them, and one blank line before code.
- Use property shorthand when key and value have the same name (`{voice}`, not `{voice: voice}`).

Prettier owns formatting (`pnpm format`). What it won't tell you:

- **Declare functions below their callers**, so a file reads top to bottom. Module-level helpers must be
  `function` declarations — an arrow `const` is in the temporal dead zone above its line.
  A `const` function nested inside another function may stay in place.
- **A file with a class holds that class and nothing else but the interfaces it needs** (and its constants, above
  it). No loose `function` above or below it: a helper that uses the class's state or is used by one method is a
  `private` method, below its caller; a helper that is pure and worth testing alone is its own file in a subfolder
  beneath. A function that must run in the browser (`page.evaluate`, `addInitScript`) is an inline arrow at the call,
  since a method does not serialise. An interface used by one other file lives in a `types/` folder beside it; one a
  class leans on only as a parameter is still named, never inline.
- **Extract pure logic and hooks when they're easy to test alone.** A small function local to a TSX
  component — an event handler closing over its props/hooks/dispatch — may stay inline when that
  keeps the JSX readable.
- **A filename is PascalCase and names its single export**, including hooks (`UseMoveSelection.ts`
  exports `useMoveSelection`). A test takes the name of its subject and sits beside it.
- **A file lives as close to its caller as it can, in a subdirectory of it.** A helper used by one
  file goes in a folder beneath it, never beside it; something shared rises to its callers' nearest
  common ancestor and no further. **Do not extract a file for what only one file uses and nobody tunes or tests alone**: a
  fixed sentence or message, a one-off constant, a three-line helper stays in its one caller, a `const` above its use (the
  player-facing "invalid" message lives in the file that returns it). A constant gets its own file only when it is a tunable
  (a number or limit set by play, read by more than one file or by a test) or is shared.
- **A file with helper folders of its own gets a folder of its own** when it shares its folder with files of other
  subjects. Its helpers go in subfolders inside that folder, never beside it: `look/look-of-fighter/LookOfFighter.ts` with
  `look/look-of-fighter/places-of-fighter/LookSampling.ts`, not `look/LookOfFighter.ts` and `look/places-of-fighter/` next to
  `look/TeamBlue.ts`. (A domain root whose files all share one subject, like `engine/src/ring/`, is already that folder.)
- **A folder's root is its table of contents.** The handful of entry points that say what's in there
  stay at the top; everything else drops into a subfolder named for its subject. Around six files is
  where a folder starts reading as a bucket rather than a list — a smell, not a hard limit.
- **Name a folder for its subject, not its shape.** `visibility/`, `weapons/`, `pre-round/` say what's
  inside; `buttons/`, `helpers/`, `styles/` describe the files' form and leave a reader no wiser.
  `utils/` is a shape name too — the last resort, not the default home for a plain function.
- **A domain folder is its root file and nothing else loose.** `<domain>/` holds the entry point (the handful that say what
  the domain does), a `<domain>/types/` folder for every interface and type alias (never beside the file that uses it),
  and a subfolder named for its subject for each helper only the root file uses (`player/walking/PlayerSpeed.ts` serves
  `MovePlayer.ts`). A constant or helper two domains share stays at the root of the domain that owns it
  (`player/PlayerRadius.ts`), or rises to the nearest common ancestor of its callers and no further. Several entry points
  may share a root only when they share the subject (`match/` has four, all the match); a file that clearly does not is a
  different domain with a folder of its own. A package's `src/` follows the same rule: one entry file (`engine/src/Engine.ts`)
  and domain folders.
- **A union of literals is read off the list, not written twice.** Declare it `as const` and derive
  the type from it (`(typeof X)[number]`), so the two can't drift apart. A union with no runtime list
  to keep it honest stays a plain `type`.
- **Use interfaces by default for object shapes, with one field per line.** Use a type alias when its syntax is needed (unions, function types, mapped/conditional types or derivation from runtime values).
- **Give every type a name.** No inline object type or union in a signature, a field, or a `Record`'s
  value. Exception: a component's own `Props`.
- **Use `undefined` for absence, never `null`, inside the codebase.** Optional
  fields and values that may be missing use `?` or `| undefined`, so callers
  never have to handle both. Where a browser, SDK or established wire contract
  supplies or requires `null`, translate it to or from `undefined` at that
  boundary; do not expose the nullable type any further. Tests may use `null`
  to exercise untrusted input or to implement an SDK-shaped fake. Omit absent
  optional JSON fields unless the established wire format explicitly requires
  `null`.
- **Three parameters at most; past that, take one object.** What a function acts *through* (an
  engine, an audio context) may stay positional ahead of the object.
- **Name a variable after the type it holds**, where the type has a name of its own.
- **Use gunsmith's own terms** (the glossary is in `docs/game-design.md`): *match* (best of three), *round*, *arena*,
  *weapon*, *pickup*, *vision*, *fog*, *crouch*, *closing ring*, *credit*, *library*, *power rating*, *pre-round*,
  *reveal*. Identifiers are plain English; do not invent synonyms for these (no `lobbyGame`, `map`, `gun`, `stormZone`
  where the glossary has a word).
- **A guard sits directly under the line it checks**, no blank line between them: `const thing = build();` then
  `if (!thing) return undefined;`. A blank line goes after the guard, before the next block. This holds for
  an `if` that reads the variable declared on the line above it, whatever it returns; a guard that checks a
  parameter or an earlier line is separated as usual.
- **An `if` with an `else` is braced on both sides**, even when each branch is one statement. ESLint can't enforce
  this (`curly` allows braceless one-liners), so it is on you.
- **Return early, before building what the guard doesn't need.** Put the cheap guard first and compute the value
  after it passes (`if (state !== "playing") return state;` *then* ask the engine), not the other way round.
- **Nest, don't repeat a condition.** Two `if`s sharing a leading test (`if (a && b) …` then `if (a) …`) become
  `if (a) { if (b) … }`.
- **A ternary is the last resort**, for a plain value with no clearer form; prefer guards, `&&` or a small
  function. (JSX and `clsx` have their own rules in `webapp/AGENTS.md` and `webapp/src/react/AGENTS.md`; in JSX it is never a ternary, always `&&` conditionals.)
  **Never `return cond ? a : b`** — write `if (cond) { return a; }` then `return b;`, and unroll a chain
  (`a ? x : b ? y : z`) into one `if` per condition, separated by blank lines. A `const x = cond ? a : b`
  becomes a small function that returns early, not a `let` assigned in branches.
- **An arrow whose expression body runs onto a second line takes a block and a `return`**
  (`() => { return this || that; }`), whether it is a multi-line call or an `||` chain. An arrow whose
  body is wrapped in parentheses (`=> ({ ... })`, `=> (<li />)`) is fine as it is. A body on one line stays
  an expression.
- **A body on a line of its own is braced** (`curly: multi-line`, ESLint-enforced; Prettier won't add
  or remove braces).
- **No `../` imports** — use the `@src/*` alias each package maps to its own `src/`.
- **Explicit return types** on function declarations; `import type` for type-only imports
  (`verbatimModuleSyntax` is on).
- Prefer a named `export function` over `export default`.
- **Strict TypeScript; no `any`** (use `unknown` and narrow), and no non-null `!` without a comment saying why.

`webapp/src/react/AGENTS.md` has the two rules this doesn't cover — components are the one place
"declare below callers" doesn't apply, and JSX has its own layout conventions.

## Import boundaries

Enforced by ESLint (`no-restricted-imports`, in `shared/config/eslint.base.js`) — a violation fails
`pnpm checks`.

| From                | May import                                                                          |
| ------------------- | ----------------------------------------------------------------------------------- |
| `shared/`           | nothing else in the workspace — it is the bottom of the graph                       |
| `engine/`           | itself and `@gunsmith/shared`                                                       |
| `ai/`               | itself, `@gunsmith/shared` and `@gunsmith/engine` (to validate and rate its output); only `api/` imports it |
| `webapp/`           | itself, `@gunsmith/shared` and `@gunsmith/engine`                                   |
| `acceptance-tests/` | itself and `@gunsmith/shared`                                                       |
| `api/`              | itself, `@gunsmith/shared`, `@gunsmith/engine` and `@gunsmith/ai`; nothing imports it |
| `infra/`            | itself only; nothing imports it                                                     |

`api/` imports `ai/` **(decided 2026-11-12, `docs/ai-hosting.md`)**: the pipeline runs inside the Worker with LangChain.js
and LangGraph.js, because the user declined LangSmith Plus, which a hosted LangGraph deployment needs. Add `@gunsmith/ai` to
`api/`'s `allowedPackages` when `api/` is scaffolded. `ai/` must stay Workers-safe (no Node-only APIs; `nodejs_compat`
only), and the graph stays host-agnostic (`langgraph.json`) so a hosted deployment remains an option later.

A workspace package added later is **denied by default**; add it to `allowedPackages` in that
package's `eslint.config.js` to permit it. Packages enforce their own internal layering too — see the
`AGENTS.md` in each (webapp's covers `react/` → `store/` → `game/`, plus `audio/`).

Flat config replaces a rule rather than merging it, so **never write `"no-restricted-imports"`
directly in an override** — call `restrictedImports({...})` from `shared/config/eslint.base.js`, or
the boundary is silently dropped for those files.

## More than one session may be running

Several agent sessions can be open on this working tree at once (the seven personas may share it), and nothing
tells you when another one starts. The working tree, the index, the stash and the editor's language servers are all shared.

- **Re-read a file immediately before you change it** — a targeted edit beats rewriting a whole file,
  which silently reverts whatever landed in between.
- **Never run a command that moves work you didn't write:** `git stash`, `git checkout`/`restore`,
  `git reset`, `git read-tree`, `git clean`. `stash` is the worst — `pop` brings everything back
  unstaged, flattening a staging split someone was relying on.
- **Never run repo-wide rewrites** (`pnpm format`, `pnpm lint:fix`) — format only the files you touched.
- **Reading is always safe** (`git status`, `git diff`, `pnpm lint`, `pnpm test`), but `git status`
  shows everyone's work — don't report it as a description of yours.
- **Stay in your folders** (`HANDOFF.md` has the ownership table). The user may sometimes copy work between
  checkouts by hand, so keep each persona's output confined to its own paths.

`pgrep -a claude` shows what else is live — each session is one line carrying
`--permission-prompt-tool`. More than one and you're not alone: ask first, naming the command and why.

## Keeping the context small

Every tool result is re-read on each later API call in the session, so a large one is paid for again
and again, not once.

- **Read the part of a file you need, not the file** — `grep -n` to find it, `sed -n` to read it.
  Never `cat` a source file, and never sweep a directory with a `for f in …; do cat "$f"; done` loop.
- **Do not assume package instructions are already in context.** Read each applicable file explicitly, record the sources used, and re-read after relevant changes. Avoid repeating unchanged reads.
- **Keep these files worth what they cost.** Every session pays for the ones in its chain in full —
  when you add to an `AGENTS.md`, take out whatever it supersedes.
- **A batched check is the cheap shape.** `pnpm checks` is quiet when it passes — never skip a check
  to save context; skipping is what costs.

## Ask before

- **Adding or upgrading any dependency.** Versions are exact-pinned in the `catalog:` of `pnpm-workspace.yaml`, several
  deliberately (see Gotchas), and a supply-chain policy there rejects packages published in the last seven days.
  Nothing updates them automatically, so **when there has been a gap since the last commit** — a few days or more
  between it and the work now starting — check the catalog's versions (`pnpm outdated -r`) before beginning, and
  say which are behind and which of those are held on purpose (Gotchas). Propose the bumps; do not apply them unasked.
- **Deleting or rebuilding `pnpm-lock.yaml`.** It re-resolves every transitive dependency.
- **Any git commit, branch or push.** The standing exceptions, agreed in advance: the worktree integration flow in
  `docs/agent-reference/Operations.md`, including a worktree session's **merge of `main` into its own branch at the start of a
  turn**. Pushing never is. Commit messages, once asked, are Conventional Commits (`feat:`, `fix:`,
  `chore:` …), small and focused.
- **Any git command that writes to the index, the stash or the working tree.**
- **Anything that spends money or changes live infrastructure:** an LLM call outside the evals, a provider key, a
  Cloudflare deploy, a budget or kill-switch change, enabling Workers Paid or LangSmith Plus.
- **Reading or printing secrets.** Never read `.env*`, `.dev.vars`, `appsettings.<Environment>.json` or user-secrets.
  Ask the user to run the command with `!` or to say whether a value is set.

## Tool configuration

Base config lives in `shared/config/` — change a rule there, not in a package. A package's
`eslint.config.js` must call `baseConfig({tsconfigRootDir: import.meta.dirname, ...})` or it throws:
the editor runs one ESLint server for the whole workspace, and without an explicit root the parser
mixes up which package a file belongs to.

## Enforced standards and limits

The shared ESLint config enforces return-ternary prohibition, three parameters maximum, named object types at boundaries, function ordering and module-level helper declarations (including tests), and one public subject per source file. Runtime values may keep their directly derived types; a class may keep interfaces it needs. Component-local `Props` and the two acceptance/eval mapping interfaces retain their documented exceptions.
Folder ownership, helper placement and design quality still require the explicit review above. Do not describe a passing gate as proof of those properties.
`pnpm checks` also checks instruction chains against a 65536-byte budget and validates executable art scripts. Frozen HTML receives syntax checks, not a claim of usability or complete standards compliance. New standalone art scripts receive JavaScript lint checks.
Codex's global `project_doc_max_bytes` should be 65536; start a fresh session after changing configuration or startup guidance. Model and reasoning settings are unchanged.
