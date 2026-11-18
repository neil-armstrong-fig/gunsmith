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
record hashes and mastering. The agreed incoming key is `sfx-damage-crunch`,
using MP3; play has wired it in its uncommitted slice 2a (not yet integrated into
main or art). Keep `sfx-hit` as outgoing confirmation, still unregistered here.

## Crunch MP3 review — 2026-11-17

Art reviewed play’s uncommitted `webapp/src/assets/sounds/files/sfx-damage-crunch.mp3`
in worktree `play`, against the approved WAV master. FFmpeg 9.0.2 and the existing
`encoderArguments`, `decodePcm`, `measurePcm` and `durationFailure` helpers were used
from art’s worktree at `5c7be84`. A fresh temporary encode using the workspace’s
48 kHz / libmp3lame quality 2 / Xing recipe matches play’s export byte for byte.
No gain, fade, trim or tempo processing was added.

- Approved WAV SHA-256: `e0b7c4cf6093a9abe1a4ba542c2afd0139c48ebe6115e9d79f0f0ef7e9c35ca7`.
- Reviewed MP3 SHA-256: `2d7a1f9e58d99a29b800890f4a8fcda6b228a9d38075de76ec5b4e5dd9136825`.
- Native probe: MP3, mono, 48 kHz. Native decode: 8,640 frames (180 ms),
  matching the master within the unchanged one-frame tolerance.
- Decoded peak: 0.39964 (master 0.49997); RMS: −29.21 dBFS (master −28.28).
  These are sample measurements, not perceived loudness or true-peak measurements.
- Native decoded empty-click peak is 0.51663; one click plus one crunch at unity
  has a conservative sample-peak sum bound of 0.91627. This only covers these two
  native-decoded voices, not browser decoding, device output or future combat sounds.
- Negative controls rejected silent PCM, clipped PCM and two-frame duration padding.
  The reviewed export and approved master were not changed.

The codec/provenance review passes. Keep current levels pending gameplay listening;
this review does not settle the earlier report that the click sounded abrasive/loud.
For the current M1 slice, reusing crunch once when ring damage starts is an acceptable
mapping: keep the sustained unsafe visual and no per-tick impacts. Do not use the
2.8-second `sfx-ring-warning` countdown as a damage-onset cue. A dedicated onset cue
is not required for this slice. Play retains responsibility for scheduling/coalescing,
mute and reset behavior; this review does not replace its acceptance coverage.

Safari is accepted as good enough by user decision. Weapon-shot masking, sustained
combat fatigue and headphone/speaker levels remain open until runtime synthesis exists.
This is native asset review, not new browser or listening evidence.

## Continuous ring damage cue — 2026-11-17

The user superseded the one-crunch-per-exposure mapping: ring damage needs a
continuous bed, with no impact/onset cue. Art delivered the separate
[ring damage study](../../../../webapp/audio/studies/ring-damage/README.md)
(`sfx-ring-damage-loop`, two seconds, mono 48 kHz, quiet electrical texture,
no baked-in fades). The user approved the sound after listening in Visual Studio Code. Play owns registration,
one looping voice per exposure, roughly 100 ms fades and mute/reset cancellation.

WAV loops exactly in Chromium/WebKit. MP3 passes the unchanged seam checks,
but WebKit adds 40 ms of padding: use the WAV for exact looping, or fix and listen to MP3 loop bounds
before integration. Approved masters, crunch and countdown warning are unchanged.

## Clarifications from the study's drawing code (play, 2026-11-17)

The tables above say "local brackets" and "sustained unsafe-state treatment" without saying where, and the first build put both on the health panel. Read from
`Study.html`'s own script (open it, pick an event, and look), the study draws:

- **Incoming damage:** a `[ ]` pair of coral (`#FF5B62`) brackets **round the player's body**, not the HUD. Each is a vertical 25 study pixels out from the body's
  centre and 30 tall, with a 7-pixel foot toward the body at the bottom, 3 pixels thick; they open outward by up to 8 pixels over the 180 ms and vanish (no fade).
  One pair per burst: hits inside 100 ms of the first merge into it. The brackets never rotate with the aim. 1 study pixel is 0.025 tile (the body is 32 pixels
  and 0.8 tile).
- **Ring danger:** the study draws three coral slashes under the player and a red band along the bottom of the view. **The user rejected both on 2026-11-17**
  (they disliked them in play) and chose instead, while the ring hurts and steady with no pulse: a thin coral highlight circle round the player (0.5 to 0.56
  tile from the body's centre) and the red 2-pixel border round the health panel. The ring's own edge is drawn only once its timer has run out and it starts to
  close (before that it covers the arena and its edge would show as a wedge in the farthest corner).
- **Health trail:** the part a **burst of bullets** took, in the warning amber `#F2C66D`, behind the green bar, draining over 350 ms. The ring's loss has no trail.
- **Health panel position:** bottom right, as in the game. (The [inventory concept](../inventory-display/README.md) puts health bottom left; see its placement note.)

- **Outgoing hit (built 2026-11-17):** four 2-pixel mint (`#8AD4B0`) diagonal ticks, each 7 pixels long between 17 and 24 pixels out from the target's centre along both axes, tips toward the body, for 180 ms, no expansion (`Study.html`). `sfx-hit` plays once per burst (hits inside 100 ms merge: play's decision, the study is silent). Both only for a target the player sees, and the ticks go the moment its place leaves sight.
- **Camera shake and reduced motion (built 2026-11-18):** the camera moves the *picture* by the study's curve for 100 ms after a bullet hurts the player (not the ring), 12 screen pixels by default (the user tried 8, 12 and 16 on 2026-11-18 and chose 12; the study's 2 was too subtle to see; `?shake=<pixels>` tunes it, `0` is off, and a settings control can come later). **The aim is worked out on the still camera** (the user's decision, 2026-11-17: fixed view, so a hit never nudges the aim; the picture is up to 12 px off the cursor for 100 ms). Reduced motion (`?reducedMotion=1` or `prefers-reduced-motion`, read at load) removes the shake, the brackets' opening and the health trail; health, the brackets and the ticks still show.

Two lines above are stale and are corrected here: the acceptance bullet "Sustained ring damage has one onset" predates the user's decision (table, 2026-11-17)
that there is **no onset cue**; the criterion now is: the ring's marks are steady while it hurts, never pulse per tick, and clear when exposure or the round ends.
The study also plays `sfx-death` at a local death, which no slice here covers yet. The user wants it but **deferred it until more important things** (2026-11-18); it is not shelved. Play owns it, with art's file, which already exists as
`webapp/audio/generated-audio/sfx-death.wav`. The cosmetic recoil and muzzle flash need the held weapon's drawing, which is not built yet. The user wants to work on it (2026-11-18); it is not shelved.

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
| Continuous ring damage | Sustained unsafe-state treatment and one continuous looping bed while hurt; no onset cue, crunch or per-tick impacts |
| Local death / round reset | One local death resolution; cancel stale cues and scheduled audio; reveal no hidden killer |

A hidden opponent's coarse directional sound events are a separate existing
contract. This study adds no incoming attack-direction indicator.

## Acceptance and completion

Build's acceptance criteria should cover:

- Incoming damage, visible outgoing hits and simultaneous exchange are distinguishable;
  health changes immediately and all losses survive coalescing.
- A hidden hit generates no outgoing visual or audio confirmation. Turning/fog/height
  changes cannot leave effects revealing a now-hidden target.
- Sustained ring damage has a continuous bed, stops when exposure ends, and does not pulse
  each tick. Death and the next round clear pending effects and sounds.
- Shake occurs on incoming impacts at the retained settings; off/reduced motion
  removes it. The reticle, HUD and cursor-to-arena alignment remain correct across
  viewport sizes, including during shake. Cosmetic recoil never changes hitboxes.
- Silent playback retains visual information. Voices remain bounded and cancelling
  or resetting cannot play old cues later. Prove coverage with focused mutations.

Run `pnpm checks` and the relevant game acceptance specs on a production build.
Follow engine property-test and audio render requirements when touching those
areas; report unavailable commands rather than inventing a passing result.

Still needed in play: actual weapon-shot masking, headphone/speaker fatigue,
latency and live aiming checks; remaining cue/playback integration.
Recorded WebKit Ogg/MP3 findings are preserved; Safari is accepted as good enough. There are **no weapon gunshots in
this preview**, so its safe headroom does not establish a safe final combat mix.
These are integration tasks, not reasons to repeat the chosen art direction.


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
