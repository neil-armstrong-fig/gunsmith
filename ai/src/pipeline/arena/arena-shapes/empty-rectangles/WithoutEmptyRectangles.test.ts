import {withoutEmptyRectangles} from "@gunsmith/ai/pipeline/arena/arena-shapes/empty-rectangles/WithoutEmptyRectangles";

it("drops a wall, cover block or platform of no width or no height, and keeps the rest in order", () => {
  const kept = {x: 1, y: 1, width: 2, height: 1};

  expect(
    withoutEmptyRectangles({
      name: "A",
      walls: [{x: 0, y: 0, width: 0, height: 3}, kept],
      covers: [{x: 0, y: 0, width: 2, height: 0}, kept],
      platforms: [
        {x: 0, y: 0, width: -1, height: 2, level: 1},
        {...kept, level: 1},
      ],
    }),
  ).toEqual({name: "A", walls: [kept], covers: [kept], platforms: [{...kept, level: 1}]});
});

it("leaves a size that is not a number, and everything that is not a rectangle, for the schema to refuse", () => {
  const odd = {walls: [{x: 0, y: 0, width: "wide", height: 1}, "wall", 3], stairs: [{x: 0, y: 0, width: 0, height: 0}]};

  expect(withoutEmptyRectangles(odd)).toEqual(odd);
  expect(withoutEmptyRectangles("a big room")).toBe("a big room");
  expect(withoutEmptyRectangles(undefined)).toBeUndefined();
});

it("does not change the answer it was given", () => {
  const answer = {name: "A", walls: [{x: 0, y: 0, width: 0, height: 0}]};

  withoutEmptyRectangles(answer);

  expect(answer.walls).toHaveLength(1);
});

it("drops a floor rectangle of no size from an outline, as it drops a wall", () => {
  const kept = {x: 1, y: 1, width: 2, height: 1};

  expect(withoutEmptyRectangles({floor: [{x: 0, y: 0, width: 4, height: 0}, kept]})).toEqual({floor: [kept]});
});
