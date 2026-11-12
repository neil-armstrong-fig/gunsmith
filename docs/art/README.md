# Art direction

Owner: `art` (Codex). Read `HANDOFF.md`, `TODO.md` and all three persona checklists first. You write **only** under
`docs/art/` and `webapp/public/assets/`.

## Direction (A1, 2026-11-12)

**Industrial arena:** clean flat vector, slate surfaces, blue and orange teams, heavier geometry and sparse neon.
Top-down orthographic camera; desktop only. Technical markings are functional: level ticks, stair treads and team
stripes. Avoid decorative distress, perspective, photorealism, pure black, pure white and text over busy backgrounds.

[Concept sheet](concepts/industrial-arena.svg) is the editable source, 1920 × 1400; [PNG preview](concepts/industrial-arena.png).
It includes 64 px and 32 px samples.
This is a concept delivery, not production sprites. The real manifest and behaviour enum are still pending from `build`.

## Palette and integration proposal

Prefix every token below with `--color-gs-` when `build` adopts it into Tailwind `@theme`. Components use tokens,
not hex literals. The SVG uses literal colours for portability. Token names are proposed until the M2 contract review;
this delivery changes no schema, enum or runtime manifest. Proposed arena theme: `industrial-arena`.

| Token suffix | Hex | Use |
| --- | --- | --- |
| `background` | `#10151B` | Page and canvas surround |
| `fog` | `#151B23` | Dim terrain shading outside detailed vision |
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

- Height: ascending floor brightness plus 1, 2 or 3 short edge ticks. **No L1/L2/L3 labels in the arena.**
  Height boundaries are impassable except at explicit stairs. Draw a full flight with repeated rectangular treads,
  side rails and broad landings on **both** connected levels. Both halves remain visible when their level is visible;
  stairs never override fog. A matching tread pattern makes the connection readable from either side.
  Do not use an arrow as the primary stair cue or imply players can walk up other edges.
- Wall: uninterrupted solid boundary and filled corners. Cover: inset diagonal hatching. Shape carries the distinction
  in grayscale; cover penetration still depends on the weapon. No visual implies an indestructible wall can be pierced.
- Fog: keep known static terrain dimly visible at low detail outside the cone: floor tones, structural outlines and
  navigation shapes remain legible. Inside the unoccluded cone, lift brightness and reveal detail plus players/items.
  Never draw a concealed player, pickup, projectile, outline, glow or exact-position sound indicator in the dim layer.
  The concept's reveal arena is an overview; the vision studies demonstrate the two terrain presentation levels.
- Vision: the equipped weapon supplies the prompt-defined base cone, modified by standing/crouching. The cone follows
  aim as the player spins through 360°, clipped by walls and height. Detailed terrain and dynamic entities follow the
  current cone; outside terrain stays dim rather than disappearing into opaque darkness. Lower ground cannot see up;
  higher ground can see over lower cover. The illustrated aperture is an example, not a default/cap. Cone ownership
  is settled; omitted-stat policy remains pending. The engine/server owns entity visibility, not the art shader.
- Crouch: compact body, **substantially slower movement**, and a **longer forward vision cone**, with the same angle
  and aim direction. This makes the stationary/slow player vulnerable. Walls and height
  still occlude the cone; it never reveals through cover merely because its range is longer. The illustrated range
  difference is illustrative, not the engine's tuning. Retain the local player's marker and HUD; do not imply a
  smaller collision shape or guaranteed immunity.
- Closing ring: coral chevrons, with the unsafe side hatched. Keep danger separate from orange-team markings.
- Power rating: a segmented horizontal track with the actual numeric rating beside it. Low through absurd may gain
  filled segments, never a green-to-red colour-only scale. The engine owns thresholds; no numbers are invented here.

## Game-first research

[Comparable designs and five playable experiments](gameplay-research.md) feed the game session: crouch tradeoffs,
shared pickups, stairs, ring escape and readable weapon surprises. Sources and inferences are separated. With the
2026-11-12 direction change, schema/renderer proposals remain future options until gameplay needs them; withdrawn
contracts are not implementation targets.

## Prompt-malleable art system

[Submitted schema proposal](visual-schema-proposal.md): strict primitive data, known effects and one fixed renderer.
Build/AI TODOs now track M2 review and implementation; the proposal is not a shipped interface.

The concept weapons are **examples of a visual grammar**, never the full catalogue. A beam weapon need not always have
forks, nor a shotgun the same wide body. Player prompts should be able to produce recognisably different objects,
including absurd ones, while keeping the game's industrial outline language.

- Vary body silhouette and proportions, barrel profile/count/arrangement, grips, magazine forms, coils, fins,
  ornaments, projectile shapes and impact motifs. Preserve the forward aim axis, held pivot and pickup framing.
- Separate body, barrel, attachment, accent mask, projectile and effect layers so new combinations do not require
  repainting a complete held/pickup/UI sprite. Reuse a composition across those views at their own readable detail level.
- Use validated generated data for visual choices. The existing schema supplies behaviour, colour and stats; it
  **does not yet carry these visual parts**. Build and AI must agree a bounded visual description at M2 rather than
  silently discarding imaginative prompt details or treating this art note as an implemented interface.
- Variation may suggest firing behaviour, but art cannot add gravity, sticky terrain, destructible cover or new damage
  rules. Any such request needs an explicit supported behaviour or a clear explanation of the available interpretation.
  A black-hole-looking projectile can be explosive without claiming to pull players.
- Use a neutral readable composition when appearance is unspecified. Keep provided appearance choices intact where
  supported. The pending omitted-*stat* policy is a separate game-design decision, not a reason to homogenise art.
- Preserve team stripes, wall/cover distinction, stair landings, silhouette strokes and fog restrictions under every
  variation. Cosmetic size and effects never alter hitboxes or expose hidden players. Extreme forms need 32 px review.

[Prompt-built oddities](concepts/prompt-built-oddities.md) records six wild prompts, their intended visuals and
mechanics boundaries; its companion sheet demonstrates silhouette flexibility. It is a concept exploration, not
production art or a new schema. No new manifest keys are introduced.

## Typography and licences

Use **Barlow** regular (400) for body text and semibold (600) for headings; **IBM Plex Mono** regular (400) for numbers,
controls, timers and technical annotations. Use 16 px body text and 14 px secondary labels in the eventual UI.
Font installation and bundling belong to `build`; no font package or binary is delivered here. The sheet uses portable
sans-serif/monospace fallbacks so it remains self-contained without network requests.

- [Barlow, official source and licence](https://github.com/jpt/barlow): SIL Open Font License 1.1.
- [IBM Plex, official source and licence](https://github.com/IBM/plex): SIL Open Font License 1.1 for the fonts.
- When fonts are bundled, preserve their copyright and OFL notices with the font files.
- The industrial-arena SVG geometry is original. The companion oddities PNG is an OpenAI-generated exploration,
  with provenance and example prompts in `concepts/prompt-built-oddities.md`. No third-party stock images or audio are included.
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

## A1 verification (2026-11-12)

- SVG XML parsed; dimensions, unique IDs, internal references and absence of external resources checked.
- Chromium rendering reviewed at full size, including the 64 px and 32 px samples, in colour and grayscale.
  Player posture, team stripe count, weapon silhouettes, height steps and wall/cover patterns remain distinguishable.
  The PNG preview is a browser render of the SVG, not a separate source.
- `pnpm checks` passed using installed Node 26.13.0 on PATH: lint, formatting and typecheck for shared/webapp;
  2 webapp test files, 8 tests passed. Shared has no tests yet. The initial attempt through mise failed because
  Node 26.13.1 was missing and installation outside the writable area was denied. No dependency or config changed.
- No game runtime, schema, production asset or manifest changed. Review production anchors, tint layers and behaviour
  variants with `build` at M2 before A2–A4 delivery.

## Revision: stairs and forward vision (2026-11-12)

The user replaced ramps with explicit stairs, requested no arena level text, and changed circular vision to a
prompt-configured forward cone. The sheet now shows a continuous stair flight straddling each level boundary,
with upper and lower landings; the silhouette studies show the forward cone and longer-range crouched cone.
`HANDOFF.md` records the required build/AI contract follow-up and the pending omission/default policy.

Revision verification: SVG parsed with unique IDs and resolved references; no ramp symbol or 360° vision wording
remains in the art guide/sheet. Both flights cross their level boundary and have 2 landings. In-arena level text
is removed; colour and grayscale renders reviewed. Lint and all 57 tests pass (49 shared, 8 webapp). Typecheck fails
in build-owned shared schema tests because `it`/`expect` globals are missing, with resulting implicit parameter types;
`pnpm checks` also stops on formatting in 3 shared files. Art changed no runtime source or config.

## Latest delivery: malleable identities and crouch range (2026-11-12)

- Six wild weapon concepts with 2 visual variants each are saved in `concepts/prompt-built-oddities.png`;
  matching player prompts, supported interpretations and extension boundaries are in its sibling Markdown file.
  They explore identities in profile, not production top-down sprites. The art system must support more than colour swaps.
- Main SVG and PNG now compare a standing cone with a longer crouched cone at the same aperture. Range values are
  illustrative; the engine owns the bonus. All active guidance and shared design/netcode notes retain occlusion.
- Reviewed both sheets visually; SVG XML and references pass. Latest typecheck passes and 99 tests pass
  (49 shared, 50 webapp). `pnpm checks` passed shared's checks, then stopped on a missing explicit return type in
  build-owned `webapp/src/redux/pre-round/thunks/GenerateRoundContent.test.ts:30`. No runtime code changed by art.

## Corrected terrain presentation (2026-11-12)

The user clarified that outside-cone terrain is **dim, not completely dark**. The equipped weapon and stance configure
its rotating detailed cone. The SVG/PNG studies now show dim layout outlines, brighter detailed terrain inside the cone
and pickup markers only in that cone. Active guidance and build TODOs follow this; earlier opaque-fog assumptions are
superseded. Visual inspection and XML/reference checks pass; `pnpm checks` passes (51 unit tests). No runtime changed.
