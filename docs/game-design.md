# Game design

The rules of gunsmith as decided in planning (2026-11-12). Numbers marked *tunable* live in one config and are expected to
change in play. Anything marked *stretch* is not part of the first pass.

## The idea

A 1v1 top-down 2D shooter with fog of war. Before a match, each player writes, in plain language, the weapons that will
lie around the arena and the arena itself. The twist: weapons are a **shared pool** at random spots, so a wildly
overpowered weapon you ask for may end up in your opponent's hands. An AI judge chooses the more interesting arena prompt.
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
| **library** | A player's saved weapons and arenas. Private; limited slots per account. |
| **pre-round** | Prompt entry, generation and the reveal before round 1. |
| **reveal** | The screen (about 30 s, *tunable*) showing the arena, weapon names and stats. |
| **practice arena** | The solo arena with practice dummies, where a player can also spend credits to make and save weapons. |
| **guest** | A player who is not signed in: built-in weapons and arenas only. |

## Controls

WASD move, mouse aim (360°), Ctrl or C crouch, **1** default rifle, **2** the carried custom weapon. Reload, pick up and
drop keys are decided in the fuzzy frontend and kept in one key-binding config. Desktop only.

## A match

1. **Pre-round.** Both players submit within a window (about 60 s, *tunable*).
   - Weapons are submitted one at a time (two each). **The opponent's first weapon prompt is visible once you have
     submitted yours**, so you see it before writing your second. If the opponent has not yet submitted their first, you may
     still submit your second, and you see theirs only if it exists by then.
   - Arena prompts are **blind until you have submitted yours**; then you see the opponent's.
   - Generation then runs. A lone arena prompt wins by default; no prompts means a built-in arena. Generation that times out
     falls back to the built-in pool for that item and the credit is refunded.
2. **Reveal** (about 30 s): the arena preview and the four weapons with their stats and power rating.
3. **Rounds.** Best of three, one life each, 100 HP, no healing. Pickups and spawns are random every round but **evenly
   spaced**, so neither player can know them ahead of time. The arena and weapons stay the same for all rounds.
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
- **Power is capped, not balanced.** Each stat has a wide hard cap set by what physics, the 20 Hz tick and performance can
  carry. Inside the caps the weapon is used as written. The reveal screen shows a code-computed **power rating**, so the
  gamble is visible. Nothing is silently nerfed.
- The AI-authored names and descriptions pass deterministic length, charset and blocklist checks.

## Arenas

- A **tile grid** (size *tunable*) of floor, indestructible wall, penetrable cover and similar classes, with **up to three
  height levels (stories)** on the first pass.
- **Stairs** are the only way to change height. Each connection has a visible stair flight and landing on both levels;
  players cannot walk across other height boundaries. No L1/L2/L3 labels appear on the arena during play.
- **Indestructible walls** block every weapon, always. Cover blocks some weapons and is penetrated by others.
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
  **Higher ground** extends vision and sees over lower cover; **lower ground cannot see up**.
- **Crouch** hides you behind cover and increases forward vision range. Keep the same cone angle and aim direction;
  walls and height still block vision. Crouching **substantially slows movement**, leaving you easier to hit; this
  is its intended tradeoff. The range bonus and slowdown are tunable. Protection depends on whether the incoming weapon
  penetrates that cover.
- **Sound:** a hidden opponent can be heard within a hearing range. The server sends only a **direction quantised to about
  8 sectors**, never a position. Crouching is quieter. Weapon sounds are synthesised in the browser from the weapon's
  `sound` block; other sounds are pre-rendered files.

## Players, rooms and rating

- **Guests** can play (practice arena, private rooms, public queue) with the built-in pool; signing in with Google
  (opt-in) unlocks credits and the library.
- **Private room:** strictly 1v1 plus spectators (up to 8, *tunable*). Spectators see a **delayed full view** with a
  **host-set delay**.
- **Public queue:** FIFO with a rating window that widens over time, and a small Elo.
- **Disconnects:** 30 s to reconnect, then the round is forfeited; no input for about 60 s counts as idle and is treated
  the same.
- **History:** a match history list (result, rating change, arena, weapons). *Stretch:* replays.

## Credits and the library

- 10 credits a day, reset at 00:00 UTC. Weapon 1, arena 1, edit-from-base 1, a rejected prompt 0.5; reusing a saved item is
  free. *Stretch:* paying for more.
- Prompt limits: weapon 150 tokens, arena 250 (*tunable*). Over the limit is rejected before any model call at the
  rejection price.
- The library is private. Limits on saved weapons and arenas are **per account and never expire** (numbers to be decided; one
  config). *Stretch:* a paid upgrade for more slots; a public gallery.

## Out of scope for the first pass

Mobile and touch play, accessibility features, other languages (English only, hard-coded), health or ammo pickups, a
public gallery, paid credits, replays, bots as opponents (a small scripted bot exists, in `engine/src/opponent/`, as a target to test weapons and arenas
against while the game is built, not as a feature; and practice dummies).

## Tunables checklist

Tick rate (20 Hz), arena size, HP (100), round timer, ring timing and damage, pre-round window (60 s), reveal length (30 s),
spectator cap (8) and default delay, library slot limits, per-stat power caps, rating window, prompt token limits, credit
prices, daily budget numbers (`docs/cost-and-budget.md`).
