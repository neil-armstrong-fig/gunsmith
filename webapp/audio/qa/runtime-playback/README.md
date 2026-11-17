# Audio format decision and build handoff — 2026-11-17

**MP3 is the user-confirmed compressed format.** Keep approved WAV masters.
The user subsequently authorized art/research 1 to switch the current runtime
empty click to MP3; future cue integration belongs to build. Safari timing
checks remain follow-up QA and do not block that approval. The listening
page and this investigation's seven JSON files were removed at the user's
request after review; this note preserves the decision and useful findings.
Existing codec tools, audio files and earlier QA evidence remain unchanged.

## Human listening review — 2026-11-17

The user compared WAV, Ogg and MP3 in Firefox, Chrome and Safari:

- Firefox/Chrome: all tested sounds and formats sounded good and the same.
- Safari hit: WAV good; Ogg harsher, possibly clipping; MP3 repeated more slowly.
- Safari ring warning: Ogg's first note sounded clipped; MP3 sounded good.
- Safari UI click: Ogg awful when looped; MP3 sounded like WAV but repeated slowly.

These are listening observations, not measurements of clipping or playback-rate
change. Browser versions, output device and selected context rate were not
supplied. Ogg correction is no longer the active production path.

## Useful diagnosis

Source commit `89e123b`; Node 26.13.1, FFmpeg 9.0.2, Chromium 156.0.8078.4 and
WebKit 27.2. QA ran against temporary copies, preserving delivered reports.

- Native and Chromium passed all 38 compressed candidates. WebKit reproduced
  23 failures: 17 MP3 effect durations, four Vorbis effect durations and both
  Vorbis music joins. Both browsers rejected corrupt audio and broken-loop controls.
- All 38 candidates produced identical live/offline decoded PCM in each browser
  at matching 48 kHz and default 44.1 kHz rates: equal lengths, zero sample error.
  Changing context type did not resolve the WebKit discrepancies.
- Live-decoded WebKit Vorbis music joins were about 0.163/0.175 at 48 kHz and
  0.151/0.159 at 44.1 kHz, above the unchanged 0.003 limit. MP3 music joins passed
  in both browsers at both rates. Three-repeat offline renders had zero
  repetition error; scheduling cannot remove a discontinuity inside a buffer.
- Ten production-preview cases played the original WAV or temporarily substituted
  UI-click/drop Ogg/MP3 through the game's existing empty-click player. All started
  in running contexts without page errors. Candidate buffer metrics matched the
  standalone study; no game source or state was changed.
- At 44.1 kHz, UI-click MP3 decoded to 2,866 frames in Chromium and 4,233 in
  WebKit; drop MP3 to 14,993 and 16,934 respectively. Extra decoded frames are
  consistent with slower whole-buffer repetition, but the exact perceptual
  cause was not established. No global timing correction is justified.

Earlier [alignment findings](../webkit-alignment/README.md) and
[codec baseline](../ogg-pages/README.md) retain their original evidence. The
new investigation's raw captures and temporary-tool provenance are intentionally
not retained. The game's music path does not yet exist; offline loop checks and
human audition are not a claim of music runtime integration or fatigue/masking QA.

## Build next

Use MP3 for production integration. The empty click has been switched under
its existing key at the user’s request. Schedule one-shot cues from game events,
independently of when a previous buffer ends. Follow up Safari onset, content
and intended cadence during play. Preserve approved WAV masters and existing thresholds;
do not globally trim buffers, apply sampled offsets or fade away broken joins.

The existing codec verifiers can reproduce baseline checks against temporary
copies of `encoded-audio/` and `generator-scripts/browser/page/`, through their
`verifyEncoded` and `verifyBrowserAudio` exports. No live-alignment or listening
command is maintained after this cleanup.

During delivery, seven synthetic probe checks, six production-preview empty-click
acceptance tests and Chromium/WebKit listening-page checks passed after recorded
red cases. These describe the completed investigation, not retained test coverage.
Final project checks and cleanup validation are recorded in `HANDOFF.md`.

## Runtime MP3 export — 2026-11-17

The selected 70 ms `empty-tight.wav` master is shipped as
`webapp/src/assets/sounds/files/sfx-empty-click.mp3`. Its stable key and
event-driven playback are unchanged. No gain, fade, trim or tempo processing
was applied. The redundant runtime WAV copy was removed; the approved master
remains in `studies/empty-weapon-click/`.

Encoder: FFmpeg 9.0.2, Homebrew full build. Reproduce from the repository root:

```sh
/opt/homebrew/opt/ffmpeg-full/bin/ffmpeg -v error -nostdin -y \
  -i webapp/audio/studies/empty-weapon-click/empty-tight.wav \
  -map 0:a:0 -map_metadata -1 -ar 48000 -c:a libmp3lame -q:a 2 \
  -write_xing 1 webapp/src/assets/sounds/files/sfx-empty-click.mp3
```

SHA-256 master: `c1ea912790b70b571f229488f641ed81082305a2d673cb1f4bf7b95622c5188f`.
SHA-256 MP3: `59d229cb1cce800c2e545800067b5c367e16a36794319a3d0b78591e767ded3e`.
Native probe confirms MP3, mono, 48 kHz; full native decoding succeeds.

## Runtime onset and cadence follow-up — 2026-11-17

Measured the shipped empty-click MP3 through `WebAudioOutput` on a production
build at art commit `4688a51`. Temporary instrumentation observed the actual
`decodeAudioData` buffer and `AudioBufferSourceNode.start` calls without changing
samples, playback rate, scheduling or game state. Chromium 156.0.8078.4 and
Playwright WebKit 27.2 each ran with default, explicit 44.1 kHz and explicit
48 kHz contexts; default resolved to 48 kHz in both. The temporary JavaScript
runner used Node 24.13.1; reference decoding used FFmpeg 9.0.2.

### Decoded content

Reference PCM is FFmpeg's decode of the **same shipped MP3**, resampled to the
context rate. This separates browser alignment from compression against the WAV.
The original duration tolerance remains one frame.

| Browser  | Context rate | Native / browser frames | Buffer length | Strongest-window offset   |
| -------- | ------------ | ----------------------- | ------------- | ------------------------- |
| Chromium | 48 kHz       | 3,360 / 3,360           | 70 ms         | 0 frames                  |
| Chromium | 44.1 kHz     | 3,087 / 3,086           | 69.98 ms      | 0 frames                  |
| WebKit   | 48 kHz       | 3,360 / 4,608           | 96 ms         | +576 frames (12 ms)       |
| WebKit   | 44.1 kHz     | 3,087 / 4,233           | 95.99 ms      | +529 frames (about 12 ms) |

Default-rate results repeat the explicit 48 kHz results. Chromium is within the
existing duration limit; WebKit exceeds it by 1,248/1,146 frames. These findings
do not change the approved MP3 format or its integration status.

Alignment used the highest-energy complete 512-frame reference window, searched
within ±1,024 frames with full-window overlap. It selected reference frame 0 in
all six runs. Normalised correlations were approximately 1.0000/0.9999 for
Chromium at 48/44.1 kHz and 1.0000/0.9578 for WebKit. The separate-peak margin
outside eight adjacent samples exceeded 0.71 in every run. This locates the
main transient; it does not establish a uniform offset throughout a file or
sample equality at 44.1 kHz.

WebKit's first 12 ms contains about 0.87–0.88% of the decoded signal's energy,
so it is **not silent padding**. Both browsers already have a sample above
0.001 absolute amplitude at frame 0: that simple threshold alone misses the
main-transient delay. Six synthetic controls checked unchanged/delayed/truncated
signals, rejection of incomplete-window matches and changed content, and the
threshold-onset calculation before accepting the measurements. No trim, fade,
sampled correction or threshold change is justified by this study.

### Game-event cadence

Each of the six runs drained a magazine while held, released the trigger and
then made twelve additional trigger holds with alternating short/long durations.
Every run recorded thirteen starts for thirteen holds, all in running contexts,
with no page errors. The twelve repeated presses each had a distinct recorded
start; no subsequent buffer completion was needed to start another click.

Observed repeated-start intervals were about 66–334 ms. In every run, three
intervals were shorter than the previous decoded buffer (70 ms in Chromium,
96 ms in WebKit), demonstrating that decoded duration does not impose a minimum
repeat interval in this game path. `WebAudioOutput` replaces the previous voice;
this does not prove that fast repeats preserve its tail or sound pleasant.

For the twelve repeated presses, pointer-event-to-`start()` call delays ranged
from 5.5–10 ms in Chromium and 12–15 ms in WebKit. These are JavaScript dispatch
measurements under automation, **not speaker/headphone latency or first-gesture
wake-up measurements**. They exclude the initial held trigger used to empty the
magazine and must not be added to the decoded offset as a measured device delay.

All six existing `ClickingOnAnEmptyWeapon` criteria pass in each browser on the
production build: twelve acceptance cases. This confirms the latch, release and
repress, reload-while-held, mute, non-empty suppression and MP3 path; it does not
turn the separate diagnostic timing observations into retained regression tests.

### Remaining listening work

Native Safari/device output still needs listening for first-gesture wake-up,
perceived onset and interrupted fast repeats, with browser version, context rate,
headphones/speakers and output volume recorded. Keep the approved MP3 and WAV
master unchanged unless the user requests a sound change.

Combat masking/fatigue cannot yet be judged against the real runtime weapon-shot
synth: the current game sound output only registers `sfx-empty-click`; weapon-shot
synthesis is not wired into this path. Art supplies static cues; AI owns shot
synthesis and play owns playback/mixing. Repeat headphone/speaker and sustained
combat listening after that integration, including empty clicks under shots and
future hit/ring cues. Do not substitute the general mixed audition as evidence.

No investigation code or new JSON reports were added to the repository. Local
captures and the temporary runner are under `/private/tmp/gunsmith-art-audio-timing/`;
this note preserves the method and useful results. Hash checks preserved all
69 inventoried WAV/MP3/Ogg and frozen-evidence files, including the shipped MP3.
