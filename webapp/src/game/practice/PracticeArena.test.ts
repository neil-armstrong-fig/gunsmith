import {validateArena} from "@gunsmith/engine/arena/validation/ValidateArena";
import {PRACTICE_ARENA} from "@src/game/practice/PracticeArena";

// Drawn for a spec or a playtest and not in the engine's built-in pool, so it is checked here (the pool is checked in
// `engine/src/arena/built-in/BuiltInArenas.test.ts`).
it("finds nothing wrong with the practice arena", () => {
  expect(validateArena(PRACTICE_ARENA)).toEqual([]);
});
