# Match netcode, fog and rooms

The design of real-time play. The planned room is a ticking authority. Sign-in uses OAuth code + PKCE and opaque session tokens ([design](sign-in.md)). Status: initial private-room slice implemented; server keeps it in step
with the code ([MVP-TODO.md](../MVP-TODO.md)); the netcode session owns its feel and fairness (`TODO-netcode.md`).

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
| API Worker | Authenticates the session, routes HTTP and WebSocket upgrades, hands the account id to the right Durable Object in a trusted internal header |
| `Match` Durable Object | One per match. Fixed 30 Hz snapshots (the engine steps at 60 Hz), input validation, authoritative state, fog-filtered snapshots, round and match logic, reconnect window, spectator fan-out, alarm cleanup |
| `Matchmaker` Durable Object | Singleton. Holds the public queue in memory/SQLite and serialises pairing (D1 has no transactions, so two matchers could pair one player twice). Creates a `Match` and hands both players its code |
| D1 | Accounts, sessions, library, ratings, match history. Not the queue, and not credits or spend: those are Durable Objects (a `CreditLedger` per account, one `SpendLedger`; budget, `docs/cost-and-budget.md`) |
| Client | Sends inputs with a sequence number, predicts its own player with the shared engine, reconciles to the server, interpolates the others |

## The tick

- 30 Hz snapshots (*tunable*; the free-plan spike decides whether to go lower). A browser that only drew what it was sent looked choppy at 20 Hz next to the local game (user, 2026-11-17), so the client now predicts its own fighter and blends the other (see Snapshots and the client row above); the server does not need to run faster for it. The clock plays the 1/60 s engine steps real time owes, so a late timer does not slow the match. Each tick: apply validated inputs, step the engine,
  resolve hits, update the closing ring, compute per-player visibility, send each player their snapshot.
- Input validation: rate-limit and clamp (a move vector's length, a fire request only if the weapon can fire), reject
  out-of-order sequence numbers, ignore anything for a dead player.
- A ticking object stays awake for the match. A Durable Object with a running loop cannot hibernate, so cost grows with match
  length (the free-plan spike in `POSTMVP-TODO.md` tracks this). Between matches the object is idle and can be evicted.

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
- **Built (2026-11-18): reconnect.** Each seat gets a secret `token` in `joined`, sent on every connection; a returning
  browser shows it (`?token=` on the socket URL, kept in session storage) and gets the same seat, and the server's next
  snapshot is the full state. The returning page counts its inputs from zero, so the server forgets the seat's `ack` on rebinding.
  Close codes (application codes, both mean "do not come back"): `4409` the room is full, `4410` the seat's person connected
  again elsewhere (the old connection is closed).
- **Built (2026-11-18): the 30 s window and the 60 s idle rule.** Each seat has a clock of how long it has been silent, in game time. It
  restarts when the person leaves or returns, asks for something **new** (the heartbeat repeating the same ask is not new), clicks "Next
  round", and for both seats when a round is decided or begins. Away: 30 s; there but silent: 60 s. Then the seat forfeits: a round being fought
  goes to the other seat and is scored as a lost round (so two forfeits lose the match); a decided round still waiting for that seat to click has
  the next round forfeited as it begins. A decided match forfeits nothing, and two seats running out together forfeit nothing. Specs shorten
  both with `?reconnectSeconds=` and `?idleSeconds=` on the page (passed on the socket URL; only the room's first connection sets them, never
  longer than the real limits or under a second). No on-screen notice of the other player being away yet.

## Rooms

- **Private room:** a friend code, strictly two seats plus up to 8 spectators. The host sets the spectator delay. A
  spectator may request a seat only when a player leaves.
- **Public queue:** Google sign-in required. FIFO with a widening rating window
  within each of two pools, normal and restricted. Never widen across that boundary.
  Normal matches update a small Elo in D1; restricted matches grant no normal rating gains.
- **Guests** may play practice and private rooms with the built-in pool, not the
  public queue; their ratings are not kept.

## Wire messages (draft; server owns the final in `shared/`, once a second package imports it)

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

## Review against the engine (server, 2026-11-17)

What the code gives today, and what the design still needs:

- **Visibility is real but one-sided.** `engine/src/vision/VisibleToPlayer.ts` decides what the *player* sees from
  `ConeOf` and `CanSeePoint`, covering the opponent, pickup, dummies and bullets, as the "single source" principle says.
  It takes a `World` with one `player` and a scripted `opponent`.
- **Gap: two human fighters.** `step(world, input, seconds)` takes one input and thinks for the opponent itself
  (`thinkOpponent`). An authoritative match needs both seats' inputs per step and a view per seat. Engine owns the shape;
  requested in `HANDOFF.md`.
- **Sound (2026-11-20):** `engine/src/sound/` (`hearSound`, `HEARING_RANGES` shot 20, step 8, pickup 12, `direction/SectorOf`, `footsteps/IsFootfall`,
  `loudness/LoudnessOf`). A shot, a footfall or the taking of a weapon by the other fighter within that sound's range, seen or not, becomes
  `{kind: "heard", sound, sector, loudness}` in the listener's own events: sector 0 is north and the rest follow clockwise, eight in all;
  loudness is the near, mid or far third of the sound's range. No place, no distance and **no level for each speaker**: the browser works
  out the ears from the sector and band (`webapp/src/sound/spatial/`), so the wire carries nothing finer than that. Walls do not muffle it;
  A crouched fighter's footfalls are silent. The browser plays authored cues for shots, footfalls and pickups. Each seat's
  `SeatView.events` carries its own reload start, damage and visible hit confirmations. The room gathers events across
  every step of a tick and `OnlineMatch` hands each batch to playback and rendering once. Reload start carries only its
  event kind. The game draws incoming damage feedback on the seat's own fighter. It marks the rendered opponent for an
  outgoing hit only when the latest snapshot includes them and draws the mark while its place is in sight. `TwoBrowsersHearingEachOther`,
  `TwoBrowsersHearingAReload` and `TwoBrowsersSeeingHits` cover the room cues.
  `TwoBrowsersFightingForTheWeapon` covers the room pickup.
- **The first acceptance scenario** is `TwoBrowsersHidingFromEachOther`: it reads the frames each browser *received*, not
  the state hook, because a client sent a hidden opponent and told to hide it would pass a hook check. It pins one wire
  proposal, `{kind: "snapshot", opponent?}` with `opponent` absent when unseen. Nothing moves to `shared/` until a second
  package imports it.
- Wire messages are written by server with consumer review (this doc's earlier "build owns" is retired).
- **Rounds in a room (2026-11-18).** Built as the draft says, with one `ready` instead of `round-start`/`round-end`: the snapshot already
  carries `round` and `match` (scored from each seat's side), so a decided round needs no separate message. A client sends `{kind: "ready"}`;
  it counts only once the round is decided. When both seats have sent it the server begins the next round (score kept) or, after a decided
  match, a fresh match. A snapshot carries `ready {player, opponent}` so a seat can say it is waiting. Specs: `TwoBrowsersPlayingARound`,
  `TwoBrowsersPlayingABestOfThree`. Not built: the pre-round phase, deadlines. A room round has the closing ring and a submachine gun lying fair between the seats (2026-11-20).

## Open questions

- Delta compression and binary frames: only if the free-plan spike or bandwidth says so.
- The exact reconcile algorithm and interpolation delay: tuned in play.
