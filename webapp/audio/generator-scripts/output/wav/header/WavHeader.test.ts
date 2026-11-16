import {expect, it} from "vitest";
import {wavHeader} from "@gunsmith/audio-studies/output/wav/header/WavHeader";

it("is the 44 bytes of a canonical PCM WAV header", () => {
  expect(wavHeader({frames: 100, channelCount: 1}).length).toBe(44);
});

it("names the file RIFF, WAVE, fmt and data in their places", () => {
  const header = wavHeader({frames: 100, channelCount: 1});

  expect(header.toString("ascii", 0, 4)).toBe("RIFF");
  expect(header.toString("ascii", 8, 12)).toBe("WAVE");
  expect(header.toString("ascii", 12, 16)).toBe("fmt ");
  expect(header.toString("ascii", 36, 40)).toBe("data");
});

it("says it is 16-bit linear PCM at 48 kHz, with a 16-byte format chunk", () => {
  const header = wavHeader({frames: 100, channelCount: 2});

  expect(header.readUInt32LE(16)).toBe(16);
  expect(header.readUInt16LE(20)).toBe(1);
  expect(header.readUInt32LE(24)).toBe(48000);
  expect(header.readUInt16LE(34)).toBe(16);
});

it("counts the channels, and works out the frame size and byte rate from them", () => {
  const mono = wavHeader({frames: 10, channelCount: 1});
  const stereo = wavHeader({frames: 10, channelCount: 2});

  expect(mono.readUInt16LE(22)).toBe(1);
  expect(mono.readUInt16LE(32)).toBe(2);
  expect(mono.readUInt32LE(28)).toBe(96000);
  expect(stereo.readUInt16LE(22)).toBe(2);
  expect(stereo.readUInt16LE(32)).toBe(4);
  expect(stereo.readUInt32LE(28)).toBe(192000);
});

it("sizes the data chunk from the frames, and the RIFF chunk as everything after its own eight bytes", () => {
  const header = wavHeader({frames: 100, channelCount: 2});

  expect(header.readUInt32LE(40)).toBe(400);
  expect(header.readUInt32LE(4)).toBe(400 + 44 - 8);
});

it("is the same every time", () => {
  expect(wavHeader({frames: 5, channelCount: 1})).toStrictEqual(wavHeader({frames: 5, channelCount: 1}));
});
