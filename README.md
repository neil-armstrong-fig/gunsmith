# Gunsmith

A 1v1 top-down shooter where players describe weapons and arenas in plain words, and AI builds them. Fight a scripted bot or a
friend in a private room, in a full-screen arena with fog of war, three height levels, crouching, pickups and a closing ring.

![A duel on Twin ridges: the player's vision cone lights the floor between two raised platforms, with the bot beside the centre cover and a weapon pickup](docs/screenshots/terraced-arena.png)

| | |
| --- | --- |
| ![Mid-fight: a bullet in flight, a hit marker on the player and health down to 75](docs/screenshots/duel.png) | ![The pre-round reveal: both loadouts with power ratings and stats, and the chosen arena](docs/screenshots/pre-round-reveal.png) |
| Fog hides anything outside your vision cone. | Before a match, both loadouts and the arena are revealed with their power ratings. |

- **The game:** a deterministic TypeScript engine (fixed timestep, seeded randomness), drawn with React and react-three-fiber.
- **Online:** private rooms by friend code. A Cloudflare Durable Object runs the authoritative match and sends each player only
  what they can see; the browser predicts its own fighter and smooths the other.
- **The workshop:** signed-in players describe a weapon or an arena. A LangGraph pipeline with Claude Haiku proposes it, and code
  validates it, caps its stats and rates its power before anyone can play with it. Saved items can be taken into a room.
- **Built with AI agents**, acceptance-test first. The coding standards and agent workflow are in [AGENTS.md](AGENTS.md).

## Run locally

Use Node from `.nvmrc` and the pnpm version pinned in `package.json`.

```sh
pnpm install --frozen-lockfile
pnpm start
```

Open http://localhost:3000. Local play needs no provider key or cloud account. If that port is taken, run
`pnpm --filter @gunsmith/webapp exec vite --port 3100 --strictPort`.

**Controls:** WASD moves, the mouse aims, the left button fires, Ctrl or C crouches, 1 and 2 switch weapon, and Esc opens the
menu. Walk onto a visible pickup to take it.

For private rooms, also run the API Worker locally with `pnpm api:dev`. Guests can play rooms with the built-in weapons and arenas;
sign-in and generation need the setup in [MANUAL-SETUP-STEPS.md](MANUAL-SETUP-STEPS.md).

## Development

| Package | What it holds |
| --- | --- |
| `engine/` | The deterministic simulation: movement, vision and fog, heights, bullets, the ring, rounds, arena validation and repair, power rating |
| `webapp/` | The React app and game loop, rendering, audio playback and the online client |
| `api/` | The Cloudflare Worker: sign-in, credits and spend limits, the library, generation routes and the `Match` Durable Object |
| `ai/` | The weapon and arena generation pipeline (LangGraph, Claude Haiku), its validation and its evals |
| `shared/` | What more than one package imports, and the shared tool configuration |
| `acceptance-tests/` | Playwright acceptance specifications, written before the code they cover |
| `infra/` | Deployment of the Workers, D1 and Durable Objects (Alchemy) |

```sh
pnpm checks                # lint, formatting, strict type checks and unit tests for every package
pnpm install-browsers      # once, for Playwright's Chromium
pnpm acceptance-tests:preview
```

Checks need FFmpeg and `glslangValidator`. No check or acceptance test calls a model or spends money. See the
[contributor guide](CONTRIBUTING.md) and the [documentation index](docs/README.md). To report a security problem, see [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE). All versions of this repository, including commits made before the license was added, are available under the MIT
License. Third-party fonts and assets keep their own licences, listed in
[webapp/public/references.html](webapp/public/references.html).
