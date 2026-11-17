# Match netcode, fog and rooms

The design of real-time play. Modelled on janggi's `docs/online-play.md` (read it for the sign-in and room-token flow,
which is unchanged), but the game is real-time, so the room is a ticking authority. Status: design; `build` keeps it in step
with the code (`TODO-server.md`).

The 2026-11-15 [fair-play research and handoff](art/fair-play-research.md)
adds sign-in for public play, recording, reports and silent restricted matchmaking.
These are design decisions; the online controls are not implemented yet.

## Principles

1. **The server is the authority.** Clients send *inputs*, never positions or hits. The server simulates and decides hits.
2. **Fog is enforced at the source.** A snapshot sent to a player contains only what that player can see. A hidden
   opponent is absent from the packet; their position cannot be recovered by inspecting traffic. This is an acceptance
   criterion.
3. **One deterministic engine.** `engine/` runs in the browser (prediction), in the `Match` Durable Object (authority) and
   in tests. Same seed, same inputs, same result.
4. **Sounds leak direction, not position.** A hidden opponent firing or moving within hearing range produces an event with a
   direction quantised to about 8 sectors and no coordinates. Crouching is quieter.

## Pieces

| Piece | Responsibility |
| ----- | -------------- |
| API Worker | Authenticates the session, routes HTTP and WebSocket upgrades, hands the account id to the right Durable Object in a trusted internal header (as janggi does) |
| `Match` Durable Object | One per match. Fixed 20 Hz tick, input validation, authoritative state, fog-filtered snapshots, round and match logic, reconnect window, spectator fan-out, alarm cleanup |
| `Matchmaker` Durable Object | Singleton. Holds the public queue in memory/SQLite and serialises pairing (D1 has no transactions, so two matchers could pair one player twice). Creates a `Match` and hands both players its code |
| D1 | Accounts, sessions, credits, library, ratings, match history. Not the queue |
| Client | Sends inputs with a sequence number, predicts its own player with the shared engine, reconciles to the server, interpolates the others |

## The tick

- 20 Hz (*tunable*; 30 Hz is possible if the free-plan spike allows). Each tick: apply validated inputs, step the engine,
  resolve hits, update the closing ring, compute per-player visibility, send each player their snapshot.
- Input validation: rate-limit and clamp (a move vector's length, a fire request only if the weapon can fire), reject
  out-of-order sequence numbers, ignore anything for a dead player.
- A ticking object stays awake for the match. A Durable Object with a running loop cannot hibernate, so cost grows with match
  length (the free-plan spike in `TODO-server.md` tracks this). Between matches the object is idle and can be evicted.

## Snapshots

Per player, per tick (delta-compressed later if needed):

- Their own full state (position, health, ammo, weapon, crouch, last processed input sequence).
- Visible opponents and projectiles only, using the same visibility the client uses to draw fog.
- Pickups they can see, ring state, round timer and score.
- Sound events: a direction sector, a kind, and a loudness, only within hearing range.

Private-room spectators receive a **full view delayed** by the host's setting
(a ring buffer of full snapshots in the Durable Object). Public full-view
spectating and replay access wait until the whole match ends, not just a round;
a delay alone can still help a player through a second account.

## Visibility

- The equipped weapon's prompt configures the base forward-cone angle/range; standing/crouching modifies it. The cone
  follows aim throughout 360° rotation. Walls/height clip detailed vision; higher ground extends vision and sees over
  lower cover, lower ground cannot see up. Crouching increases range with the same angle/occlusion.
- Separate **terrain presentation** from **dynamic entity visibility**: known static arena layout may remain dimly
  visible outside the cone. Terrain detail, players and items are revealed inside the current unoccluded cone.
  A dim terrain layer never licenses sending hidden opponent, pickup, projectile or exact-position effect data.
- Tests rotate/move the cone, switch weapon/stance, check the dim-versus-detailed terrain and assert which entities
  are visible. Newly visible entities use current pose/weapon/effect state; concealed ones leave no stale marker.
- Computed in `engine/` on a tile grid with three height levels (a visibility polygon or shadow-cast over tiles). It is the
  single source for the server's snapshot filter, the client's fog shader and the tests.
- Property tests: visibility is symmetric where it should be, never passes an indestructible wall, and a hidden entity
  is never in a snapshot.

## Reconnect and forfeits

- A disconnected player has 30 s to return; their character is frozen in place and still vulnerable. After that the round is
  forfeited; two forfeits lose the match. No input for about 60 s counts as idle and is treated the same.
- The client re-sends `introduce` on every connection and the server replies with a full snapshot (janggi's pattern).
- Close code for "match is gone, stop retrying", as janggi's 4404.

## Rooms

- **Private room:** a friend code, strictly two seats plus up to 8 spectators. The host sets the spectator delay. A
  spectator may request a seat only when a player leaves.
- **Public queue:** Google sign-in required. FIFO with a widening rating window
  within each of two pools, normal and restricted. Never widen across that boundary.
  Normal matches update a small Elo in D1; restricted matches grant no normal rating gains.
- **Guests** may play practice and private rooms with the built-in pool, not the
  public queue; their ratings are not kept.

## Wire messages (draft; `build` owns the final in `shared/`)

Discriminated unions on `kind`, JSON text frames to begin with.

- Client: `introduce`, `input {seq, move, aim, fire, reload, crouch, slot, interact}`, `submit-prompt {kind, text}`, `ready`,
  `leave`.
- Server: `snapshot`, `pre-round {phase, deadline, opponentFirstWeaponPrompt?}`, `generation-progress {step}`,
  `reveal {arena, weapons[]}`, `round-start`, `round-end`, `match-end`, `sound {sector, kind}`, `rejected {reason}`,
  `opponent-left`, `opponent-back`.

## Anti-cheat stance

Inputs are validated and everything else is authoritative. Speed, fire rate,
ammo and cooldowns are enforced on the server. Bound input processing per tick;
neither packet volume nor client timestamps grant extra simulation time.
Hidden information must be absent from every outbound channel, including seeds
that reveal hidden state, reconnects, effects and the state hook.

Automated aiming can still choose legal inputs using visible information.
Authority prevents forged hits; it does not prove a human chose the aim.
Authenticate WebSocket upgrades and seats, validate origins, and enforce
message limits after upgrade. See the research for sources and acceptance criteria.

## Recordings and reports (planned)

Journal authoritative inputs/events and periodic checkpoints, with resolved
definitions, engine/replay versions and separate per-player information evidence.
Use bounded Durable Object storage batches, private R2 chunks and D1 metadata.
Upload retries must not block simulation; incomplete evidence stays explicitly incomplete.
Players and moderators can watch completed matches; either participant may share
a sanitized replay. Ordinary hosted recordings expire after 14 days; flagged
evidence after 90 days. Shared exports exclude raw prompts and security evidence.

Participant reports attach match evidence and are deduplicated; report counts
alone never lower trust. Silent restrictions combine calibrated automatic
corroboration with human review/override. Recovery requires completed clean
matches resistant to farming, never inactivity; an empty restricted pool may
prevent recovery. Keep manual correction and never match into the normal pool
as a timeout fallback. Behavioral detectors start in observation mode.

## Open questions

- Delta compression and binary frames: only if the free-plan spike or bandwidth says so.
- The exact reconcile algorithm and interpolation delay: tuned in play.
