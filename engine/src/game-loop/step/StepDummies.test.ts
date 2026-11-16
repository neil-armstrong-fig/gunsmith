import {DUMMY_HEALTH} from "@gunsmith/engine/dummy/DummyHealth";
import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import {step} from "@gunsmith/engine/game-loop/Step";
import type {World} from "@gunsmith/engine/game-loop/types/World";
import {MARKSMAN_RIFLE} from "@gunsmith/engine/weapon/weapons/MarksmanRifle";
import {RIFLE} from "@gunsmith/engine/weapon/weapons/Rifle";
import {arena} from "@gunsmith/engine/game-loop/step/testing/Arena";
import {TICK} from "@gunsmith/engine/game-loop/step/testing/Tick";
import {IDLE} from "@gunsmith/engine/game-loop/step/testing/Idle";
import {shoot} from "@gunsmith/engine/game-loop/step/testing/Shoot";

describe("with a dummy east of the player", () => {
  it("hurts a dummy the player shoots at", () => {
    const after = shoot(withDummyEast(), 1, 30);

    expect(after.dummies[0]?.health).toBe(DUMMY_HEALTH - RIFLE.bulletDamage);
  });

  it("uses up the bullet that hit the dummy, well before the wall would have", () => {
    // The dummy is two tiles from the muzzle; the wall is six. After 0.1 s a free bullet would be two tiles out, past the dummy.
    const near = startingWorld(arena, [{x: 9.5, y: 4.5}]);

    expect(shoot(near, 1, 6).bullets).toEqual([]);
    expect(shoot(startingWorld(arena), 1, 6).bullets).toHaveLength(1);
  });

  it("takes the dummy out of the world once enough shots have landed", () => {
    expect(withDummyEast().dummies).toHaveLength(1);
    expect(shoot(withDummyEast(), 180, 0).dummies).toEqual([]);
  });

  it("does not hurt a dummy that is not in the line of fire", () => {
    const aside = startingWorld(arena, [{x: 11.5, y: 7}]);

    expect(shoot(aside, 1, 30).dummies[0]?.health).toBe(DUMMY_HEALTH);
  });

  it("does not change the dummies of the world it was given", () => {
    const world = withDummyEast();
    const before = structuredClone(world);

    shoot(world, 60, 0);

    expect(world).toEqual(before);
  });

  it("hurts a dummy by the damage of the weapon that shot it", () => {
    const switched = step(withDummyEast(), {...IDLE, switchTo: 2}, TICK);

    expect(shoot(switched, 1, 30).dummies[0]?.health).toBe(DUMMY_HEALTH - MARKSMAN_RIFLE.bulletDamage);
  });

  // The player starts at (7.5, 4.5) facing east; four tiles east of that is a dummy on the same row.
  function withDummyEast(): World {
    return startingWorld(arena, [{x: 11.5, y: 4.5}]);
  }
});
