# Asset manifest (spec)

The contract between `build` and `art` so art can be dropped in without code changes. **`build` creates the real manifest in
`webapp/src/assets/sprites/` (the pictures; started 2026-11-16 with the player, other families as they are wired) and keeps this spec in step. A team has its own file per stance, so those keys end in `-blue` or `-orange` (`sprite-player-stand-blue`);** `art` reviews it before it freezes (Milestone M2).

[Visual examples and build guide](asset-reference/README.md) cover every family
below, with labelled sizes, placement, variants and approved audio links. These
are reference examples; they add no production keys or frozen contracts.

Current M1 sound mapping: `sfx-empty-click` is integrated in
`webapp/src/assets/sounds/` as a separate MP3 asset, encoded from the approved
`empty-tight` WAV master; `sfx-damage-crunch` is integrated beside it, encoded by play from
`webapp/audio/studies/combat-feedback/damage-crunch.wav` with the audio workspace's recipe. MP3 is the approved production format for future
static cues. `sfx-ring-damage-loop` uses the approved two-second WAV for gapless playback during local ring damage. The broader manifest and planned keys below remain unfrozen.

## Rules

- Every sprite, tile, icon and sound has a **stable key**, a size, a format and a **placeholder** (a drawn primitive or a
  silent clip), so the game runs before any art exists.
- Keys are lowercase kebab-case, grouped by prefix: `sprite-`, `tile-`, `ui-`, `fx-`, `brand-`, `sfx-`, `music-`.
- Files live at `webapp/public/assets/<group>/<key>.<ext>`. The manifest maps key to path, size, anchor and format.
- A missing file falls back to the placeholder and logs once in development; a build check lists missing keys.
- Palette tokens, not hex, are used in the webapp; sprites may use the palette's actual colours.
- Sizes are the design size; supply 2x for raster images. Sprites face **right** (positive x) at rest; the game rotates them.
- Weapon sounds are **not** in the manifest: they are synthesised from the weapon's `sound` block.

Current M1 pickup sprite: [`sprite-pickup-marker`](concepts/top-down-oddities/pickup-markers/README.md)
is the approved C2 SVG. Its 88 × 88 canvas centres on (44, 44) and spans
88 / 90 tiles at pickup scale.

Current M1 terrain keys are `tile-floor-l1`, `tile-floor-l2`,
`tile-floor-l3`, and `tile-wall`. Each [approved terrain tile](terrain/README.md)
is an SVG with a 64 × 64 canvas centred at (32, 32), drawn at one cell per
image. The flat materials serve as fallbacks.

## Planned keys (build finalises; art may propose additions)

| Key | Notes | Size | Format |
| --- | ----- | ---- | ------ |
| `sprite-player-stand`, `sprite-player-crouch` | Neutral body; team colour applied by tint or a second layer | 64 | SVG |
| `sprite-player-hold-<class>` | Held weapon by behavior class (rifle, hitscan, projectile, shotgun, beam, other) | 64 | SVG |
| `sprite-rifle-default` | The default rifle (pickup-style icon and held) | 64 | SVG |
| `sprite-dummy` | Practice dummy | 64 | SVG |
| `sprite-pickup-glow` | Behind a weapon pickup; tinted by the weapon's `colour` | 96 | SVG |
| `fx-projectile-<behavior>`, `fx-muzzle-<behavior>`, `fx-impact`, `fx-explosion`, `fx-beam` | One per behavior in the enum | varies | SVG or PNG strip |
| `fx-hit`, `fx-death` | Player hit and death | 96 | PNG strip |
| `tile-cover` | Penetrable cover | 64 | SVG or atlas |
| `tile-edge-<n>`; stair keys pending build | Height edges and paired stair landings; provisional `tile-ramp` withdrawn | 64 | SVG or atlas |
| `tile-spawn`, `tile-pickup-spot` | Markers (shown in the practice arena and the reveal) | 64 | SVG |
| `fx-ring-edge`, `fx-fog` | The closing ring's edge and the fog texture | tiling | PNG |
| `ui-hud-frame`, `ui-slot-1`, `ui-slot-2`, `ui-health`, `ui-ammo`, `ui-credit` | HUD | varies | SVG |
| `ui-button`, `ui-panel`, `ui-power-gauge`, `ui-progress-step` | Menus and the reveal | varies | SVG |
| `brand-logo`, `brand-favicon-*`, `brand-social` | Logo, icons, social-preview image | varies | SVG and PNG |
| `sfx-pickup`, `sfx-drop`, `sfx-reload`, `sfx-step-stand`, `sfx-step-crouch`, `sfx-hit`, `sfx-death`, `sfx-ring-warning`, `sfx-ui-click`, `sfx-round-start`, `sfx-round-end` | Static sounds (`docs/art/audio.md`) | n/a | `.mp3` |
| `music-loop-menu`, `music-loop-match` | Looping music | n/a | `.mp3` |

## Delivery protocol

1. `art` produces files named exactly `<key>.<ext>` in the right folder.
2. `art` lists the keys in the delivery log in `HANDOFF.md`.
3. `build` wires them (usually no code change), runs the missing-keys check, and ticks the item.
