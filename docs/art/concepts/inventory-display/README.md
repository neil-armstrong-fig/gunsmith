# Inventory display: know what you carry

Current implementation owner: play (Claude); art owns authored icons/manifest, engine supplies inventory data. Use root TODO-play.md and HANDOFF.md for current tasks.

Art/research session 1, 2026-11-17. User chose **two compact icons and only the
selected weapon's name**. User visually approved the rendered study: “looks good!”
Runtime behavior belongs to play; these are static, original vector studies.

![Inventory state study](Review.png)

[Editable SVG](Review.svg) · [1280 × 720 context](context/Arena1280.png) ·
[1920 × 1080 context](context/Arena1920.png) ·
[1280 editable SVG](context/Arena1280.svg) ·
[1920 editable SVG](context/Arena1920.svg)

## Recommendation

Keep both carried weapons visible in numbered 48 × 48 px slots. Use the selected
weapon's name and rounds/reserve above them, with status beside the slots. One
320 × 104 px panel sits 16 px from the bottom and left, below health with an 8 px
gap. Its footprint stays fixed at both desktop viewport sizes. The panel covers
3.61% of a 1280 × 720 viewport, or 1.60% at 1920 × 1080; that measures screen area,
not lost visibility or gameplay impact. Context sheets are illustrative arena
composites, not screenshots, playable layouts or demonstrations of height/fog rules.

- **Placement note (play, 2026-11-17, user decision):** the study stacks health above this panel at the bottom left, but the [combat feedback
  study](../combat-feedback/Handover.md) and the game keep health at the **bottom right**, and the user chose to keep it there. Build the panel at the
  bottom left on its own (16 px from the bottom and left); the "below health, 8 px gap" placement and its 3.61% area figure no longer apply as written.
- **Possession:** the actual weapon silhouette occupies the slot, selected or
  stowed. A blue outline identifies selection; the pale underline and heavier
  border preserve that distinction in grayscale. Slot numbers match keys 1 and 2.
- **Name:** show only the selected name, 14 px bold, on one line in a fixed-width
  area, with ellipsis on overflow. Never shrink type to fit. Keep the full name
  in accessible DOM text. Do not depend on hover: the HUD passes pointer input
  through to aiming. Names are escaped text, never markup.
- **Ammo:** show the selected weapon's exact rounds/reserve, 22 px bold. The quiet
  bottom track shows loaded fraction, and becomes reload progress during reload.
  This continuous track is a proposal to bound the current magazine-segment
  layout: a 30-round pickup must not widen the HUD. Numbers remain authoritative.
- **Icons:** fixed right-facing orientation, preserving the complete silhouette
  with padding. The 64 × 64 sources are reduced to about 34 px within the slots;
  never rotate them with aim. Keep state badges outside the silhouette's main area.
  Colour is decorative identity support, not the sole way to distinguish weapons.

[Selected-slot quickbars in Epic's Lyra documentation](https://dev.epicgames.com/documentation/en-us/unreal-engine/lyra-inventory-and-equipment-in-unreal-engine)
provide a useful separation of item display information from ammunition state.
[Xbox Accessibility Guideline 103](https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/103)
recommends reinforcing colour with text and symbols. This study applies those
principles; its dimensions and visual choices are original recommendations, not
measured player-performance results or a claim of accessibility compliance.

## State language

Selection is independent of ammunition status. Keep its underline even when the
selected weapon cannot fire. These rows are presentation rules, not new engine
states or an exported enum.

| Condition | Slot treatment | Selected status |
| --- | --- | --- |
| Rounds remain, even with zero reserve | Weapon icon | READY |
| No rounds, reserve remains | Weapon icon + R badge | R · RELOAD |
| Reload underway, with any remaining rounds | Weapon icon + R badge | RELOADING; progress replaces loaded fraction |
| No rounds and no reserve | Weapon icon + ! badge | NO AMMO |
| Stowed weapon needs reload / has no ammo | Keep icon + R / ! badge | Selected weapon's status is unchanged |
| No weapon in a slot | Dash, number and quiet border | No ammunition claim for that slot |

Reload status takes precedence while reloading. A weapon with no ammunition
remains owned and selectable by the existing rules. Empty slots are future visual
references only: both current starting slots are occupied. Only the equipped
weapon reloads, and switching or taking the pickup cancels that reload. Do not
show reload progress continuing on a stowed weapon or transfer it to the new one.

## Weapon artwork and prompt-built identities

| Editable source | HUD icon key | Identity cue |
| --- | --- | --- |
| [Rifle](weapons/rifle/Icon.svg) | `rifle` | Broad receiver and short barrel |
| [Marksman rifle](weapons/marksman-rifle/Icon.svg) | `marksman-rifle` | Long barrel, slim body and raised optic |
| [Submachine gun](weapons/submachine-gun/Icon.svg) | `submachine-gun` | Short body and projecting magazine |

The production SVGs copy these sources byte for byte. Play can call
`inventoryIconUrl(identity)` from `@src/assets/inventory-icons/InventoryIconUrl`
with a HUD icon key. It returns the corresponding `/assets/ui/ui-weapon-*.svg`
URL, or `undefined` for a missing or unsupported key. The HUD uses the built-in
weapon identity key directly and draws a neutral mark for occupied slots without
an icon. It fits the full 64 × 64 canvas into 34 × 34 px, facing right. The built-in
submachine gun uses a lighter `#687B8C` magazine fill so the projection reads
against the dark slot when selected or stowed. The study above shows the original fill.

For prompt-built weapons, render a thumbnail from the **same validated appearance**
as the held weapon. Cache it by stable visual identity/revision, fit the bounded
64-unit drawing into the icon area without cropping, and omit projectile, impact
and animation effects. Do not infer identity from stats or use an icon keyed only
by slot number. Do not add a model call or restart the shelved kit-generation probe.

Cards 9–10 reuse the body primitives of saved
[Bad Idea and Quackback studies](../simple-machinery-04/README.md), not newly
sampled model outputs. These examples demonstrate varied shapes, not arbitrary
prompt recognition. If appearance is unavailable, retain an occupied-slot neutral
weapon fallback and the available name; never render the empty-slot dash. Build/AI
must preserve existing fallback disclosure when adopting the real renderer.

## Build handover: minimum data and acceptance

The live HUD uses optional `Weapon.identity` metadata (`key` and `name`).
The starting loadout and pickups carry it with the weapon. `selectAmmoReadout`
reads the two slots and the selected weapon from the existing world. The browser
criteria inspect the rendered DOM. The existing state hook still provides the
selected ammunition data for its current consumers.

The HUD retains the segmented magazine and CSS reload progress. The local
sparring preview now uses the generated weapon's validated structural drawing
in its slot. A one-pixel contour keeps the silhouette readable against the slot
background at 34 px. The same renderer can take the production appearance once
AI and Engine associate it with a weapon. The continuous track and per-slot
status badges remain design follow-ups.

Suggested acceptance scenarios for build, written before runtime changes:

1. A fresh round shows rifle and marksman rifle, with slot 1 selected and its
   name/ammo. Switching changes selection/name/ammo while retaining both identities.
2. Fire, switch away and back: each weapon retains its ammunition and identity.
3. In seeded sparring, walk onto the pickup (existing seed 8): slot 2 becomes the
   submachine gun and is selected, with 30/60; slot 1 remains unchanged.
4. Run a magazine dry with reserve, start/finish reload, then exhaust all ammo:
   distinguish RELOAD, RELOADING and NO AMMO without removing the weapon.
5. Switch during reload, or take a pickup: reload feedback cancels, without
   changing ammunition as though the interrupted reload had completed.
6. A new round restores starting identities/ammo; long names cannot overlap ammo
   or widen the panel. A missing thumbnail still looks occupied.
7. Aim/fire through the noninteractive HUD at both desktop sizes; round overlays
   keep ordinary button behaviour. No hidden opponent data influences the display.

Use the existing switching, reloading and pickup DSLs. Assert visible DOM by
role/label/test ID and compare with the read-only hook, using web-first assertions.
Mutation-prove inherited coverage (wrong slot identity, missed pickup update,
stale reload badge, omitted underline, HUD intercepting input). Empty-slot and
prompt-built examples need runtime scenarios only when those capabilities exist;
do not add game mechanics or a state-writing test hook to exercise this art.

## Verification

Rendered with installed Chromium at 1× and inspected in colour/grayscale. The
native-size sheet covers ten examples, including combined selected/reload/empty
states, stowed depletion, empty slot, saved prompt appearances and a long name.
Both context SVGs remain editable beside their PNGs. Sources are self-contained:
no scripts, event handlers, external images or fonts. Authoring/rendering tools
were temporary; shipped SVGs are the editable sources. No dependency, paid call,
audio change or runtime code was needed.

Static validation passes: six SVGs parse with an allowed-element check and no
external resources; three PNGs match their SVG dimensions; local brief/art-index
links resolve; all ten state examples are present. `git diff --check` passes.
Standards review followed root `AGENTS.md` and the art ownership/direction brief:
listed the added folders and checked reference counts with grep. Only the brief
and review sheet sit at the study root; context composites and weapon sources
live beneath their subjects. No runtime helpers or types were introduced.
Existing artwork/audio remains unchanged except the intended art-index link.

Final `pnpm checks` exited 0 outside the sandbox: repository checks, lint,
formatting, strict typechecks and unit suites all pass (52 shared, 842 engine,
421 AI, 270 webapp, 270 audio; one slow audio render skipped). The initial sandbox
run failed only because ServeFolder could not bind 127.0.0.1 (`EPERM`); the
unsandboxed rerun passed. SVG rendering likewise required Chromium outside the
sandbox.
Runtime acceptance and model evals were not run for this static art delivery;
future integration scenarios above are a build handover, not passing tests.
