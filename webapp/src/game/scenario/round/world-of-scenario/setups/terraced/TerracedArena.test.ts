import {validateArena} from "@gunsmith/engine/arena/validation/ValidateArena";
import {TERRACED_ARENA} from "@src/game/scenario/round/world-of-scenario/setups/terraced/TerracedArena";

// Drawn for a spec or a playtest and not in the engine's built-in pool, so it is checked here (the pool is checked in
// `engine/src/arena/built-in/BuiltInArenas.test.ts`).
// The overlook scenario plays on this arena too.
it("finds nothing wrong with the terraced arena", () => {
  expect(validateArena(TERRACED_ARENA)).toEqual([]);
});
