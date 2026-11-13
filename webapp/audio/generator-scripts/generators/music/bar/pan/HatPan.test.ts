import assert from "node:assert/strict";
import {it} from "node:test";
import {hatPan} from "@gunsmith/audio-studies/generators/music/bar/pan/HatPan";

it("puts even steps to the left and odd steps to the right, so the hats ping-pong", () => {
  assert.equal(hatPan(0), -0.32);
  assert.equal(hatPan(1), 0.32);
  assert.equal(hatPan(2), -0.32);
  assert.equal(hatPan(7), 0.32);
});
