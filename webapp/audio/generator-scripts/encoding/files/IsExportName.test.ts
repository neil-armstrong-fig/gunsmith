import assert from "node:assert/strict";
import {it} from "node:test";
import {isExportName} from "@gunsmith/audio-studies/encoding/files/IsExportName";

it("accepts a good key in either export format", () => {
  assert.equal(isExportName("sfx-hit", "ogg"), true);
  assert.equal(isExportName("music-loop-menu", "mp3"), true);
});

it("rejects a format that is not exported", () => {
  for (const format of ["wav", "flac", "OGG", "ogg.exe", ""]) {
    assert.equal(isExportName("sfx-hit", format), false, format);
  }
});

it("rejects a bad key whatever the format", () => {
  assert.equal(isExportName("audition-mix", "ogg"), false);
  assert.equal(isExportName("../sfx-hit", "mp3"), false);
});
