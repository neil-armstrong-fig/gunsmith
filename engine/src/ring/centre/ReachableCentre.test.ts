import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import {isSolid} from "@gunsmith/engine/arena/IsSolid";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {nextRandom} from "@gunsmith/engine/random/NextRandom";
import {reachableCentre} from "@gunsmith/engine/ring/centre/ReachableCentre";
import {DEFAULT_RING_TIMING} from "@gunsmith/engine/ring/DefaultRingTiming";
import type {RingRequest} from "@gunsmith/engine/ring/types/RingRequest";

const room = arenaFrom(["#######", "#.....#", "#.....#", "#.....#", "#######"]);
const withStair = arenaFrom(["#########", "#...>111#", "#...#111#", "#########"]);
const noStair = arenaFrom(["#########", "#...1111#", "#...1111#", "#########"]);
const SEEDS = Array.from({length: 120}, (_, seed) => seed);

it("is the middle of a floor tile", () => {
  const centre = reachableCentre(requestIn(room, 3));

  expect(centre.x % 1).toBe(0.5);
  expect(centre.y % 1).toBe(0.5);
  expect(isSolid(room, Math.floor(centre.x), Math.floor(centre.y))).toBe(false);
});

it("is the same for the same seed", () => {
  expect(reachableCentre(requestIn(room, 9))).toEqual(reachableCentre(requestIn(room, 9)));
});

it("is not always the same place: the seed picks it", () => {
  const places = new Set(SEEDS.map(seed => JSON.stringify(reachableCentre(requestIn(room, seed)))));

  expect(places.size).toBeGreaterThan(8);
});

it("can fall on any floor tile of the arena, wherever the seeds lead", () => {
  const places = new Set(SEEDS.map(seed => JSON.stringify(reachableCentre(requestIn(room, seed)))));

  expect(places.size).toBeLessThanOrEqual(15);
  expect([...places].every(place => place.includes(".5"))).toBe(true);
});

it("falls on the platform when the fighters can climb to it by a stair", () => {
  const onPlatform = SEEDS.filter(seed => reachableCentre(requestIn(withStair, seed)).x > 4);

  expect(onPlatform.length).toBeGreaterThan(0);
});

it("never falls where the fighters cannot walk: a platform with no stair", () => {
  const onPlatform = SEEDS.filter(seed => reachableCentre(requestIn(noStair, seed)).x > 4);

  expect(onPlatform).toEqual([]);
});

it("draws on a stream of its own: the seed's first draw is the opponent's, so the ring does not take the same one", () => {
  const sharedDrawIndex = (seed: number): number => Math.floor(nextRandom(seed).value * 15);
  const tiles = [...Array(15).keys()].map(index => ({x: (index % 5) + 1.5, y: Math.floor(index / 5) + 1.5}));
  const sameAsTheBrain = SEEDS.filter(seed => {
    const centre = reachableCentre(requestIn(room, seed));

    return centre.x === tiles[sharedDrawIndex(seed)]?.x && centre.y === tiles[sharedDrawIndex(seed)]?.y;
  });

  expect(sameAsTheBrain.length).toBeLessThan(SEEDS.length / 4);
});

it("is judged from every fighter's start: a start that cannot reach the others is refused", () => {
  const request = requestIn(noStair, 1, [
    {x: 1.5, y: 1.5},
    {x: 6.5, y: 1.5},
  ]);

  expect(() => reachableCentre(request)).toThrow("cannot walk");
});

it("does not depend on which fighter is listed first", () => {
  const starts = [
    {x: 1.5, y: 1.5},
    {x: 6.5, y: 2.5},
  ];
  const reversed = [...starts].reverse();

  for (const seed of SEEDS) {
    expect(reachableCentre(requestIn(withStair, seed, starts))).toEqual(
      reachableCentre(requestIn(withStair, seed, reversed)),
    );
  }
});

function requestIn(arena: Arena, seed: number, starts: readonly Point[] = [{x: 1.5, y: 1.5}]): RingRequest {
  return {arena, starts, seed, timing: DEFAULT_RING_TIMING};
}
