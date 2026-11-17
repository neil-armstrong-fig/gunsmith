import {expect, it} from "vitest";
import {makeRingDamageLoop} from "@gunsmith/audio-studies/generators/effects/ring-damage/MakeRingDamageLoop";

it("leaves headroom and avoids sharp single-sample steps throughout the sustained bed", () => {
  const renderedCue = makeRingDamageLoop();
  const channel = renderedCue.channels[0];
  if (!channel) {
    throw new Error("The ring damage bed has no channel");
  }

  expect(channel.every(Number.isFinite)).toBe(true);
  let peak = 0;
  let largestStep = 0;
  let previous = channel[channel.length - 1] ?? 0;
  for (const sample of channel) {
    peak = Math.max(peak, Math.abs(sample));
    largestStep = Math.max(largestStep, Math.abs(sample - previous));
    previous = sample;
  }
  expect(peak).toBeGreaterThan(0.02);
  expect(peak).toBeLessThanOrEqual(0.13);
  expect(largestStep).toBeLessThan(0.01);
});
