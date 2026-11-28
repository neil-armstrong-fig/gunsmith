import {dropIllegalStairs} from "@gunsmith/engine/arena/repair/stairs/DropIllegalStairs";

it("keeps a legal stair and a drawing with none", () => {
  const rows = ["#######", "#..>11#", "#..#11#", "#######"];

  expect(dropIllegalStairs(rows)).toEqual({rows, dropped: 0});
  expect(dropIllegalStairs(["###", "#.#", "###"])).toEqual({rows: ["###", "#.#", "###"], dropped: 0});
});

it("draws a stair with a wall behind it as floor, and keeps the legal one drawn beside it", () => {
  const rows = ["#########", "#..>11..#", "#...11..#", "#.>.....#", "#########"];

  expect(dropIllegalStairs(rows)).toEqual({
    rows: ["#########", "#..>11..#", "#...11..#", "#.......#", "#########"],
    dropped: 1,
  });
});

it("draws a stair that climbs to floor of the same level as floor", () => {
  expect(dropIllegalStairs(["#####", "#.>.#", "#####"]).dropped).toBe(1);
});

it("draws every stair as floor when the drawing is refused for another reason, which is why `repairArena` checks that it can read the result", () => {
  const withUnknown = ["#####", "#.>x#", "#####"];

  expect(dropIllegalStairs(withUnknown).rows).toEqual(["#####", "#..x#", "#####"]);
});

it("draws two stairs as floor when each is legal alone but the engine refuses them together", () => {
  const rows = ["######", "#1<..#", "#1>2##", "######"];

  expect(dropIllegalStairs(rows)).toEqual({rows: ["######", "#1...#", "#1.2##", "######"], dropped: 2});
});
