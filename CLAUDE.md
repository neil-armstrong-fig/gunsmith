@AGENTS.md

# Claude Code notes

- `AGENTS.md` is the source of truth for standards.
- Start a session with one line, e.g. "You are build, continue the TODO." The personas are `build`, `ai` and `art`; their
  start prompts are in `HANDOFF.md`.
- **Every fresh session reads all of `HANDOFF.md`, `TODO.md`, `TODO-build.md`, `TODO-ai.md` and `TODO-art.md` first,** whichever
  persona it is, and says what the other two are up to before starting (the sync protocol is at the top of `TODO.md`).
- The user's global rules still apply: pnpm, strict TypeScript without `any`, run typecheck, lint and the relevant tests
  before saying a change is done, Playwright with role/test-id locators and no `waitForTimeout`, Conventional Commits,
  and never commit or push unless asked.
