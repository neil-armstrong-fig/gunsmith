# AGENTS.md

Gunsmith: a 1v1 top-down 2D shooter with fog of war, where the players write (via AI) the weapons and the arena before
each match. Built with React and react-three-fiber, hosted on Cloudflare, with the AI side on LangChain, LangGraph and
LangSmith. It follows the janggi model (`/Users/neilarmstrong/Development/Personal/janggi`) for structure, standards
and acceptance-test-driven development.

> **Status: the game's core is being built, test first.** Five of the seven packages exist (`webapp/`,
> `engine/`, `acceptance-tests/`, `shared/`, `ai/`); `api/` and `infra/` are planned. `pnpm checks`, `pnpm start`,
> `pnpm acceptance-tests` and `pnpm install-browsers` work today; the other commands, CI and deployment below are
> **planned** and become true as `build` builds them (see `TODO-build.md`). Where this file describes a package or command
> that does not exist yet, read "will be". Delete this note when the last of the seven packages lands.

pnpm workspace, seven planned packages (`@gunsmith/*`):

| Package             | Contains                                                                                           |
| ------------------- | -------------------------------------------------------------------------------------------------- |
| `webapp/`           | The React app. Vite, React 19, Zustand, Tailwind v4, react-three-fiber.                            |
| `acceptance-tests/` | The acceptance-test DSL and specs, run by Playwright.                                              |
| `shared/`           | The gunsmith vocabulary, wire types, the weapon and arena zod schemas, and base tool config.       |
| `engine/`           | The deterministic simulation and rules: movement, projectiles, visibility, power rating, arena checks. |
| `ai/`               | The LangChain / LangGraph pipeline, judges, token pre-check, and the evals.                         |
| `api/`              | The Cloudflare Worker: sign-in, credits, library, the match and matchmaker Durable Objects.         |
| `infra/`            | The Cloudflare infrastructure as code (Alchemy).                                                    |

Each has its own `AGENTS.md` (written when the package is scaffolded), and webapp has one per subfolder besides.

`docs/` holds research a decision in the code rests on, linked from the code it justifies. Add a document only when
losing the reasoning would mean someone re-deriving it. Today: `docs/fuzzy-frontend.md`, `docs/game-design.md`, `docs/architecture.md`,
`docs/match-netcode.md`, `docs/schemas.md`, `docs/ai-pipeline.md`, `docs/ai-hosting.md`, `docs/ai-visual-generation.md`, `docs/cost-and-budget.md`,
`docs/privacy-and-data.md`, `docs/focused-case-study.md`, `docs/state-management.md`, `docs/art/`.

## The three builders

Work is split across three personas so a session can be cleared and resumed with one line
("You are build, continue the TODO."). **`build`** builds the game and project, **`ai`** builds the AI, **`art`** (Codex)
makes art, text and audio. Stay inside your own folders; a contract another persona plugs into changes only in
`HANDOFF.md` first.

**Every fresh session starts by reading all of these, whichever persona it is:** this file, `HANDOFF.md` (table,
ownership, contracts, start prompts), `TODO.md` (the shared north-star path, the status board and the blockers) and **all
three persona checklists**: `TODO-build.md`, `TODO-ai.md`, `TODO-art.md`. Then say, in a few lines, which milestone the
project is on, what the other two personas are doing or waiting on, and what you are about to do. At the end of the
session, tick your own checklist, update your row on the status board in `TODO.md`, and add a line to the delivery log in
`HANDOFF.md`. The sync protocol is spelled out at the top of `TODO.md`.

## Before changing code

1. Identify every package in scope and read each applicable package `AGENTS.md` in full before
   planning — root, package, and any nested one on the path to the file you're editing.
2. Inspect the nearest existing implementation and test that establish the local structure and
   naming. If none exists, say so (for a new package, name the janggi file you are following instead).
3. Before editing, say which instruction files and reference implementations you used.
4. Before finishing, re-read the applicable instructions and perform a standards-only review of
   the diff. Fix deviations that lint and tests cannot detect before reporting completion.

## Commands (planned)

While working, scope tools to what you changed (e.g. `pnpm --filter @gunsmith/engine exec vitest run
src/visibility`). Before finishing:

```bash
pnpm checks              # lint + format check + type check + unit tests, every package
pnpm format              # apply Prettier; fixes most format:check failures
pnpm lint:fix            # apply the ESLint fixes that are automatic
pnpm start               # dev server on http://localhost:3000 — fine for a few specs, or work in progress
pnpm start:preview       # compile, then serve the build on http://localhost:3000 — what CI tests
pnpm acceptance-tests    # needs one of the two running in another terminal; preview for the whole suite
pnpm install-browsers    # one-time Playwright chromium download
pnpm api:dev             # the API Worker locally (`wrangler dev`, port 8787); see `api/AGENTS.md`
pnpm test:properties     # the property tests, which `pnpm checks` leaves out
pnpm evals               # the AI evals (`ai`); costs money, so `pnpm checks` leaves them out
```

`pnpm checks` is the gate (`--max-warnings=0`). It deliberately leaves out the property tests — a
fresh seed every run means a failure isn't reproducible from the same commit, so it can't gate a
deploy — and the evals, which call a model, cost money, and are non-deterministic. Run `pnpm test:properties`
before finishing work in `engine/src/`, and `pnpm evals` before finishing work in `ai/src/` prompts or graph nodes.

## How work is done here

This project is Acceptance Test Driven. **Write the acceptance test first**, watch it fail for the
right reason, then make it pass. See `acceptance-tests/AGENTS.md` (written by `build`, modelled on janggi's).

**There is no exception.** A fuzzy-frontend phase (every screen clickable with fakes, built without tests,
`docs/fuzzy-frontend.md`) was tried on 2026-11-12 and dropped at the user's request: it produced a pile of menus and
contracts around a game that was not yet fun. The order now is **a fun game first, then everything built around it**:
the canvas fills the whole screen, menus appear over it only when needed, and each mechanic starts as an acceptance spec.
Do not build screens or fakes ahead of the game.

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

Prettier owns formatting (`pnpm format`). What it won't tell you:

- **Declare functions below their callers**, so a file reads top to bottom. Helpers must be
  `function` declarations — an arrow `const` is in the temporal dead zone above its line.
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
  common ancestor and no further.
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
  (`player/PlayerRadius.ts`), or rises to the nearest common ancestor of its callers and no further.
- **A union of literals is read off the list, not written twice.** Declare it `as const` and derive
  the type from it (`(typeof X)[number]`), so the two can't drift apart. A union with no runtime list
  to keep it honest stays a plain `type`.
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
  function. (JSX and `clsx` have their own rules in `webapp/AGENTS.md` and `webapp/src/react/AGENTS.md`.)
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

Several agent sessions can be open on this working tree at once (`build`, `ai` and `art` may share it), and nothing
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

## Working on a feature in a worktree

**Work in the main checkout, however big the change. Use a worktree only when asked.** The rest of
this section is for then. `EnterWorktree` makes one under `.claude/worktrees/<name>` on branch
`worktree-<name>` (`git worktree add` does the same by hand).

1. **Install its own dependencies** — a worktree has no `node_modules`:
   `pnpm install --frozen-lockfile --offline`.
2. **The files are yours; the repository isn't.** Branches, remotes and the stash are shared with
   every other checkout, so the concurrency rules above still hold — above all, never `git stash` in
   a worktree. Set work aside with a WIP commit on your own branch instead.
3. **Run the app on a port of your own** and point specs at it (`pnpm start:preview --port 3100`, or
   `pnpm start --port 3100 --strictPort` while writing a spec, then
   `WEBAPP_URL=http://localhost:3100` for Playwright), or you'll test somebody else's code.
4. **Verify before handing over**: `pnpm checks` and the acceptance suite against your own port.
5. **Stop, and leave the work uncommitted.** Say what changed and what you ran — the branch is
   reviewed and committed by hand.
6. **Integrate from the main checkout only, once that commit exists.** Default to a real merge
   (`git -C /path/to/main-checkout merge worktree-<name>`), not a fast-forward — it's the safer choice
   where main may have moved on. For a linear history instead, rebase the worktree branch onto main
   first and fast-forward main onto the result (`git merge --ff-only worktree-<name>`); ask before
   rewriting a worktree branch that another worktree or session might still be building on. **A clean text
   merge proves nothing**: re-run `pnpm checks` (and the acceptance suite where both sides touched the same
   area) from the main checkout after either route, then tear down: `git worktree remove
   .claude/worktrees/<name>` and `git branch -d worktree-<name>`.
7. **Kill any dev server you started by process, not wrapper** — `pkill -f "vite.*--port <port>"`, or
   the next `--strictPort` start fails with "Port is already in use".

Pushing is the human's, always.

## Keeping the context small

Every tool result is re-read on each later API call in the session, so a large one is paid for again
and again, not once.

- **Read the part of a file you need, not the file** — `grep -n` to find it, `sed -n` to read it.
  Never `cat` a source file, and never sweep a directory with a `for f in …; do cat "$f"; done` loop.
- **This file and the current package's `AGENTS.md` are already in your context** — both are loaded
  before your first turn. Don't `cat` either.
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
- **Any git commit, branch or push.** The one standing exception: the worktree-merge flow above,
  agreed in advance. Pushing never is. Commit messages, once asked, are Conventional Commits (`feat:`, `fix:`,
  `chore:` …), small and focused.
- **Any git command that writes to the index, the stash or the working tree.**
- **Anything that spends money or changes live infrastructure:** an LLM call outside the evals, a provider key, a
  Cloudflare deploy, a budget or kill-switch change, enabling Workers Paid or LangSmith Plus.
- **Reading or printing secrets.** Never read `.env*`, `.dev.vars`, `appsettings.<Environment>.json` or user-secrets.
  Ask the user to run the command with `!` or to say whether a value is set.

## Gotchas that will waste your time

These are janggi's, carried over until each is re-checked against the versions actually installed.

- **Do not upgrade TypeScript past 6.0.3.** Re-checked 2026-11-12: TS 7.0.2 is `latest`, but `typescript-eslint` 8.72.x
  still declares `typescript >=4.8.4 <6.1.0`, so ESLint cannot read TS 7. Re-check when typescript-eslint's peer range
  moves.
- **Port 3000 may already be taken by janggi's dev server** (`strictPort` makes `pnpm start` fail rather than move). Do not
  kill it; run `pnpm --filter @gunsmith/webapp exec vite --port 3100 --strictPort` instead.
- **Do not add `baseUrl` to a tsconfig.** TS 6 made it an error — `paths` already resolve relative to
  the tsconfig's own directory.
- **`pnpm setup` and `pnpm deploy` are built-in pnpm commands**, not ours. The scripts are `pnpm install-browsers` and
  `pnpm --filter @gunsmith/infra provision`.
- **Root-level files get no Prettier config from a package directory** — `AGENTS.md` and `docs/`
  fall back to 80 columns and rewrap content you never touched. Edit them by hand.
- **The canvas is not in the DOM.** react-three-fiber draws to a `<canvas>`, so Playwright cannot find a player or a
  wall by role. The DSL reads game state through one deliberate state hook (`HANDOFF.md`); it is shipped code, so keep it
  read-only and tiny.
- On Linux/WSL, Chromium needs system libraries once:
  `pnpm --filter @gunsmith/acceptance-tests exec playwright install-deps chromium` (needs sudo), or
  every acceptance test fails on browser launch with `libnspr4.so`.
- **LangSmith on Workers:** with `nodejs_compat_populate_process_env` the tracing variables are read (checked 2026-11-12;
  without the flag, pass the config to the client explicitly). **Flush on every request path with
  `ctx.waitUntil(awaitAllCallbacks())`**: an unflushed trace is lost and the orphaned batch can hang the next request that
  awaits a flush (`docs/ai-hosting.md`). Avoid streaming until it is verified.
- **Cloudflare has no hard spend cap.** Budget alerts are email only. The kill switch is ours (`docs/cost-and-budget.md`).

## CI and deployment (planned)

`ci.yml` runs `checks`, then `acceptance-tests` against a production build (`vite preview`), then
deploys `main` with Alchemy (`deploy`: the database, its migrations, the Worker with its static assets and the Durable
Objects, from `infra/`), gated on both, and does nothing until the `CLOUDFLARE_API_TOKEN` secret exists. After the deploy it
runs the acceptance suite once more against the live address. `property-tests.yml` and `evals.yml` run on push/PR
and on demand, and go **red on failure but gate nothing** (a fresh seed, or a model, means a failure isn't reproducible
from the same commit) — except that `evals.yml` is the AI regression gate **for changes under `ai/`**; `ai` decides
whether that becomes a required check, as `docs/ai-pipeline.md` explains. **If branch protection is ever turned on,
leave the property tests out of required checks.**

One Worker serves both the site (static assets) and `/api/*` (`run_worker_first: ["/api/*"]`) at
`gunsmith.neilarmstrong.dev`, DNS at Cloudflare, so the session cookie is same-origin. Environments: local and `prod`
only (a throwaway Cloudflare account for the first deploy).

## Manual setup

Some of this project lives outside the repository: the Google OAuth client, the Cloudflare API token and Worker domain,
the AI Gateway and its spend limits, the provider key and its hard cap, the LangSmith key, the Cloudflare budget
alerts, the GitHub secrets. `MANUAL-SETUP-STEPS.md` lists every such step, and why. **Update it in the same pass as any
change that creates, renames or removes one** (a new secret, console setting, DNS record or workflow permission), and
never put an account id, token, secret or personal address in it.

## Tool configuration

Base config lives in `shared/config/` — change a rule there, not in a package. A package's
`eslint.config.js` must call `baseConfig({tsconfigRootDir: import.meta.dirname, ...})` or it throws:
the editor runs one ESLint server for the whole workspace, and without an explicit root the parser
mixes up which package a file belongs to.
