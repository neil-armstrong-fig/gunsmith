# Audio brief

Two kinds of sound, with different owners.

## 1. Weapon sounds: synthesised in the browser (not `art`'s job)

The planned weapon schema has a `sound` block (`docs/schemas.md`), part of what the AI generates. The webapp will turn it into
Web Audio (oscillators, noise, a filter, an envelope). `build` writes the synthesiser; `ai` fuzz-tests the limits. Every
parameter is clamped, and total duration, gain and voice count are limited, because a player influences these sounds.

## 2. Static sounds: pre-rendered files (`art`)

`art` supplies these files, named as the manifest says (`docs/art/asset-manifest.md`). Local WAV synthesis is verified:
the audition pack is in [webapp/audio/](../../webapp/audio/README.md), with reproducible TypeScript sources using
`node-web-audio-api@2.2.0` on Node. The runtime manifest remains pending; these are candidate auditions, not production assets.

| Key | What | Notes |
| --- | ---- | ----- |
| `sfx-pickup`, `sfx-drop` | Picking up and dropping a weapon | Short, satisfying, metallic |
| `sfx-reload` | Reload | About 0.5 to 1 s; weapon-agnostic |
| `sfx-step-stand`, `sfx-step-crouch` | Footsteps | Loopable variants; crouch is quieter and softer |
| `sfx-hit`, `sfx-death` | You hit, you die | |
| `sfx-ring-warning` | The closing ring is about to start and while it closes | Rising tension |
| `sfx-ui-click` | Buttons | Very short |
| `sfx-round-start`, `sfx-round-end` | Stingers | |
| `music-loop-menu`, `music-loop-match` | Looping music | Seamless loops; calm menu, tense match; ducks under effects |

## Technical requirements

- Format: Ogg Vorbis plus an MP3 fallback. Mono for effects, stereo for music.
- Loudness: normalise effects to a consistent level, leave headroom; music about 6 dB below effects.
- Length: effects under 2 s except the ring warning; music loops of 60 to 120 s.
- Footsteps and other positional sounds are played with direction by the game; supply dry, centred mono files.
- Original or properly licensed only; record licences in `docs/art/README.md`.

## Audio and fog (design reminder)

A hidden opponent's sound reaches a player only as a direction in about 8 sectors, never a position, and only within hearing
range (`docs/match-netcode.md`). Crouching is quieter. Keep footsteps and weapon sounds distinct enough to read at a glance.

## Chosen direction and current delivery (2026-11-12)

The user chose **industrial electronic**, a **driving soundtrack during play**, and **original local synthesis**.
Mechanical percussion, restrained distortion, a D-minor motif and resonant plucks connect the sound to the industrial
arena. Preserve a strong rhythm while leaving combat cues intelligible. The menu uses a calmer related arrangement.

Delivered: 60-second menu / 90-second match arrangements at 128 BPM, all 11 original mono effect candidates,
six additional footstep variants and a 90-second stereo mixed audition (20 WAVs total). All files are 48 kHz, 16-bit PCM WAV. The listening guide describes each cue, the mixed timeline, reproduction
and measurements. Music peaks about 6 dB below most effects; crouched steps have lower gain and a softer spectrum.
Peak matching is only an initial mix, not perceptual loudness matching. The user approved the expanded pack
on 2026-11-12 ("Sounds great"); detailed cross-device/fatigue and in-game masking review remain before production.

Effects have no panning or room reverb baked in. Steps are individual footfalls for scheduling, not continuous walking
loops; each stance has four variants including the original. Local `-02`/`-03`/`-04` suffixes are candidates, not new manifest keys. The 0.82-second reload is a mechanical cue, **not the reload timer**:
build decides its playback alignment against each weapon's actual duration and cancels it on an interrupted reload.
The hit audition proposes outgoing-hit confirmation; no event rules or hidden-hit information are introduced.

Build owns eventual music/effects gain, ducking, scheduling, mute/volume settings and positional playback, all added
test-first when needed. Do not derive hidden-opponent audio from precise positions on the client. The mixed audition
has no gunshots; masking must be rechecked with the real weapon synthesiser before integration.

The expanded tracks have four / six distinct eight-bar sections and preserve wraparound tails. Every crouched
footfall is at least 6 dB quieter than its paired standing version in measured RMS. Next: detailed listening,
production encoding and manifest review. Ogg Vorbis plus MP3 remain the required shipping formats; candidates are delivered, but strict production QA fails as documented below. The user approved `node-web-audio-api@2.2.0` as a dev-only tool and the pack was regenerated on Node; the Python
sources were replaced. Run `pnpm --filter @gunsmith/audio-studies render`. No service, paid generation, game-runtime code
or schema changed. Preserve the approved direction when expanding the pack; no repeat direction approval is needed.


## Compressed production-preparation result (2026-11-13)

38 Ogg/MP3 candidates and reproducible native/Chromium/WebKit QA are in `webapp/audio/encoded-audio/`;
see the [commands and findings](../../webapp/audio/README.md#compressed-candidate-delivery-2026-11-13).
Masters are unchanged. Production approval remains open: measured effect durations differ across codecs/browsers,
WebKit Vorbis music joins fail, and one WebKit crouch pair misses the 6 dB margin. Both MP3 music loops pass in both browsers.
No manifest keys registered and no runtime integration. Keep these as candidates pending resolution and listening QA.
