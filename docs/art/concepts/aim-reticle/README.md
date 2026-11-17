# Precision aim reticle

Current runtime owner: play (Claude); art supplies authored reticle assets. See root HANDOFF.md for current ownership.

Art delivery: 2026-11-16. User chose a precision crosshair and an aim marker
only. Artwork is ready for visual review; build owns runtime integration and
production manifest registration. No game code or approved audio changed.

[Review sheet](Preview.png) · [editable sheet](Preview.svg)

## Artwork

| File | Dimensions | Purpose |
| --- | --- | --- |
| [SVG source](precision/reticle.svg) | 32×32 | Editable vector, transparent |
| [PNG](precision/reticle.png) | 32×32 | Native cursor candidate, transparent |
| [2× PNG](precision/reticle@2x.png) | 64×64 | High-density export, transparent |

The hotspot is `(16,16)` in the 32×32 image. Ink occupies `[4,28)` on both
axes, leaving 4 px padding. Four rectangular arms surround an 8×8 transparent
centre, `[12,20)` on both axes. Each arm has a 6×2 px pale mark and a 1 px
dark border (the vertical arms transpose those dimensions). Colours are
`ui-text` (`#E5EAF0`) and `background` (`#10151B`) from the
[art guide](../../README.md#palette-and-integration-proposal).

There is no centre dot, glow, rotation, animation or target-sensitive colour.
The opening preserves the aimed-at detail; the mark records mouse intent,
not guaranteed impact, range, accuracy, penetration or a valid target.

## Native-size review

The sheet compares the same vector at 24, 32 and 40 screen pixels. Start with
32 px: it retains integer-aligned 2 px pale marks and 1 px borders. The smaller
and larger samples are comparisons, not additional shipping exports; fractional
scaling softens their edges. The large construction view is labelled 6×.

Twelve paired colour/grayscale scenes show the 32 px reticle over all three
floor tones, dim known terrain, a wall/height boundary, stairs, blue and orange
players, a bright muzzle flash, outgoing-hit marks, the ring and a 6 px target
visible through the centre. References come from the existing
[build asset guide](../../asset-reference/README.md). They are static art
composites, not screenshots of the running game or proof of browser cursor
rendering. Each embedded reference is clipped to its review panel only.

The reticle remains distinguishable in these samples. The dark border separates
it from pale effects and edges; the pale marks separate it from dark terrain.
This is an art inspection, not a measured player-performance result. User visual
approval, live aiming feel and display-scale/browser QA remain open with build.

## Build handoff

- Use the 32×32 PNG at native image size with hotspot `(16,16)`, or the SVG
  with explicit intrinsic dimensions and the same hotspot. Keep apparent size
  constant as arena scale or viewport dimensions change.
- The 64×64 export has hotspot `(32,32)` in image pixels. Do not substitute
  it into a plain native cursor URL with `(16,16)` or assume it displays at
  32 px. Build must explicitly verify its density/scaling path before using it.
- Prefer a native custom cursor for this static design. Supply the keyword
  fallback `crosshair`; retain a usable cursor if artwork fails to load.
  [MDN cursor reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/cursor)
  documents image-pixel hotspots, mandatory keyword fallback and size limits.
- Scope the reticle to active arena play. Interactive overlays, buttons and
  text fields keep their ordinary UI cursors. Round/match-end overlays restore
  normal UI cursor behaviour. The HUD must not create an aim dead zone.
- Keep the exact mouse position as the aim point, with no snapping, smoothing,
  trailing, recoil drift or extra offset. Do not show both arrow and reticle.
  A native cursor needs no new per-frame React state or game-store field.
- Preserve the same mark while firing, empty, reloading or crouched. No response
  to entities under it, hidden or visible. It reveals no hidden information.
- Do not register a production key yet. Suggested manifest name for build's
  review: `ui-aim-reticle`. Final path/format stay with build at M2.

Build should write its acceptance coverage first: aiming alignment at multiple
viewport sizes and display scales; cursor on active arena versus interactive
UI/end overlays; unchanged firing/aim coordinates and HUD pass-through; fallback
when the image is unavailable. Check native cursor appearance on real displays:
normal page screenshots do not establish what a native cursor looks like.

## Verification

Both SVGs are self-contained, with no scripts, event handlers, external assets
or fonts. PNGs were rendered with installed Chromium using the existing
Playwright dependency. Geometry, transparency, pixel symmetry, 2× equivalence,
reference embedding, links and preservation checks are recorded with the final
validation in the delivery log. Temporary authoring/QA scripts are not shipped;
the SVG files are the editable sources. No new dependency or model call.

Final root `pnpm checks` passed outside the sandbox: lint, formatting, strict
TypeScript and unit tests (787 engine, 421 AI, 239 webapp, 254 audio; one slow
audio render skipped). Pixel checks cover all 1,024 native pixels, exact palette,
transparent centre/padding, 90-degree symmetry and every 2× replicated pixel.
The initial embedded-reference namespace issue was corrected before the final
render. SVG safety, PNG dimensions, local links and folder/reference review pass.
A preservation comparison covered 561 existing art/audio files; only the intended
art-guide link changed. Gameplay acceptance, paid/local model evals and native OS
cursor integration were not run; those do not follow from static artwork QA.

The next art study is taking-damage feedback and game feel, followed by the
empty-weapon click and symmetrical arenas. These remain separate deliveries.
