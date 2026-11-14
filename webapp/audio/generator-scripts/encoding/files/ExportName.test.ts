import assert from "node:assert/strict";
import {it} from "node:test";
import {exportName} from "@gunsmith/audio-studies/encoding/files/ExportName";

it("names an export after its master's key and its format", () => {
  assert.equal(exportName("sfx-hit", "ogg"), "sfx-hit.ogg");
  assert.equal(exportName("music-loop-menu", "mp3"), "music-loop-menu.mp3");
});
