import assert from "node:assert/strict";
import {it} from "node:test";
import {isMusicKey} from "@gunsmith/audio-studies/encoding/files/IsMusicKey";

it("is true for a music loop and false for an effect", () => {
  assert.equal(isMusicKey("music-loop-match"), true);
  assert.equal(isMusicKey("sfx-music-box"), false);
  assert.equal(isMusicKey("sfx-hit"), false);
});
