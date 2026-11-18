import {playableArena} from "@evals/dsl/arena/pipeline/evaluators/playable/PlayableArena";
import {passingArenaInput} from "@evals/dsl/arena/pipeline/evaluators/testing/PassingArenaInput";

it("passes a walled room of open floor", () => {
  expect(playableArena(passingArenaInput()).score).toBe(1);
});

it("passes an arena whose two levels are joined by a stair", () => {
  const rows = ["#####", "#.>1#", "#####"];

  expect(playableArena(passingArenaInput({arena: {name: "Step", rows}})).score).toBe(1);
});

it("fails an arena split in two by a wall", () => {
  const rows = ["#####", "#.#.#", "#####"];
  const score = playableArena(passingArenaInput({arena: {name: "Split", rows}}));

  expect(score).toEqual({
    key: "playableArena",
    score: 0,
    comment: expect.stringMatching(
      /^the engine's validator: 1 tiles of floor, .* cannot be walked to from the rest of the arena\.$/,
    ),
  });
});

it("says how many more problems the engine found, not all of them", () => {
  const rows = ["#######", "#.#.#.#", "#######"];
  const score = playableArena(passingArenaInput({arena: {name: "Speckled", rows}}));

  expect(score.comment).toMatch(/cannot be walked to from the rest of the arena\. \(and 1 more\)$/);
});

it("fails an arena whose second level has no stair up to it", () => {
  const rows = ["#####", "#.#1#", "#####"];

  expect(playableArena(passingArenaInput({arena: {name: "Stranded", rows}})).score).toBe(0);
});

it("fails an arena the engine refuses to read, with the engine's words", () => {
  const rows = ["#####", "#.#", "#####"];
  const score = playableArena(passingArenaInput({arena: {name: "Ragged", rows}}));

  expect(score.comment).toBe("the engine refused the arena: Every row of an arena must be the same length.");
});

it("fails an arena of walls only", () => {
  const rows = ["###", "###"];

  expect(playableArena(passingArenaInput({arena: {name: "Solid", rows}})).comment).toBe(
    "the engine's validator: The arena has no floor to stand on.",
  );
});

it("fails a created arena that carries no drawing", () => {
  expect(playableArena(passingArenaInput({arena: undefined})).comment).toContain("no arena drawing");
});

it("fails a drawing whose rows are not all text", () => {
  expect(playableArena(passingArenaInput({arena: {name: "Odd", rows: ["###", 7]}})).score).toBe(0);
});

it("passes a rejected request that gave no arena", () => {
  expect(playableArena(passingArenaInput({status: "rejected", arena: undefined})).score).toBe(1);
});

it("fails a rejected request that gave an arena", () => {
  expect(playableArena(passingArenaInput({status: "rejected"})).score).toBe(0);
});
