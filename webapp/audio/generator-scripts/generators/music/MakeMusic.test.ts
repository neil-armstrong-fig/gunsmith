import {assert, expect, it} from "vitest";
import {MATCH_ARRANGEMENT} from "@gunsmith/audio-studies/generators/music/arrangements/match/MatchArrangement";
import {MENU_ARRANGEMENT} from "@gunsmith/audio-studies/generators/music/arrangements/menu/MenuArrangement";
import {noteFrequency} from "@gunsmith/audio-studies/generators/music/bar/note/NoteFrequency";
import {makeMusic} from "@gunsmith/audio-studies/generators/music/MakeMusic";
import type {Arrangement} from "@gunsmith/audio-studies/generators/music/types/Arrangement";
import type {Voice} from "@gunsmith/audio-studies/common/types/Voice";

const BAR_SECONDS = 4 * (60 / 128);
const SECTION_SECONDS = 8 * BAR_SECONDS;

it("composes full-length tracks: 90 seconds of match and 60 of menu, in stereo, as loops", () => {
  const match = makeMusic(MATCH_ARRANGEMENT);
  const menu = makeMusic(MENU_ARRANGEMENT);

  expect(match.duration).toBe(90);
  expect(menu.duration).toBe(60);
  for (const cue of [match, menu]) {
    expect(cue.channels).toBe(2);
    expect(cue.loop).toBe(true);
    expect(cue.peak).toBe(0.25);
  }
  expect(match.key).toBe("music-loop-match");
  expect(menu.key).toBe("music-loop-menu");
});

it("lasts eight bars at 128 beats a minute for every section of the arrangement", () => {
  const section = MENU_ARRANGEMENT.sections[0];
  assert(section);

  expect(makeMusic({key: "one", sections: [section]}).duration).toBe(SECTION_SECONDS);
  expect(makeMusic({key: "two", sections: [section, section]}).duration).toBe(SECTION_SECONDS * 2);
});

it("composes distinct eight-bar sections, not one section repeated", () => {
  for (const [arrangement, seconds] of [
    [MENU_ARRANGEMENT, 60],
    [MATCH_ARRANGEMENT, 90],
  ] as const) {
    const cue = makeMusic(arrangement);
    const sections = new Set<string>();
    for (let start = 0; start < seconds; start += 15) {
      const voices = cue.voices.filter(voice => voice.at >= start && voice.at < start + 15);
      expect(voices.length).toBeGreaterThan(0);
      // Ignore noise seeds: new noise alone is not a new musical section.
      sections.add(JSON.stringify(voices.map(voice => ({...withoutSeed(voice), at: voice.at - start}))));
    }

    expect(sections.size, `${cue.key}: repeated arrangement`).toBe(seconds / 15);
  }
});

it("starts every voice inside the track, except an echo of the last note, which starts just past the loop point and wraps", () => {
  for (const arrangement of [MATCH_ARRANGEMENT, MENU_ARRANGEMENT]) {
    const cue = makeMusic(arrangement);
    const beat = 60 / 128;
    const pastTheEnd = cue.voices.filter(voice => voice.at >= cue.duration);

    expect(
      cue.voices.every(voice => voice.at >= 0 && voice.at < cue.duration + beat / 2),
      cue.key,
    ).toBe(true);
    expect(
      pastTheEnd.every(voice => voice.gain === 0.04),
      `${cue.key}: only an echo may start past the end`,
    ).toBe(true);
  }
});

it("plays the four instruments of each bar in order: drums, hats, bass, melody", () => {
  const arrangement: Arrangement = {
    key: "test",
    sections: [{sparse: false, kickBeats: [0], bassSteps: [0], melody: [62, 65, 69, 65]}],
  };
  const firstBar = makeMusic(arrangement).voices.filter(voice => voice.at < BAR_SECONDS);
  const kinds = firstBar.map(voice => `${voice.kind}:${voice.gain}`);

  expect(kinds.slice(0, 2)).toStrictEqual(["tone:0.65", "noise:0.25"]);
  expect(kinds[2]).toBe("noise:0.25");
  expect(kinds.indexOf("noise:0.1")).toBeGreaterThan(kinds.indexOf("noise:0.25"));
  expect(kinds.indexOf("tone:0.28")).toBeGreaterThan(kinds.lastIndexOf("noise:0.1"));
  expect(kinds.indexOf("tone:0.14")).toBeGreaterThan(kinds.indexOf("tone:0.28"));
});

it("builds each bar on the bass round's root for that bar", () => {
  const arrangement: Arrangement = {
    key: "test",
    sections: [{sparse: false, kickBeats: [], bassSteps: [0], melody: [62, 65, 69, 65]}],
  };
  const bass = makeMusic(arrangement).voices.filter(voice => voice.kind === "tone" && voice.wave === "sawtooth");

  expect(bass.slice(0, 4).map(voice => voice.kind === "tone" && voice.frequency)).toStrictEqual(
    [38, 38, 34, 36].map(noteFrequency),
  );
});

function withoutSeed(voice: Voice): Omit<Voice, "seed"> {
  if (voice.kind === "noise") {
    const {seed: _seed, ...rest} = voice;

    return rest;
  }

  return voice;
}
