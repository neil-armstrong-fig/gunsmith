# Contributing

Gunsmith is currently focused on a fun local game. Read the [current milestone and backlog](TODO.md) before extending menus, online services or shared contracts.

## Setup and checks

Use the Node version in `.nvmrc` and pinned pnpm from `package.json`, then run `pnpm install --frozen-lockfile`. Install FFmpeg and glslang (`brew install ffmpeg glslang` on macOS; `ffmpeg glslang-tools` packages on Ubuntu). Run `pnpm start` for the local game.

`pnpm checks` runs repository checks, lint, formatting checks, strict typechecking and unit tests. For browser coverage, run `pnpm install-browsers` once, then `pnpm acceptance-tests:preview`. On Linux, install Chromium dependencies with `pnpm --filter @gunsmith/acceptance-tests exec playwright install-deps chromium` (requires system package permissions).

Engine changes may also require `pnpm test:properties`. Properties preserve seeds and counterexamples but remain outside the release gate. AI eval commands and spending rules are in [the AI package instructions](ai/AGENTS.md): fake evals prove the harness, local evals need Ollama, and paid evals require explicit authorization and the existing cumulative spend guard. Ordinary checks and acceptance tests make no model calls.

## Working on a change

Follow [AGENTS.md](AGENTS.md) and every applicable package instruction file. The maintained workflow uses seven personas, persistent development worktrees and an integration-only main checkout. [Operations](docs/agent-reference/Operations.md#development-worktrees-and-the-integration-checkout) describes the flow; [HANDOFF.md](HANDOFF.md) identifies ownership and shared contracts.

Write acceptance criteria first, observe the intended failure, implement the smallest slice, and prove inherited coverage with a deliberate mutation. Run the relevant checks and report their real results. Review folder/helper placement separately from lint. Format only touched files.

Keep credentials and local settings out of commits. Dependency changes, commits, pushes, paid calls and live infrastructure require the authorization described in the root instructions. Use Conventional Commits when a commit is requested.

## Documentation

Describe implemented behavior separately from accepted future design and unresolved proposals. Keep decisions and reproducible evidence that future work needs; avoid session transcripts and duplicate delivery narratives. Update your current checklist and handoff without changing another owner’s active tasks. See the [documentation index](docs/README.md).
