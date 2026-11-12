# Gunsmith audio audition 01

Original local synthesis, regenerated with native Web Audio on 2026-11-12.
**Listening review pending for this new render.**
These are concepts, with candidate names from the existing asset spec. Nothing
is installed in the game or registered in a runtime manifest.

Start with [the mixed audition](generated-audio/audition-mix.wav), then compare
[match music](generated-audio/music-loop-match.wav) and [menu music](generated-audio/music-loop-menu.wav).
Each is 15 seconds. The music is eight bars at 128 BPM, D minor: a shared
D–F–A motif, mechanical percussion, bass pulses and short resonant plucks.
The menu variation removes percussion and gives the motif more space.

## Effects

| Audition                                             | Duration | Intention                                 |
| ---------------------------------------------------- | -------- | ----------------------------------------- |
| [Pickup](generated-audio/sfx-pickup.wav)             | 0.38 s   | Upward metallic latch                     |
| [Drop](generated-audio/sfx-drop.wav)                 | 0.34 s   | Low descending metal impact               |
| [Reload](generated-audio/sfx-reload.wav)             | 0.82 s   | Release, insert, latch; weapon-agnostic   |
| [Standing step](generated-audio/sfx-step-stand.wav)  | 0.24 s   | Dry boot impact with grit and body        |
| [Crouched step](generated-audio/sfx-step-crouch.wav) | 0.24 s   | Same surface, softer and quieter          |
| [Hit](generated-audio/sfx-hit.wav)                   | 0.20 s   | Brief outgoing-hit confirmation candidate |
| [Death](generated-audio/sfx-death.wav)               | 1.35 s   | Descending nonvocal collapse              |
| [Ring warning](generated-audio/sfx-ring-warning.wav) | 2.80 s   | Five rising, accelerating pulses          |
| [UI click](generated-audio/sfx-ui-click.wav)         | 0.065 s  | Tiny mechanical confirmation              |
| [Round start](generated-audio/sfx-round-start.wav)   | 1.35 s   | Ascending readiness motif                 |
| [Round end](generated-audio/sfx-round-end.wav)       | 1.65 s   | Descending resolution, neutral to winner  |

The hit cue is not a damage-taken cue. Build must decide when authoritative
rules permit confirmation; this study adds no hidden-hit information contract.
Round-end is neutral rather than a win/lose pair; no extra keys are proposed.

## Listening pass

1. Play each music sketch three times consecutively (45 seconds). Check the
   musical return and seam as well as fatigue from the bass and percussion.
2. Play the mix: pickup at 1.2 s, standing steps from 2 s, reload at 4.1 s,
   ring warning at 7.2 s, crouched steps from 9.5 s, hit at 12.3 s.
   Check whether the rhythm masks steps or makes the warning feel like music.
3. Compare stand/crouch at the same volume. Crouch should be softer without
   sounding as if the arena surface changed. Repeating one step may sound
   mechanical; additional variants are a follow-up, not delivered here.
4. Compare headphones and speakers at a comfortable fixed volume. Check that
   the click is not piercing and the bass does not dominate.

The mix uses centred cues, no positional model and no runtime ducking. Gunshots
are not included, so combat masking needs a second pass with build's synthesiser.

## Reproduce and inspect

From the repository root:

```sh
pnpm --filter @gunsmith/audio-studies render
pnpm --filter @gunsmith/audio-studies checks
```

TypeScript runs directly on the project's Node 26, using the approved
`node-web-audio-api@2.2.0` dev dependency. No browser, Playwright, Python or
transpiler is involved. Sources live in `generator-scripts/`: Web Audio oscillators, filters,
gain envelopes and panners render the arrangement offline; Node writes PCM WAVs.
Noise is original seeded xorshift data. No samples, recorded voices, model calls,
services or third-party audio. `generated-audio/measurements.json` records
durations, channels, sample peak, unweighted RMS and SHA-256 hashes. It is not a
perceptual loudness or true-peak measurement. Re-rendering replaces only the
named audition WAVs and measurements in `generated-audio/`.

WAV: 48 kHz, signed 16-bit PCM; mono effects, stereo music/mix. Music peaks at
−12.04 dBFS, most effects at −5.68 dBFS; music has approximately 6 dB less peak
level. This is a starting mix, not a claim of matched perceived loudness.
Crouch RMS is 8.88 dB below standing. The mixed audition peaks at −4.18 dBFS.
Noise uses per-event seeds; the common footstep seed is 8231.

Music renders three periods and retains the middle eight bars, including tails
from the previous period; no shortened crossfade changes the tempo. Encoded loop seams and three-repeat
continuity are checked numerically; listening remains pending. Deterministic
hashes are verified in the current environment; floating-point results can vary
slightly between engine/platform versions. These sounds replace the Python
auditions; matching the old PCM was not a requirement.

The Node test renders into an isolated temporary folder, checks all 14 filenames,
WAV headers, duration, channels, non-silence, headroom and crouch level, decodes the
WAVs through the native engine, checks both joins across three music repeats,
and re-renders to compare every SHA-256 hash. The empty renderer was watched red
first. Three deliberate faults (invalid WAV header, over-loud crouch, unseeded
noise) were each caught by the intended assertion, then restored. The final
After relocation, CLI regeneration wrote all 14 WAVs into `generated-audio/`
with unchanged hashes. `pnpm checks` passed lint, formatting, strict typecheck,
324 engine tests, 82 webapp tests, 67 AI tests and the audio integration test. Listening quality is a separate
review; no browser gameplay suite was run for this offline tool.

## Engine and ownership

[node-web-audio-api](https://github.com/ircam-ismm/node-web-audio-api) supplies
the Rust-backed Web Audio implementation, standard DOM audio TypeScript types
and prebuilt binaries for macOS Intel/Apple Silicon. Its licence is BSD-3-Clause;
the dependency retains its own notices. We use `copyFromChannel`/`copyToChannel`
at the SDK boundary, following its documented buffer-access caveat. Our generated
audio is original; repository licensing remains private/pending.

This is the private `@gunsmith/audio-studies` tooling workspace, owned by art under `webapp/audio/`. It uses shared lint/format/strict-TypeScript config and participates in
`pnpm checks`. It is not an eighth game/runtime package. The only new direct external
dependency is `node-web-audio-api`; existing shared tools are reused. Regeneration
does not install files into `webapp/public/assets/` or register manifest keys.

## Next delivery

After listening feedback: refine the cue balance, add footstep variants, expand
menu to 60 seconds and match to 90 seconds, and recheck with real gunshots.
Ogg Vorbis/MP3 encoding, browser loop/decode checks, manifest approval and runtime
integration remain outstanding. MP3 fallback loop behaviour needs separate
verification; WAV continuity alone does not prove compressed playback seamless.
