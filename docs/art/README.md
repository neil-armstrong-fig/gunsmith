# Art direction

Owner: `art` (Codex). Read `HANDOFF.md`, `TODO.md` and all three persona checklists first. You write **only** under
`docs/art/` and `webapp/public/assets/`.

## Direction (A1, 2026-11-12)

**Industrial arena:** clean flat vector, slate surfaces, blue and orange teams, heavier geometry and sparse neon.
Top-down orthographic camera; desktop only. Technical markings are functional: level ticks, ramp stripes and team
stripes. Avoid decorative distress, perspective, photorealism, pure black, pure white and text over busy backgrounds.

[Concept sheet](concepts/industrial-arena.svg) is the editable source, 1920 × 1400. It includes 64 px and 32 px samples.
This is a concept delivery, not production sprites. The real manifest and behaviour enum are still pending from `build`.

## Palette and integration proposal

Prefix every token below with `--color-gs-` when `build` adopts it into Tailwind `@theme`. Components use tokens,
not hex literals. The SVG uses literal colours for portability. Token names are proposed until the M2 contract review;
this delivery changes no schema, enum or runtime manifest. Proposed arena theme: `industrial-arena`.

| Token suffix | Hex | Use |
| --- | --- | --- |
| `background` | `#10151B` | Page and canvas surround |
| `fog` | `#151B23` | Fully concealed space |
| `floor-l1` | `#202B36` | Ground level |
| `floor-l2` | `#30404F` | Middle level |
| `floor-l3` | `#465A6B` | Upper level |
| `wall` | `#18212B` | Indestructible solid obstacle |
| `cover` | `#596572` | Penetrable, diagonal-hatched obstacle |
| `edge` | `#91A2B2` | Structural boundaries and level ticks |
| `team-blue` | `#62B5FF` | Single shoulder stripe |
| `team-orange` | `#FF9B54` | Double shoulder stripe |
| `ui-surface` | `#19222D` | Quiet panels |
| `ui-text` | `#E5EAF0` | Primary labels |
| `ui-muted` | `#A7B3C2` | Secondary labels |
| `warning` | `#F2C66D` | Caution with a triangle marker |
| `success` | `#8AD4B0` | Confirmation with a check marker |
| `ring` | `#FF5B62` | Closing-ring chevrons |
| `weapon-blue` | `#62B5FF` | Weapon accent |
| `weapon-orange` | `#FF9B54` | Weapon accent |
| `weapon-violet` | `#B6A0FF` | Weapon accent |
| `weapon-mint` | `#8AD4B0` | Weapon accent |

The four `weapon-*` names are proposed values for the weapon's `colour` token. Weapon accent denotes the weapon,
not ownership: teams also have shoulder stripes; pickups have a diamond surround. Ring danger uses chevrons.

## Shape, strokes and light

- Players: circular neutral bodies, an angular right-facing carried weapon and a team shoulder band. Blue has 1 stripe;
  orange has 2. Keep these stripes when tinting. Never tint the entire neutral body into a featureless disc.
- Standing body diameter: 36 px inside a 64 px design box. Crouched: 26 px with tucked shoulders and a darker outline.
  Body size is a visual cue, not a proposed collision or hitbox change. Weapon orientation still follows aim.
- Weapons: angular, readable silhouettes. Default rifle is narrow; beam has a forked tip; shotgun is wide; launcher has
  a drum. These are concept labels, not new manifest keys or a final behaviour list.
- At 64 px: 2 px silhouette/structural strokes and 1 px internal detail. At 32 px: 1 px silhouettes; omit fine detail
  that falls below 1 px. Enlargements scale both geometry and strokes proportionally.
- Floors, players and interface panels have no ambient glow. Pickups and active effects may have a restrained halo:
  maximum 4 px radius at 64 px design size, 20% opacity. The ring may use the same halo continuously. Silhouettes must
  remain legible with glow removed. No global bloom.

## Reading the mechanics

- Height: ascending floor brightness plus 1, 2 or 3 short edge ticks. Ramps have parallel transverse stripes with an
  arrow towards the higher level. Do not imply overlapping floors or use isometric extrusion.
- Wall: uninterrupted solid boundary and filled corners. Cover: inset diagonal hatching. Shape carries the distinction
  in grayscale; cover penetration still depends on the weapon. No visual implies an indestructible wall can be pierced.
- Fog: opaque `fog` fill outside server-approved vision. A soft seam may shade the **visible side only** (4 px at
  64 px design scale). Never reveal a concealed player, projectile, outline, glow or exact-position sound indicator.
  The concept's reveal arena is explicitly an overview, not a live player snapshot.
- Vision: 360°, independent of aim and clipped by walls and height. Lower ground cannot see up; higher ground can see
  over lower cover. The small vision studies are illustrative; `engine` supplies the actual visible region.
- Crouch: compact body plus no surrounding vision. Retain the local player's own marker and HUD; do not imply a smaller
  collision shape, guaranteed immunity, or remaining vision around the body.
- Closing ring: coral chevrons, with the unsafe side hatched. Keep danger separate from orange-team markings.
- Power rating: a segmented horizontal track with the actual numeric rating beside it. Low through absurd may gain
  filled segments, never a green-to-red colour-only scale. The engine owns thresholds; no numbers are invented here.

## Typography and licences

Use **Barlow** regular (400) for body text and semibold (600) for headings; **IBM Plex Mono** regular (400) for numbers,
controls, timers and technical annotations. Use 16 px body text and 14 px secondary labels in the eventual UI.
Font installation and bundling belong to `build`; no font package or binary is delivered here. The sheet uses portable
sans-serif/monospace fallbacks so it remains self-contained without network requests.

- [Barlow, official source and licence](https://github.com/jpt/barlow): SIL Open Font License 1.1.
- [IBM Plex, official source and licence](https://github.com/IBM/plex): SIL Open Font License 1.1 for the fonts.
- When fonts are bundled, preserve their copyright and OFL notices with the font files.
- All concept geometry in this delivery is original. No third-party images, textures or audio are included.
  Repository licensing remains private/pending; this is provenance, not a new public licence grant.

## Deliverables and where they go

Everything is named by the **asset manifest** (`docs/art/asset-manifest.md`): stable key, size, format, location. Do not invent
new keys; ask `build` to add one in `TODO.md` blockers.

| Group | Folder | Format |
| ----- | ------ | ------ |
| Sprites (player, rifle, dummy, projectiles, effects) | `webapp/public/assets/sprites/` | SVG preferred; PNG where an effect needs it |
| Tiles | `webapp/public/assets/tiles/` | SVG or a PNG atlas, per the manifest |
| UI | `webapp/public/assets/ui/` | SVG |
| Brand (logo, favicon set, social image) | `webapp/public/assets/brand/` | SVG and PNG |
| Static sounds | `webapp/public/assets/audio/` | per `docs/art/audio.md` |
| Copy | `docs/art/copy.md` | Markdown |
| Concept sheets and process | `docs/art/concepts/` | PNG or SVG |

## Working rules

- Every delivery is listed in the delivery log in `HANDOFF.md` with the manifest keys it covers.
- Keep source files (layered or generator scripts) in `docs/art/concepts/` if they are small, so assets can be regenerated.
- Check readability at the game's real scale: a player is a few tens of pixels across on screen.
- Licences: only original or properly licensed material; record any font or asset licence here.
