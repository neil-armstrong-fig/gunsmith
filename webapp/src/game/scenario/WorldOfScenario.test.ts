import {isSolid} from "@gunsmith/engine/arena/IsSolid";
import {levelOfTile} from "@gunsmith/engine/arena/LevelOfTile";
import {stairOfTile} from "@gunsmith/engine/arena/StairOfTile";
import {levelAt} from "@gunsmith/engine/height/LevelAt";
import {disarmOpponent} from "@gunsmith/engine/opponent/DisarmOpponent";
import {giveOpponentBrain} from "@gunsmith/engine/opponent/GiveOpponentBrain";
import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import {startMatch} from "@gunsmith/engine/match/StartMatch";
import type {Pickup} from "@gunsmith/engine/pickup/types/Pickup";
import {startPickup} from "@gunsmith/engine/pickup/StartPickup";
import {SUBMACHINE_GUN} from "@gunsmith/engine/weapon/weapons/SubmachineGun";
import {startRing} from "@gunsmith/engine/ring/StartRing";
import {DEFAULT_RING_TIMING} from "@gunsmith/engine/ring/DefaultRingTiming";
import type {Ring} from "@gunsmith/engine/ring/types/Ring";
import type {RingTiming} from "@gunsmith/engine/ring/types/RingTiming";
import {DUEL_ARENA} from "@src/game/duel/DuelArena";
import {DUEL_OPPONENT} from "@src/game/duel/DuelOpponent";
import {HEIGHTS_ARENA} from "@src/game/heights/HeightsArena";
import {HEIGHTS_DUMMIES} from "@src/game/heights/HeightsDummies";
import {PRACTICE_ARENA} from "@src/game/practice/PracticeArena";
import {PRACTICE_DUMMIES} from "@src/game/practice/PracticeDummies";
import {TERRACED_ARENA} from "@src/game/terraced/TerracedArena";
import {TERRACED_OPPONENT} from "@src/game/terraced/TerracedOpponent";
import {worldOfScenario} from "@src/game/scenario/WorldOfScenario";

it("makes the practice range with its dummies and no opponent", () => {
  const world = worldOfScenario("practice", 1);

  expect(world).toEqual(startingWorld(PRACTICE_ARENA, PRACTICE_DUMMIES));
  expect(world.opponent).toBeUndefined();
  expect(world.dummies).not.toEqual([]);
});

it("makes the duel with the opponent where it stands and no dummies", () => {
  const world = worldOfScenario("duel", 7);

  expect(world).toEqual({
    ...giveOpponentBrain(startingWorld(DUEL_ARENA, [], DUEL_OPPONENT), 7),
    match: startMatch(),
    ring: duelRing(7),
    pickup: duelPickup(7),
  });
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

  expect(world).toEqual({...disarmOpponent(startingWorld(DUEL_ARENA, [], DUEL_OPPONENT)), pickup: duelPickup(7)});
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

it("gives the duel the game's own ring, with none of its round played", () => {
  const {ring} = worldOfScenario("duel", 7);

  expect(ring).toEqual(duelRing(7));
  expect(ring?.roundSeconds).toBe(0);
  expect(ring?.timing).toEqual(DEFAULT_RING_TIMING);
});

it("gives the duel the ring timing it is asked for", () => {
  const timing = {startDelaySeconds: 2, closingSeconds: 9};

  expect(worldOfScenario("duel", 7, timing).ring).toEqual(duelRing(7, timing));
});

it("gives the ring the damage scale it is asked for, so it hurts as much as the page said", () => {
  const timing = {startDelaySeconds: 2, closingSeconds: 9, damageScale: 10};

  expect(worldOfScenario("duel", 7, timing).ring?.timing.damageScale).toBe(10);
  expect(worldOfScenario("sparring", 7, timing).ring?.timing.damageScale).toBe(10);
});

it("draws the ring's centre from the seed: another seed, another place", () => {
  const centres = new Set<string>();
  for (let seed = 0; seed < 30; seed++) {
    centres.add(JSON.stringify(worldOfScenario("duel", seed).ring?.centre));
  }

  expect(centres.size).toBeGreaterThan(8);
});

it("gives sparring, the practice range and the heights arena no ring, so they stay endless", () => {
  expect(worldOfScenario("sparring", 7).ring).toBeUndefined();
  expect(worldOfScenario("practice", 7).ring).toBeUndefined();
  expect(worldOfScenario("heights", 7).ring).toBeUndefined();
});

it("gives sparring a ring when it is asked for ring timing, and no other scenario", () => {
  const timing = {startDelaySeconds: 1, closingSeconds: 6};

  expect(worldOfScenario("sparring", 7, timing).ring).toEqual(duelRing(7, timing));
  expect(worldOfScenario("practice", 7, timing).ring).toBeUndefined();
  expect(worldOfScenario("heights", 7, timing).ring).toBeUndefined();
});

it("leaves sparring's opponent without a brain and its match unscored when it has a ring", () => {
  const world = worldOfScenario("sparring", 7, {startDelaySeconds: 1, closingSeconds: 6});

  expect(world.opponentBrain).toBeUndefined();
  expect(world.match).toBeUndefined();
});

describe("the heights arena", () => {
  it("has a dummy on each level and no opponent", () => {
    const world = worldOfScenario("heights", 1);

    expect(world).toEqual(startingWorld(HEIGHTS_ARENA, HEIGHTS_DUMMIES));
    expect(world.opponent).toBeUndefined();
  });

  it("stands one dummy on the low ground and one on the platform, each four tiles from the player along their row", () => {
    const {dummies, player, arena} = worldOfScenario("heights", 1);
    const levels = dummies.map(dummy => levelAt(arena, dummy.position)).sort();

    expect(levels).toEqual([0, 1]);
    expect(dummies.map(dummy => Math.abs(dummy.position.x - player.position.x))).toEqual([4, 4]);
    expect(dummies.every(dummy => dummy.position.y === player.position.y)).toBe(true);
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
});

describe("the terraced duel", () => {
  it("is in its own arena, with the opponent on the low ground and the player on the platform", () => {
    const world = worldOfScenario("terraced", 1);

    expect(world.arena).toBe(TERRACED_ARENA);
    expect(world.opponent?.position).toEqual(TERRACED_OPPONENT);
    expect(levelAt(world.arena, TERRACED_OPPONENT)).toBe(0);
    expect(levelAt(world.arena, world.player.position)).toBe(1);
  });

  it("gives the opponent a brain drawn from the seed, and is one round with no score, and no dummies", () => {
    const world = worldOfScenario("terraced", 5);

    expect(world.opponentBrain).toEqual(
      giveOpponentBrain(startingWorld(TERRACED_ARENA, [], TERRACED_OPPONENT), 5).opponentBrain,
    );
    expect(world.match).toBeUndefined();
    expect(world.dummies).toEqual([]);
  });

  it("has a ring on ground both fighters can walk to, with the timing the page asked for", () => {
    const timing = {startDelaySeconds: 1, closingSeconds: 6, damageScale: 10};
    const {player} = startingWorld(TERRACED_ARENA, [], TERRACED_OPPONENT);

    expect(worldOfScenario("terraced", 9, timing).ring).toEqual(
      startRing({arena: TERRACED_ARENA, starts: [player.position, TERRACED_OPPONENT], seed: 9, timing}),
    );
    expect(worldOfScenario("terraced", 9).ring?.timing).toEqual(DEFAULT_RING_TIMING);
  });
});

it("lays a weapon between the fighters in the duel and in sparring, drawn from the seed", () => {
  for (const scenario of ["duel", "sparring"] as const) {
    expect(worldOfScenario(scenario, 8).pickup).toEqual(duelPickup(8));
    expect(worldOfScenario(scenario, 8).pickup).toEqual(worldOfScenario(scenario, 8).pickup);
    expect(worldOfScenario(scenario, 8).pickup?.position.x).toBe(13.5);
  }
  expect(worldOfScenario("duel", 8).pickup?.position).not.toEqual(worldOfScenario("duel", 6).pickup?.position);
});

it("lays no weapon in the practice range or the heights arena, which have no opponent to be as far from", () => {
  expect(worldOfScenario("practice", 8).pickup).toBeUndefined();
  expect(worldOfScenario("heights", 8).pickup).toBeUndefined();
});

function duelRing(seed: number, timing: RingTiming = DEFAULT_RING_TIMING): Ring {
  const {player} = startingWorld(DUEL_ARENA, [], DUEL_OPPONENT);

  return startRing({arena: DUEL_ARENA, starts: [player.position, DUEL_OPPONENT], seed, timing});
}

function duelPickup(seed: number): Pickup {
  const {player} = startingWorld(DUEL_ARENA, [], DUEL_OPPONENT);

  return startPickup({arena: DUEL_ARENA, starts: [player.position, DUEL_OPPONENT], seed, weapon: SUBMACHINE_GUN});
}
