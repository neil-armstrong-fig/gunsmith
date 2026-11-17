# Historical snapshot: webapp/audio/AGENTS.md

Captured 2026-11-17 before compaction. This is historical context, not active
instructions or a current task list. Relative Markdown links have been rebased.
Current source: [active document](../../../webapp/audio/AGENTS.md).

# AGENTS.md: audio

`@gunsmith/audio-studies` renders the original audition pack (effects, two music loops and a mixed audition) offline with
`node-web-audio-api`, and writes WAVs and `measurements.json` into `generated-audio/`. It then encodes the WAV masters
to Ogg Vorbis and MP3 candidates in `encoded-audio/` with `ffmpeg`, and checks those natively and in Chromium and WebKit. It is a private tooling workspace
owned by `art`, not a game package, and it is never imported by the game. `README.md` is the listening guide and the
decisions; this file is how the code is laid out. The root `AGENTS.md` standards apply.

## The rule that matters most

**`generated-audio/` is the product, and the user has approved how it sounds.** A change to the code must leave every file
in it byte for byte the same, unless the user has asked for the sound to change. `pack/verification/RenderedPack.test.ts` checks exactly that.
When a sound is meant to change, re-render with `pnpm render`, say so, and let the user listen before anything is called done.

## Commands

```bash
pnpm --filter @gunsmith/audio-studies checks   # lint, format, types and the fast tests (a few seconds; vitest, see vitest.config.ts)
pnpm --filter @gunsmith/audio-studies render        # re-render the pack into generated-audio/ (replaces the files)
pnpm --filter @gunsmith/audio-studies test:render   # render the whole pack into a temp folder and compare every file
                                                    # to generated-audio/ byte for byte (minutes; not in checks)
pnpm --filter @gunsmith/audio-studies encode          # masters -> encoded-audio/ (needs ffmpeg with libvorbis; see the README)
pnpm --filter @gunsmith/audio-studies verify:encoded   # decode every export natively; writes verification.json
pnpm --filter @gunsmith/audio-studies verify:browser   # decode them in Chromium and WebKit; writes browser-verification.json
```

`verify:encoded` and `verify:browser` exit non-zero while art's findings stand (the README lists them): a red run is the
result, not a fault in the tool. `encode` replaces `encoded-audio/`, and Ogg bytes change on every encode (the container
carries a random stream serial number), so compare a re-encode by decoded audio, MP3 by hash.

Run `test:render` after any change to a recipe, the synthesis, the levels or the encoding. The fast tests cover every stage
on its own, and the whole pipeline on a tiny pack; `pack/verification/CommittedPack.test.ts` checks the committed WAVs against the hashes
recorded in `measurements.json`.

## Layout (`generator-scripts/`)

Imports use the package's own name, `@gunsmith/audio-studies/...`, as `engine/` does.

**A folder's root is one file and its test: the entry point of that subject.** Whatever the entry point leans on sits in a
subfolder beneath it, named for its subject, and every interface in a `types/` folder. Where several pieces are peers with no
single entry (`common/levels/`, `generators/`, `generators/music/bar/`, `output/`), the folder holds only subfolders, one per piece. Two folders hold tests
with no subject file: `generators/music/arrangements/Arrangements.test.ts` (it checks both tracks against each other) and
`pack/verification/` (the whole-pack tests). When you add a file, give it a folder of its own beside its peers rather than
dropping it into a root.

The code is in three layers, and imports only run down them: **`generators/`** make cues, **`common/`** is what everything reads,
and **`synthesis/`**, **`output/`** and **`pack/`** consume cues. A generator imports only `common/`; nothing in `common/`
imports any other folder; no consumer imports a generator. If a second layer needs something that lives in a generator, move
it to `common/` rather than reaching across.

- `RenderAudio.ts`: the entry point. `renderAudio(output, pack)` renders every cue, writes the WAVs in a fixed
  order, the audition mix, and `measurements.json`.
- `common/`: `types/` is the shared vocabulary: `Cue` (a list of `Voice`s with a length, channel count and peak), `Voice` (a
  `ToneVoice` or a `NoiseVoice`, in `voice/` with their shared parts) and `RenderedCue`. `format/` is `AudioFormat`, 48 kHz,
  16-bit, 128 BPM. `noise-seed/` is the house seed the footfalls count up from. `step-key/` names the footfall cues, which the
  mix refers to as well as the effects. `levels/` has `peak/` (finds a peak), `normalize/` (scales to a target) and `limit/`
  (pulls a mix down).
- `generators/effects/`: `MakeEffects` lists the cues. `metallic/` builds a strike (`recipes/` has the effects as data,
  `strike/` the tuned numbers); `steps/` builds a footfall (`stance/` has the stance table); `damage/` makes the two
  selected incoming-damage crunch (`MakeDamageCandidates`), which `MakeEffects` does not list, so it is not in the pack.
- `generators/music/`: `MakeMusic` plays each bar of an `Arrangement`, a list of eight-bar `Section`s. `arrangements/` has one
  folder per track (`match/`, `menu/`) and the shared `bass/` and `kick/` patterns; `bar/` has one folder per instrument
  (`bass/`, `drums/`, `hats/`, `melody/`) plus `note/` and `pan/`. Change the music by editing a section, not by adding a branch.
- `synthesis/`: `RenderCue` (offline render; a loop is rendered three times and the middle kept). `schedule/` holds
  `ScheduleVoice` and what it leans on: `chain/` (the filter, panner and gain), `tone-source/`, `noise-source/` and `shape/`
  (the envelope and filter numbers, `VoiceShape`). `noise/` is the seeded generator.
- `output/`: `mix/` (`MakeMix`, with `layer/` and `timeline/`), `wav/` (`WriteWav`, which checks then writes, with `header/`,
  `pcm/`, `seam/` and `measure/`), `measurements/` (`WriteMeasurements`, with `read/` and its `types/`) and `mastering/`
  (the peak ceiling, the mix ceiling, the loop-join limit).
- `pack/`: `MakeAudioPack` is the real pack (`types/AudioPack`). `verification/` holds the tests that look at the whole pack:
  `PackFingerprint` (the recipes), `CommittedPack` (the committed WAVs against their hashes) and `RenderedPack` (the slow
  byte-for-byte render).
- `studies/`: renders that are not the approved pack, one folder per study. `combat-feedback/RenderCombatFeedback` writes the
  selected crunch and its `measurements.json` into the `output` it is given (run as a script, into
  `webapp/audio/studies/combat-feedback/`, with `node generator-scripts/studies/combat-feedback/RenderCombatFeedback.ts`); its
  test checks the render against that committed folder byte for byte, as `CommittedPack` does for the pack, so a changed recipe
  needs a re-render and a listen.
- `encoding/`: `EncodeAudio` encodes every measured master but the audition mix into a staging folder and publishes only if all
  succeeded, the report last (`publish/`). `masters/` loops the masters and `masters/master/` encodes one (hash checked
  before and after, so the approved masters are never changed); `encoder-arguments/` is the one list of `ffmpeg` arguments
  (`codec/` holds each codec's flags), `settings/` the rate and qualities, `files/` what an export may be called, and `format/`
  the two formats. `process/` runs a program without a shell and finds the build (`binary/`: the `FFMPEG` override, Homebrew's full
  build, or the system one). `verification/VerifyEncoded` decodes every export **with the same build that encoded it** (its
  `ffprobe` is the one beside it): a wrong name, hash or codec stops it with no report; a finding (`failures/`: length, loop join,
  crouch level, against `limits/`) is written to `verification.json` and then fails. `pcm/` measures decoded floats and
  `report/` reads and writes the three reports (Prettier-formatted, so a report passes `format:check`). `fixture/` builds the
  small source the tests encode.
- `browser/`: `VerifyBrowserAudio` serves the check page from this machine (`serve/`, a port the system picks, only the page and
  `encoded-audio/`), opens it in each browser (`run/`), and proves the check can fail with two controls (`controls/`: a corrupt
  file, a loop that jumps at its join). `page/` is the page and its script, plain JavaScript because it runs in the browser;
  it takes its limits from `VERIFICATION_LIMITS`, which the runner injects, so a limit is written once. Playwright is
  borrowed from `acceptance-tests/` (`playwright/LoadPlaywright`), not a dependency of this package.

## Conventions specific to this package

- **Float order is part of the output.** Rendered samples are 32-bit floats and the files are hashed. Where the code
  multiplies and then divides, or sums in a set order (`common/levels/normalize/NormalizeInPlace`, `output/wav/pcm/EncodePcm`), that is the order
  the approved pack was rendered in: a mathematically equal rewrite usually gives the same bits but is not guaranteed to, and
  `test:render` is what tells you. The same goes for the order voices are scheduled in and the order files are written.
- **A voice is a tone or a noise, never a bag of flags.** Noise carries a seed; a tone carries a pitch.
- **Numbers that were tuned by ear live in one named table** (`VOICE_SHAPE`, `STRIKE_SHAPE`, `STANCE_SHAPE`, `MASTERING`,
  `BASS_PATTERNS`, `KICK_PATTERNS`), not inline.
- **Encode and verify with one `ffmpeg` build.** Both read `FFMPEG` or Homebrew's full build, and `ffprobe` is found beside it, so a
  result names the build that made it. The limits a decoded export is held to (`encoding/verification/limits/`) are shared with the
  browser page, and the loop-join limit is the mastering one: compression may not make a loop click more than its master.
- **A red verification is a finding, never a number to loosen.** Do not change a limit, a tolerance or a master to make a run green.
- **The measurements record the engine version** (`output/measurements/WriteMeasurements.ts`); a test fails if it differs from the installed
  `node-web-audio-api`, which `pnpm-workspace.yaml` pins. Upgrading it means a re-render and the user's ear.
