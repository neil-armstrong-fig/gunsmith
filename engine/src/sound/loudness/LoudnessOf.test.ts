import {loudnessOf} from "@gunsmith/engine/sound/loudness/LoudnessOf";

it("is near in the nearest third of the range, mid in the second and far in the last", () => {
  expect([0, 5, 9].map(distance => loudnessOf(distance, 30))).toEqual(["near", "near", "near"]);
  expect([11, 15, 19].map(distance => loudnessOf(distance, 30))).toEqual(["mid", "mid", "mid"]);
  expect([21, 25, 30].map(distance => loudnessOf(distance, 30))).toEqual(["far", "far", "far"]);
});

it("changes at exactly a third and two thirds of the range, the edge belonging to the nearer", () => {
  expect(loudnessOf(10, 30)).toBe("near");
  expect(loudnessOf(10.001, 30)).toBe("mid");
  expect(loudnessOf(20, 30)).toBe("mid");
  expect(loudnessOf(20.001, 30)).toBe("far");
});

it("measures against the range it is given, so a footfall at seven tiles is far and a shot at six is near", () => {
  expect(loudnessOf(7, 8)).toBe("far");
  expect(loudnessOf(6, 20)).toBe("near");
});
