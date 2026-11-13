import assert from "node:assert/strict";
import {it} from "node:test";
import {makeMelody} from "@gunsmith/audio-studies/generators/music/bar/melody/MakeMelody";
import {noteFrequency} from "@gunsmith/audio-studies/generators/music/bar/note/NoteFrequency";
import type {BarPosition} from "@gunsmith/audio-studies/generators/music/bar/types/BarPosition";

function position(sparse: boolean, sectionIndex = 0): BarPosition {
  return {
    bar: 0,
    sectionIndex,
    section: {sparse, kickBeats: [], bassSteps: [], melody: [62, 65, 69, 65]},
    root: 38,
    start: 8,
    beat: 0.5,
  };
}

it("plays each note of a full section on the off-beat, with a quieter echo three-eighths of a beat after it", () => {
  const voices = makeMelody(position(false));

  assert.equal(voices.length, 8);
  assert.deepEqual(
    voices.map(voice => voice.at),
    [8.25, 8.625, 8.75, 9.125, 9.25, 9.625, 9.75, 10.125],
  );
});

it("plays a triangle wave at the note's pitch, with the echo much quieter and on the other side", () => {
  const [note, echo] = makeMelody(position(false));

  assert.deepEqual(note, {
    kind: "tone",
    at: 8.25,
    duration: 0.62,
    frequency: noteFrequency(62),
    wave: "triangle",
    cutoff: 2200,
    gain: 0.14,
    pan: -0.32,
  });
  assert.equal(echo?.gain, 0.04);
  assert.equal(echo?.pan, 0.32);
});

it("plays only the first and third notes of a sparse section", () => {
  const voices = makeMelody(position(true));

  assert.deepEqual(
    voices.filter((_, index) => index % 2 === 0).map(voice => voice.kind === "tone" && voice.frequency),
    [noteFrequency(62), noteFrequency(69)],
  );
  assert.equal(voices.length, 4);
});

it("closes its filter a little more in each section", () => {
  assert.equal(makeMelody(position(false, 0))[0]?.cutoff, 2200);
  assert.equal(makeMelody(position(false, 4))[0]?.cutoff, 2200 - 4 * 100);
});
