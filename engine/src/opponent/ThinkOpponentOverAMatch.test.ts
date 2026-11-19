import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {isSolid} from "@gunsmith/engine/arena/IsSolid";
import {levelOfTile} from "@gunsmith/engine/arena/LevelOfTile";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import {step} from "@gunsmith/engine/game-loop/Step";
import type {Input} from "@gunsmith/engine/game-loop/types/Input";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import type {World} from "@gunsmith/engine/game-loop/types/World";
import {giveOpponentBrain} from "@gunsmith/engine/opponent/GiveOpponentBrain";
import {DIFFICULTY} from "@gunsmith/engine/opponent/Difficulty";
import {startRing} from "@gunsmith/engine/ring/StartRing";

// The practice arena's shape: four pillars to be walked around.
const pillared = arenaFrom([
  "########################",
  "#......................#",
  "#......................#",
  "#...##..............##.#",
  "#...##..............##.#",
  "#......................#",
  "#......................#",
  "#......................#",
  "#......................#",
  "#.##..............##...#",
  "#.##..............##...#",
  "#......................#",
  "#......................#",
  "########################",
]);
// The same, split down the middle by a wall with no gap, so the two halves never see each other.
const split = arenaFrom([
  "########################",
  "#...........#..........#",
  "#...........#..........#",
  "#...##......#.....##...#",
  "#...##......#.....##...#",
  "#...........#..........#",
  "#...........#..........#",
  "#...........#..........#",
  "#...........#..........#",
  "#.##........#....##....#",
  "#.##........#....##....#",
  "#...........#..........#",
  "#...........#..........#",
  "########################",
]);
// Low ground in the west (with a sealed pocket at its far end where an idle player stands, so the opponent never sees them), a
// platform one level up in the east, and one stair between them in the top row of the floor, at column 14.
const terraced = arenaFrom([
  "##############################",
  "#..#..........>11111111111111#",
  "#..#...............1111111111#",
  "#..#...............1111111111#",
  "#..#...............1111111111#",
  "#..#...............1111111111#",
  "##############################",
]);
const IN_THE_POCKET: Point = {x: 1.5, y: 3.5};
const ON_THE_LOW_GROUND: Point = {x: 8.5, y: 3.5};
const ON_THE_PLATFORM: Point = {x: 24.5, y: 3.5};
// The game's terraced arena (`webapp/src/game/terraced/`): low ground in the west, a platform from column 11, one stair at column 10
// in the top row. In the overlook the opponent stands on the platform and the player on the low ground, eleven tiles apart.
const overlook = arenaFrom([
  "#########################",
  "#.........>1111111111111#",
  "#..........1111111111111#",
  "#..........1111111111111#",
  "#..........1111111111111#",
  "#..........1111111111111#",
  "#########################",
]);
const OVERLOOK_OPPONENT: Point = {x: 12.5, y: 3.5};
const OVERLOOK_PLAYER: Point = {x: 1.5, y: 3.5};

const TICK = 1 / 60;
const IDLE: Input = {direction: {x: 0, y: 0}, firing: false, reload: false};
const SEEDS = Array.from({length: 20}, (_, index) => index + 1);

describe("on the pillared arena", () => {
  it("kills a player who stands still, within fifteen seconds, whatever its seed", () => {
    for (const seed of SEEDS) {
      let world = giveOpponentBrain(startingWorld(pillared, [], {x: 18.5, y: 7.5}), seed);
      for (let tick = 0; tick < 15 / TICK && world.round === "playing"; tick++) {
        world = step(world, IDLE, TICK);
      }

      expect(world.round).toBe("lost");
    }
  });

  it("never walks into a wall or out of the arena while it fights", () => {
    for (const seed of SEEDS) {
      let world = giveOpponentBrain(startingWorld(pillared, [], {x: 18.5, y: 7.5}), seed);
      for (let tick = 0; tick < 15 / TICK && world.round === "playing"; tick++) {
        world = step(world, IDLE, TICK);

        expect(isOnOpenFloor(pillared, opponentPosition(world))).toBe(true);
      }
    }
  });

  it("plays the same match out the same way from the same seed", () => {
    for (const seed of SEEDS.slice(0, 5)) {
      const play = (): World => {
        let world = giveOpponentBrain(startingWorld(pillared, [], {x: 18.5, y: 7.5}), seed);
        for (let tick = 0; tick < 600; tick++) {
          world = step(world, IDLE, TICK);
        }

        return world;
      };

      expect(play()).toEqual(play());
    }
  });

  it("moves while it fights, rather than standing where it began", () => {
    for (const seed of SEEDS) {
      let world = giveOpponentBrain(startingWorld(pillared, [], {x: 18.5, y: 7.5}), seed);
      const start = opponentPosition(world);
      let furthest = 0;
      for (let tick = 0; tick < 3 / TICK && world.round === "playing"; tick++) {
        world = step(world, IDLE, TICK);
        furthest = Math.max(
          furthest,
          Math.hypot(opponentPosition(world).x - start.x, opponentPosition(world).y - start.y),
        );
      }

      expect(furthest).toBeGreaterThan(0.3);
    }
  });

  it("never takes a point of damage from the closing ring, whatever its seed", () => {
    for (const seed of SEEDS) {
      let world = ringedDuel(seed);
      for (let tick = 0; tick < 17 / TICK; tick++) {
        world = step(world, IDLE, TICK);

        expect(world.opponent?.health).toBe(100);
      }
    }
  });

  it("is inside the final ring when it has closed", () => {
    for (const seed of SEEDS) {
      let world = ringedDuel(seed);
      for (let tick = 0; tick < 17 / TICK; tick++) {
        world = step(world, IDLE, TICK);
      }
      const {ring} = world;
      const position = opponentPosition(world);

      expect(Math.hypot(position.x - (ring?.centre.x ?? 0), position.y - (ring?.centre.y ?? 0))).toBeLessThanOrEqual(2);
    }
  });

  it("plays the same ringed match out the same way from the same seed", () => {
    for (const seed of SEEDS.slice(0, 5)) {
      const play = (): World => {
        let world = ringedDuel(seed);
        for (let tick = 0; tick < 600; tick++) {
          world = step(world, IDLE, TICK);
        }

        return world;
      };

      expect(play()).toEqual(play());
    }
  });
});

describe("on the arena split by a wall", () => {
  it("wanders a whole minute, staying on open floor, never stuck, with a player it can never see", () => {
    for (const seed of SEEDS) {
      let world = giveOpponentBrain(startingWorld(split, [], {x: 18.5, y: 7.5}), seed);
      const visited = new Set<string>();
      let anchor = opponentPosition(world);
      let stillSeconds = 0;
      let longestStill = 0;
      for (let tick = 0; tick < 60 / TICK; tick++) {
        world = step(world, IDLE, TICK);
        const position = opponentPosition(world);
        visited.add(`${Math.floor(position.x)},${Math.floor(position.y)}`);

        expect(isOnOpenFloor(split, position)).toBe(true);

        if (Math.hypot(position.x - anchor.x, position.y - anchor.y) >= 0.5) {
          anchor = position;
          stillSeconds = 0;
        } else {
          stillSeconds += TICK;
          longestStill = Math.max(longestStill, stillSeconds);
        }
      }

      expect(longestStill).toBeLessThan(6);
      expect(visited.size).toBeGreaterThan(15);
      expect(world.round).toBe("playing");
    }
  });
});

describe("on the terraced arena, across two levels", () => {
  const SIMULATION_TIMEOUT_MS = 15_000;

  it(
    "climbs the stair to a ring that closes on a platform, and takes no damage, whatever its seed",
    {timeout: SIMULATION_TIMEOUT_MS},
    () => {
      for (const seed of SEEDS) {
        let world = terracedDuel(seed, ON_THE_LOW_GROUND, {x: 25.5, y: 3.5});
        for (let tick = 0; tick < 23 / TICK; tick++) {
          world = step(world, IDLE, TICK);

          expect(world.opponent?.health).toBe(100);
        }

        expect(Math.hypot(opponentPosition(world).x - 25.5, opponentPosition(world).y - 3.5)).toBeLessThanOrEqual(2);
      }
    },
  );

  it("comes down the stair to a ring that closes on the low ground, and takes no damage, whatever its seed", () => {
    for (const seed of SEEDS) {
      let world = terracedDuel(seed, ON_THE_PLATFORM, {x: 8.5, y: 3.5});
      for (let tick = 0; tick < 23 / TICK; tick++) {
        world = step(world, IDLE, TICK);

        expect(world.opponent?.health).toBe(100);
      }

      expect(Math.hypot(opponentPosition(world).x - 8.5, opponentPosition(world).y - 3.5)).toBeLessThanOrEqual(2);
    }
  });

  it("comes down by the stair to a player who stands on the low ground in its sight, and fights them from its range, whatever its seed", () => {
    for (const seed of SEEDS) {
      let world = overlookDuel(seed);
      for (let tick = 0; tick < 10 / TICK; tick++) {
        world = step(world, IDLE, TICK);
      }

      const {x, y} = opponentPosition(world);
      expect(levelOfTile(overlook, Math.floor(x), Math.floor(y))).toBe(0);
      expect(Math.hypot(x - world.player.position.x, y - world.player.position.y)).toBeLessThanOrEqual(
        DIFFICULTY.farRange + 1,
      );
    }
  });

  it("plays the overlook out the same way from the same seed", () => {
    for (const seed of SEEDS.slice(0, 5)) {
      const play = (): World => {
        let world = overlookDuel(seed);
        for (let tick = 0; tick < 600; tick++) {
          world = step(world, IDLE, TICK);
        }

        return world;
      };

      expect(play()).toEqual(play());
    }
  });

  it("plays the same match out the same way from the same seed", () => {
    for (const seed of SEEDS.slice(0, 5)) {
      const play = (): World => {
        let world = terracedDuel(seed, ON_THE_LOW_GROUND, {x: 25.5, y: 3.5});
        for (let tick = 0; tick < 900; tick++) {
          world = step(world, IDLE, TICK);
        }

        return world;
      };

      expect(play()).toEqual(play());
    }
  });

  it(
    "wanders a whole minute, on both levels, never stuck, with a player it can never see",
    {timeout: SIMULATION_TIMEOUT_MS},
    () => {
      for (const seed of SEEDS) {
        // No ring: the wall of the pocket keeps the player out of sight, so wandering is all it does.
        let world = giveOpponentBrain(startingWorld(terraced, [], ON_THE_LOW_GROUND), seed);
        world = {...world, player: {...world.player, position: IN_THE_POCKET, health: 100000}};
        const levels = new Set<number>();
        let anchor = opponentPosition(world);
        let stillSeconds = 0;
        let longestStill = 0;
        for (let tick = 0; tick < 60 / TICK; tick++) {
          world = step(world, IDLE, TICK);
          const position = opponentPosition(world);
          levels.add(levelOfTile(terraced, Math.floor(position.x), Math.floor(position.y)));

          expect(isOnOpenFloor(terraced, position)).toBe(true);

          if (Math.hypot(position.x - anchor.x, position.y - anchor.y) >= 0.5) {
            anchor = position;
            stillSeconds = 0;
          } else {
            stillSeconds += TICK;
            longestStill = Math.max(longestStill, stillSeconds);
          }
        }

        expect(longestStill).toBeLessThan(6);
        expect([...levels].sort()).toEqual([0, 1]);
      }
    },
  );
});

function opponentPosition(world: World): Point {
  if (!world.opponent) {
    throw new Error("The world has no opponent.");
  }

  return world.opponent.position;
}

function isOnOpenFloor(arena: Arena, point: Point): boolean {
  return !isSolid(arena, Math.floor(point.x), Math.floor(point.y));
}

// A duel inside a ring that closes in a few seconds. The player is idle and cannot be killed, so the round carries on and
// the only thing that can hurt the opponent is the ring: its health is the measure of whether it stayed inside.
function ringedDuel(seed: number): World {
  const duel = giveOpponentBrain(startingWorld(pillared, [], {x: 18.5, y: 7.5}), seed);
  const ring = startRing({
    arena: pillared,
    starts: [duel.player.position, {x: 18.5, y: 7.5}],
    seed,
    timing: {startDelaySeconds: 2, closingSeconds: 10},
  });

  return {...duel, player: {...duel.player, health: 100000}, ring};
}

// The opponent on the platform, 1.5 tiles from its edge, and an idle player who cannot be killed standing on the low ground eleven
// tiles away, in the rifle's reach: farther than its far range even from the edge, so the way straight at them ends at the drop.
function overlookDuel(seed: number): World {
  const duel = giveOpponentBrain(startingWorld(overlook, [], OVERLOOK_OPPONENT), seed);

  return {...duel, player: {...duel.player, position: OVERLOOK_PLAYER, health: 100000}};
}

// A duel whose ring closes on `centre` over twenty seconds, after two. The player is idle in the pocket and cannot be killed, so
// the opponent's health measures whether the ring caught it.
function terracedDuel(seed: number, opponentAt: Point, centre: Point): World {
  const duel = giveOpponentBrain(startingWorld(terraced, [], opponentAt), seed);
  const ring = startRing({
    arena: terraced,
    starts: [opponentAt],
    seed,
    timing: {startDelaySeconds: 2, closingSeconds: 20},
  });

  return {
    ...duel,
    player: {...duel.player, position: IN_THE_POCKET, health: 100000},
    ring: {...ring, centre, startRadius: 40},
  };
}
