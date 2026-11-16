import {expect, it} from "vitest";
import {MATCH_ARRANGEMENT} from "@gunsmith/audio-studies/generators/music/arrangements/match/MatchArrangement";
import {MENU_ARRANGEMENT} from "@gunsmith/audio-studies/generators/music/arrangements/menu/MenuArrangement";

const ARRANGEMENTS = [MATCH_ARRANGEMENT, MENU_ARRANGEMENT];

it("names the two tracks as the asset notes do", () => {
  expect(MATCH_ARRANGEMENT.key).toBe("music-loop-match");
  expect(MENU_ARRANGEMENT.key).toBe("music-loop-menu");
});

it("gives the match six sections (90 seconds) and the menu four (60 seconds)", () => {
  expect(MATCH_ARRANGEMENT.sections.length).toBe(6);
  expect(MENU_ARRANGEMENT.sections.length).toBe(4);
});

it("keeps every kick beat on a beat of the bar, and every bass step on a sixteenth of it", () => {
  for (const {sections} of ARRANGEMENTS) {
    for (const section of sections) {
      expect(section.kickBeats.every(beat => Number.isInteger(beat) && beat >= 0 && beat < 4)).toBe(true);
      expect(section.bassSteps.every(step => Number.isInteger(step) && step >= 0 && step < 16)).toBe(true);
    }
  }
});

it("keeps the beats and steps in order and without repeats", () => {
  for (const {sections} of ARRANGEMENTS) {
    for (const section of sections) {
      expect([...section.kickBeats]).toStrictEqual([...new Set(section.kickBeats)].sort((a, b) => a - b));
      expect([...section.bassSteps]).toStrictEqual([...new Set(section.bassSteps)].sort((a, b) => a - b));
    }
  }
});

it("gives every section a four-note melody inside the range of the key", () => {
  for (const {sections} of ARRANGEMENTS) {
    for (const section of sections) {
      expect(section.melody.length).toBe(4);
      expect(section.melody.every(note => Number.isInteger(note) && note >= 48 && note <= 84)).toBe(true);
    }
  }
});

it("keeps the menu sparse throughout and the match sparse only in its quiet fourth section", () => {
  expect(MENU_ARRANGEMENT.sections.every(section => section.sparse)).toBe(true);
  expect(MATCH_ARRANGEMENT.sections.map(section => section.sparse)).toStrictEqual([
    false,
    false,
    false,
    true,
    false,
    false,
  ]);
});

it("makes every section of a track different from the others", () => {
  for (const {sections} of ARRANGEMENTS) {
    expect(new Set(sections.map(section => JSON.stringify(section))).size).toBe(sections.length);
  }
});
