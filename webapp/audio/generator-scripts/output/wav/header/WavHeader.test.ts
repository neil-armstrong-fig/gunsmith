import assert from "node:assert/strict";
import {it} from "node:test";
import {wavHeader} from "@gunsmith/audio-studies/output/wav/header/WavHeader";

it("is the 44 bytes of a canonical PCM WAV header", () => {
  assert.equal(wavHeader({frames: 100, channelCount: 1}).length, 44);
});

it("names the file RIFF, WAVE, fmt and data in their places", () => {
  const header = wavHeader({frames: 100, channelCount: 1});

  assert.equal(header.toString("ascii", 0, 4), "RIFF");
  assert.equal(header.toString("ascii", 8, 12), "WAVE");
  assert.equal(header.toString("ascii", 12, 16), "fmt ");
  assert.equal(header.toString("ascii", 36, 40), "data");
});

it("says it is 16-bit linear PCM at 48 kHz, with a 16-byte format chunk", () => {
  const header = wavHeader({frames: 100, channelCount: 2});

  assert.equal(header.readUInt32LE(16), 16);
  assert.equal(header.readUInt16LE(20), 1);
  assert.equal(header.readUInt32LE(24), 48000);
  assert.equal(header.readUInt16LE(34), 16);
});

it("counts the channels, and works out the frame size and byte rate from them", () => {
  const mono = wavHeader({frames: 10, channelCount: 1});
  const stereo = wavHeader({frames: 10, channelCount: 2});

  assert.equal(mono.readUInt16LE(22), 1);
  assert.equal(mono.readUInt16LE(32), 2);
  assert.equal(mono.readUInt32LE(28), 96000);
  assert.equal(stereo.readUInt16LE(22), 2);
  assert.equal(stereo.readUInt16LE(32), 4);
  assert.equal(stereo.readUInt32LE(28), 192000);
});

it("sizes the data chunk from the frames, and the RIFF chunk as everything after its own eight bytes", () => {
  const header = wavHeader({frames: 100, channelCount: 2});

  assert.equal(header.readUInt32LE(40), 400);
  assert.equal(header.readUInt32LE(4), 400 + 44 - 8);
});

it("is the same every time", () => {
  assert.deepEqual(wavHeader({frames: 5, channelCount: 1}), wavHeader({frames: 5, channelCount: 1}));
});
