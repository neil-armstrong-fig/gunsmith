import {expect, it} from "vitest";
import {colourIsNear} from "@src/dsl/gunsmith/playwright/look/ColourIsNear";

const TARGET = {red: 48, green: 64, blue: 79};

it("accepts the colour itself", () => {
  expect(colourIsNear(TARGET, TARGET, 0)).toBe(true);
});

it("accepts a colour off by the tolerance in every part, and no further", () => {
  expect(colourIsNear({red: 54, green: 58, blue: 85}, TARGET, 6)).toBe(true);
  expect(colourIsNear({red: 55, green: 64, blue: 79}, TARGET, 6)).toBe(false);
});

it("refuses a colour that is far off in any single part", () => {
  expect(colourIsNear({red: 48, green: 64, blue: 100}, TARGET, 6)).toBe(false);
  expect(colourIsNear({red: 48, green: 40, blue: 79}, TARGET, 6)).toBe(false);
});
