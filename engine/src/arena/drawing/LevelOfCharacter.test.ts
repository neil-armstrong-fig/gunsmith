import {levelOfCharacter} from "@gunsmith/engine/arena/drawing/LevelOfCharacter";

it("gives a wall, floor and every stair arrow level 0", () => {
  for (const character of ["#", ".", "^", "v", "<", ">"]) {
    expect(levelOfCharacter(character)).toBe(0);
  }
});

it("gives raised floor its digit as the level", () => {
  expect(levelOfCharacter("1")).toBe(1);
  expect(levelOfCharacter("2")).toBe(2);
});

it("refuses a level beyond the third, naming the character", () => {
  expect(() => levelOfCharacter("3")).toThrow("'3'");
});

it("refuses a character that is not a tile, and one that is only part of a stair arrow's name", () => {
  expect(() => levelOfCharacter("?")).toThrow("'?'");
  expect(() => levelOfCharacter("toString")).toThrow("'toString'");
  expect(() => levelOfCharacter("constructor")).toThrow("'constructor'");
});
