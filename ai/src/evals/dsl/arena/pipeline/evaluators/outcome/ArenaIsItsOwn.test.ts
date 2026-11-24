import {BUILT_IN_ARENAS} from "@gunsmith/engine/built-in-arenas/BuiltInArenas";
import {arenaIsItsOwn} from "@evals/dsl/arena/pipeline/evaluators/outcome/ArenaIsItsOwn";
import {passingArenaInput} from "@evals/dsl/arena/pipeline/evaluators/testing/PassingArenaInput";

it("passes an arena that is no built-in arena", () => {
  expect(arenaIsItsOwn(passingArenaInput()).score).toBe(1);
});

it("fails an arena that is a built-in arena word for word, whatever it is called", () => {
  const copy = {name: "My Own Arena", rows: BUILT_IN_ARENAS[0]?.rows};

  expect(arenaIsItsOwn(passingArenaInput({arena: copy}))).toMatchObject({
    score: 0,
    comment: `the arena is the built-in arena "${BUILT_IN_ARENAS[0]?.name}" unchanged`,
  });
});

it("passes a built-in arena with one tile changed", () => {
  const rows = BUILT_IN_ARENAS[0]?.rows.map((row, index) => (index === 1 ? `#c${row.slice(2)}` : row));

  expect(arenaIsItsOwn(passingArenaInput({arena: {name: "Almost", rows}})).score).toBe(1);
});

it("fails when the outcome carries no arena drawing to compare", () => {
  expect(arenaIsItsOwn(passingArenaInput({arena: undefined})).score).toBe(0);
});
