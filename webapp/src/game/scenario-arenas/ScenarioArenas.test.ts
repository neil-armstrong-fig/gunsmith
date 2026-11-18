import {validateArena} from "@gunsmith/engine/arena-validation/ValidateArena";
import {HEIGHTS_ARENA} from "@src/game/heights/HeightsArena";
import {PRACTICE_ARENA} from "@src/game/practice/PracticeArena";
import {OVERWATCH_ARENA} from "@src/game/overwatch/OverwatchArena";
import {terrainPreview} from "@src/game/terrain-preview/TerrainPreview";
import {TERRACED_ARENA} from "@src/game/terraced/TerracedArena";

// The scenarios' own arenas, drawn for a spec or a playtest and not in the engine's built-in pool (the duel and the fair duel are,
// and are checked there: `engine/src/built-in-arenas/BuiltInArenas.test.ts`). The overlook scenario plays on the terraced arena.
it("finds nothing wrong with the heights arena", () => {
  expect(validateArena(HEIGHTS_ARENA)).toEqual([]);
});

it("finds nothing wrong with the practice arena", () => {
  expect(validateArena(PRACTICE_ARENA)).toEqual([]);
});

it("finds nothing wrong with the terraced arena", () => {
  expect(validateArena(TERRACED_ARENA)).toEqual([]);
});

it("finds nothing wrong with the overwatch arena", () => {
  expect(validateArena(OVERWATCH_ARENA)).toEqual([]);
});

it("finds nothing wrong with the terrain preview arena", () => {
  expect(validateArena(terrainPreview().arena)).toEqual([]);
});
