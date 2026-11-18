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
- `match/room/MatchRoom.ts` is the match as plain state, no network: seats, what each seat last asked for, the engine's world, the tick. `match/Match.ts` only feeds it frames and a clock and sends what it answers. `match/messages/` parses what a client sends (`unknown` until parsed; the engine then caps what an input may ask for): an `input` frame (`ParseInputMessage`) or a `ready` frame (`ParseReadyMessage`).
- **Rounds and the match are the room's.** A room's world carries a best of three (`startMatch`), which `playStep` scores as each round ends. A decided round freezes until **both seats send `ready`**; then `MatchRoom` begins the next round (`nextRound`: the score kept, both fighters restored to their starting places) or, once the match is decided, a fresh match. A `ready` while the round is still being fought is ignored, so a seat cannot ask ahead. Each snapshot also carries `ready {player, opponent}` (who has asked, from that seat's side); it is only flags, so it tells nothing about where anyone is. There is no ring and no pickup in a room yet.
- **A seat is kept for its person (reconnect, 2026-11-18).** Each seat is given a secret `token` in the `joined` frame (sent once on **every** connection); a browser shows it as `?token=` on the socket URL to get the same seat back (`MatchRoom.reconnect`). Before the match begins a seat that leaves is simply given back (its token is void); after it, `leave` freezes the fighter (its ask is zeroed; it stays in the world and hittable) and the seat waits for the reconnect window (below). A token that is not a seat's is an ordinary newcomer's: with both seats held the socket is closed `4409 room-full`. If the seat's old connection is still open when the token arrives it is closed `4410 replaced`. Both codes mean "do not come back" to the browser. Rebinding **forgets what the seat had reached** (`ack`, its held input): a returning page counts its inputs from zero again, and an old `ack` would make the server drop every one of them as stale. `Match` ignores frames and closes from a socket that no longer holds the seat, so a late `close` cannot freeze the seat's new connection. If both players are away the Durable Object may be evicted and the room's state lost (a known limit).
- **The room does not wait for ever (2026-11-18).** Each seat has a clock of how long it has been silent, counted in the game time `MatchRoom.tick` plays (no wall clock in `MatchRoom`), and checked **one step at a time** so that of two seats running out in one stretch the first is the one that forfeits. It restarts when the seat's person leaves or comes back, **asks for something new** (`forfeit/AskChanged`: the browser's own rule, so the heartbeat repeating the same ask does not count), clicks "Next round", and for both seats when a round is decided or begins. A seat whose person is away may be silent 30 s (`reconnectSeconds`), one who is there 60 s (`idleSeconds`; `DefaultForfeitLimits`). Then it **forfeits**: a round being fought goes to the other seat (`forfeit/ForfeitRound`, scored with the engine's `scoreRound`, so two forfeits lose the match as two lost rounds do); a decided round that was waiting for this seat to click has the _next_ round forfeited as it begins, leaving the other seat the usual "Next round"; a decided match forfeits nothing. **Both seats running out together forfeit nothing** (two people gone is a stall, not a win). The clock stops with the last connection (`Match` clears its interval), so a room everyone has left does not run down. Specs shorten the limits with `?reconnectSeconds=` and `?idleSeconds=` on the page address: the webapp passes them on the socket URL, `Match` reads them from the room's **first** connection only (`forfeit-limits/ParseForfeitLimits`: never longer than the real limits, never under a second, non-numbers ignored).
- `ai/` is budget's: AI credits and spend (`docs/cost-and-budget.md`). Each domain has one root file, a Durable Object (`credits/CreditLedger.ts`, one per account; `spend/SpendLedger.ts`, the one global), that only wires; the decisions are plain **synchronous** classes beneath it (`credits/account/CreditAccount.ts`, `spend/meter/SpendMeter.ts`). Keep them synchronous: the object runs one request at a time, so no `await` between a read and its write is what makes a reserve atomic. Time is passed in as a parameter (only the Durable Object reads the clock). `utc/UtcDay.ts` is shared by both.
- **Fog is the engine's** (`@gunsmith/engine/seat/ViewOfSeat`): the server sends each seat exactly `viewOfSeat(world, seat)`, so a hidden fighter is absent from the frame. Never build a snapshot another way. `TwoBrowsersHidingFromEachOther` reads the received frames to prove it.
- The arena is a copy of the webapp's duel arena (`match/room/arena/MatchArenaRows.ts`) until arenas come from rooms.

## Conventions

- **Decide in plain functions and plain classes; keep the runtime at the edge.** A class is for state (`MatchRoom`) or the Durable Object itself.
- Property tests (`fast-check`, `match/property-tests/**/*Invariants.test.ts`: the room's in `match-room/` with its arbitraries, `step-checks/` and `score-checks/` beneath it, the parser's beside it) are left out of `pnpm checks` and run with `pnpm test:properties`, as the engine's do.
- Tests run in plain node (`vitest.config.ts`): `@cloudflare/vitest-pool-workers` peers on vitest 4 and the workspace is on 5. A route takes a `Request` and an `ApiEnvironment`, so a test passes a fake `MATCHES` namespace.
- Pacing is `match/tick/MatchTick.ts`: a clock 30 times a second plays the engine's 1/60 s steps that real time owes (`StepsOwed`, so a late timer does not slow the game) and sends a snapshot after each. The browser predicts its own fighter and blends the other between snapshots (`webapp/src/online/`), so 30 is enough; at 20 the plain local-feeling game was choppy only because nothing smoothed it. The wire carries `seq` on each input and `ack` (`seq`, `held`) on each snapshot (`@gunsmith/shared/online/types/InputAck`) so the browser knows which of its inputs the server has played.
- Not built yet, on purpose: sign-in, D1/Drizzle, the matchmaker, the closing ring and pickup in a room, an "opponent is away" notice for the player who stays, spectators, rate limiting, recordings. Add each when a spec needs it.

## Running

```bash
pnpm api:dev                 # the Worker on :8787 (API_PORT=8790 pnpm api:dev for another port)
pnpm start                   # the webapp; its /api proxy (with WebSockets) points at :8787, or at API_URL
```

For an acceptance run, serve the build with `API_URL=http://localhost:<worker port> pnpm --filter @gunsmith/webapp exec vite preview --port <port> --strictPort`, and point `WEBAPP_URL` at it. Use your own ports and stop only your own servers.
