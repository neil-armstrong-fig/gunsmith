import {WeaponKeyLatch} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/hooks/use-weapon-keys/latch/WeaponKeyLatch";

it("has no reload asked for before a key is pressed", () => {
  expect(new WeaponKeyLatch().takeReload()).toBe(false);
});

it("has no weapon asked for before a key is pressed", () => {
  expect(new WeaponKeyLatch().takeSlot()).toBeUndefined();
});

it("hands a reload to the first step that asks, and only that step", () => {
  const latch = new WeaponKeyLatch();
  latch.pressReload();

  expect(latch.takeReload()).toBe(true);
  expect(latch.takeReload()).toBe(false);
});

it("hands a weapon switch to the first step that asks, and only that step", () => {
  const latch = new WeaponKeyLatch();
  latch.pressSlot(2);

  expect(latch.takeSlot()).toBe(2);
  expect(latch.takeSlot()).toBeUndefined();
});

it("counts two presses before a step as one reload", () => {
  const latch = new WeaponKeyLatch();
  latch.pressReload();
  latch.pressReload();

  expect(latch.takeReload()).toBe(true);
  expect(latch.takeReload()).toBe(false);
});

it("asks for the last weapon pressed when two are pressed before a step", () => {
  const latch = new WeaponKeyLatch();
  latch.pressSlot(1);
  latch.pressSlot(2);

  expect(latch.takeSlot()).toBe(2);
});

it("keeps a reload and a switch apart", () => {
  const latch = new WeaponKeyLatch();
  latch.pressReload();

  expect(latch.takeSlot()).toBeUndefined();
  expect(latch.takeReload()).toBe(true);
});

it("delivers a key pressed after a step to the next one", () => {
  const latch = new WeaponKeyLatch();
  latch.pressSlot(2);
  latch.takeSlot();

  latch.pressSlot(1);

  expect(latch.takeSlot()).toBe(1);
});
