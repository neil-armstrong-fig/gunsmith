# Asset manifest (spec)

The contract between `build` and `art` so art can be dropped in without code changes. **`build` creates the real manifest in
`webapp/src/assets/manifest` and keeps this spec in step;** `art` reviews it before it freezes (Milestone M2).

## Rules

- Every sprite, tile, icon and sound has a **stable key**, a size, a format and a **placeholder** (a drawn primitive or a
  silent clip), so the game runs before any art exists.
- Keys are lowercase kebab-case, grouped by prefix: `sprite-`, `tile-`, `ui-`, `fx-`, `brand-`, `sfx-`, `music-`.
- Files live at `webapp/public/assets/<group>/<key>.<ext>`. The manifest maps key to path, size, anchor and format.
- A missing file falls back to the placeholder and logs once in development; a build check lists missing keys.
- Palette tokens, not hex, are used in the webapp; sprites may use the palette's actual colours.
- Sizes are the design size; supply 2x for raster images. Sprites face **right** (positive x) at rest; the game rotates them.
- Weapon sounds are **not** in the manifest: they are synthesised from the weapon's `sound` block.

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
| `tile-floor-l1`, `tile-floor-l2`, `tile-floor-l3` | Three height levels | 64 | SVG or atlas |
| `tile-wall`, `tile-cover` | Indestructible wall vs penetrable cover | 64 | SVG or atlas |
| `tile-edge-<n>`, `tile-ramp` | Height edges and ramps | 64 | SVG or atlas |
| `tile-spawn`, `tile-pickup-spot` | Markers (shown in the practice arena and the reveal) | 64 | SVG |
| `fx-ring-edge`, `fx-fog` | The closing ring's edge and the fog texture | tiling | PNG |
| `ui-hud-frame`, `ui-slot-1`, `ui-slot-2`, `ui-health`, `ui-ammo`, `ui-credit` | HUD | varies | SVG |
| `ui-button`, `ui-panel`, `ui-power-gauge`, `ui-progress-step` | Menus and the reveal | varies | SVG |
| `brand-logo`, `brand-favicon-*`, `brand-social` | Logo, icons, social-preview image | varies | SVG and PNG |
| `sfx-pickup`, `sfx-drop`, `sfx-reload`, `sfx-step-stand`, `sfx-step-crouch`, `sfx-hit`, `sfx-death`, `sfx-ring-warning`, `sfx-ui-click`, `sfx-round-start`, `sfx-round-end` | Static sounds (`docs/art/audio.md`) | n/a | `.ogg` (+ `.mp3` fallback) |
| `music-loop-menu`, `music-loop-match` | Looping music | n/a | `.ogg` (+ `.mp3`) |

## Delivery protocol

1. `art` produces files named exactly `<key>.<ext>` in the right folder.
2. `art` lists the keys in the delivery log in `HANDOFF.md`.
3. `build` wires them (usually no code change), runs the missing-keys check, and ticks the item.
