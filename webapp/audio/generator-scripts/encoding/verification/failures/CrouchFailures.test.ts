import assert from "node:assert/strict";
import {it} from "node:test";
import {crouchFailures} from "@gunsmith/audio-studies/encoding/verification/failures/CrouchFailures";
import type {PcmMeasurement} from "@gunsmith/audio-studies/encoding/pcm/types/PcmMeasurement";

function measuredAt(rmsDbfs: number): PcmMeasurement {
  return {frames: 1, peak: 0.5, rmsDbfs, loopJump: 0};
}

it("passes a crouched footfall at least 6 dB quieter than its standing pair, and one exactly 6 dB quieter", () => {
  assert.deepEqual(
    crouchFailures({"sfx-step-stand.ogg": measuredAt(-20), "sfx-step-crouch.ogg": measuredAt(-26.5)}),
    [],
  );
  assert.deepEqual(crouchFailures({"sfx-step-stand.ogg": measuredAt(-20), "sfx-step-crouch.ogg": measuredAt(-26)}), []);
});

it("names a crouched footfall that is less than 6 dB quieter", () => {
  assert.deepEqual(
    crouchFailures({"sfx-step-stand-02.mp3": measuredAt(-20), "sfx-step-crouch-02.mp3": measuredAt(-25.9)}),
    ["sfx-step-crouch-02.mp3: crouch less than 6 dB quieter"],
  );
});

it("pairs each variant and format with its own standing footfall, and skips one with no pair", () => {
  assert.deepEqual(
    crouchFailures({"sfx-step-stand.ogg": measuredAt(-20), "sfx-step-crouch-03.ogg": measuredAt(-1)}),
    [],
  );
  assert.deepEqual(crouchFailures({"sfx-step-stand.ogg": measuredAt(-20), "sfx-step-crouch.mp3": measuredAt(-1)}), []);
});

it("ignores every file that is not a crouched footfall", () => {
  assert.deepEqual(crouchFailures({"sfx-hit.ogg": measuredAt(-1), "sfx-step-stand.ogg": measuredAt(-1)}), []);
});
