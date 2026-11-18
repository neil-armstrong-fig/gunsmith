# Weapon and arena schemas (draft)

The data the AI produces and the engine consumes. **Draft, design only.** A first version was coded in `shared/src` on
2026-11-12 and **deleted the same day** at the user's request (game first, nothing in `shared/` until it is shared). The
field lists below and the "As built" notes record what that attempt settled; they are a starting point to re-derive
test-first, not code that exists. The *shape* is what `ai` and `art` plug into. Code, not the AI, enforces the caps (`engine/`), and the model's
output is `unknown` until a schema has parsed it.

## Principles

- A fixed schema, validated in code. A failed parse gets one repair attempt, then a typed failure.
- Closed lists for behavior, penetration and tile classes (`as const` unions read off the list).
- Short plain-text names and descriptions with length, charset and blocklist limits.
- Every number has a hard cap and a floor. Inside them nothing is nerfed; the power rating is shown, not applied.
- Nothing player-written is ever executed or interpolated into a prompt unescaped.

## Weapon (draft fields)

| Field | Type | Notes |
| ----- | ---- | ----- |
| `name` | string, 2 to 24 chars | Plain text; filtered |
| `description` | string, up to 140 chars | Plain text; filtered |
| `behavior` | enum | `hitscan`, `projectile`, `shotgun`, `beam`, `bouncing`, `explosive`, `homing`, and so on (the list is `build`'s to finalise) |
| `damage` | number | Per hit (per pellet for a shotgun). Capped |
| `fireRate` | number | Shots per second. Capped by what a 20 Hz tick can represent |
| `spread` | number | Degrees |
| `projectileSpeed` | number | Tiles per second (projectile-like behaviors) |
| `range` | number | Tiles |
| `magazine` | integer | Rounds before reload |
| `reserve` | integer | Total spare rounds (finite for custom weapons) |
| `reloadTime` | number | Seconds |
| `penetration` | enum | What it passes through (for example `none`, `light-cover`, `heavy-cover`). Never passes indestructible walls |
| `moveSpeedFactor` | number | Carrying slows the player; capped |
| `sound` | object | Synthesis parameters, below |
| `colour` | token | One of the named palette tokens; used for pickup glow and projectiles |

### `sound` block

Parameters for the in-browser Web Audio synthesiser, all clamped, with the whole sound limited in duration and gain. A fuzz
test (`TODO-ai.md`, O4) sets every parameter to its limits. Draft: `wave` (enum), `startFrequency`, `endFrequency`,
`attack`, `decay`, `noiseMix`, `filter` (enum plus cutoff), `gain`, `duration` (at most about 1 s), `voices` (at most a
small number).

## Arena (draft fields)

| Field | Type | Notes |
| ----- | ---- | ----- |
| `name` | string | Filtered |
| `description` | string | Filtered |
| `width`, `height` | integers | Tiles, within min and max |
| `levels` | integer, 1 to 3 | Stories |
| `tiles` | per level, a row-major grid of tile codes | Codes from a closed list: floor, indestructible wall, penetrable cover, plus any later class |
| `ramps` | list | Connections between levels |
| `spawnHints` | optional list of zones | The AI may suggest zones; code places spawns evenly and at random |
| `pickupHints` | optional list of zones | For example "middle" or "far corner"; code enforces even spacing and the count (four) |
| `theme` | token | A named visual theme from the art palette |

### Arena validity (the `engine/` validator)

Within bounds; levels consistent; both spawn zones reachable by flood fill (including through ramps); minimum open space;
a cap on wall density and on single-tile corridors; pickups reachable; no unreachable enclosed spawn. A failing arena gets
one repair attempt, then the built-in pool is used and the credit is refunded.

## Judge verdicts (the `ai` package)

- **Input judge:** `{valid: boolean, reason: enum, category: enum}`; never prose passed on to players.
- **No arena judge (decided 2026-11-18):** the players pick the arena. Each submission is screened by the input judge above (a built-in
  arena is named, not screened). A pick is `{playerId, choice: {kind: "arena", chosenPlayerId} | {kind: "random"} | {kind: "nothing"}}`;
  the rule that settles two picks is `ai/src/pipeline/arena-picking/` (see `docs/ai-pipeline.md`). Draft, local to `ai/`.

## Fixtures `build` provides in `shared/`

Valid weapons (mild, overpowered, one per behavior), boundary weapons (every stat at its cap and floor), invalid weapons
(out of range, wrong type, extra fields, an over-long name), three valid arenas (one, two and three levels), and invalid
arenas (unreachable spawn, no spawn, out of bounds). `ai` seeds its datasets from these.

## Power rating

A deterministic function in `engine/` from a weapon's stats (damage × fire rate, range, penetration, behavior weights,
spread, reload and ammo). It is displayed on the reveal screen, not used to scale anything. The formula is documented in
`engine/AGENTS.md` and covered by property tests (monotonic in damage, bounded).

## As built (where the code differs from the draft above)

- **Ramps are a tile, not a list.** An arena has no `ramps` field. `r` is a ramp up to the next level: the same cell on the
  level above must be floor (`.`). `_` is "nothing on this level, look down". The tile codes are `. # + r _`
  (`arenas/ArenaTile.ts`). The schema checks only the grid's shape (levels declared match drawn, `height` rows, `width`
  characters, known codes); that the levels fit together and the spawns are reachable is the `engine/` validator's.
  `art` proposes paired stair endpoints; whether the data needs the pair is open (`HANDOFF.md`, M2).
- **Hints are zones from a closed list** (`arenas/HintZone.ts`: centre, north, south, east, west, corners), at most four
  per list, and optional.
- **Spawn and pickup placement is not in the schema at all.** Code places both, evenly and from a seed.
- **`colour` is one of four weapon tokens** (`weapons/WeaponColour.ts`: blue, orange, violet, mint), matching `art`'s palette.
- **Strict objects.** An extra field is a failed parse, so a stray model field is refused rather than dropped.
- **Text** is plain letters, digits, spaces and `' . , ! ? & : ; ( ) -`, trimmed (`schemas/PlainText.ts`). The blocklist is
  `engine/`'s and does not exist yet.
- **No visual-description fields.** `art` asks for a bounded vocabulary so generated weapons can look as different as they
  play; none is added until `art` and `ai` agree it with `build` at M2.
- **Fixtures** are in `weapons/fixtures/` and `arenas/fixtures/`: eight valid weapons (one per behavior, a mild one, a
  broken one), boundary weapons (every stat and sound parameter at its cap and floor), invalid weapons and arenas, and
  three valid arenas. Arenas that parse but are unplayable arrive with the validator.
