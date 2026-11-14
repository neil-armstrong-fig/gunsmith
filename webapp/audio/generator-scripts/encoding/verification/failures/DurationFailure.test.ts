import assert from "node:assert/strict";
import {it} from "node:test";
import {durationFailure} from "@gunsmith/audio-studies/encoding/verification/failures/DurationFailure";

it("passes a decoded length within one frame of the master's", () => {
  assert.equal(durationFailure({name: "a.mp3", frames: 4800, seconds: 0.1}), undefined);
  assert.equal(durationFailure({name: "a.mp3", frames: 4801, seconds: 0.1}), undefined);
  assert.equal(durationFailure({name: "a.mp3", frames: 4799, seconds: 0.1}), undefined);
});

it("names the file and both lengths when it is two frames out, short or long", () => {
  const expected = "a.ogg: duration mismatch (4798 frames; expected 4800)";

  assert.equal(durationFailure({name: "a.ogg", frames: 4798, seconds: 0.1}), expected);
  assert.equal(
    durationFailure({name: "a.ogg", frames: 4802, seconds: 0.1}),
    "a.ogg: duration mismatch (4802 frames; expected 4800)",
  );
});
