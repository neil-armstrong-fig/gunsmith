import {expect, it} from "vitest";
import {isExportKey} from "@gunsmith/audio-studies/encoding/files/IsExportKey";

it("accepts the keys of effects and music, with numbered variants", () => {
  expect(isExportKey("sfx-ui-click")).toBe(true);
  expect(isExportKey("sfx-step-crouch-04")).toBe(true);
  expect(isExportKey("music-loop-match")).toBe(true);
});

it("rejects the audition mix, which is not exported", () => {
  expect(isExportKey("audition-mix")).toBe(false);
});

it("rejects anything that is not a lowercase name made of words and digits", () => {
  for (const key of ["", "sfx-", "music-", "sfx-Hit", "sfx hit", "../sfx-hit", "sfx-hit.wav", "sfx-hit\n", "SFX-hit"]) {
    expect(isExportKey(key), JSON.stringify(key)).toBe(false);
  }
});
