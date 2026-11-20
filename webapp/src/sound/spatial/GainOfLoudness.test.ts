import {LOUDNESSES} from "@gunsmith/engine/sound/Loudnesses";
import {gainOfLoudness} from "@src/sound/spatial/GainOfLoudness";

it("plays a near sound as the file is, and each farther one quieter than the last", () => {
  expect(gainOfLoudness("near")).toBe(1);
  expect(gainOfLoudness("mid")).toBeLessThan(gainOfLoudness("near"));
  expect(gainOfLoudness("far")).toBeLessThan(gainOfLoudness("mid"));
});

it("never plays a heard sound in silence", () => {
  expect(LOUDNESSES.every(loudness => gainOfLoudness(loudness) > 0)).toBe(true);
});
