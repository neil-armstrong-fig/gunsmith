import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import type {World} from "@gunsmith/engine/game-loop/types/World";
import {RING_START_DELAY_SECONDS} from "@gunsmith/engine/ring/countdown/RingStartDelaySeconds";
import {selectSecondsUntilRing} from "@src/store/game/selectors/select-seconds-until-ring/SelectSecondsUntilRing";
import type {GameStore} from "@src/store/game/types/GameStore";

const world = startingWorld(arenaFrom(["###", "#.#", "###"]));

function storeHolding(held: World): GameStore {
  return {world: held, setWorld: () => undefined};
}

it("reads nothing when the world has no ring", () => {
  expect(selectSecondsUntilRing(storeHolding(world))).toBeUndefined();
});

it("reads the whole start delay before any of the round is played", () => {
  expect(selectSecondsUntilRing(storeHolding({...world, ring: {roundSeconds: 0}}))).toBe(RING_START_DELAY_SECONDS);
});

it("rounds a part of a second up, so the countdown shows 1 until the ring starts and not 0 a moment early", () => {
  const nearlyThere = {roundSeconds: RING_START_DELAY_SECONDS - 0.2};

  expect(selectSecondsUntilRing(storeHolding({...world, ring: nearlyThere}))).toBe(1);
});

it("reads nothing left once the ring has started", () => {
  const started = {roundSeconds: RING_START_DELAY_SECONDS + 5};

  expect(selectSecondsUntilRing(storeHolding({...world, ring: started}))).toBe(0);
});

it("reads the same number on every frame inside one second, so a component re-renders once a second at most", () => {
  const early = selectSecondsUntilRing(storeHolding({...world, ring: {roundSeconds: 10.1}}));
  const later = selectSecondsUntilRing(storeHolding({...world, ring: {roundSeconds: 10.9}}));

  expect(later).toBe(early);
});
