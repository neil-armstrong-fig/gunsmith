# Ogg page-duration fix: 2026-11-14

Production remains blocked. This pass fixes export packaging; the approved sound,
formats, verification limits and runtime remain unchanged.

## Result

| Check                                | Before    | After     |
| ------------------------------------ | --------- | --------- |
| Native, 38 candidates                | 13 failed | 0 failed  |
| Chromium 156.0.8078.4, 38 candidates | 13 failed | 0 failed  |
| WebKit 27.2, 38 candidates           | 34 failed | 23 failed |

All candidates decode. Both browsers reject the corrupt-file and discontinuous-loop
controls. The WebKit crouch-level failure is resolved; all four pairs meet the
existing 6 dB margin. Reports retain exact frames, levels and joins.

Vorbis now uses `-page_duration 20000` (microseconds), with quality 5 unchanged.
Changing the default one-second pages corrected the measured frame-count
failures. The decoder-level cause has not been established. This is an observed packaging workaround, not a general
claim about every Vorbis decoder. [FFmpeg documents the option](https://ffmpeg.org/ffmpeg-formats.html#ogg).
A 20 ms scratch probe and one-packet pages gave the same remaining WebKit
failures; the smaller pages brought no further improvement. MP3 CBR and removing
ID3 metadata did not fix the sampled WebKit MP3 padding, so neither was adopted.

All 21 master/measurement files retain their hashes. All 19 MP3 exports retain
their hashes. Both native-decoded Vorbis music tracks are sample-identical.
Vorbis container overhead increases total Ogg bytes from 2,319,644 to 2,514,989
(about 8.4%). No gain, fade, trim, resampling or tempo change was introduced.

## Remaining build handoff

- WebKit MP3: all 17 effects have padded decoded durations. Both MP3 music loops pass.
- WebKit Vorbis: drop is 16,192 rather than 16,320 frames; reload 39,232 rather
  than 39,360; death 64,704 rather than 64,800; round-end 79,168 rather than 79,200.
- WebKit Vorbis music joins remain about 0.163 (match) and 0.175 (menu), exceeding
  the unchanged 0.003 limit. Correct duration and zero repetition error do not
  establish a good seam.

Build should reproduce these with the real playback path, then propose a supported
format-selection or playback-normalisation contract. Any timing correction must
preserve the cue's onset and content and use measured codec metadata; merely
truncating to the expected length cannot prove alignment. Art has not authorised
runtime trimming, browser exclusions, alternative formats or relaxed thresholds.
Listening on devices, fatigue, masking with the shot synthesiser and manifest
agreement remain open. Do not integrate these candidates as production-approved.

## Reproduce and evidence

From the repository root, with the existing full FFmpeg build and Playwright browsers:

```sh
pnpm --filter @gunsmith/audio-studies verify:encoded
pnpm --filter @gunsmith/audio-studies verify:browser
```

Native exits 0; browser verification exits 1 for the findings above. The commands
write their reports. Re-encoding replaces candidates and removes old reports;
use the exported `encodeAudio({source, output})` function with a temporary output
when experimenting rather than running `encode` against the delivered files.

Frozen baseline: [encoding inventory](evidence/BaselineEncoding.json),
[native report](evidence/BaselineNative.json), [browser report](evidence/BaselineBrowser.json).
[Preservation and size comparison](evidence/Preservation.json) records the music
PCM hashes. Current reports are in [encoded-audio](../../encoded-audio/).

Regression proof: before the flag, UI click decodes to 2,992 rather than 3,120
frames and hit to 10,560 rather than 9,600 natively. Both pass after it. Removing
only the flag reproduces those failures (four verification tests fail, including
the two positive regression cases); the source was restored byte for byte.

## Implementation validation

Root `pnpm checks` passed: lint, formatting, strict typechecks, 570 engine,
394 AI, 139 webapp and 254 audio tests; one slow audio test skipped. After the
single-caller encoder shim moved beneath verification, audio checks passed again.
The separate full-render check passed in 321 seconds, comparing all 21 files byte
for byte. Folder/caller and standards review completed before final checks.
No gameplay acceptance suite or model eval was run: runtime and AI code were not
changed by this delivery. WebKit production verification remains red as recorded.
