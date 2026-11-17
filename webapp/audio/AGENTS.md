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

`RenderAudio.ts` is the entry point; `pack/` assembles the approved pack. Separate studies live under `studies/` and must not enter the approved pack implicitly.
See the [historical module catalogue](../../docs/history/2026-11-17-compaction/AudioInstructions.md#layout-generator-scripts)
for the earlier file tour. Inspect the current caller and tests when editing.

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
