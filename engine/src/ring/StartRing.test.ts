import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {reachableCentre} from "@gunsmith/engine/ring/centre/ReachableCentre";
import {startRing} from "@gunsmith/engine/ring/StartRing";
import {DEFAULT_RING_TIMING} from "@gunsmith/engine/ring/DefaultRingTiming";
import type {RingRequest} from "@gunsmith/engine/ring/types/RingRequest";

const arena = arenaFrom(["#######", "#.....#", "#.....#", "#######"]);
const request: RingRequest = {
  arena,
  starts: [{x: 1.5, y: 1.5}],
  seed: 4,
  timing: {startDelaySeconds: 3, closingSeconds: 9},
};

it("starts a round's ring with none of the round played", () => {
  expect(startRing(request).roundSeconds).toBe(0);
});

it("closes on a point the fighters can walk to, drawn from the seed", () => {
  expect(startRing(request).centre).toEqual(reachableCentre(request));
});

it("keeps the timing it was given", () => {
  expect(startRing(request).timing).toEqual({startDelaySeconds: 3, closingSeconds: 9});
});

it("covers the whole arena at first: it reaches the corner farthest from the centre", () => {
  const onlyTile = arenaFrom(["###", "#.#", "###"]);
  const ring = startRing({arena: onlyTile, starts: [{x: 1.5, y: 1.5}], seed: 1, timing: DEFAULT_RING_TIMING});

  expect(ring.startRadius).toBeCloseTo(Math.hypot(1.5, 1.5), 12);
});

it("reaches the farthest corner whichever corner that is", () => {
  const ring = startRing(request);
  const corners = [
    {x: 0, y: 0},
    {x: 7, y: 0},
    {x: 0, y: 4},
    {x: 7, y: 4},
  ];
  const farthest = Math.max(...corners.map(corner => Math.hypot(corner.x - ring.centre.x, corner.y - ring.centre.y)));

  expect(ring.startRadius).toBeCloseTo(farthest, 12);
});
