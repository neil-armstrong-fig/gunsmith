# WebKit alignment diagnosis — 2026-11-14

Diagnosis and build handoff only. Approved WAV masters and all 38 Ogg/MP3 exports
are unchanged. Production remains blocked. No runtime playback or format policy
is changed by this delivery.

## Findings

Fresh native verification passes 38/38; Chromium 156.0.8078.4 passes 38/38.
WebKit 27.2 reproduces 23 failures: 17 MP3 effect durations, four Vorbis effect
durations and both Vorbis music joins. Both browsers reject corrupt audio and
the discontinuous-loop control. Crouch levels pass.

The completed investigation compared each browser's decoded PCM with the native decode
of the **same compressed file**, independently per channel. This isolates decoder
alignment from the lossy encoder's differences against the WAV master.

| Observation                             | Chromium         | WebKit                               |
| --------------------------------------- | ---------------- | ------------------------------------ |
| Informative windows                     | 55, all offset 0 | 52: 28 at −128, 18 at +576, six at 0 |
| Inconclusive windows                    | 71               | 74                                   |
| Vorbis files with measured −128 offsets | 0                | 15 of 19                             |
| MP3 files with measured +576 offsets    | 0                | 11 of 19                             |

Positive means browser content is delayed relative to the native decode;
negative means it is advanced. These are observed **sample windows**, not proof
of a uniform shift through an entire file. No offset is inferred for a file
without an informative window. Stereo channels are measured separately.

Examples: drop Vorbis has 16,192 frames against 16,320 natively, with two −128
windows. UI-click Vorbis has the expected 3,120 frames but all three sampled
windows measure −128. Both music Vorbis files have the expected lengths but
informative windows measure −128, while their existing seam checks fail.
UI-click MP3 has 4,608 frames against 3,120 natively; two windows measure +576.
The music MP3 files have informative zero-offset windows and pass existing QA.

Thus length alone misses shifted content. A length deficit does not by itself
locate missing samples, and extra frames do not prove harmless trailing silence.
The observed offsets suggest decoder timing treatment deserves investigation;
this pass does not establish its implementation-level cause.

## Method and limits

Three 512-frame windows are compared per channel: near the beginning, middle
and end. Short files can have overlapping windows; they are not independent
trials. Search is ±2,048 samples with complete-window overlap required.
Normalised correlation must reach 0.95; separate peaks need a 0.01 margin.
Equal adjacent peaks are ambiguous. Window power below 1e-14 is inconclusive.
These are diagnostic confidence settings, **not production acceptance limits**.

The report distinguishes ambiguous, weak-match and energy/overlap failures.
Most tails are quiet and some musical/effect sections are repetitive. They must
not be reported as zero offset. Residual RMS error is measured after temporal
alignment without gain correction. No mono downmix masks stereo differences.

`Alignment.json` records every file hash, browser and native-decoder version,
expected/native/browser frame counts, channel windows, raw joins and ffprobe
stream/first-two-packet metadata. Metadata is supporting evidence; the probe did not rewrite tags or interpret
them as permission to trim. The native and
browser reports retain the unchanged duration, level, join and repetition checks.

## Build handoff

1. Reproduce these cases in the eventual playback path: UI click (correct-length
   shifted Vorbis versus padded MP3), drop (short Vorbis), and both music loops.
2. Determine whether the actual decoder/playback path has the same alignment.
   Trace timing metadata and onset/end content before proposing normalisation.
3. Preserve onset, content and loop phase. Do not apply −128/+576 corrections
   globally, truncate to a target duration, fade a broken join, or treat
   inconclusive windows as clean audio. Missing content cannot be recovered by
   trimming. Any runtime correction needs its own test-first contract.

No alternative codec, relaxed threshold, browser exclusion or production asset
mapping is proposed. Detailed listening, device/fatigue checks, masking with the
weapon-shot synthesiser and manifest agreement remain open.

## Reproduction status

The temporary alignment runner, helper, types and nine tests were removed at the
user's request after the investigation. The frozen measurements and methodology
above remain the handoff; there is no maintained alignment command or gate.
Source hashes in Provenance.json identify removed investigation code and are
historical identifiers, not paths that should still exist.

The existing native/browser QA tools remain available. Their verifyEncoded and
verifyBrowserAudio exports can run against a temporary copy of encoded-audio
and the existing browser page to reproduce the duration, level and seam matrix
without replacing delivered reports. A future playback fix should have a focused
regression test beside its implementation.

## Evidence and validation

- [Alignment measurements](evidence/Alignment.json): 76 browser/file rows.
- [Native QA](evidence/Native.json) and [browser QA with controls](evidence/Browser.json).
- [Preservation hashes](evidence/Preservation.json): all 20 WAVs, measurements and 38 exports.

During the investigation, nine synthetic-signal tests covered offset sign, equal-length lost onset, partial
overlap (including one missing sample), ambiguity/silence, changed content,
gain differences, trailing padding and independent stereo shifts. The original
behavior tests were watched red first. Three mutation probes were killed:
offset sign inversion, removing complete-overlap enforcement (a test gap found
and closed), and removing both ambiguity guards together. Individual ambiguity
guards overlap on the constant-signal fixture; no independent proof is claimed.
Source was restored byte for byte after each probe.

Final root `pnpm checks` exited 0 outside the sandbox: lint, formatting,
strict typechecks; 630 engine, 419 AI, 160 webapp and 263 audio tests passed,
one slow audio render skipped. Folder/caller and standards review completed.
[Provenance](Provenance.json) records evidence and historical source hashes.
The first sandboxed run stalled in the existing local-server test and was stopped;
the successful final run used restored sources after mutation testing. The full master render was not
needed: recipes, synthesis, levels and encoding were untouched. No gameplay
acceptance suite or model evaluation is claimed for this offline tooling change.

## Tool removal

The one-off alignment code and its tests were deleted after delivery at the
user's request. Evidence, existing codec QA, WAV masters and compressed exports
are retained. Root `pnpm checks` passes after removal: lint, formatting, strict
types and tests (254 audio tests pass, one slow render skipped). Frozen evidence
and audio hashes still match. Folder/caller and standards review completed.
