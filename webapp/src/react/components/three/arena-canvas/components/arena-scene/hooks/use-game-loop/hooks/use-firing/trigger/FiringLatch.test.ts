import {FiringLatch} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/hooks/use-firing/trigger/FiringLatch";

it("is not firing before the button goes down", () => {
  expect(new FiringLatch().isFiring()).toBe(false);
});

it("is firing while the button is held", () => {
  const latch = new FiringLatch();

  latch.press();

  expect(latch.isFiring()).toBe(true);
});

it("keeps firing across steps for as long as the button stays held", () => {
  const latch = new FiringLatch();
  latch.press();

  latch.afterTicks(3);

  expect(latch.isFiring()).toBe(true);
});

it("stops firing once the button is released and the steps that saw it have run", () => {
  const latch = new FiringLatch();
  latch.press();
  latch.afterTicks(1);

  latch.release();

  expect(latch.isFiring()).toBe(false);
});

it("still fires for a click that came and went between two steps", () => {
  const latch = new FiringLatch();

  latch.press();
  latch.release();

  expect(latch.isFiring()).toBe(true);
});

it("has finished with that click once a step has run", () => {
  const latch = new FiringLatch();
  latch.press();
  latch.release();

  latch.afterTicks(1);

  expect(latch.isFiring()).toBe(false);
});

it("keeps the click for a frame that owed no steps", () => {
  const latch = new FiringLatch();
  latch.press();
  latch.release();

  latch.afterTicks(0);

  expect(latch.isFiring()).toBe(true);
});
