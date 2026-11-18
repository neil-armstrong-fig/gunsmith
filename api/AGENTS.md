# AGENTS.md: api

The Cloudflare Worker: one Worker serves the site (static assets) and `/api/*` from the same origin, so there is no CORS and the
session cookie will be same-site. Root `AGENTS.md` still applies. The design is `docs/match-netcode.md` (rooms, the tick, fog) and
`docs/ai-hosting.md` (the AI pipeline runs inside this Worker). Modelled on janggi's `api/`.

## Import boundaries

`api/` may import `@gunsmith/shared`, `@gunsmith/engine` and `@gunsmith/ai` (`eslint.config.js`). **Nothing imports it**: the webapp
and the acceptance specs reach it over HTTP and WebSocket, so a frame's shape is written out on both sides (`webapp/src/online/types/`).
Import with the `@src/*` alias.

## What is here

- `ApiWorker.ts` is the runtime's front door and, with `match/Match.ts`, the only code that touches the Workers runtime. Keep them to wiring: they are not unit tested.
- `router/HandleApiRequest.ts` answers `POST /api/rooms` (a friend code, from `rooms/`) and hands a WebSocket upgrade on `/api/rooms/<code>/socket` to that room's `Match` Durable Object.
- `match/room/MatchRoom.ts` is the match as plain state, no network: seats, what each seat last asked for, the engine's world, the tick. `match/Match.ts` only feeds it frames and a clock and sends what it answers. `match/messages/` parses what a client sends (`unknown` until parsed; the engine then caps what an input may ask for).
- `ai/` is budget's: AI credits and spend (`docs/cost-and-budget.md`). Each domain has one root file, a Durable Object (`credits/CreditLedger.ts`, one per account; `spend/SpendLedger.ts`, the one global), that only wires; the decisions are plain **synchronous** classes beneath it (`credits/account/CreditAccount.ts`, `spend/meter/SpendMeter.ts`). Keep them synchronous: the object runs one request at a time, so no `await` between a read and its write is what makes a reserve atomic. Time is passed in as a parameter (only the Durable Object reads the clock). `utc/UtcDay.ts` is shared by both.
- **Fog is the engine's** (`@gunsmith/engine/seat/ViewOfSeat`): the server sends each seat exactly `viewOfSeat(world, seat)`, so a hidden fighter is absent from the frame. Never build a snapshot another way. `TwoBrowsersHidingFromEachOther` reads the received frames to prove it.
- The arena is a copy of the webapp's duel arena (`match/room/arena/MatchArenaRows.ts`) until arenas come from rooms.

## Conventions

- **Decide in plain functions and plain classes; keep the runtime at the edge.** A class is for state (`MatchRoom`) or the Durable Object itself.
- Property tests (`fast-check`, `match/property-tests/*Invariants.test.ts`) are left out of `pnpm checks` and run with `pnpm test:properties`, as the engine's do.
- Tests run in plain node (`vitest.config.ts`): `@cloudflare/vitest-pool-workers` peers on vitest 4 and the workspace is on 5. A route takes a `Request` and an `ApiEnvironment`, so a test passes a fake `MATCHES` namespace.
- Pacing is `match/tick/MatchTick.ts`: a clock 30 times a second plays the engine's 1/60 s steps that real time owes (`StepsOwed`, so a late timer does not slow the game) and sends a snapshot after each. The browser predicts its own fighter and blends the other between snapshots (`webapp/src/online/`), so 30 is enough; at 20 the plain local-feeling game was choppy only because nothing smoothed it. The wire carries `seq` on each input and `ack` (`seq`, `held`) on each snapshot (`@gunsmith/shared/online/types/InputAck`) so the browser knows which of its inputs the server has played.
- Not built yet, on purpose: sign-in, D1/Drizzle, the matchmaker, reconnect and idle forfeit, spectators, rate limiting, recordings. Add each when a spec needs it.

## Running

```bash
pnpm api:dev                 # the Worker on :8787 (API_PORT=8790 pnpm api:dev for another port)
pnpm start                   # the webapp; its /api proxy (with WebSockets) points at :8787, or at API_URL
```

For an acceptance run, serve the build with `API_URL=http://localhost:<worker port> pnpm --filter @gunsmith/webapp exec vite preview --port <port> --strictPort`, and point `WEBAPP_URL` at it. Use your own ports and stop only your own servers.
