import {uphillStep} from "@gunsmith/engine/arena/drawing/stairs/UphillStep";

it("steps north to a greater y, as the arena has it", () => {
  expect(uphillStep("north")).toEqual({x: 0, y: 1});
});

it("steps south to a smaller y", () => {
  expect(uphillStep("south")).toEqual({x: 0, y: -1});
});

it("steps east to a greater x", () => {
  expect(uphillStep("east")).toEqual({x: 1, y: 0});
});

it("steps west to a smaller x", () => {
  expect(uphillStep("west")).toEqual({x: -1, y: 0});
});
