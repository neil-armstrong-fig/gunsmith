# Approved pickup marker: C2 soft octagon

**User selected C2 on 2026-11-17.** Preserve its four open, clipped corners,
cardinal gaps, rounded caps and quiet neutral outline. This supersedes the
original diamond proposal for runtime pickup markers.

[Approved SVG](Marker.svg) · [Native/context proof](Preview.png) ·
[Editable proof](Preview.svg)

## Approved artwork

`Marker.svg` is transparent, with an 88×88 canvas and viewBox
`-12 -12 88 88`. The marker is centred at design `(32,32)`, equivalent to
canvas pixel `(44,44)`. Its shape spans `-5` to `69`, with stroke-inclusive
bounds `-7.5` to `71.5`. Keep the 2-unit pale line `#E5EAF0` over the 5-unit
dark backing `#080D12`, rounded joins/caps, and no fill, glow or animation.

Scale in the same design units as the weapon; do not squash the 88-unit canvas
into its 64-unit design square. At the existing half-scale pickup, the marker
canvas is `88 × 0.5 / 45` world tiles across (about 0.978). Keep the marker
centred on the pickup and screen-aligned, independent of its generated shape.

The proof retains the exact selected C2 geometry and unchanged fallback and
lantern at native 64/32 px, plus arena context. The PNG is a Chromium
156.0.8078.4 render of the self-contained proof SVG at 1000×700, device scale 1.
Source weapon/arena images are from the S4 runtime review at revision
`9484ad0`, seed 8, and are embedded in `Preview.svg`. The original screenshot
bundle and capture metadata were removed at the user's request after approval.
The marker SVG contains no raster image.

## Runtime placement

The [runtime sprite](../../../../../webapp/public/assets/sprites/sprite-pickup-marker.svg)
uses the manifest key `sprite-pickup-marker`. It translates the approved source
onto a zero-origin canvas. The marker sits above the weapon, so the same outline
stays visible around a corner-filling design. The pickup's existing visibility
and collection check applies to both layers. If the marker file is unavailable,
the weapon drawing or placeholder still appears once sprite loading settles.

The browser spec checks both drawings and the placeholder. Fog and collection
checks read the full marker canvas (about 0.489 tile from centre). The lantern
core check reads only the centre because the marker uses the same pale colour.
Fallback body contrast remains the separate S4-1 follow-up.

## Cleanup and verification

Removed the rejected marker comparisons, intermediate HTML/PNGs and variant
folder. Retained only this decision, the selected SVG, editable proof and PNG.
The redundant S4 screenshot/metadata bundle was also removed; its fallback
contrast finding remains in `HANDOFF.md`. Scratch authoring/render scripts were
removed. No runtime code, dependencies, model calls, commits or pushes.

Chromium verifies the proof loads and the marker contains both outline layers;
the final PNG was visually reviewed. Root instructions and the existing pickup
study were the standards references. Folder/caller audit: four intentional art
entry files, no helper scripts or types; every source/proof is linked above.
Project check results were recorded in art's checklist (in git history).
