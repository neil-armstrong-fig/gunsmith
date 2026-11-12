import {FIRE_INTERVAL_SECONDS} from "@gunsmith/engine/weapon/firing/FireInterval";
import {pullTrigger} from "@gunsmith/engine/weapon/TriggerPull";

const TICK = 1 / 60;

it("fires when the trigger is held and the weapon is ready", () => {
  expect(pullTrigger(0, true, TICK).fires).toBe(true);
});

it("starts the cool-down when it fires", () => {
  expect(pullTrigger(0, true, TICK).cooldownSeconds).toBe(FIRE_INTERVAL_SECONDS);
});

it("does not fire when the trigger is not held", () => {
  expect(pullTrigger(0, false, TICK).fires).toBe(false);
});

it("does not fire again while it is still cooling down", () => {
  expect(pullTrigger(FIRE_INTERVAL_SECONDS, true, TICK).fires).toBe(false);
});

it("counts the cool-down down by the time that passed", () => {
  expect(pullTrigger(0.1, false, 0.04).cooldownSeconds).toBeCloseTo(0.06, 12);
});

it("never lets the cool-down go below zero", () => {
  expect(pullTrigger(0.01, false, 1).cooldownSeconds).toBe(0);
});

it("fires again on the step that finishes the cool-down", () => {
  const result = pullTrigger(0.01, true, TICK);

  expect(result.fires).toBe(true);
  expect(result.cooldownSeconds).toBe(FIRE_INTERVAL_SECONDS);
});
