import assert from "node:assert/strict";
import {it} from "node:test";
import {mimeType} from "@gunsmith/audio-studies/browser/serve/mime/MimeType";

it("gives each kind of file the type a browser needs to run or decode it", () => {
  assert.equal(mimeType("index.html"), "text/html; charset=utf-8");
  assert.equal(mimeType("DecodePage.js"), "text/javascript; charset=utf-8");
  assert.equal(mimeType("report.json"), "application/json");
  assert.equal(mimeType("sfx-hit.mp3"), "audio/mpeg");
  assert.equal(mimeType("sfx-hit.ogg"), "audio/ogg");
});

it("gives anything else the plain binary type", () => {
  assert.equal(mimeType("notes.txt"), "application/octet-stream");
  assert.equal(mimeType("noextension"), "application/octet-stream");
});
