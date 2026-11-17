# Build asset reference

Start here when replacing a primitive or drafting the asset manifest. These are
editable examples, not production-approved assets. All art is original SVG geometry
using the established industrial palette. No runtime, schema or manifest changed.

- [Players & Weapons](players/PlayersWeapons.png) · [editable sheet](players/PlayersWeapons.svg)
- [Arena & Visibility](arena/ArenaVisibility.png) · [editable sheet](arena/ArenaVisibility.svg)
- [Combat Effects](effects/CombatEffects.png) · [editable sheet](effects/CombatEffects.svg)
- [Interface](interface/Interface.png) · [editable sheet](interface/Interface.svg)
- [Brand](brand/Brand.png) · [editable sheet](brand/Brand.svg)

Open PNG sheets at 100% to inspect the labelled native-size samples. Sprites
use 64/32 px; small icons also show their intended design size. Enlarged previews
help explain construction. Individual SVGs have transparent backgrounds except
terrain, interface surfaces and branded compositions. Raster examples are 2× the
SVG reference dimensions; favicon PNGs additionally have exact-size exports.

## What build should carry forward

- Compose neutral player body, team stripe and held weapon as separate layers.
  One blue stripe / two orange stripes survive stance changes and aim rotation.
  Shrinking the crouched drawing never changes the engine hitbox.
- Reference weapon grip is `(12,32)` and muzzle `(61,32)`, facing right. The held
  pose uses scale 0.65 and translation `(22,11.2)`, reaching hand `(29.8,32)`.
  These anchors describe this example; generated geometry needs its own alignment
  proof. Rotate the composition around the player's centre.
- Six class labels come from the existing manifest brief, not a new behaviour
  enum. Shotgun, beam and other examples do not implement those mechanics.
  Generated appearances remain flexible primitive compositions, not a fixed kit.
- Stairs include plain landings on both levels; every other height edge blocks
  walking. Floor brightness and ticks convey level without arena labels.
- Fog illustration shows dim known terrain outside the detailed cone; hidden
  players, pickups and their exact-position effects are absent. The engine clips
  visibility. A static picture is not a visibility implementation.
- Ring hatching marks the unsafe side. Effects need authoritative event and fog
  filtering. An outgoing-hit cue must not reveal a hidden target.
- UI numbers, text and progress are illustrative. Preserve readable values at
  full, low and empty states; actual stats, timing and thresholds stay code-owned.
- Use actual palette roles from [the art guide](../README.md), with 2px outlines
  at 64px. Icons have 1–2px strokes. No global bloom or ambient floor glow.

## Status and source decisions

M1 continues; M2 keys, formats and final anchors remain build-owned. Dimensions
marked “reference” below are proposals wherever the manifest says “varies”.
`tile-edge-<n>` is demonstrated in four directions without deciding its naming.
Stair examples have no production key. Prompt/reveal and README-banner references
cover the checklist without inventing keys. Legal and onboarding copy are separate.

Reuse existing examples as design references; build may later adopt them through
the manifest. Raster effect PNGs are horizontal four-cell storyboards, not timed
animations. Frame order is rise, peak, decay, tail; build decides timing. Fog is a
composite explanation, not a drop-in mask. Ring sample includes terrain to explain
the unsafe side; build extracts the boundary motif for runtime tiling.

Kit 05 remains approved authored artwork, but its AI generation approach was
shelved after the user preferred the shapes arm. AI worktree commit `be6b913` and
its `docs/ai-visual-generation.md` record that decision. This pack neither restarts
the kit nor repeats Haiku review 06. The previous concepts and audio are preserved.
No fonts, external imagery, model calls or new dependencies were used. Text uses
portable sans-serif; proposed font bundling remains build-owned.

## Asset index

Each entry links directly to its editable example. PNG strips and brand previews
sit beside the SVG with the same stem. Placement uses SVG coordinates.

### Players & Weapons

| Key / family | Example | Reference size | Placement / colour | States and use |
| --- | --- | --- | --- | --- |
| `sprite-player-stand` | [Stand / blue](players/player-stand-blue/player-stand-blue.svg) | 64×64 | Body (27,32); aim +x; Only shoulder stripes: blue; neutral body | stand. One blue stripe / two orange stripes. |
| `sprite-player-stand` | [Stand / orange](players/player-stand-orange/player-stand-orange.svg) | 64×64 | Body (27,32); aim +x; Only shoulder stripes: orange; neutral body | stand. One blue stripe / two orange stripes. |
| `sprite-player-crouch` | [Crouch / blue](players/player-crouch-blue/player-crouch-blue.svg) | 64×64 | Body (27,32); aim +x; Only shoulder stripes: blue; neutral body | crouch. One blue stripe / two orange stripes. |
| `sprite-player-crouch` | [Crouch / orange](players/player-crouch-orange/player-crouch-orange.svg) | 64×64 | Body (27,32); aim +x; Only shoulder stripes: orange; neutral body | crouch. One blue stripe / two orange stripes. |
| `sprite-player-hold-<class>` | [Weapon layer / rifle](players/weapon-rifle/weapon-rifle.svg) | 64×64 | Grip (12,32); nominal emitter (61,32); +x; Palette roles; no global tint | Static. Separate weapon layer; compose with neutral body. |
| `sprite-player-hold-<class>` | [Held / rifle](players/hold-rifle/hold-rifle.svg) | 64×64 | Body (27,32); nominal hand (29.8,32); Palette roles; no global tint | Standing; see pose comparison. Illustrative class; body and weapon separate. |
| `sprite-player-hold-<class>` | [Weapon layer / hitscan](players/weapon-hitscan/weapon-hitscan.svg) | 64×64 | Grip (12,32); nominal emitter (61,32); +x; Palette roles; no global tint | Static. Separate weapon layer; compose with neutral body. |
| `sprite-player-hold-<class>` | [Held / hitscan](players/hold-hitscan/hold-hitscan.svg) | 64×64 | Body (27,32); nominal hand (29.8,32); Palette roles; no global tint | Standing; see pose comparison. Illustrative class; body and weapon separate. |
| `sprite-player-hold-<class>` | [Weapon layer / projectile](players/weapon-projectile/weapon-projectile.svg) | 64×64 | Grip (12,32); nominal emitter (61,32); +x; Palette roles; no global tint | Static. Separate weapon layer; compose with neutral body. |
| `sprite-player-hold-<class>` | [Held / projectile](players/hold-projectile/hold-projectile.svg) | 64×64 | Body (27,32); nominal hand (29.8,32); Palette roles; no global tint | Standing; see pose comparison. Illustrative class; body and weapon separate. |
| `sprite-player-hold-<class>` | [Weapon layer / shotgun](players/weapon-shotgun/weapon-shotgun.svg) | 64×64 | Grip (12,32); nominal emitter (61,32); +x; Palette roles; no global tint | Static. Separate weapon layer; compose with neutral body. |
| `sprite-player-hold-<class>` | [Held / shotgun](players/hold-shotgun/hold-shotgun.svg) | 64×64 | Body (27,32); nominal hand (29.8,32); Palette roles; no global tint | Standing; see pose comparison. Illustrative class; body and weapon separate. |
| `sprite-player-hold-<class>` | [Weapon layer / beam](players/weapon-beam/weapon-beam.svg) | 64×64 | Grip (12,32); nominal emitter (61,32); +x; Palette roles; no global tint | Static. Separate weapon layer; compose with neutral body. |
| `sprite-player-hold-<class>` | [Held / beam](players/hold-beam/hold-beam.svg) | 64×64 | Body (27,32); nominal hand (29.8,32); Palette roles; no global tint | Standing; see pose comparison. Illustrative class; body and weapon separate. |
| `sprite-player-hold-<class>` | [Weapon layer / other](players/weapon-other/weapon-other.svg) | 64×64 | Grip (12,32); nominal emitter (61,32); +x; Palette roles; no global tint | Static. Separate weapon layer; compose with neutral body. |
| `sprite-player-hold-<class>` | [Held / other](players/hold-other/hold-other.svg) | 64×64 | Body (27,32); nominal hand (29.8,32); Palette roles; no global tint | Standing; see pose comparison. Illustrative class; body and weapon separate. |
| `sprite-rifle-default` | [Default rifle](players/rifle-default/rifle-default.svg) | 64×64 | Grip (12,32); muzzle (61,32); +x; Palette roles; no global tint | Static. Top-down stock, chamber and rightward barrel. |
| `sprite-dummy` | [Practice dummy](players/dummy/dummy.svg) | 64×64 | Centre (32, 32); Palette roles; no global tint | Static. Crosshair rings; never uses team stripes. |
| `sprite-pickup-glow` | [Pickup surround](players/pickup-glow/pickup-glow.svg) | 96×96 | Centre (48, 48); Weapon accent replaces mint | Static. Tint surround only; omit when pickup is hidden. |
| `sprite-player-hold-<class>` | [Pose / both teams and stances](players/held-pose-review/held-pose-review.svg) · [PNG](players/held-pose-review/held-pose-review.png) | 320×320 | Centre (160, 160); Palette roles; no global tint | Four rotations × two stances × two teams. Four aim directions; reference placement only. |

### Arena & Visibility

| Key / family | Example | Reference size | Placement / colour | States and use |
| --- | --- | --- | --- | --- |
| `tile-floor-l1` | [Floor / level 1](arena/floor-l1/floor-l1.svg) | 64×64 | Centre (32, 32); Palette roles; no global tint | Static. Brightness and ticks; no in-arena level text. |
| `tile-floor-l2` | [Floor / level 2](arena/floor-l2/floor-l2.svg) | 64×64 | Centre (32, 32); Palette roles; no global tint | Static. Brightness and ticks; no in-arena level text. |
| `tile-floor-l3` | [Floor / level 3](arena/floor-l3/floor-l3.svg) | 64×64 | Centre (32, 32); Palette roles; no global tint | Static. Brightness and ticks; no in-arena level text. |
| `tile-wall` | [Indestructible wall](arena/wall/wall.svg) | 64×64 | Centre (32, 32); Palette roles; no global tint | Static. Solid boundary, filled corners; no glow. |
| `tile-cover` | [Penetrable cover](arena/cover/cover.svg) | 64×64 | Centre (32, 32); Palette roles; no global tint | Static. Inset hatch distinguishes cover in grayscale. |
| `tile-edge-<n>` | [Height edge / north](arena/edge-north/edge-north.svg) | 64×64 | Centre (32, 32); Palette roles; no global tint | Static. Impassable edge; direction names are examples. |
| `tile-edge-<n>` | [Height edge / east](arena/edge-east/edge-east.svg) | 64×64 | Centre (32, 32); Palette roles; no global tint | Static. Impassable edge; direction names are examples. |
| `tile-edge-<n>` | [Height edge / south](arena/edge-south/edge-south.svg) | 64×64 | Centre (32, 32); Palette roles; no global tint | Static. Impassable edge; direction names are examples. |
| `tile-edge-<n>` | [Height edge / west](arena/edge-west/edge-west.svg) | 64×64 | Centre (32, 32); Palette roles; no global tint | Static. Impassable edge; direction names are examples. |
| `stair keys pending build` | [Stairs / two landings](arena/stairs-landings/stairs-landings.svg) | 192×64 | Flight centre (96,32); climbs +x; Palette roles; no global tint | Rotate flight and landings together. One-tile flight with a plain landing at each end. |
| `tile-spawn` | [Spawn marker](arena/spawn/spawn.svg) | 64×64 | Centre (32, 32); Palette roles; no global tint | Static. Reveal/practice marker; not an opponent locator. |
| `tile-pickup-spot` | [Pickup marker](arena/pickup-spot/pickup-spot.svg) | 64×64 | Centre (32, 32); Palette roles; no global tint | Static. Reveal/practice placement marker. |
| `fx-ring-edge` | [Ring / unsafe side hatched](arena/ring-edge/ring-edge.svg) · [PNG](arena/ring-edge/ring-edge.png) | 128×128 | Boundary y=64; repeat along x; Palette roles; no global tint | Static motif; movement engine-owned. Coral + chevrons; bottom half is unsafe. |
| `fx-fog` | [Fog / dim terrain remains](arena/fog/fog.svg) · [PNG](arena/fog/fog.png) | 192×128 | Illustration, not a fog mask; Palette roles; no global tint | Standing cone; engine clips visibility. Known terrain stays; unseen entities are absent. |
| `fx-fog` | [Vision / stand and crouch](arena/vision-stance/vision-stance.svg) | 288×128 | Centre (144, 64); Palette roles; no global tint | Illustrative 1.5× range; no new tuning. Same aperture; crouch sees farther and walks slower. |

### Combat Effects

| Key / family | Example | Reference size | Placement / colour | States and use |
| --- | --- | --- | --- | --- |
| `fx-projectile-<behavior>` | [Shot / rifle](effects/projectile-rifle/projectile-rifle.svg) · [PNG](effects/projectile-rifle/projectile-rifle.png) | 64×64 | Centre (32,32); travels +x; Palette roles; no global tint | Illustrative; supported rules decide use. Trace for hitscan; geometry does not add mechanics. |
| `fx-muzzle-<behavior>` | [Muzzle / rifle](effects/muzzle-rifle/muzzle-rifle.svg) · [PNG](effects/muzzle-rifle/muzzle-rifle.png) | 64×64 | Emitter (12,32); opens +x; Palette roles; no global tint | Burst peak; timing not specified. Short accent burst; only where emitter is visible. |
| `fx-projectile-<behavior>` | [Shot / hitscan](effects/projectile-hitscan/projectile-hitscan.svg) · [PNG](effects/projectile-hitscan/projectile-hitscan.png) | 64×64 | Centre (32,32); travels +x; Palette roles; no global tint | Illustrative; supported rules decide use. Trace for hitscan; geometry does not add mechanics. |
| `fx-muzzle-<behavior>` | [Muzzle / hitscan](effects/muzzle-hitscan/muzzle-hitscan.svg) · [PNG](effects/muzzle-hitscan/muzzle-hitscan.png) | 64×64 | Emitter (12,32); opens +x; Palette roles; no global tint | Burst peak; timing not specified. Short accent burst; only where emitter is visible. |
| `fx-projectile-<behavior>` | [Shot / projectile](effects/projectile-projectile/projectile-projectile.svg) · [PNG](effects/projectile-projectile/projectile-projectile.png) | 64×64 | Centre (32,32); travels +x; Palette roles; no global tint | Illustrative; supported rules decide use. Trace for hitscan; geometry does not add mechanics. |
| `fx-muzzle-<behavior>` | [Muzzle / projectile](effects/muzzle-projectile/muzzle-projectile.svg) · [PNG](effects/muzzle-projectile/muzzle-projectile.png) | 64×64 | Emitter (12,32); opens +x; Palette roles; no global tint | Burst peak; timing not specified. Short accent burst; only where emitter is visible. |
| `fx-projectile-<behavior>` | [Shot / shotgun](effects/projectile-shotgun/projectile-shotgun.svg) · [PNG](effects/projectile-shotgun/projectile-shotgun.png) | 64×64 | Centre (32,32); travels +x; Palette roles; no global tint | Illustrative; supported rules decide use. Trace for hitscan; geometry does not add mechanics. |
| `fx-muzzle-<behavior>` | [Muzzle / shotgun](effects/muzzle-shotgun/muzzle-shotgun.svg) · [PNG](effects/muzzle-shotgun/muzzle-shotgun.png) | 64×64 | Emitter (12,32); opens +x; Palette roles; no global tint | Burst peak; timing not specified. Short accent burst; only where emitter is visible. |
| `fx-projectile-<behavior>` | [Shot / beam](effects/projectile-beam/projectile-beam.svg) · [PNG](effects/projectile-beam/projectile-beam.png) | 64×64 | Centre (32,32); travels +x; Palette roles; no global tint | Illustrative; supported rules decide use. Trace for hitscan; geometry does not add mechanics. |
| `fx-muzzle-<behavior>` | [Muzzle / beam](effects/muzzle-beam/muzzle-beam.svg) · [PNG](effects/muzzle-beam/muzzle-beam.png) | 64×64 | Emitter (12,32); opens +x; Palette roles; no global tint | Burst peak; timing not specified. Short accent burst; only where emitter is visible. |
| `fx-projectile-<behavior>` | [Shot / other](effects/projectile-other/projectile-other.svg) · [PNG](effects/projectile-other/projectile-other.png) | 64×64 | Centre (32,32); travels +x; Palette roles; no global tint | Illustrative; supported rules decide use. Trace for hitscan; geometry does not add mechanics. |
| `fx-muzzle-<behavior>` | [Muzzle / other](effects/muzzle-other/muzzle-other.svg) · [PNG](effects/muzzle-other/muzzle-other.png) | 64×64 | Emitter (12,32); opens +x; Palette roles; no global tint | Burst peak; timing not specified. Short accent burst; only where emitter is visible. |
| `fx-impact` | [Impact / four phases](effects/impact/impact.svg) · [PNG](effects/impact/impact.png) | 256×64 | Each 64×64 frame centred; Hit neutral; impact mint; explosion orange; death neutral | Four equal cells, left to right. Rise / peak / decay / tail; no fixed timing. |
| `fx-explosion` | [Explosion / four phases](effects/explosion/explosion.svg) · [PNG](effects/explosion/explosion.png) | 384×96 | Each 96×96 frame centred; Hit neutral; impact mint; explosion orange; death neutral | Four equal cells, left to right. Rise / peak / decay / tail; no fixed timing. |
| `fx-hit` | [Hit / four phases](effects/hit/hit.svg) · [PNG](effects/hit/hit.png) | 384×96 | Each 96×96 frame centred; Hit neutral; impact mint; explosion orange; death neutral | Four equal cells, left to right. Rise / peak / decay / tail; no fixed timing. |
| `fx-death` | [Death / four phases](effects/death/death.svg) · [PNG](effects/death/death.png) | 384×96 | Each 96×96 frame centred; Hit neutral; impact mint; explosion orange; death neutral | Four equal cells, left to right. Rise / peak / decay / tail; no fixed timing. |
| `fx-beam` | [Beam / emitter to endpoint](effects/beam/beam.svg) · [PNG](effects/beam/beam.png) | 256×64 | Emitter (4,32); endpoint (252,32); Palette roles; no global tint | Sustain example; length engine-owned. Clip to authoritative visible beam; no glow through fog. |

### Interface

| Key / family | Example | Reference size | Placement / colour | States and use |
| --- | --- | --- | --- | --- |
| `ui-hud-frame` | [HUD frame](interface/hud-frame/hud-frame.svg) | 320×80 | Centre (160, 40); Palette roles; no global tint | Static. Quiet panel; reserve/ammo numbers are examples. |
| `ui-slot-1` | [Weapon slot / 1](interface/slot-1/slot-1.svg) | 48×48 | Centre (24, 24); Palette roles; no global tint | Static. Blue outline denotes selection, not ownership. |
| `ui-slot-2` | [Weapon slot / 2](interface/slot-2/slot-2.svg) | 48×48 | Centre (24, 24); Palette roles; no global tint | Static. Blue outline denotes selection, not ownership. |
| `ui-health` | [Health icon](interface/health/health.svg) | 24×24 | Centre (12, 12); Palette roles; no global tint | Static. Pair with readable number or label. |
| `ui-ammo` | [Ammo icon](interface/ammo/ammo.svg) | 24×24 | Centre (12, 12); Palette roles; no global tint | Static. Pair with readable number or label. |
| `ui-credit` | [Credit icon](interface/credit/credit.svg) | 24×24 | Centre (12, 12); Palette roles; no global tint | Static. Pair with readable number or label. |
| `ui-button` | [Button / idle](interface/button-idle/button-idle.svg) | 160×48 | Centre (80, 24); Palette roles; no global tint | idle. Label illustrative; real actions stay test-first. |
| `ui-button` | [Button / hover](interface/button-hover/button-hover.svg) | 160×48 | Centre (80, 24); Palette roles; no global tint | hover. Label illustrative; real actions stay test-first. |
| `ui-button` | [Button / pressed](interface/button-pressed/button-pressed.svg) | 160×48 | Centre (80, 24); Palette roles; no global tint | pressed. Label illustrative; real actions stay test-first. |
| `ui-button` | [Button / disabled](interface/button-disabled/button-disabled.svg) | 160×48 | Centre (80, 24); Palette roles; no global tint | disabled. Label illustrative; real actions stay test-first. |
| `ui-panel` | [Panel / overlay surface](interface/panel/panel.svg) | 360×240 | Centre (180, 120); Palette roles; no global tint | Static. Surface and spacing; not a new screen. |
| `ui-power-gauge` | [Power rating / labelled segments](interface/power-gauge/power-gauge.svg) | 240×32 | Centre (120, 16); Palette roles; no global tint | Static. 72 is sample data; engine owns thresholds. |
| `ui-progress-step` | [Progress / queued](interface/progress-queued/progress-queued.svg) | 160×40 | Centre (80, 20); Palette roles; no global tint | queued. Visual state only; pipeline supplies real step. |
| `ui-progress-step` | [Progress / current](interface/progress-current/progress-current.svg) | 160×40 | Centre (80, 20); Palette roles; no global tint | current. Visual state only; pipeline supplies real step. |
| `ui-progress-step` | [Progress / complete](interface/progress-complete/progress-complete.svg) | 160×40 | Centre (80, 20); Palette roles; no global tint | complete. Visual state only; pipeline supplies real step. |
| `ui-progress-step` | [Progress / error](interface/progress-error/progress-error.svg) | 160×40 | Centre (80, 20); Palette roles; no global tint | error. Visual state only; pipeline supplies real step. |
| `ui-health` | [Health / readout states](interface/health-states/health-states.svg) | 240×132 | Centre (120, 66); Palette roles; no global tint | Full, low/hurt, empty. Keep value readable; reload is separate progress. |
| `ui-ammo` | [Ammo / readout states](interface/ammo-states/ammo-states.svg) | 240×176 | Centre (120, 88); Palette roles; no global tint | Full, low/hurt, empty, reloading. Keep value readable; reload is separate progress. |
| `A4 prompt styling; no manifest key` | [Prompt entry / component](interface/prompt-entry/prompt-entry.svg) | 360×128 | Centre (180, 64); Palette roles; no global tint | Static. Example help text; not final onboarding copy. |
| `A4 reveal frame; no manifest key` | [Reveal / component](interface/reveal-frame/reveal-frame.svg) | 360×180 | Centre (180, 90); Palette roles; no global tint | Static. Single framed object; no invented reveal flow. |

### Brand

| Key / family | Example | Reference size | Placement / colour | States and use |
| --- | --- | --- | --- | --- |
| `brand-logo` | [Gunsmith / wordmark](brand/logo/logo.svg) · [PNG](brand/logo/logo.png) | 384×64 | Left baseline; 8px clear space; Palette roles; no global tint | Static. One proposed direction; name check still open. |
| `brand-favicon-*` | [Favicon / 16px](brand/favicon-16/favicon-16.svg) · [2× PNG](brand/favicon-16/favicon-16.png) · [exact PNG](brand/favicon-16/favicon-16-exact.png) | 16×16 | Centre (8, 8); Palette roles; no global tint | Static. Example export size, not a platform manifest. |
| `brand-favicon-*` | [Favicon / 32px](brand/favicon-32/favicon-32.svg) · [2× PNG](brand/favicon-32/favicon-32.png) · [exact PNG](brand/favicon-32/favicon-32-exact.png) | 32×32 | Centre (16, 16); Palette roles; no global tint | Static. Example export size, not a platform manifest. |
| `brand-favicon-*` | [Favicon / 180px](brand/favicon-180/favicon-180.svg) · [2× PNG](brand/favicon-180/favicon-180.png) · [exact PNG](brand/favicon-180/favicon-180-exact.png) | 180×180 | Centre (90, 90); Palette roles; no global tint | Static. Example export size, not a platform manifest. |
| `brand-favicon-*` | [Favicon / 192px](brand/favicon-192/favicon-192.svg) · [2× PNG](brand/favicon-192/favicon-192.png) · [exact PNG](brand/favicon-192/favicon-192-exact.png) | 192×192 | Centre (96, 96); Palette roles; no global tint | Static. Example export size, not a platform manifest. |
| `brand-favicon-*` | [Favicon / 512px](brand/favicon-512/favicon-512.svg) · [2× PNG](brand/favicon-512/favicon-512.png) · [exact PNG](brand/favicon-512/favicon-512-exact.png) | 512×512 | Centre (256, 256); Palette roles; no global tint | Static. Example export size, not a platform manifest. |
| `brand-social` | [Social preview](brand/social/social.svg) · [PNG](brand/social/social.png) | 1200×630 | Centre (600, 315); Palette roles; no global tint | Static. Proposed brand composition; original vector geometry. |
| `A7 README banner; no manifest key` | [README banner](brand/readme-banner/readme-banner.svg) · [PNG](brand/readme-banner/readme-banner.png) | 1200×300 | Centre (600, 150); Palette roles; no global tint | Static. Proposed brand composition; original vector geometry. |

## Approved audio examples

The user approved pack 02 (“Sounds great”). These WAVs demonstrate the intended
sound. MP3 is now approved for production; recorded WebKit findings remain
follow-up QA. Read
[the audio guide](../../../webapp/audio/README.md) and
[playback handoff](../../../webapp/audio/qa/webkit-alignment/README.md) before
integration. No approved master or compressed candidate is changed here.

| Planned key | Audition | Use |
| --- | --- | --- |
| `sfx-pickup` | [Pickup](../../../webapp/audio/generated-audio/sfx-pickup.wav) | Mono, centred; runtime decides scheduling and fog-safe events |
| `sfx-drop` | [Drop](../../../webapp/audio/generated-audio/sfx-drop.wav) | Mono, centred; runtime decides scheduling and fog-safe events |
| `sfx-reload` | [Reload; cue is not the timer](../../../webapp/audio/generated-audio/sfx-reload.wav) | Mono, centred; runtime decides scheduling and fog-safe events |
| `sfx-step-stand` | [Dry standing footfall](../../../webapp/audio/generated-audio/sfx-step-stand.wav) | Mono, centred; runtime decides scheduling and fog-safe events |
| `sfx-step-crouch` | [Same surface, softer footfall](../../../webapp/audio/generated-audio/sfx-step-crouch.wav) | Mono, centred; runtime decides scheduling and fog-safe events |
| `sfx-hit` | [Outgoing-hit confirmation candidate](../../../webapp/audio/generated-audio/sfx-hit.wav) | Mono, centred; runtime decides scheduling and fog-safe events |
| `sfx-death` | [Death](../../../webapp/audio/generated-audio/sfx-death.wav) | Mono, centred; runtime decides scheduling and fog-safe events |
| `sfx-ring-warning` | [Ring warning](../../../webapp/audio/generated-audio/sfx-ring-warning.wav) | Mono, centred; runtime decides scheduling and fog-safe events |
| `sfx-ui-click` | [Button confirmation](../../../webapp/audio/generated-audio/sfx-ui-click.wav) | Mono, centred; runtime decides scheduling and fog-safe events |
| `sfx-round-start` | [Readiness motif](../../../webapp/audio/generated-audio/sfx-round-start.wav) | Mono, centred; runtime decides scheduling and fog-safe events |
| `sfx-round-end` | [Neutral resolution motif](../../../webapp/audio/generated-audio/sfx-round-end.wav) | Mono, centred; runtime decides scheduling and fog-safe events |
| `music-loop-menu` | [Menu music](../../../webapp/audio/generated-audio/music-loop-menu.wav) | Stereo, 60 seconds; eventual ducking/volume are build-owned |
| `music-loop-match` | [Match music](../../../webapp/audio/generated-audio/music-loop-match.wav) | Stereo, 90 seconds; eventual ducking/volume are build-owned |

Footfalls: four variants per stance, candidate names only. stand: [01](../../../webapp/audio/generated-audio/sfx-step-stand.wav), [02](../../../webapp/audio/generated-audio/sfx-step-stand-02.wav), [03](../../../webapp/audio/generated-audio/sfx-step-stand-03.wav), [04](../../../webapp/audio/generated-audio/sfx-step-stand-04.wav). crouch: [01](../../../webapp/audio/generated-audio/sfx-step-crouch.wav), [02](../../../webapp/audio/generated-audio/sfx-step-crouch-02.wav), [03](../../../webapp/audio/generated-audio/sfx-step-crouch-03.wav), [04](../../../webapp/audio/generated-audio/sfx-step-crouch-04.wav). 

Hidden-opponent audio must use coarse direction events, never exact client-side
positions. Reload playback must follow the actual weapon and cancel on interruption.
Fatigue/device listening, gunshot masking and final manifest mapping remain open.

## Verification

See [verification record](Verification.md) for coverage, rendering, preservation
and project checks. This reference delivery does not claim runtime acceptance,
compressed-audio approval, or a new model evaluation.
