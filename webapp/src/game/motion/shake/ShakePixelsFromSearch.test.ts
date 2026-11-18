import {shakePixelsFromSearch} from "@src/game/motion/shake/ShakePixelsFromSearch";

it("shakes by twelve pixels, the strength the user chose, when the query says nothing", () => {
  expect(shakePixelsFromSearch("")).toBe(12);
  expect(shakePixelsFromSearch("?scenario=duel")).toBe(12);
});

it("takes the strength the query names, among other parameters", () => {
  expect(shakePixelsFromSearch("?shake=5")).toBe(5);
  expect(shakePixelsFromSearch("?scenario=duel&shake=1.5&seed=3")).toBe(1.5);
});

it("is off at zero", () => {
  expect(shakePixelsFromSearch("?shake=0")).toBe(0);
});

it("keeps the default strength for a value that is not a number of pixels", () => {
  expect(shakePixelsFromSearch("?shake=")).toBe(12);
  expect(shakePixelsFromSearch("?shake=lots")).toBe(12);
  expect(shakePixelsFromSearch("?shake=-3")).toBe(12);
  expect(shakePixelsFromSearch("?shake=Infinity")).toBe(12);
});
