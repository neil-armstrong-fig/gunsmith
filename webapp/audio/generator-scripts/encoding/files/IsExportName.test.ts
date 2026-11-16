import {expect, it} from "vitest";
import {isExportName} from "@gunsmith/audio-studies/encoding/files/IsExportName";

it("accepts a good key in either export format", () => {
  expect(isExportName("sfx-hit", "ogg")).toBe(true);
  expect(isExportName("music-loop-menu", "mp3")).toBe(true);
});

it("rejects a format that is not exported", () => {
  for (const format of ["wav", "flac", "OGG", "ogg.exe", ""]) {
    expect(isExportName("sfx-hit", format), format).toBe(false);
  }
});

it("rejects a bad key whatever the format", () => {
  expect(isExportName("audition-mix", "ogg")).toBe(false);
  expect(isExportName("../sfx-hit", "mp3")).toBe(false);
});
