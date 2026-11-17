# Combat feedback / build handover

Current implementation owner: play (Claude), with engine supplying simulation events and art supplying assets/manifests. Use the root TODO-play.md and HANDOFF.md. Historical build references below mean these domain owners.

Status: art study complete, ready for build. Owner of implementation: `play` (Claude).
User decision, 2026-11-16: **punchy / crunch is preferred; keep the camera shake
as it is and adjust it during build.** No further art approval is required to
start integration. This does not claim production playback or gameplay QA.

## Decisions to preserve

- Use the punchy visual treatment and incoming **crunch** sound as the starting point.
- Retain current shake settings. The user cannot perceive it clearly in the study
  and explicitly deferred tuning to build; do not block on another art audition.
- The aim reticle and HUD stay fixed. No aim drift, gameplay recoil, knockback,
  hit-stop, zoom, blur or whole-screen flash is proposed.
- Reduced motion removes shake, cosmetic recoil, expansion and health trailing,
  retaining immediate health and static event information. Sound can be muted.
- Approved pack audio and previous art remain preserved. The frozen HTML keeps its original
  comparisons; unselected thud files and recipe have been removed.

## Assets and current settings

Use [Study.json](Study.json) for the selected treatment's cue table and
[Study.html](Study.html) for the frozen, self-contained working reference. The preview is a scripted SVG
composition with illustrative fog, not a renderer, physics implementation or
production event contract.

| Item | Starting value / source |
| --- | --- |
| Incoming sound | [damage-crunch.wav](../../../../webapp/audio/studies/combat-feedback/damage-crunch.wav), dry mono, 48 kHz / 16-bit PCM, 180 ms, peak about −6 dBFS |
| Incoming visual | Local coral brackets, 180 ms; up to 8 design-pixel expansion |
| Outgoing confirmation | Separate mint diagonal ticks at a visible target; reuse approved [sfx-hit.wav](../../../../webapp/audio/generated-audio/sfx-hit.wav) |
| Cosmetic weapon recoil | 2 design pixels, returning over 120 ms; affects drawing only |
| Camera translation | Horizontal `sin(age × 180) × 2 × (1 − age / 0.1)`; vertical = −horizontal / 2; age in seconds, only during the first 100 ms |
| Health trail | Immediate actual health change; the lost segment trails for 350 ms |
| Repeated incoming accents | First immediately; merge further hits inside 100 ms; keep at most one incoming audio voice |
| Preview mix only | Master gain 0.55; cue gain 0.7; music gain 0.22 |

The source uses design coordinates in a 480×300 viewBox, with 32-pixel player
bodies. At the normal three-panel review size, design pixels are approximately
screen pixels. Keep the initial camera strength around 2 screen pixels, **not
2 arena tiles**; tune its feel in the actual renderer. Preserve the damped return
and off/reduced-motion controls. Preview gain values are audition values, not a
finished game mix or sound-design contract.

Recipe source: `webapp/audio/generator-scripts/generators/effects/damage/MakeDamageCandidates.ts`.
Render entry (selected crunch only): `webapp/audio/generator-scripts/studies/combat-feedback/RenderCombatFeedback.ts`.
[Study measurements](../../../../webapp/audio/studies/combat-feedback/measurements.json)
record hashes and mastering. No production manifest key is registered; agree the
incoming-damage key and final format in HANDOFF before wiring it. Keep the existing
`sfx-hit` meaning as outgoing confirmation.

## Integration order and event behaviour

1. Read root, engine, webapp, React and acceptance-test instructions applicable to
   the slice. Write the first acceptance spec and watch it fail before runtime work.
2. Obtain confirmed hit and damage events from the rules, with enough cause and
   visibility information to distinguish projectile, ring and local death. Agree
   the minimum contract in HANDOFF first; do not copy the study timeline schema.
   A vanished bullet or a rounded health readout cannot establish what happened.
3. Implement presentation through the existing game loop/rendering layers. Keep
   cosmetic timing out of deterministic simulation, the World-only game store
   intact and per-frame updates out of React state. A round change clears cues.
4. Connect crunch and approved outgoing-hit playback with mute, bounded voices,
   burst coalescing and cancellation on death/reset. Do not alter existing masters.
5. Integrate camera translation with mouse-to-arena projection. The current pointer
   mapping assumes a fixed camera: a render-only offset can separate the apparent
   aim point from the cursor. Verify projection using the actual camera transform
   while keeping the screen reticle fixed and avoiding any gameplay aim jitter.
6. Play the result and tune shake/intensity in context. Keep current values as the
   starting point; do not treat the user's difficulty seeing the study as a blocker.

| Confirmed event | Presentation and limits |
| --- | --- |
| Actual local projectile damage | Local brackets, crunch and immediate health change; no attacker position, outline or direction |
| Outgoing hit on a visible target | Distinct target-centred confirmation and outgoing cue; leave the reticle unchanged |
| Hidden target hit | Suppress both outgoing confirmation and its sound; never send hidden exact-position effects |
| Simultaneous exchange | Preserve incoming and visible outgoing feedback as distinct cues |
| Burst | All actual losses count; merge visual accents within 100 ms and replace the previous incoming voice |
| Continuous ring damage | Sustained unsafe-state treatment; one onset cue, no per-tick impacts; a new exposure can have a new onset |
| Local death / round reset | One local death resolution; cancel stale cues and scheduled audio; reveal no hidden killer |

A hidden opponent's coarse directional sound events are a separate existing
contract. This study adds no incoming attack-direction indicator.

## Acceptance and completion

Build's acceptance criteria should cover:

- Incoming damage, visible outgoing hits and simultaneous exchange are distinguishable;
  health changes immediately and all losses survive coalescing.
- A hidden hit generates no outgoing visual or audio confirmation. Turning/fog/height
  changes cannot leave effects revealing a now-hidden target.
- Sustained ring damage has one onset, stops when exposure ends, and does not pulse
  each tick. Death and the next round clear pending effects and sounds.
- Shake occurs on incoming impacts at the retained settings; off/reduced motion
  removes it. The reticle, HUD and cursor-to-arena alignment remain correct across
  viewport sizes, including during shake. Cosmetic recoil never changes hitboxes.
- Silent playback retains visual information. Voices remain bounded and cancelling
  or resetting cannot play old cues later. Prove coverage with focused mutations.

Run `pnpm checks` and the relevant game acceptance specs on a production build.
Follow engine property-test and audio render requirements when touching those
areas; report unavailable commands rather than inventing a passing result.

Still needed in build: actual weapon-shot masking, headphone/speaker fatigue,
latency and live aiming checks; production asset key and codec/playback integration.
Existing WebKit Ogg/MP3 findings remain open. There are **no weapon gunshots in
this preview**, so its safe headroom does not establish a safe final combat mix.
These are integration tasks, not reasons to repeat the chosen art direction.

## Resume prompt for Claude

> You are play. Read HANDOFF.md, TODO.md, your current checklist and
> docs/art/concepts/combat-feedback/Handover.md. Implement the combat-feedback
> slice test-first when it reaches play's queue. The user chose punchy/crunch;
> preserve current shake values and tune them during playtests. Agree event/manifest
> contracts first, preserve fog privacy and the World-only store, verify aiming
> during camera translation, and keep approved audio unchanged. Leave uncommitted.

## Handover contents and verification

Only this handover, the short README, cue data and portable HTML are retained
in this folder. Prototype builder/playback/template files and review artifacts
were removed at the user's request. The HTML itself embeds its source script,
cue data and audio; no external playback files or server are required. Audio
source, rendering and regression tests remain in `webapp/audio/` so build can
regenerate the chosen crunch without reconstructing it from the preview.

Prior art verification established direct-file playback in Chromium/WebKit,
hidden-hit suppression, one ring onset, reduced motion and decode fallback.
Selected effect parameters, crunch WAV and embedded script/audio are preserved
by hash during this cleanup. Selected-output tests were watched fail on the
unwanted thud before its removal. Root checks and standalone-copy playback pass. The full approved-pack render
comparison also passes (383.88 s), proving approved output remains byte-identical. Production acceptance remains the work described above. Final
workspace and focused check results are recorded in HANDOFF's cleanup entry.
