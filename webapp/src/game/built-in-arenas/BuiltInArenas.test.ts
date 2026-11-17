import {validateArena} from "@gunsmith/engine/arena-validation/ValidateArena";
import {DUEL_ARENA} from "@src/game/duel/DuelArena";
import {HEIGHTS_ARENA} from "@src/game/heights/HeightsArena";
import {PRACTICE_ARENA} from "@src/game/practice/PracticeArena";
import {TERRACED_ARENA} from "@src/game/terraced/TerracedArena";

// The overlook scenario plays on the terraced arena and pickup-race on the duel arena, so these four are every arena the game ships.
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
