# Gunsmith audio pack 02

Original local synthesis, regenerated with native Web Audio on 2026-11-12.
**The user approved the expanded pack on 2026-11-12: "Sounds great".**
Detailed fatigue, cross-device and in-game masking review remain before production.
These are concepts, with candidate names from the existing asset spec. Nothing
is installed in the game or registered in a runtime manifest.

Start with [the mixed audition](generated-audio/audition-mix.wav), then compare
[match music](generated-audio/music-loop-match.wav) and [menu music](generated-audio/music-loop-menu.wav).
Menu is 60 seconds (32 bars); match and mix are 90 seconds (48 bars).
Both tracks retain 128 BPM, D minor, the shared D–F–A motif, mechanical percussion,
bass pulses and short resonant plucks. Menu stays calmer with sparse percussion.

## Arrangement map

Each section is eight bars / 15 seconds. These are composed variations, with
changes in melody, bass rhythm, filtering and percussion density.

| Start | Menu                       | Match                               |
| ----- | -------------------------- | ----------------------------------- |
| 0 s   | Sparse original theme      | Established driving groove          |
| 15 s  | Higher motif answer        | Syncopated bass and reordered motif |
| 30 s  | Lower phrase, reduced kick | Rising answering phrase             |
| 45 s  | Returning theme            | Reduced percussion and lower motif  |
| 60 s  | Loop returns to opening    | Fuller high-register return         |
| 75 s  | —                          | Descending turnaround into opening  |

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

Additional standing footfalls: [02](generated-audio/sfx-step-stand-02.wav),
[03](generated-audio/sfx-step-stand-03.wav), [04](generated-audio/sfx-step-stand-04.wav).
Paired crouched footfalls: [02](generated-audio/sfx-step-crouch-02.wav),
[03](generated-audio/sfx-step-crouch-03.wav), [04](generated-audio/sfx-step-crouch-04.wav).

The hit cue is not a damage-taken cue. Build must decide when authoritative
rules permit confirmation; this study adds no hidden-hit information contract.
Round-end is neutral rather than a win/lose pair; no extra keys are proposed.

## Listening pass

1. Play menu three times (180 seconds) and match three times (270 seconds). Check the
   musical return and seam as well as fatigue from the bass and percussion.
2. Play the mix: pickup at 1.2 s, standing steps from 2 s, reload at 4.1 s,
   ring warning at 7.2 s, crouched steps from 9.5 s, hit at 12.3 s.
   This sequence repeats at offsets of 30 and 60 seconds across different music sections.
   Check whether the rhythm masks steps or makes the warning feel like music.
3. Compare stand/crouch at the same volume. Crouch should be softer without
   sounding as if the arena surface changed. The mix cycles through the original
   plus `-02`, `-03` and `-04` in each stance, at 0.42 s standing / 0.65 s crouched
   intervals. Compare variation without implying a different arena material.
4. Compare headphones and speakers at a comfortable fixed volume. Check that
   the click is not piercing and the bass does not dominate.

The mix uses centred cues, no positional model and no runtime ducking. Gunshots
are not included, so combat masking needs a second pass with build's synthesiser.

## Reproduce and inspect

From the repository root:

```sh
pnpm --filter @gunsmith/audio-studies render
pnpm --filter @gunsmith/audio-studies checks
pnpm --filter @gunsmith/audio-studies test:render
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
Every crouch variant is at least 6 dB below its paired standing footfall in RMS.
Exact levels and the mixed audition peak are in `generated-audio/measurements.json`.
Footsteps use paired fixed seeds 8231–8234, small pitch/impact changes, and softer
crouched filtering. All eight footfalls are 0.24 seconds, dry and centred.
The original two footsteps and nine other effect WAVs are preserved.

Music renders three periods and retains the middle full arrangement, including tails
from the previous period; no shortened crossfade changes the tempo. Encoded loop seams and three-repeat
continuity are checked numerically; the audition direction is user-approved. Deterministic
hashes are verified in the current environment; floating-point results can vary
slightly between engine/platform versions. These sounds replace the Python
auditions; matching the old PCM was not a requirement.

`checks` runs in about a second. Its tests cover each stage on its own (the seeded noise, voices,
cue rendering, level helpers, arrangements and every instrument of a bar, the effect recipes, the WAV header, PCM encoding,
loop joins, measurements and the mix) and run the whole pipeline on a tiny pack: all filenames, headers, hashes, mono and stereo
decoding through the native engine, loop joins and determinism. `pack/verification/CommittedPack.test.ts` checks every committed WAV against
the SHA-256 recorded in `measurements.json`. Tests of the arrangements check exact full-track durations and distinct
musical sections (ignoring noise seeds); tests of the footfalls check complete pairs, softer filtering and unique variants.

`test:render` is the slow check, kept out of `checks`: it renders the whole pack into a temporary folder and requires every file
to be byte for byte the same as `generated-audio/`. Run it after any change to a recipe, the synthesis, the levels or the
encoding. It replaced a single test that rendered the full pack twice inside `checks`, which took about eight minutes.

The source was restructured by `build` on 2026-11-13, at the user's request, to the project's code standards (see `AGENTS.md`).
Every voice of both tracks and all effects was compared with the previous code, and the whole pack was re-rendered and
compared byte for byte: **the audio is unchanged**. Technical checks do not establish listening quality. No browser gameplay
suite was run for this offline tool.

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

The full tracks and footstep variants are delivered. Next: listening review for
fatigue, device playback and masking with real gunshots.
Compressed candidates and browser reports are delivered below, with failing production checks. Manifest approval and runtime integration remain outstanding. MP3 fallback loop behaviour needs separate
verification; WAV continuity alone does not prove compressed playback seamless.

## Compressed candidate delivery (2026-11-13)

Production is **blocked by measured codec/browser differences**. The approved WAV masters remain unchanged.
`encoded-audio/` contains 38 candidate files (17 effects and two music loops, each Ogg Vorbis and MP3); the audition mix is excluded.
These are not registered manifest assets. Footstep suffixes remain provisional.

Install Homebrew `ffmpeg-full` (the standard formula lacks `libvorbis`). The exporter finds its Apple Silicon Homebrew path;
otherwise put a full build on PATH or set `FFMPEG` to its executable. Encoding uses Vorbis quality 5 and LAME MP3 VBR quality 2,
48 kHz, original channel counts, and MP3 Xing/LAME delay metadata. No new pnpm dependency is used. No gain, fade, trim or tempo change is applied.
Sources: [FFmpeg codecs](https://ffmpeg.org/ffmpeg-codecs.html), [MP3 metadata](https://ffmpeg.org/ffmpeg-formats.html#mp3),
[Web Audio looping](https://www.w3.org/TR/webaudio/#AudioBufferSourceNode).

```sh
pnpm --filter @gunsmith/audio-studies encode
pnpm --filter @gunsmith/audio-studies verify:encoded
# Requires the existing acceptance workspace's Playwright installation:
pnpm --filter @gunsmith/acceptance-tests exec playwright install chromium webkit
pnpm --filter @gunsmith/audio-studies verify:browser
```

`verify:browser` starts and stops its own local server on a port the system picks; nothing is started by hand.

The encoder verifies master hashes and stages output before publishing its inventory. A new encode removes previous QA reports.
`report.json` records source/output hashes, exact settings, sizes and encoder version; `verification.json` records native decode results
and failure status; `browser-verification.json` records each browser's version, decoded samples, levels, loop joins and repetition errors.
Verification commands intentionally exit nonzero when a candidate fails. Re-run verification after every encode.
The browser runner (`generator-scripts/browser/`) borrows existing Playwright tooling via the acceptance workspace; it does not import game code or change its tests. Ogg files are not byte-reproducible (the container carries a random stream serial number), so a re-encode matches by decoded audio, and MP3 by hash.
Corrupt audio and a synthetic discontinuous loop are negative controls. The harness renders three complete music periods offline,
then compares every sample against repeated decoded input; this verifies scheduling, not perceived seam quality.

Findings: native decoding and Chromium expose duration differences in 13 Vorbis effects (usually 128 samples short; the hit cue is longer).
WebKit has 34 failing candidates: effect-duration differences, one crouch-level failure, and Vorbis music joins above 0.003 amplitude.
Both MP3 music loops pass in both browsers; Chromium also passes both Vorbis loops. All 38 candidates decode in each browser.
These results are release blockers, not permission to loosen thresholds or change the approved masters. Do not wire this pack into production yet.
Detailed cross-device/fatigue listening, masking with real weapon shots, manifest agreement and build-owned runtime integration remain pending.

Implementation validation: root `pnpm checks` passes (lint, formatting, types and unit tests; audio 177 pass / one slow test skipped).
The separate full-render comparison passes in 645 seconds, byte for byte against all approved masters.
Six targeted mutations (peak, frame count, join measurement, audition exclusion, source hash and stale-report removal)
were killed by their corresponding tests and restored. Both browser negative controls reject corrupt audio and a discontinuous loop.
The exporter integration test was observed red before implementation; measurement cover was proved by mutation.
Game acceptance specs were not run: no runtime/gameplay code changed. Compressed-candidate QA remains red for the findings above.
