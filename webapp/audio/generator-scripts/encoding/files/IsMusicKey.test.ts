import {expect, it} from "vitest";
import {isMusicKey} from "@gunsmith/audio-studies/encoding/files/IsMusicKey";

it("is true for a music loop and false for an effect", () => {
  expect(isMusicKey("music-loop-match")).toBe(true);
  expect(isMusicKey("sfx-music-box")).toBe(false);
  expect(isMusicKey("sfx-hit")).toBe(false);
});
