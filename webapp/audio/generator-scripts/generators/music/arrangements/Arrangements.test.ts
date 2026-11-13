import assert from "node:assert/strict";
import {it} from "node:test";
import {MATCH_ARRANGEMENT} from "@gunsmith/audio-studies/generators/music/arrangements/match/MatchArrangement";
import {MENU_ARRANGEMENT} from "@gunsmith/audio-studies/generators/music/arrangements/menu/MenuArrangement";

const ARRANGEMENTS = [MATCH_ARRANGEMENT, MENU_ARRANGEMENT];

it("names the two tracks as the asset notes do", () => {
  assert.equal(MATCH_ARRANGEMENT.key, "music-loop-match");
  assert.equal(MENU_ARRANGEMENT.key, "music-loop-menu");
});

it("gives the match six sections (90 seconds) and the menu four (60 seconds)", () => {
  assert.equal(MATCH_ARRANGEMENT.sections.length, 6);
  assert.equal(MENU_ARRANGEMENT.sections.length, 4);
});

it("keeps every kick beat on a beat of the bar, and every bass step on a sixteenth of it", () => {
  for (const {sections} of ARRANGEMENTS) {
    for (const section of sections) {
      assert.ok(section.kickBeats.every(beat => Number.isInteger(beat) && beat >= 0 && beat < 4));
      assert.ok(section.bassSteps.every(step => Number.isInteger(step) && step >= 0 && step < 16));
    }
  }
});

it("keeps the beats and steps in order and without repeats", () => {
  for (const {sections} of ARRANGEMENTS) {
    for (const section of sections) {
      assert.deepEqual(
        [...section.kickBeats],
        [...new Set(section.kickBeats)].sort((a, b) => a - b),
      );
      assert.deepEqual(
        [...section.bassSteps],
        [...new Set(section.bassSteps)].sort((a, b) => a - b),
      );
    }
  }
});

it("gives every section a four-note melody inside the range of the key", () => {
  for (const {sections} of ARRANGEMENTS) {
    for (const section of sections) {
      assert.equal(section.melody.length, 4);
      assert.ok(section.melody.every(note => Number.isInteger(note) && note >= 48 && note <= 84));
    }
  }
});

it("keeps the menu sparse throughout and the match sparse only in its quiet fourth section", () => {
  assert.ok(MENU_ARRANGEMENT.sections.every(section => section.sparse));
  assert.deepEqual(
    MATCH_ARRANGEMENT.sections.map(section => section.sparse),
    [false, false, false, true, false, false],
  );
});

it("makes every section of a track different from the others", () => {
  for (const {sections} of ARRANGEMENTS) {
    assert.equal(new Set(sections.map(section => JSON.stringify(section))).size, sections.length);
  }
});
