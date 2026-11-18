# Arena terrain

[Review sheet](Terrain.png) · [Editable SVG](Terrain.svg) ·
[WebKit rendering](Terrain-webkit.png)

The user approved these four terrain SVGs on 2026-11-18. They now draw in
the game, and `?scenario=terrain` opens a playable preview of all three
levels. Open the PNG at 100% for native 64/32 px samples. The static context
composition uses 48 px per tile.

## Files and placement

| Asset                                                                      | Engine level   | Base fill | Mark                             |
| -------------------------------------------------------------------------- | -------------- | --------- | -------------------------------- |
| [tile-floor-l1.svg](../../../webapp/public/assets/tiles/tile-floor-l1.svg) | 0              | `#202B36` | One tick                         |
| [tile-floor-l2.svg](../../../webapp/public/assets/tiles/tile-floor-l2.svg) | 1              | `#30404F` | Two ticks                        |
| [tile-floor-l3.svg](../../../webapp/public/assets/tiles/tile-floor-l3.svg) | 2              | `#465A6B` | Three ticks                      |
| [tile-wall.svg](../../../webapp/public/assets/tiles/tile-wall.svg)         | Any solid cell | `#18212B` | Solid boundary and corner braces |

Each file is a self-contained 64×64 SVG with an opaque full-cell footprint,
centre `(32,32)`, and 64 design pixels per world tile. Place its centre at
`(tile.x + 0.5, tile.y + 0.5)`. The `l1` filename is engine level **0**.
Keep level ticks screen-up; these tiles do not rotate with player aim.
The files use literal palette colours; runtime styling uses existing tokens.

Floors have quiet one-pixel seams along the right and bottom edges and two-pixel
level ticks. Wall fill reaches all four edges; its two-pixel outline is inset,
so neighbouring blocks have a dark material join, not transparent space.
The wall uses neither cover hatching nor a penetrability cue.

## Context and integration handoff

The static composition copies the current 25×7 `TerracedArena` drawing. The
stair tile and drop edge are illustrative existing-geometry cues, not new
stair/edge assets. Actors use the existing manifest's 45 design pixels per tile,
with body anchor `(27,32)` and shot-tip anchor `(49,32)`; their scale differs
from these terrain tiles. Existing sprites and references are preserved.

Fog samples overlay `#05080C` at 50%, matching `VisionOverlay`'s settings.
SVG compositing approximates the WebGL presentation: this is neither an
engine visibility test nor evidence of live shader colour equivalence. The
dim region contains no concealed actors or exact-position effects.

The existing picture loader registers the four SVGs and waits for each load
to settle. Flat materials are used while an image is loading and when it
fails. The renderer applies the floor palette to the stair bands and draws
drop edges and fog in their existing layers.

## Playable stair preview

Open `?scenario=terrain` and use A or D to cross both flights. The player
starts on the highest floor, facing the stairs. Aim away to see the same
treads, landing rails and drop edges dim under fog.

Each flight uses four slate bands and three 2 px treads. Two rails extend
16 design pixels onto each open landing, clear of the floor ticks in the
preview. The drop edge has a 4 px lip and a 12 px shadow on the lower floor.
The shared renderer derives the placement from each arena's stair directions
and drop edges. The browser checks cover the opposing stairs in
`?scenario=fair-duel&seed=17` and the wall-side landing in
`?scenario=terraced&seed=9`. Review the terrain preview at 1024 × 560 for
64 px per tile or 512 × 400 for 32 px.

## Verification — 2026-11-17

Source: `worktree-art` at `6f7c38a` plus these uncommitted terrain files;
last merged main is `2347f21`.

- The asset checks were written first and failed for exactly four missing files.
  All four now pass XML parsing, dimensions, accessible labels, allowed static
  elements/attributes and complete cell-footprint checks.
- Chromium 156.0.8078.4 and WebKit 27.2 each decoded/rendered all four assets at
  64 and 32 px. All repeated 3×3 grids remain fully opaque; base-fill samples,
  ascending floor brightness and native-size tick contrast pass.
- A rendered in-memory mutation recolouring the middle floor to the low-ground
  fill is rejected by the palette assertion in both browsers. Delivered files
  were never mutated. Browser pages report no JavaScript errors.
- Both 1440×1420 sheets were rendered at device scale 1 and visually inspected:
  ticks, wall braces, quiet floor seams, joined blocks, grayscale and dim terrain
  remain readable. The PNGs are exact sheet-size exports, not 2× previews.
- `pnpm checks` passes outside the sandbox: lint, formatting, strict types and
  2,175 unit tests; one slow audio render skipped. The first sandboxed run
  timed out in the existing audio server setup; the unrestricted rerun passed.
  Runtime gameplay acceptance and audio re-rendering were not run for this
  artwork-only delivery.

Authoring/check runners and detailed browser samples are temporary files under
`/private/tmp/gunsmith-terrain-qa/`; SVGs are the editable source of record.
Root and webapp instructions plus the art guide/reference verification govern
this delivery. Standards and folder/caller review cover the new asset and
terrain folders; no executable tooling, source helpers or types are shipped.
