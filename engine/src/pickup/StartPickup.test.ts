import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {routeDistancesFrom} from "@gunsmith/engine/pickup/placement/RouteDistancesFrom";
import {startPickup} from "@gunsmith/engine/pickup/StartPickup";
import type {PickupRequest} from "@gunsmith/engine/pickup/types/PickupRequest";
import {nextRandom} from "@gunsmith/engine/random/NextRandom";
import {SUBMACHINE_GUN} from "@gunsmith/engine/weapon/weapons/SubmachineGun";

// The duel's arena: starts at (10.5, 6.5) and (16.5, 6.5), pillars north and south of the row.
const duel = arenaFrom([
  "####################",
  "#..................#",
  "#..................#",
  "#...##........##...#",
  "#...##........##...#",
  "#..................#",
  "#..................#",
  "#...##........##...#",
  "#...##........##...#",
  "#..................#",
  "#..................#",
  "####################",
]);
const PLAYER: Point = {x: 10.5, y: 6.5};
const OPPONENT: Point = {x: 16.5, y: 6.5};
const SEEDS = Array.from({length: 60}, (_, seed) => seed);

function requestIn(arena: Arena, seed: number, starts: readonly Point[] = [PLAYER, OPPONENT]): PickupRequest {
  return {arena, starts, seed, weapon: SUBMACHINE_GUN};
}

it("lies on the middle of a floor tile, holding the weapon it was asked for", () => {
  const pickup = startPickup(requestIn(duel, 3));

  expect(pickup.position.x % 1).toBe(0.5);
  expect(pickup.position.y % 1).toBe(0.5);
  expect(pickup.weapon).toBe(SUBMACHINE_GUN);
});

it("is the same for the same seed and not always the same place", () => {
  expect(startPickup(requestIn(duel, 9))).toEqual(startPickup(requestIn(duel, 9)));
  expect(new Set(SEEDS.map(seed => startPickup(requestIn(duel, seed)).position.y)).size).toBeGreaterThan(5);
});

it("lies exactly as far from one fighter as from the other, by the way they would walk", () => {
  for (const seed of SEEDS) {
    const {position} = startPickup(requestIn(duel, seed));
    const key = Math.floor(position.y) * duel.width + Math.floor(position.x);

    expect(routeDistancesFrom(duel, PLAYER).get(key)).toBe(routeDistancesFrom(duel, OPPONENT).get(key));
  }
});

it("lies on the column halfway between the starts in the duel's arena", () => {
  expect(new Set(SEEDS.map(seed => startPickup(requestIn(duel, seed)).position.x))).toEqual(new Set([13.5]));
});

it("puts the pickup where the acceptance specs expect it for their seeds: on the fighters' row for seed 8, four rows off for seed 6", () => {
  expect(startPickup(requestIn(duel, 8)).position).toEqual({x: 13.5, y: 6.5});
  expect(startPickup(requestIn(duel, 6)).position).toEqual({x: 13.5, y: 2.5});
});

it("is the same whichever fighter's start is listed first", () => {
  expect(startPickup(requestIn(duel, 5, [PLAYER, OPPONENT]))).toEqual(
    startPickup(requestIn(duel, 5, [OPPONENT, PLAYER])),
  );
});

it("never lies under a fighter, even where their own tiles are as fair as any", () => {
  const corridor = arenaFrom(["######", "#....#", "######"]);
  const places = SEEDS.map(
    seed =>
      startPickup(
        requestIn(corridor, seed, [
          {x: 1.5, y: 1.5},
          {x: 2.5, y: 1.5},
        ]),
      ).position.x,
  );

  expect(new Set(places)).toEqual(new Set([3.5, 4.5]));
});

it("falls back to the fairest tile there is when no tile is exactly as far from both", () => {
  const corridor = arenaFrom(["######", "#....#", "######"]);
  const places = SEEDS.map(
    seed =>
      startPickup(
        requestIn(corridor, seed, [
          {x: 1.5, y: 1.5},
          {x: 4.5, y: 1.5},
        ]),
      ).position.x,
  );

  expect(new Set(places)).toEqual(new Set([2.5, 3.5]));
});

it("draws on a stream of its own, not the seed's first draw that the opponent's brain takes", () => {
  const sameAsTheBrain = SEEDS.filter(seed => {
    const firstDraw = nextRandom(seed).value;
    const candidates = Array.from({length: 10}, (_, index) => index + 1.5);

    return startPickup(requestIn(duel, seed)).position.y === candidates[Math.floor(firstDraw * 10)];
  });

  expect(sameAsTheBrain.length).toBeLessThan(SEEDS.length / 2);
});

it("refuses an arena where the fighters cannot walk to each other", () => {
  const split = arenaFrom(["#######", "#..#..#", "#######"]);

  expect(() =>
    startPickup(
      requestIn(split, 1, [
        {x: 1.5, y: 1.5},
        {x: 5.5, y: 1.5},
      ]),
    ),
  ).toThrow(/cannot walk to each other/);
});

it("refuses a request with no fighter to be as far from", () => {
  expect(() => startPickup(requestIn(duel, 1, []))).toThrow(/at least one fighter/);
});
