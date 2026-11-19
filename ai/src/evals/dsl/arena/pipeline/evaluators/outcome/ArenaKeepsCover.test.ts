import {arenaKeepsCover} from "@evals/dsl/arena/pipeline/evaluators/outcome/ArenaKeepsCover";
import {passingArenaInput} from "@evals/dsl/arena/pipeline/evaluators/testing/PassingArenaInput";

const ROWS_WITH_COVER = ["#######", "#.....#", "#..c..#", "#.....#", "#######"];

it("passes an arena that has a cover block", () => {
  const input = passingArenaInput({arena: {name: "Low Wall", rows: ROWS_WITH_COVER}});

  expect(arenaKeepsCover(input)).toEqual({key: "arenaKeepsCover", score: 1});
});

it("fails an arena of walls and floor only, which a model that dropped the cover would give", () => {
  const score = arenaKeepsCover(passingArenaInput());

  expect(score).toEqual({
    key: "arenaKeepsCover",
    score: 0,
    comment: "the arena has no cover block (c) in its drawing",
  });
});

it("fails an outcome that carries no arena to look in", () => {
  expect(arenaKeepsCover(passingArenaInput({arena: undefined})).score).toBe(0);
});

it("fails a drawing the engine cannot read, without throwing", () => {
  const input = passingArenaInput({arena: {name: "Odd", rows: ["#####", "#.c.", "#####"]}});

  expect(arenaKeepsCover(input).score).toBe(0);
});
