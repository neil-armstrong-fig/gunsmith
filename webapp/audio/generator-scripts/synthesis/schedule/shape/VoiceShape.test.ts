import assert from "node:assert/strict";
import {it} from "node:test";
import {VOICE_SHAPE} from "@gunsmith/audio-studies/synthesis/schedule/shape/VoiceShape";

// These numbers were tuned by ear and the pack the user approved was rendered with them. A change here is a change of sound:
// run `pnpm test:render` to see the files change, let the user listen, and only then update this test.
it("has the envelope, filter and sweep numbers the approved pack was rendered with", () => {
  assert.deepEqual(VOICE_SHAPE, {
    attackSeconds: 0.003,
    releaseSeconds: 0.004,
    decayFloorGain: 0.00001,
    defaultCutoff: 12000,
    filterQ: 0.6,
    longestSweepSeconds: 0.08,
  });
});
