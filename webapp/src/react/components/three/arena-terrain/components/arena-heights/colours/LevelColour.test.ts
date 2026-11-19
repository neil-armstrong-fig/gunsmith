import {levelColour} from "@src/react/components/three/arena-terrain/components/arena-heights/colours/LevelColour";

it("gives each level its own colour", () => {
  expect(new Set([levelColour(0), levelColour(1), levelColour(2)]).size).toBe(3);
});

it("gives the low ground the floor colour the arena is drawn with", () => {
  expect(levelColour(0)).toBe("#202b36");
});

it("gives a level beyond the third the third's colour, and a level below the first the first's", () => {
  expect(levelColour(7)).toBe(levelColour(2));
  expect(levelColour(-1)).toBe(levelColour(0));
});
