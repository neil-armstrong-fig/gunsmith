import {isHalfTurnSymmetric} from "@gunsmith/engine/arena-symmetry/IsHalfTurnSymmetric";
import {validateArena} from "@gunsmith/engine/arena-validation/ValidateArena";
import {DUEL_ARENA} from "@src/game/duel/DuelArena";
import {FAIR_DUEL_ARENA} from "@src/game/fair-duel/FairDuelArena";
import {HEIGHTS_ARENA} from "@src/game/heights/HeightsArena";
import {PRACTICE_ARENA} from "@src/game/practice/PracticeArena";
import {terrainPreview} from "@src/game/terrain-preview/TerrainPreview";
import {TERRACED_ARENA} from "@src/game/terraced/TerracedArena";

// The overlook scenario plays on the terraced arena and pickup-race on the duel arena.
it("finds nothing wrong with the duel arena", () => {
  expect(validateArena(DUEL_ARENA)).toEqual([]);
});

it("finds nothing wrong with the heights arena", () => {
  expect(validateArena(HEIGHTS_ARENA)).toEqual([]);
});

it("finds nothing wrong with the practice arena", () => {
  expect(validateArena(PRACTICE_ARENA)).toEqual([]);
});

it("finds nothing wrong with the terraced arena", () => {
  expect(validateArena(TERRACED_ARENA)).toEqual([]);
});

it("finds nothing wrong with the fair duel's arena, which is the same picture turned half way round", () => {
  expect(validateArena(FAIR_DUEL_ARENA)).toEqual([]);
  expect(isHalfTurnSymmetric(FAIR_DUEL_ARENA)).toBe(true);
});

it("finds nothing wrong with the terrain preview arena", () => {
  expect(validateArena(terrainPreview().arena)).toEqual([]);
});
