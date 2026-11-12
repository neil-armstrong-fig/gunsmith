import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {writeFile} from "node:fs/promises";
import {join} from "node:path";
import {AUDIO_FORMAT} from "@gunsmith/audio-studies/AudioFormat";
import type {RenderedCue} from "@gunsmith/audio-studies/types/RenderedCue";
import type {Measurement} from "@gunsmith/audio-studies/types/Measurement";

/** Writes little-endian PCM and measures the encoded samples, including loop joins. */
export async function writeWav(output: string, renderedCue: RenderedCue): Promise<Measurement> {
  const {channels, key} = renderedCue;
  const first = channels[0];
  assert.ok(first);
  const frames = first.length;
  assert.ok(channels.every(channel => channel.length === frames));
  const blockAlign = channels.length * 2;
  const wav = Buffer.alloc(44 + frames * blockAlign);
  wav.write("RIFF", 0);
  wav.writeUInt32LE(wav.length - 8, 4);
  wav.write("WAVEfmt ", 8);
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(channels.length, 22);
  wav.writeUInt32LE(AUDIO_FORMAT.sampleRate, 24);
  wav.writeUInt32LE(AUDIO_FORMAT.sampleRate * blockAlign, 28);
  wav.writeUInt16LE(blockAlign, 32);
  wav.writeUInt16LE(AUDIO_FORMAT.sampleBits, 34);
  wav.write("data", 36);
  wav.writeUInt32LE(wav.length - 44, 40);
  let peak = 0;
  let power = 0;
  for (let frame = 0; frame < frames; frame += 1) {
    for (const [index, channel] of channels.entries()) {
      const sample = channel[frame];
      assert.ok(sample !== undefined && Number.isFinite(sample) && Math.abs(sample) <= 0.708, `${key}: headroom`);
      const pcm = Math.round(sample * 32767);
      wav.writeInt16LE(pcm, 44 + frame * blockAlign + index * 2);
      peak = Math.max(peak, Math.abs(pcm) / 32768);
      power += (pcm / 32768) ** 2;
    }
  }
  assert.ok(peak > 0, `${key}: silent`);
  const measurement: Measurement = {
    seconds: frames / AUDIO_FORMAT.sampleRate,
    channels: channels.length,
    peakDbfs: dbfs(peak),
    rmsDbfs: dbfs(Math.sqrt(power / (frames * channels.length))),
    sha256: createHash("sha256").update(wav).digest("hex"),
  };
  if (renderedCue.loop) {
    let jump = 0;
    for (let channel = 0; channel < channels.length; channel += 1) {
      const firstSample = wav.readInt16LE(44 + channel * 2);
      const lastSample = wav.readInt16LE(wav.length - blockAlign + channel * 2);
      jump = Math.max(jump, Math.abs(firstSample - lastSample) / 32768);
    }
    assert.ok(jump < 0.003, `${key}: loop discontinuity ${jump}`);
    measurement.seamJumpDbfs = dbfs(jump);
    measurement.threeRepeatsSeconds = measurement.seconds * 3;
  }
  await writeFile(join(output, `${key}.wav`), wav);
  return measurement;
}

function dbfs(amplitude: number): number {
  return Number((20 * Math.log10(Math.max(amplitude, 1e-9))).toFixed(2));
}
