# Game design

The intended rules of Gunsmith; online and generation features are planned unless identified as current local behavior. Numbers marked *tunable* live in one config and are expected to
change in play. Anything marked *stretch* is not part of the first pass.

## The idea

A 1v1 top-down 2D shooter with fog of war. Before a match, each player writes, in plain language, the weapons that will
lie around the arena and the arena itself. The twist: weapons are a **shared pool** at random spots, so a wildly
overpowered weapon you ask for may end up in your opponent's hands. Each player may put an arena forward, and the players, not an AI, pick which one is played.
Code, not the AI, enforces every rule.

## Glossary (use these words in code and copy)

| Term | Meaning |
| ---- | ------- |
| **match** | A best-of-three between two players. |
| **round** | One life each, until one player is dead or the ring decides it. |
| **arena** | The tile grid with walls, cover and up to three height levels. Defined once per match. |
| **weapon** | A numeric-stats-plus-behavior item with a `sound` block. Each player defines two; four are in the arena. |
| **default rifle** | The mid-stat assault rifle everyone starts with (key 1). Unlimited ammo, with reload. |
| **pickup** | A custom weapon lying in the arena. |
| **vision** | Detailed terrain and players/items revealed in a forward cone set by the equipped weapon and stance, following aim and blocked by walls/height. |
| **fog** | Dim, low-detail terrain outside the cone; players/items there remain concealed. Dynamic visibility is enforced on the server. |
| **crouch** | Ctrl or C: hide behind cover and increase forward vision range. |
| **closing ring** | The battle-royale-style ring of fire that closes toward a random point after the round timer. |
| **power rating** | A code-computed number shown on the reveal screen for each weapon. |
| **credit** | The daily AI currency. 10 a day, reset at 00:00 UTC. |
| **workshop** | Where weapons and arenas are made: the practice arena plus a panel, no timer, no opponent. Making never happens in a match. |
| **shelf** | What a player has saved (weapons and arenas, each with its own limit, set by the server), including things they did not like or use. The local stand-in for the library. |
| **library** | A player's saved weapons and arenas, kept on the account. Private; limited spaces per account, set by the server. |
| **pre-round** | Choosing weapons and the arena from the shelf and the built-ins, the arena pick and the reveal before round 1. Nothing is written or generated here. |
| **reveal** | The screen (about 30 s, *tunable*) showing the arena, weapon names and stats. |
| **practice arena** | The solo arena with practice dummies; the workshop's panel opens here, with a one-click **Try it** for a made weapon. |
| **guest** | A player who is not signed in: built-in weapons and arenas only. |

## Controls

WASD move, mouse aim (360°), Ctrl or C crouch, **1** default rifle, **2** the carried custom weapon. Current local pickups are collected by walking onto them; future drop/reload controls must follow the runtime input bindings and acceptance specs. Desktop only.

## A match

1. **Pre-round (decided 2026-11-18).** Both players **choose** within a window (about 60 s, *tunable*), from their shelf and the
   built-ins; nothing is written or generated in a match, because making a weapon takes seconds and writing it takes far longer
   (see [the selection concept](selection-concept/README.md)).
   - Each player locks in two weapons, one at a time. **The opponent's first weapon is visible once you have locked in yours**
     (the weapon and its stats, never anyone's prompt), so you see it before choosing your second.
   - The arena is blind until you lock in yours, then you see the opponent's. A player may choose any arena on their shelf or a
     built-in, and every arena choice shows a preview.
   - A player who chooses nothing gets the built-ins, and the match starts as it does today.
   - **The players pick the arena (decided 2026-11-18; no AI judge).** With two different arenas, both players see both.
     Each player picks one arena, picks nothing, or chooses **random**. The same pick is played. Two different picks: a seeded coin
     chooses between them. Only one player picks and the other picks nothing: that pick is played. One picks and the other chooses
     random: a draw chooses between the pick and random, and if random wins, a second draw chooses one of the two arenas. Both
     choose random, or nobody picks: one of the two arenas is drawn at random.
2. **Reveal** (about 30 s): the arena preview and the four weapons with their stats and power rating.
3. **Rounds.** Best of three, one life each, 100 HP, no healing. Pickups and spawns are random every round but **evenly
   spaced**, so neither player can know them ahead of time. The arena and weapons stay the same for all rounds. If both
   fighters fall in the same step (a shot each, or the ring), the round is a **draw**: nobody scores and the next round
   follows.
4. **Stalemate.** After the round timer a **closing ring** forces both players together at a random point on the map.
   Timer, speed and damage are *tunable*.
5. **End.** The result, the rating change (public games), and the chance to favourite and rename weapons and arenas
   from that match, including the opponent's.

## Weapons

- Numeric stats (damage, rate of fire, spread, projectile speed, range, magazine, reserve, reload time, and so on) plus a
  **behavior** from a closed list (hitscan, projectile, shotgun, beam, bouncing, explosive, homing, and so on), plus a
  **penetration** property and a **`sound` block** (synthesised-audio parameters). Draft fields: `docs/schemas.md`.
- A player carries the **default rifle and one custom weapon**. To pick up another, drop the custom one first.
- Custom weapons have a magazine and a finite reserve. There are **no health, armour or ammo pickups**.
- **A pickup is one weapon lying in the arena each round (decided 2026-11-16, built as slice 1).** It lies on the tile that is
  as near as can be to equally far from both fighters by the way they would walk (steps, with stairs the only way across a
  drop), drawn from the round's seed among the tiles that tie. Walking onto it (within half a tile) takes it, no key: it
  replaces the weapon in the second slot and is in hand, with a full magazine and its reserve. Either fighter can take it by
  the same rule; if both are in reach the nearer wins, an exact tie is the opponent's, and a fighter who falls that step
  takes nothing. Only the player sees it, inside their cone, like any other item. Slice 1 uses a fixed placeholder weapon
  and the bot seeks it when it can win the race; the open question is whether it should replace the weapon in hand instead.
- **Power is bounded and balanced in code.** The engine applies stat ranges, a damage cap and a deterministic power ceiling. Generated preferences guide downward adjustments; unused budget and deliberate weakness remain. Calibration through gameplay is still required.

- The AI-authored names and descriptions pass deterministic length, charset and blocklist checks.

## Arenas

- A **tile grid** (size *tunable*) of floor, indestructible wall, penetrable cover and similar classes, with **up to three
  height levels (stories)** on the first pass.
- **Stairs** are the only way to change height. Each connection has a visible stair flight and landing on both levels;
  players cannot walk across other height boundaries. No L1/L2/L3 labels appear on the arena during play.
- **Indestructible walls** block every weapon, always. Cover blocks some weapons and is penetrated by others (the penetrable class is
  not built). **Low cover blocks** are built (2026-11-18, `c` in a drawing, low ground only): impassable like a wall, but low. A
  standing fighter sees over one; a crouched fighter does not, and one crouched with a block right beside them is hidden: see
  [Crouch](#vision-height-crouch-and-sound).
- After the player/AI definitions are resolved, code finalises and validates the arena and places spawns/pickups.
  Fairness uses traversable routes through stairs, not straight-line distance alone, including access to pickups and
  escape from the closing ring. The prompt may suggest placement; code enforces the constraints.
- Built-in arenas meet the same checks and are deliberately authored and playtested as the game's quality reference.
- Placement proposal to test: weight the highest-rated weapon towards contested central space, while retaining
  randomness and fair routes from both spawns. This must not override minimum spacing or force a fixed centre spawn.

## Vision, height, crouch and sound

- **Vision:** the arena remains dimly visible at low detail outside a forward cone. Inside it, terrain detail and
  players/items are revealed, subject to walls and height. The equipped weapon defines the cone's base angle/range
  from its prompt; standing versus crouching modifies it. As you aim/spin through 360°, the detailed cone sweeps around
  with you. Dim terrain does not reveal hidden players/items. The omitted-stat policy remains pending in `HANDOFF.md`.
  **Higher ground** sees over lower ground; **lower ground cannot see up**. Built (2026-11-14): a tile blocks a viewer's sight if it is a wall or on a level higher than the
  viewer's eye level (on a stair, its upper level), so from the low ground a platform and everything on it is hidden and its edge hides what is behind it, while from a platform the low
  ground below shows. A bullet follows the same rule (built 2026-11-14): it keeps the level of its shooter's eye and stops at a wall or at any tile higher than that, so from the low ground a platform's face stops your shots, and from a platform they fly out over the low ground; what you cannot see you cannot shoot. Ideas to try after playing it: a longer reach for higher ground ("extends vision"), and "sees over lower cover" once cover has a height.
- **Crouch** hides you behind cover and increases forward vision range. Keep the same cone angle and aim direction;
  walls and height still block vision. Crouching **substantially slows movement**, leaving you easier to hit; this
  is its intended tradeoff. The range bonus and slowdown are tunable. Protection depends on whether the incoming weapon
  penetrates that cover.
  **Low cover, sight (built 2026-11-18, the user's rule; the bullet half is next):** a cover block is low, so a *standing* viewer
  sees over it; a *crouched* viewer cannot see past it, unless they are on a higher level than the block (higher ground sees over
  lower cover). A *crouched* fighter with a cover block on the line to them, no farther from them than `COVER_REACH_TILES`
  (1 tile, a tunable for play), is hidden from every viewer, high ground included: a block near the viewer hides nobody far
  behind it. A standing fighter behind cover is seen. Bullets are still unaffected by cover; the decided rule is that a
  crouched shooter's bullet stops at cover, a standing one's flies over, and a bullet that crossed cover cannot hurt a crouched
  fighter, by the same line test as sight ("what you cannot see you cannot shoot"). The bot never crouches yet, so it only
  cannot see a crouched player behind cover.
- **Sound:** a hidden opponent can be heard within a hearing range. The server sends only a **direction quantised to about
  8 sectors**, never a position. Crouching is quieter. Weapon sounds are synthesised in the browser from the weapon's
  `sound` block; other sounds are pre-rendered files.

## Players, rooms and rating

- **Guests** can play practice and private rooms with the built-in pool.
  Google sign-in unlocks public matchmaking, credits and the library.
- **Private room:** strictly 1v1 plus spectators (up to 8, *tunable*). Spectators see a **delayed full view** with a
  **host-set delay**.
- **Public queue:** sign-in required; FIFO with a widening rating window within
  normal and restricted pools, never across them. Silent restrictions use
  corroborated evidence, automatic decisions after calibration, and human review.
  Clean completed matches can restore trust; inactivity cannot. Restricted
  matches grant no normal rating gains. See [fair play](art/fair-play-research.md).
- **Disconnects:** 30 s to reconnect, then the round is forfeited; no input for about 60 s counts as idle and is treated
  the same.
- **History and recordings (planned with online play):** a match history list
  (result, rating change, arena, weapons), participant reports and completed-match
  replays for players/moderators. Either player may share a sanitized replay.
  Ordinary hosted replays last 14 days; flagged evidence lasts 90 days. Public
  full-view spectators wait until the whole match ends; private rooms retain
  their host-set delay. Recording is data replay, not server video capture.

## Credits and the library

- 10 credits a day, reset at 00:00 UTC. Weapon 1, arena 1, edit-from-base 1, a rejected prompt 0.5; reusing a saved item is
  free, and so is saving anything. Credits are spent in the workshop, never in a match. *Stretch:* paying for more.
- Prompt limits are in **characters**, not tokens (nobody can count tokens): weapon 600, arena 1,000 (*tunable*; the pre-check
  estimates tokens as characters divided by four). The workshop will not make an over-long prompt, so a mistake the player could see
  costs nothing; the server's pre-check stays as the backstop at the rejection price.
- The library is private. A player can save any weapon, arena or prompt, whether or not they liked, used or won with it, and the
  opponent's weapons and arenas after a match (the picture and stats or the map, never the opponent's prompt). Weapons and arenas
  have **separate limits per account, set by the server** (never hard-coded in the page; numbers to be decided) and never expire.
  A full space asks which item to replace and never drops one silently. *Stretch:* a paid upgrade for more spaces; a public gallery.

## Out of scope for the first pass

Accessibility features beyond reduced motion, other languages (English only, hard-coded), health or ammo pickups, server-rendered replay video.

Out of the first pass but **wanted soon after** (the user, 2026-11-18), not abandoned:

- **Mobile and touch play:** a fast follow-up to the first pass.
- **A public gallery** of arenas and weapons.
- **Paid credits**, and possibly spending credits to "pay" another player for access to their arenas or weapons. An idea only: no design, pricing or privacy review yet.

**Bots already work:** the scripted opponent (`engine/src/opponent/`) plays the duel and sparring today, and practice dummies exist. Whether a bot becomes a player-facing mode (a solo match) is open.

## Tunables checklist

Tick rate (20 Hz), arena size, HP (100), round timer, ring timing and damage, pre-round window (60 s), reveal length (30 s),
spectator cap (8) and default delay, library slot limits, per-stat power caps, rating window, prompt token limits, credit
prices, daily budget numbers (`docs/cost-and-budget.md`).
