import assert from "node:assert/strict";
import {it} from "node:test";
import {channelsOf} from "@gunsmith/audio-studies/encoding/pcm/channels/ChannelsOf";

function floats(values: number[]): Buffer {
  const pcm = Buffer.alloc(values.length * 4);
  values.forEach((value, index) => pcm.writeFloatLE(value, index * 4));

  return pcm;
}

it("splits interleaved little-endian floats into one array per channel", () => {
  const channels = channelsOf(floats([0.25, -0.5, 0.125, 0.75]), 2);

  assert.deepEqual(
    channels.map(channel => Array.from(channel)),
    [
      [0.25, 0.125],
      [-0.5, 0.75],
    ],
  );
});

it("rejects nothing at all, and a length that is not a whole number of frames", () => {
  assert.throws(() => channelsOf(Buffer.alloc(0), 1), /Invalid PCM length/);
  assert.throws(() => channelsOf(Buffer.alloc(3), 1), /Invalid PCM length/);
  assert.throws(() => channelsOf(floats([0.1, 0.2, 0.3]), 2), /Invalid PCM length/);
});

it("rejects a sample that is not a finite number", () => {
  assert.throws(() => channelsOf(floats([0.1, NaN]), 1), /Invalid PCM sample/);
  assert.throws(() => channelsOf(floats([Infinity, 0.1]), 1), /Invalid PCM sample/);
});
