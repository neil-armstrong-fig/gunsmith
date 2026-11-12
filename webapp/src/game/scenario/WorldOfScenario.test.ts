import {isSolid} from "@gunsmith/engine/arena/IsSolid";
import {disarmOpponent} from "@gunsmith/engine/opponent/DisarmOpponent";
import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import {DUEL_ARENA} from "@src/game/duel/DuelArena";
import {DUEL_OPPONENT} from "@src/game/duel/DuelOpponent";
import {PRACTICE_ARENA} from "@src/game/practice/PracticeArena";
import {PRACTICE_DUMMIES} from "@src/game/practice/PracticeDummies";
import {worldOfScenario} from "@src/game/scenario/WorldOfScenario";

it("makes the practice range with its dummies and no opponent", () => {
  const world = worldOfScenario("practice");

  expect(world).toEqual(startingWorld(PRACTICE_ARENA, PRACTICE_DUMMIES));
  expect(world.opponent).toBeUndefined();
  expect(world.dummies).not.toEqual([]);
});

it("makes the duel with the opponent where it stands and no dummies", () => {
  const world = worldOfScenario("duel");

  expect(world).toEqual(startingWorld(DUEL_ARENA, [], DUEL_OPPONENT));
  expect(world.opponent?.position).toEqual(DUEL_OPPONENT);
  expect(world.dummies).toEqual([]);
});

it("has nothing between the player and the opponent in the duel", () => {
  const {player, opponent, arena} = worldOfScenario("duel");
  const row = Math.floor(player.position.y);

  expect(Math.floor(opponent?.position.y ?? -1)).toBe(row);
  for (let column = Math.floor(player.position.x); column <= Math.floor(opponent?.position.x ?? 0); column += 1) {
    expect(isSolid(arena, column, row)).toBe(false);
  }
});

it("makes sparring the duel with an opponent who has nothing to shoot with", () => {
  const world = worldOfScenario("sparring");

  expect(world).toEqual(disarmOpponent(startingWorld(DUEL_ARENA, [], DUEL_OPPONENT)));
  expect(world.opponent?.loadout.every(carried => carried.rounds === 0 && carried.reserve === 0)).toBe(true);
  expect(world.player.loadout.every(carried => carried.rounds > 0)).toBe(true);
});
