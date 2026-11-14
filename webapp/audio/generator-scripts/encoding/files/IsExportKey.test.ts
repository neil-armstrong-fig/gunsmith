import assert from "node:assert/strict";
import {it} from "node:test";
import {isExportKey} from "@gunsmith/audio-studies/encoding/files/IsExportKey";

it("accepts the keys of effects and music, with numbered variants", () => {
  assert.equal(isExportKey("sfx-ui-click"), true);
  assert.equal(isExportKey("sfx-step-crouch-04"), true);
  assert.equal(isExportKey("music-loop-match"), true);
});

it("rejects the audition mix, which is not exported", () => {
  assert.equal(isExportKey("audition-mix"), false);
});

it("rejects anything that is not a lowercase name made of words and digits", () => {
  for (const key of ["", "sfx-", "music-", "sfx-Hit", "sfx hit", "../sfx-hit", "sfx-hit.wav", "sfx-hit\n", "SFX-hit"]) {
    assert.equal(isExportKey(key), false, JSON.stringify(key));
  }
});
