import {expect, it} from "vitest";
import {colourIsPaleGrey} from "@src/dsl/gunsmith/playwright/look/ColourIsPaleGrey";

it("accepts a light grey", () => {
  expect(colourIsPaleGrey({red: 217, green: 220, blue: 224})).toBe(true);
});

it("accepts a grey exactly as light, and as tinted, as the limits allow", () => {
  expect(colourIsPaleGrey({red: 190, green: 190, blue: 190})).toBe(true);
  expect(colourIsPaleGrey({red: 200, green: 200, blue: 224})).toBe(true);
});

it("refuses a grey with a tint just past the limit", () => {
  expect(colourIsPaleGrey({red: 200, green: 200, blue: 225})).toBe(false);
});

it("refuses a grey that is not light enough, in any part", () => {
  expect(colourIsPaleGrey({red: 189, green: 200, blue: 200})).toBe(false);
  expect(colourIsPaleGrey({red: 200, green: 189, blue: 200})).toBe(false);
  expect(colourIsPaleGrey({red: 200, green: 200, blue: 189})).toBe(false);
});

it("refuses a light colour with a tint, such as the team's pale blue", () => {
  expect(colourIsPaleGrey({red: 140, green: 192, blue: 230})).toBe(false);
  expect(colourIsPaleGrey({red: 200, green: 200, blue: 225})).toBe(false);
});

it("refuses the body's dark blue-grey outline", () => {
  expect(colourIsPaleGrey({red: 145, green: 162, blue: 178})).toBe(false);
});
