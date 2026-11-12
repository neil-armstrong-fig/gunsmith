import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {mkdtemp, readFile, readdir, rm} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {it} from "node:test";
import {OfflineAudioContext} from "node-web-audio-api";
import {renderAudio} from "@gunsmith/audio-studies/RenderAudio";

it("renders all cues as valid WAVs, preserves music continuity and repeats deterministically", async () => {
  const output = await mkdtemp(join(tmpdir(), "gunsmith-audio-"));
  try {
    await renderAudio(output);
    const files = (await readdir(output)).filter(file => file.endsWith(".wav"));
    assert.equal(files.length, 14);
    assert.deepEqual(files.sort(), [
      "audition-mix.wav",
      "music-loop-match.wav",
      "music-loop-menu.wav",
      "sfx-death.wav",
      "sfx-drop.wav",
      "sfx-hit.wav",
      "sfx-pickup.wav",
      "sfx-reload.wav",
      "sfx-ring-warning.wav",
      "sfx-round-end.wav",
      "sfx-round-start.wav",
      "sfx-step-crouch.wav",
      "sfx-step-stand.wav",
      "sfx-ui-click.wav",
    ]);
    const hashes = new Map<string, string>();
    const levels = new Map<string, number>();
    for (const file of files) {
      const wav = await readFile(join(output, file));
      hashes.set(file, createHash("sha256").update(wav).digest("hex"));
      assert.equal(wav.toString("ascii", 0, 4), "RIFF");
      assert.equal(wav.toString("ascii", 8, 12), "WAVE");
      assert.equal(wav.toString("ascii", 12, 16), "fmt ");
      assert.equal(wav.toString("ascii", 36, 40), "data");
      assert.equal(wav.readUInt16LE(20), 1);
      assert.equal(wav.readUInt32LE(24), 48000);
      assert.equal(wav.readUInt16LE(34), 16);
      assert.equal(wav.readUInt32LE(4), wav.length - 8);
      assert.equal(wav.readUInt32LE(40), wav.length - 44);
      const channels = wav.readUInt16LE(22);
      assert.equal(channels, file.startsWith("sfx-") ? 1 : 2);
      const frames = (wav.length - 44) / (channels * 2);
      const duration = frames / 48000;
      const context = new OfflineAudioContext(channels, frames, 48000);
      const decoded = await context.decodeAudioData(Uint8Array.from(wav).buffer);
      assert.equal(decoded.length, frames);
      assert.equal(decoded.numberOfChannels, channels);
      if (file.startsWith("sfx-")) {
        assert.ok(duration > 0 && (duration < 2 || file === "sfx-ring-warning.wav"));
      } else {
        assert.equal(duration, 15);
      }
      let power = 0;
      let peak = 0;
      for (let offset = 44; offset < wav.length; offset += 2) {
        const sample = wav.readInt16LE(offset) / 32768;
        assert.ok(Number.isFinite(sample));
        peak = Math.max(peak, Math.abs(sample));
        power += sample * sample;
      }
      assert.ok(peak > 0 && peak < 0.708);
      levels.set(file, Math.sqrt(power / (frames * channels)));
      if (file.startsWith("music-")) {
        // Check both joins in three repeats of the encoded PCM.
        const pcm = wav.subarray(44);
        const triple = Buffer.concat([pcm, pcm, pcm]);
        for (const boundary of [pcm.length, pcm.length * 2]) {
          for (let channel = 0; channel < channels; channel += 1) {
            const before = triple.readInt16LE(boundary - channels * 2 + channel * 2);
            const after = triple.readInt16LE(boundary + channel * 2);
            assert.ok(Math.abs(before - after) / 32768 < 0.003);
          }
        }
      }
    }
    const stand = levels.get("sfx-step-stand.wav");
    const crouch = levels.get("sfx-step-crouch.wav");
    assert.ok(stand !== undefined && crouch !== undefined);
    assert.ok(crouch < stand * 0.51);
    await renderAudio(output);
    for (const [file, hash] of hashes) {
      const wav = await readFile(join(output, file));
      assert.equal(createHash("sha256").update(wav).digest("hex"), hash);
    }
  } finally {
    await rm(output, {recursive: true, force: true});
  }
});
