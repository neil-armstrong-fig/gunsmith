import assert from "node:assert/strict";
import {it} from "node:test";
import {noteFrequency} from "@gunsmith/audio-studies/generators/music/bar/note/NoteFrequency";

it("puts concert A at 440 Hz", () => {
  assert.equal(noteFrequency(69), 440);
});

it("doubles every octave", () => {
  assert.equal(noteFrequency(81), 880);
  assert.equal(noteFrequency(57), 220);
});

it("tunes D4, the key of the music, to its even-tempered pitch", () => {
  assert.ok(Math.abs(noteFrequency(62) - 293.6648) < 1e-3);
});
