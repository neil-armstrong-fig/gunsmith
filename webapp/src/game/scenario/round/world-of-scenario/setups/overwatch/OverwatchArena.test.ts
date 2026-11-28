import {validateArena} from "@gunsmith/engine/arena/validation/ValidateArena";
import {OVERWATCH_ARENA} from "@src/game/scenario/round/world-of-scenario/setups/overwatch/OverwatchArena";

// Drawn for a spec or a playtest and not in the engine's built-in pool, so it is checked here (the pool is checked in
// `engine/src/arena/built-in/BuiltInArenas.test.ts`).
it("finds nothing wrong with the overwatch arena", () => {
  expect(validateArena(OVERWATCH_ARENA)).toEqual([]);
});
