import {expect, it} from "vitest";
import {noteFrequency} from "@gunsmith/audio-studies/generators/music/bar/note/NoteFrequency";

it("puts concert A at 440 Hz", () => {
  expect(noteFrequency(69)).toBe(440);
});

it("doubles every octave", () => {
  expect(noteFrequency(81)).toBe(880);
  expect(noteFrequency(57)).toBe(220);
});

it("tunes D4, the key of the music, to its even-tempered pitch", () => {
  expect(Math.abs(noteFrequency(62) - 293.6648)).toBeLessThan(1e-3);
});
