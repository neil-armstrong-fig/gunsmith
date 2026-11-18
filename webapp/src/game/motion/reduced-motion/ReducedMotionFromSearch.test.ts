import {reducedMotionFromSearch} from "@src/game/motion/reduced-motion/ReducedMotionFromSearch";

it("asks for reduced motion when the query says so", () => {
  expect(reducedMotionFromSearch("?reducedMotion=1")).toBe(true);
});

it("finds the request among other parameters", () => {
  expect(reducedMotionFromSearch("?scenario=duel&reducedMotion=1&seed=3")).toBe(true);
});

it("does not ask when the query does not", () => {
  expect(reducedMotionFromSearch("")).toBe(false);
  expect(reducedMotionFromSearch("?scenario=duel")).toBe(false);
});

it("does not ask for any other value", () => {
  expect(reducedMotionFromSearch("?reducedMotion=0")).toBe(false);
  expect(reducedMotionFromSearch("?reducedMotion=")).toBe(false);
  expect(reducedMotionFromSearch("?reducedMotion=yes")).toBe(false);
});
