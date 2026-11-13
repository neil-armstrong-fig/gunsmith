import assert from "node:assert/strict";
import {it} from "node:test";
import {makeBass} from "@gunsmith/audio-studies/generators/music/bar/bass/MakeBass";
import {noteFrequency} from "@gunsmith/audio-studies/generators/music/bar/note/NoteFrequency";
import type {BarPosition} from "@gunsmith/audio-studies/generators/music/bar/types/BarPosition";

function position(sparse: boolean, sectionIndex = 0): BarPosition {
  return {
    bar: 8,
    sectionIndex,
    section: {sparse, kickBeats: [], bassSteps: [0, 3, 8], melody: []},
    root: 38,
    start: 4,
    beat: 0.5,
  };
}

it("plays a sawtooth on each sixteenth-note step the section names", () => {
  assert.deepEqual(
    makeBass(position(false)).map(voice => voice.at),
    [4, 4.375, 5],
  );
});

it("plays the bar's root note, at the right pitch", () => {
  for (const voice of makeBass(position(false))) {
    assert.equal(voice.kind === "tone" && voice.frequency, noteFrequency(38));
    assert.equal(voice.kind === "tone" && voice.wave, "sawtooth");
    assert.equal(voice.gain, 0.28);
  }
});

it("plays short stabs in a full section and long notes in a sparse one", () => {
  assert.equal(makeBass(position(false))[0]?.duration, 0.5 * 0.43);
  assert.equal(makeBass(position(true))[0]?.duration, 0.5 * 0.9);
});

it("opens its filter a little more in each section, so the music brightens as it goes", () => {
  assert.equal(makeBass(position(false, 0))[0]?.cutoff, 680);
  assert.equal(makeBass(position(false, 3))[0]?.cutoff, 680 + 3 * 60);
});

it("plays nothing when the section names no steps", () => {
  const silent = {...position(false), section: {sparse: false, kickBeats: [], bassSteps: [], melody: []}};

  assert.deepEqual(makeBass(silent), []);
});
