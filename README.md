# Gunsmith

A desktop 1v1 top-down shooter where players will describe weapons and arenas in natural language. Weapons form a shared pool: something powerful you request could end up in your opponent’s hands.

The current build is a full-screen local game with a scripted opponent, a best-of-three match, fog, stairs, crouching, pickups and a closing ring. The AI weapon pipeline exists as a separate package. Online play, in-game generation, accounts and hosted deployment are still planned. The current milestone is making the local game fun.

## Run locally

Use Node from `.nvmrc` and the pnpm version pinned in `package.json`.

```sh
pnpm install --frozen-lockfile
pnpm start
```

Open http://localhost:3000. Local play needs no provider key or cloud account. If that port is occupied, use `pnpm --filter @gunsmith/webapp exec vite --port 3100 --strictPort`.

WASD moves, the mouse aims, the left mouse button fires, Ctrl or C crouches, and 1/2 switches weapon. Walk onto a visible pickup to take it.

## Development

The workspace contains a deterministic TypeScript engine, a React/react-three-fiber webapp, a LangGraph AI pipeline, shared tooling and read-only browser snapshot types, Playwright acceptance tests, and offline audio tooling. The API and infrastructure packages do not exist yet.

Start with the [contributor guide](CONTRIBUTING.md) and [documentation index](docs/README.md). AI-assisted development follows [AGENTS.md](AGENTS.md), the [shared backlog](TODO.md), and [ownership/handoffs](HANDOFF.md).

```sh
pnpm checks
pnpm install-browsers
pnpm acceptance-tests:preview
```

Checks need FFmpeg and `glslangValidator`; browser tests also need Playwright’s Chromium/system dependencies. See the contributor guide for setup and the distinction between deterministic checks, properties and model evals.

License selection remains pending.
