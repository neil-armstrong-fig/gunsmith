import {expect, it} from "vitest";
import {exportName} from "@gunsmith/audio-studies/encoding/files/ExportName";

it("names an export after its master's key and its format", () => {
  expect(exportName("sfx-hit", "ogg")).toBe("sfx-hit.ogg");
  expect(exportName("music-loop-menu", "mp3")).toBe("music-loop-menu.mp3");
});
