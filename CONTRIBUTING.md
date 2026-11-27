# Contributing

Gunsmith is a personal project, built mostly by AI coding agents working to the rules in [AGENTS.md](AGENTS.md). Issues and pull
requests are welcome; open an issue first for anything larger than a fix, so the change can be agreed before it is built. The open
work is in [MVP-TODO.md](MVP-TODO.md) and [POSTMVP-TODO.md](POSTMVP-TODO.md).

## Setup and checks

Use the Node version in `.nvmrc` and the pnpm version pinned in `package.json`, then run `pnpm install --frozen-lockfile`. Install
FFmpeg and glslang (`brew install ffmpeg glslang` on macOS; the `ffmpeg` and `glslang-tools` packages on Ubuntu). Run `pnpm start` for
the local game.

`pnpm checks` runs repository checks, lint, formatting checks, strict type checks and unit tests. For browser coverage, run
`pnpm install-browsers` once, then `pnpm acceptance-tests:preview`. On Linux, install Chromium's dependencies with
`pnpm --filter @gunsmith/acceptance-tests exec playwright install-deps chromium`.

Engine and online changes may also need `pnpm test:properties`; property tests keep their seeds and counterexamples but stay outside
the gate. AI evals are described in [the AI package instructions](ai/AGENTS.md): fake evals prove the harness, local evals need
Ollama, and paid evals need a provider key and a spend limit. Ordinary checks and acceptance tests make no model calls.

## Working on a change

Read [AGENTS.md](AGENTS.md) and the `AGENTS.md` of every package you touch: they hold the coding standards, the folder rules and the
package boundaries that lint enforces. [Operations](docs/agent-reference/Operations.md) covers commands, gotchas and CI.

Write the acceptance criterion first and watch it fail for the right reason, then build the smallest slice that passes it. Prove
cover you did not watch fail by mutation: break what the test claims to cover and confirm it fails. Format only the files you touched.

Keep credentials and local settings out of commits (`.env*` and `.dev.vars*` are ignored; [MANUAL-SETUP-STEPS.md](MANUAL-SETUP-STEPS.md) names the values they hold). Ask
before adding a dependency. Use Conventional Commits (`feat:`, `fix:`, `chore:`).

## Documentation

Describe implemented behaviour separately from accepted future design and open proposals. Keep the decisions and reproducible evidence
that future work needs, not session transcripts. See the [documentation index](docs/README.md).
