import {seedFromSearch} from "@src/game/scenario/seed/SeedFromSearch";

it("reads the seed the query asks for", () => {
  expect(seedFromSearch("?seed=42")).toBe(42);
});

it("finds the seed among other parameters", () => {
  expect(seedFromSearch("?scenario=duel&seed=7&a=1")).toBe(7);
});

it("reads a negative seed and a zero seed", () => {
  expect(seedFromSearch("?seed=-5")).toBe(-5);
  expect(seedFromSearch("?seed=0")).toBe(0);
});

it("has no seed when the query does not ask for one", () => {
  expect(seedFromSearch("")).toBeUndefined();
  expect(seedFromSearch("?scenario=duel")).toBeUndefined();
});

it("has no seed for something that is not a whole number", () => {
  expect(seedFromSearch("?seed=abc")).toBeUndefined();
  expect(seedFromSearch("?seed=1.5")).toBeUndefined();
  expect(seedFromSearch("?seed=")).toBeUndefined();
  expect(seedFromSearch("?seed=12abc")).toBeUndefined();
});

it("has no seed for a number too large to be exact", () => {
  expect(seedFromSearch("?seed=99999999999999999999")).toBeUndefined();
});
