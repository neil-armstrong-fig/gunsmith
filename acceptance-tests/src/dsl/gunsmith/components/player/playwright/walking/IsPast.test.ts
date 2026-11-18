import {isPast} from "@src/dsl/gunsmith/components/player/playwright/walking/IsPast";

const AT = {x: 10, y: 4};

it("is past a limit to the east when x is greater", () => {
  expect(isPast({x: 10.1, y: 4}, "east", 10)).toBe(true);
  expect(isPast({x: 9.9, y: 4}, "east", 10)).toBe(false);
});

it("is past a limit to the west when x is less", () => {
  expect(isPast({x: 9.9, y: 4}, "west", 10)).toBe(true);
  expect(isPast({x: 10.1, y: 4}, "west", 10)).toBe(false);
});

it("is past a limit to the north when y is greater, as the arena's y grows north", () => {
  expect(isPast({x: 10, y: 4.1}, "north", 4)).toBe(true);
  expect(isPast({x: 10, y: 3.9}, "north", 4)).toBe(false);
});

it("is past a limit to the south when y is less", () => {
  expect(isPast({x: 10, y: 3.9}, "south", 4)).toBe(true);
  expect(isPast({x: 10, y: 4.1}, "south", 4)).toBe(false);
});

it("is not past a limit it is exactly on", () => {
  expect(isPast(AT, "east", 10)).toBe(false);
  expect(isPast(AT, "west", 10)).toBe(false);
  expect(isPast(AT, "north", 4)).toBe(false);
  expect(isPast(AT, "south", 4)).toBe(false);
});

it("looks only along the heading's own axis", () => {
  expect(isPast({x: 0, y: 100}, "east", 10)).toBe(false);
  expect(isPast({x: 100, y: 0}, "north", 10)).toBe(false);
});
