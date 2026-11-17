import type {CuesRequest} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/feedback/cues/types/CuesRequest";
import {cuesAfterTick} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/feedback/cues/CuesAfterTick";

const NONE = {bulletHits: 0, ringHurting: false};
const BULLET = [{kind: "damageTaken", cause: "bullet", amount: 20}] as const;
const RING = [{kind: "damageTaken", cause: "ring", amount: 0.2}] as const;
const REFUSED = [{kind: "fireRefused", reason: "empty"}] as const;

function after(request: Partial<CuesRequest>): ReturnType<typeof cuesAfterTick> {
  return cuesAfterTick({previous: NONE, events: undefined, round: "playing", ...request});
}

it("counts a step in which a bullet hurt the player", () => {
  expect(after({events: BULLET}).bulletHits).toBe(1);
  expect(after({previous: {bulletHits: 4, ringHurting: false}, events: BULLET}).bulletHits).toBe(5);
});

it("counts one hit for a step with several bullets in it", () => {
  expect(after({events: [...BULLET, ...BULLET]}).bulletHits).toBe(1);
});

it("keeps the count when nothing hurt the player, and for events that are not damage", () => {
  const previous = {bulletHits: 2, ringHurting: false};

  expect(after({previous}).bulletHits).toBe(2);
  expect(after({previous, events: REFUSED}).bulletHits).toBe(2);
});

it("does not count the ring as a hit, and says the ring hurts", () => {
  expect(after({events: RING})).toEqual({bulletHits: 0, ringHurting: true});
});

it("says the ring hurts only in a step it did, so it stops when the player is inside", () => {
  expect(after({previous: {bulletHits: 0, ringHurting: true}}).ringHurting).toBe(false);
});

it("does not say the ring hurts for a bullet", () => {
  expect(after({events: BULLET}).ringHurting).toBe(false);
});

it("counts both when a bullet and the ring hurt in the same step", () => {
  expect(after({events: [...BULLET, ...RING]})).toEqual({bulletHits: 1, ringHurting: true});
});

it("still counts the hit that ends the round, and stops the ring hurting once the round is not being fought", () => {
  expect(after({events: [...BULLET, ...RING], round: "lost"})).toEqual({bulletHits: 1, ringHurting: false});
});

it("returns the very same object when nothing changed, so the caller can tell", () => {
  const previous = {bulletHits: 1, ringHurting: false};

  expect(after({previous})).toBe(previous);
});
