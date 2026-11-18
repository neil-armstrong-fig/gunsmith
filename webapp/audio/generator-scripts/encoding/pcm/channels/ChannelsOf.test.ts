import {expect, it} from "vitest";
import {channelsOf} from "@gunsmith/audio-studies/encoding/pcm/channels/ChannelsOf";

it("splits interleaved little-endian floats into one array per channel", () => {
  const channels = channelsOf(floats([0.25, -0.5, 0.125, 0.75]), 2);

  expect(channels.map(channel => Array.from(channel))).toStrictEqual([
    [0.25, 0.125],
    [-0.5, 0.75],
  ]);
});

it("rejects nothing at all, and a length that is not a whole number of frames", () => {
  expect(() => channelsOf(Buffer.alloc(0), 1)).toThrow(/Invalid PCM length/);
  expect(() => channelsOf(Buffer.alloc(3), 1)).toThrow(/Invalid PCM length/);
  expect(() => channelsOf(floats([0.1, 0.2, 0.3]), 2)).toThrow(/Invalid PCM length/);
});

it("rejects a sample that is not a finite number", () => {
  expect(() => channelsOf(floats([0.1, NaN]), 1)).toThrow(/Invalid PCM sample/);
  expect(() => channelsOf(floats([Infinity, 0.1]), 1)).toThrow(/Invalid PCM sample/);
});

function floats(values: number[]): Buffer {
  const pcm = Buffer.alloc(values.length * 4);
  values.forEach((value, index) => pcm.writeFloatLE(value, index * 4));

  return pcm;
}
