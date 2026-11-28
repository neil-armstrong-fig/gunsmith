import {engine} from "@gunsmith/engine/Engine";
import type {Input} from "@gunsmith/engine/game-loop/types/Input";
import {startMatch} from "@gunsmith/engine/match/StartMatch";
import {mutualKnockoutWorld} from "@src/game/scenario/round/world-of-scenario/setups/mutual-knockout/MutualKnockoutWorld";

const IDLE: Input = {direction: {x: 0, y: 0}, firing: false, reload: false};
const A_STEP_SECONDS = 1 / 60;

it("is the first round of a match at nothing to nothing, with no ring, weapon lying about or dummies", () => {
  const world = mutualKnockoutWorld();

  expect(world.round).toBe("playing");
  expect(world.match).toEqual(startMatch());
  expect(world.ring).toBeUndefined();
  expect(world.pickup).toBeUndefined();
  expect(world.dummies).toEqual([]);
});

it("has a shot in the air from each fighter at the other, each enough to bring the target down", () => {
  const world = mutualKnockoutWorld();
  const shooters = world.bullets.map(bullet => bullet.shooter).sort();

  expect(shooters).toEqual(["opponent", "player"]);
  expect(world.bullets.every(bullet => bullet.damage >= world.player.health)).toBe(true);
  expect(world.bullets.every(bullet => bullet.damage >= (world.opponent?.health ?? Infinity))).toBe(true);
});

it("draws the round in its first step, since both fighters fall together", () => {
  const after = engine.step(mutualKnockoutWorld(), IDLE, A_STEP_SECONDS);

  expect(after.round).toBe("drawn");
  expect(after.match).toEqual(startMatch());
});

it("leaves the opponent standing and unarmed, so nothing but the two shots in the air can end the round", () => {
  const world = mutualKnockoutWorld();

  expect(world.opponentBrain).toBeUndefined();
  expect(world.opponent?.loadout.every(carried => carried.rounds === 0 && carried.reserve === 0)).toBe(true);
});
