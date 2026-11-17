# Ring damage loop

A new candidate for play’s `sfx-ring-damage-loop`: a quiet, inharmonic electrical
bed with shallow erosion pulses, rather than repeated impacts. The user listened in Visual Studio Code and approved the sound on 2026-11-17.
Combat masking/fatigue with runtime weapon synthesis remains unmeasured.

[WAV master](sfx-ring-damage-loop.wav) ·
[MP3 export](sfx-ring-damage-loop.mp3)

The master is two seconds, mono, 48 kHz / 16-bit PCM. It sustains through both
ends without baked-in fades; periodic oscillators meet at a zero crossing.
Peak is −21.28 dBFS and RMS −28.81 dBFS. Those are sample measurements, not a
finished mix or perceived-loudness judgement. No approved audio was replaced.

## Playback handoff

Play owns key registration and loop start/stop. Start once when actual local
ring damage begins; stop when damage ceases, the round ends, mute is enabled,
or playback is cancelled. Use about 100 ms playback gain fades. Do not restart
on each simulation tick, play the crunch for the ring, or reuse the countdown
warning. Loop a single mono voice without positional information.

**Use the WAV for an exact continuous loop across the tested browsers.** The
MP3 passes the existing 0.003 sample seam limit and three-repeat scheduling
check, but WebKit decodes it to 2.04 seconds rather than 2.00. That padding can
produce a recurring gap; a small seam jump alone does not prove gapless content.
Keep MP3 as the compressed candidate until playback accounts for the padding
and is listened to. This is a ring-loop format finding, not a change to the
approved production format for the other cues. Use WAV for this ring loop; the other production cues remain MP3.

## Reproduce and verify

From `webapp/audio`:

```sh
node generator-scripts/studies/ring-damage/RenderRingDamage.ts
pnpm exec vitest run generator-scripts/studies/ring-damage/RenderRingDamage.test.ts generator-scripts/generators/effects/ring-damage/MakeRingDamageLoop.test.ts
```

The recipe is `generator-scripts/generators/effects/ring-damage/MakeRingDamageLoop.ts`.
Its tuned partials are intentionally inharmonic and phase-alternated to keep the
seam slope small. The renderer reuses the existing WAV writer and FFmpeg MP3
arguments; it only writes this study. [Measurements](measurements.json) record
native decoded length, level, seam, hashes and the exact encoder build.

[Browser evidence](browser-verification.json) covers WAV/MP3 in Chromium and
WebKit at 48/44.1 kHz: eight decodes, no clipping, joins below 0.003, and zero
sample error over three offline loop repeats. A 0.02 discontinuity control was
rejected against that unchanged limit. These are browser decode/scheduling
measurements, not device-output, first-gesture or listening evidence.
