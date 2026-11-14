import {isSolid} from "@gunsmith/engine/arena/IsSolid";
import {levelOfTile} from "@gunsmith/engine/arena/LevelOfTile";
import {stairOfTile} from "@gunsmith/engine/arena/StairOfTile";
import {levelAt} from "@gunsmith/engine/height/LevelAt";
import {disarmOpponent} from "@gunsmith/engine/opponent/DisarmOpponent";
import {giveOpponentBrain} from "@gunsmith/engine/opponent/GiveOpponentBrain";
import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import {startMatch} from "@gunsmith/engine/match/StartMatch";
import {DUEL_ARENA} from "@src/game/duel/DuelArena";
import {DUEL_OPPONENT} from "@src/game/duel/DuelOpponent";
import {HEIGHTS_ARENA} from "@src/game/heights/HeightsArena";
import {PRACTICE_ARENA} from "@src/game/practice/PracticeArena";
import {PRACTICE_DUMMIES} from "@src/game/practice/PracticeDummies";
import {worldOfScenario} from "@src/game/scenario/WorldOfScenario";

it("makes the practice range with its dummies and no opponent", () => {
  const world = worldOfScenario("practice", 1);

  expect(world).toEqual(startingWorld(PRACTICE_ARENA, PRACTICE_DUMMIES));
  expect(world.opponent).toBeUndefined();
  expect(world.dummies).not.toEqual([]);
});

it("makes the duel with the opponent where it stands and no dummies", () => {
  const world = worldOfScenario("duel", 7);

  expect(world).toEqual({...giveOpponentBrain(startingWorld(DUEL_ARENA, [], DUEL_OPPONENT), 7), match: startMatch()});
  expect(world.opponent?.position).toEqual(DUEL_OPPONENT);
  expect(world.dummies).toEqual([]);
});

it("has nothing between the player and the opponent in the duel", () => {
  const {player, opponent, arena} = worldOfScenario("duel", 1);
  const row = Math.floor(player.position.y);

  expect(Math.floor(opponent?.position.y ?? -1)).toBe(row);
  for (let column = Math.floor(player.position.x); column <= Math.floor(opponent?.position.x ?? 0); column += 1) {
    expect(isSolid(arena, column, row)).toBe(false);
  }
});

it("makes sparring the duel with an opponent who has nothing to shoot with", () => {
  const world = worldOfScenario("sparring", 7);

  expect(world).toEqual(disarmOpponent(startingWorld(DUEL_ARENA, [], DUEL_OPPONENT)));
  expect(world.opponent?.loadout.every(carried => carried.rounds === 0 && carried.reserve === 0)).toBe(true);
  expect(world.player.loadout.every(carried => carried.rounds > 0)).toBe(true);
});

it("gives the duel's opponent a brain that draws from the seed it is given", () => {
  expect(worldOfScenario("duel", 7).opponentBrain?.seed).toBe(7);
  expect(worldOfScenario("duel", 8).opponentBrain?.seed).toBe(8);
});

it("gives the sparring opponent no brain, so it stands and takes it", () => {
  expect(worldOfScenario("sparring", 7).opponentBrain).toBeUndefined();
});

it("gives the practice range no brain, since it has no opponent", () => {
  expect(worldOfScenario("practice", 7).opponentBrain).toBeUndefined();
});

it("makes the duel a best-of-three, at nothing to nothing in its first round", () => {
  expect(worldOfScenario("duel", 7).match).toEqual({playerWins: 0, opponentWins: 0, roundNumber: 1});
});

it("makes sparring and the practice range single rounds, with no match", () => {
  expect(worldOfScenario("sparring", 7).match).toBeUndefined();
  expect(worldOfScenario("practice", 7).match).toBeUndefined();
});

it("makes the heights arena with no dummies and no opponent", () => {
  const world = worldOfScenario("heights", 1);

  expect(world).toEqual(startingWorld(HEIGHTS_ARENA));
  expect(world.opponent).toBeUndefined();
  expect(world.dummies).toEqual([]);
});

it("starts the player on the low ground, with a stair climbing east from their row onto a platform", () => {
  const {player, arena} = worldOfScenario("heights", 1);
  const row = Math.floor(player.position.y);
  const column = Math.floor(player.position.x);

  expect(levelAt(arena, player.position)).toBe(0);
  expect(stairOfTile(arena, column + 1, row)).toBe("east");
  expect(levelOfTile(arena, column + 2, row)).toBe(1);
});

it("keeps the platform's edge a drop everywhere but the stair's row", () => {
  const {player, arena} = worldOfScenario("heights", 1);
  const stairRow = Math.floor(player.position.y);

  for (let row = 1; row < arena.height - 1; row += 1) {
    const edgeColumn = Math.floor(player.position.x) + 2;
    if (row !== stairRow) {
      expect(levelOfTile(arena, edgeColumn, row)).toBe(1);
      expect(levelOfTile(arena, edgeColumn - 1, row)).toBe(0);
      expect(stairOfTile(arena, edgeColumn - 1, row)).toBeUndefined();
    }
  }
});
