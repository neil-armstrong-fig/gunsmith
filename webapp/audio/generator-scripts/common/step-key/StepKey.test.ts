import assert from "node:assert/strict";
import {it} from "node:test";
import {STEP_VARIANTS, stepKey} from "@gunsmith/audio-studies/common/step-key/StepKey";

it("names the first variant of a stance with no number", () => {
  assert.equal(stepKey("stand", 0), "sfx-step-stand");
  assert.equal(stepKey("crouch", 0), "sfx-step-crouch");
});

it("numbers the other variants from 02, so the first is 01 in all but name", () => {
  assert.equal(stepKey("stand", 1), "sfx-step-stand-02");
  assert.equal(stepKey("stand", 2), "sfx-step-stand-03");
  assert.equal(stepKey("crouch", 3), "sfx-step-crouch-04");
});

it("has four variants", () => {
  assert.equal(STEP_VARIANTS, 4);
});
