import {pullTrigger} from "@gunsmith/engine/weapon/TriggerPull";
import type {TriggerRequest} from "@gunsmith/engine/weapon/types/TriggerRequest";

const TICK = 1 / 60;
const INTERVAL = 0.2;

/** A weapon that is ready, loaded and not reloading, with the trigger held; `changes` says what differs. */
function pull(changes: Partial<TriggerRequest> = {}): ReturnType<typeof pullTrigger> {
  return pullTrigger({
    cooldownSeconds: 0,
    firing: true,
    seconds: TICK,
    fireIntervalSeconds: INTERVAL,
    rounds: 5,
    reloading: false,
    ...changes,
  });
}

it("fires when the trigger is held and the weapon is ready", () => {
  expect(pull().fires).toBe(true);
});

it("starts the cool-down when it fires", () => {
  expect(pull().cooldownSeconds).toBe(INTERVAL);
});

it("uses the fire interval of the weapon it is given", () => {
  expect(pull({fireIntervalSeconds: 0.6}).cooldownSeconds).toBe(0.6);
});

it("does not fire when the trigger is not held", () => {
  expect(pull({firing: false}).fires).toBe(false);
});

it("does not fire again while it is still cooling down", () => {
  expect(pull({cooldownSeconds: INTERVAL}).fires).toBe(false);
});

it("counts the cool-down down by the time that passed", () => {
  expect(pull({cooldownSeconds: 0.1, firing: false, seconds: 0.04}).cooldownSeconds).toBeCloseTo(0.06, 12);
});

it("never lets the cool-down go below zero", () => {
  expect(pull({cooldownSeconds: 0.01, firing: false, seconds: 1}).cooldownSeconds).toBe(0);
});

it("fires again on the step that finishes the cool-down", () => {
  const result = pull({cooldownSeconds: 0.01});

  expect(result.fires).toBe(true);
  expect(result.cooldownSeconds).toBe(INTERVAL);
});

it("fires the last round in the magazine", () => {
  expect(pull({rounds: 1}).fires).toBe(true);
});

it("does not fire with an empty magazine", () => {
  expect(pull({rounds: 0}).fires).toBe(false);
});

it("does not fire while the weapon is being reloaded", () => {
  expect(pull({reloading: true}).fires).toBe(false);
});

it("keeps cooling down while the magazine is empty", () => {
  expect(pull({rounds: 0, cooldownSeconds: 0.1, seconds: 0.04}).cooldownSeconds).toBeCloseTo(0.06, 12);
});

it("keeps cooling down while the weapon is being reloaded", () => {
  expect(pull({reloading: true, cooldownSeconds: 0.1, seconds: 0.04}).cooldownSeconds).toBeCloseTo(0.06, 12);
});

it("does not start the cool-down when it cannot fire", () => {
  expect(pull({rounds: 0}).cooldownSeconds).toBe(0);
});
