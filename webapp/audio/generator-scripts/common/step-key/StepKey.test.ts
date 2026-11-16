import {expect, it} from "vitest";
import {STEP_VARIANTS} from "@gunsmith/audio-studies/common/step-key/StepVariants";
import {stepKey} from "@gunsmith/audio-studies/common/step-key/StepKey";

it("names the first variant of a stance with no number", () => {
  expect(stepKey("stand", 0)).toBe("sfx-step-stand");
  expect(stepKey("crouch", 0)).toBe("sfx-step-crouch");
});

it("numbers the other variants from 02, so the first is 01 in all but name", () => {
  expect(stepKey("stand", 1)).toBe("sfx-step-stand-02");
  expect(stepKey("stand", 2)).toBe("sfx-step-stand-03");
  expect(stepKey("crouch", 3)).toBe("sfx-step-crouch-04");
});

it("has four variants", () => {
  expect(STEP_VARIANTS).toBe(4);
});
