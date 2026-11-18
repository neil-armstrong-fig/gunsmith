import {expect, it} from "vitest";
import {loopSeamJump} from "@gunsmith/audio-studies/output/wav/seam/LoopSeamJump";

it("is the step from the last sample back round to the first, as a share of full scale", () => {
  expect(loopSeamJump(pcm([1000, 5, 9, 4000]), 1)).toBe(3000 / 32768);
});

it("is zero when the loop ends where it begins", () => {
  expect(loopSeamJump(pcm([700, 1, 2, 700]), 1)).toBe(0);
});

it("is the same whichever way round the step goes", () => {
  expect(loopSeamJump(pcm([4000, 0, 1000]), 1)).toBe(3000 / 32768);
});

it("takes the worst channel of a stereo loop", () => {
  // Frames are interleaved: L R L R L R. The left seam steps 100 and the right seam steps 800.
  expect(loopSeamJump(pcm([100, 10, 5, 5, 200, 810]), 2)).toBe(800 / 32768);
});

function pcm(samples: readonly number[]): Buffer {
  const data = Buffer.alloc(samples.length * 2);
  for (const [index, sample] of samples.entries()) {
    data.writeInt16LE(sample, index * 2);
  }

  return data;
}
