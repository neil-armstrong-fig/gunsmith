import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {isSolid} from "@gunsmith/engine/arena/IsSolid";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import {step} from "@gunsmith/engine/game-loop/Step";
import type {Input} from "@gunsmith/engine/game-loop/types/Input";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import type {World} from "@gunsmith/engine/game-loop/types/World";
import {giveOpponentBrain} from "@gunsmith/engine/opponent/GiveOpponentBrain";
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
const TICK = 1 / 60;
const IDLE: Input = {direction: {x: 0, y: 0}, firing: false, reload: false};
const SEEDS = Array.from({length: 20}, (_, index) => index + 1);

function opponentPosition(world: World): Point {
  if (!world.opponent) {
    throw new Error("The world has no opponent.");
  }

  return world.opponent.position;
}

function isOnOpenFloor(arena: Arena, point: Point): boolean {
  return !isSolid(arena, Math.floor(point.x), Math.floor(point.y));
}

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
