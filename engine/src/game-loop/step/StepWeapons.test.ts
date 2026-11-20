import type {Player} from "@gunsmith/engine/player/types/Player";
import {step} from "@gunsmith/engine/game-loop/Step";
import type {World} from "@gunsmith/engine/game-loop/types/World";
import {MARKSMAN_RIFLE} from "@gunsmith/engine/weapon/weapons/MarksmanRifle";
import {RIFLE} from "@gunsmith/engine/weapon/weapons/Rifle";
import {TICK} from "@gunsmith/engine/game-loop/step/testing/Tick";
import {IDLE} from "@gunsmith/engine/game-loop/step/testing/Idle";
import {EAST} from "@gunsmith/engine/game-loop/step/testing/East";
import {centred} from "@gunsmith/engine/game-loop/step/testing/Centred";
import {firingAt} from "@gunsmith/engine/game-loop/step/testing/FiringAt";
import {playTicks} from "@gunsmith/engine/game-loop/step/testing/PlayTicks";

describe("with two carried weapons", () => {
  it("spends a round from the magazine when it fires", () => {
    const after = step(centred(), firingAt(EAST), TICK);

    expect(after.player.loadout[0]?.rounds).toBe(RIFLE.magazineSize - 1);
  });

  it("spends no round when the trigger is not held", () => {
    expect(step(centred(), IDLE, TICK).player.loadout[0]?.rounds).toBe(RIFLE.magazineSize);
  });

  it("spends nothing from the weapon that is not equipped", () => {
    expect(step(centred(), firingAt(EAST), TICK).player.loadout[1]?.rounds).toBe(MARKSMAN_RIFLE.magazineSize);
  });

  it("fires the last round in the magazine", () => {
    const after = step(withRounds(centred(), 0, 1), firingAt(EAST), TICK);

    expect(after.bullets).toHaveLength(1);
    expect(after.player.loadout[0]?.rounds).toBe(0);
  });

  it("does not fire with an empty magazine, however long the trigger is held", () => {
    const after = playTicks(withRounds(centred(), 0, 0), firingAt(EAST), 60);

    expect(after.bullets).toEqual([]);
    expect(after.player.loadout[0]?.rounds).toBe(0);
  });

  it("stops firing when the magazine runs out, and has fired exactly the magazine", () => {
    const after = playTicks(centred(), firingAt(EAST), 600);

    expect(after.player.loadout[0]?.rounds).toBe(0);
    expect(after.player.loadout[0]?.reserve).toBe(RIFLE.startingReserve);
  });

  it("equips the weapon in slot 2 when asked", () => {
    expect(step(centred(), {...IDLE, switchTo: 2}, TICK).player.equippedIndex).toBe(1);
  });

  it("keeps the first weapon equipped when it is asked for a slot it does not have", () => {
    expect(step(centred(), {...IDLE, switchTo: 9}, TICK).player.equippedIndex).toBe(0);
  });

  it("fires a bullet with the damage and speed of the weapon in hand", () => {
    const [bullet] = step(centred(), {...firingAt(EAST), switchTo: 2}, TICK).bullets;

    expect(bullet?.damage).toBe(MARKSMAN_RIFLE.bulletDamage);
    expect(bullet?.speed).toBe(MARKSMAN_RIFLE.bulletSpeed);
  });

  it("fires a bullet from the rifle with the rifle's damage and speed to begin with", () => {
    const [bullet] = step(centred(), firingAt(EAST), TICK).bullets;

    expect(bullet?.damage).toBe(RIFLE.bulletDamage);
    expect(bullet?.speed).toBe(RIFLE.bulletSpeed);
  });

  it("spends the round from the weapon in hand, and cools down for that weapon's fire interval", () => {
    const after = step(centred(), {...firingAt(EAST), switchTo: 2}, TICK);

    expect(after.player.loadout[1]?.rounds).toBe(MARKSMAN_RIFLE.magazineSize - 1);
    expect(after.player.loadout[0]?.rounds).toBe(RIFLE.magazineSize);
    expect(after.player.cooldownSeconds).toBe(MARKSMAN_RIFLE.fireIntervalSeconds);
  });

  it("does not let a switch dodge the cool-down of the shot just fired", () => {
    const fired = step(centred(), firingAt(EAST), TICK);

    expect(step(fired, {...firingAt(EAST), switchTo: 2}, TICK).bullets).toHaveLength(1);
  });

  it("starts a reload when asked, and the magazine is not filled yet", () => {
    const after = step(withRounds(centred(), 0, 3), {...IDLE, reload: true}, TICK);

    expect(after.player.reloadRemainingSeconds).toBe(RIFLE.reloadSeconds);
    expect(after.player.loadout[0]?.rounds).toBe(3);
    expect(after.events).toEqual([{kind: "reloadStarted"}]);
    expect(step(after, {...IDLE, reload: true}, TICK).events).toBeUndefined();
    expect(step(centred(), {...IDLE, reload: true}, TICK).events).toBeUndefined();
  });

  it("fills the magazine from the reserve once the reload time has passed, and not before", () => {
    const started = step(withRounds(centred(), 0, 3), {...IDLE, reload: true}, TICK);
    const justBefore = playTicks(started, IDLE, Math.floor((RIFLE.reloadSeconds - 0.1) / TICK));
    const justAfter = playTicks(started, IDLE, Math.ceil((RIFLE.reloadSeconds + 0.1) / TICK));

    expect(justBefore.player.loadout[0]?.rounds).toBe(3);
    expect(justBefore.player.reloadRemainingSeconds).toBeDefined();
    expect(justAfter.player.loadout[0]).toEqual({
      weapon: RIFLE,
      rounds: RIFLE.magazineSize,
      reserve: RIFLE.startingReserve - (RIFLE.magazineSize - 3),
    });
    expect(justAfter.player.reloadRemainingSeconds).toBeUndefined();
  });

  it("does not fire while reloading, even with the trigger held", () => {
    const after = playTicks(withRounds(centred(), 0, 3), {...firingAt(EAST), reload: true}, 30);

    expect(after.bullets).toEqual([]);
    expect(after.player.loadout[0]?.rounds).toBe(3);
  });

  it("fires on the very step the reload finishes", () => {
    const nearlyDone = withPlayer(withRounds(centred(), 0, 0), {reloadRemainingSeconds: 0.001});
    const after = step(nearlyDone, firingAt(EAST), TICK);

    expect(after.bullets).toHaveLength(1);
    expect(after.player.loadout[0]?.rounds).toBe(RIFLE.magazineSize - 1);
  });

  it("cancels a reload when the weapon is switched", () => {
    const reloading = withPlayer(withRounds(centred(), 0, 3), {reloadRemainingSeconds: 1});
    const after = step(reloading, {...IDLE, switchTo: 2}, TICK);

    expect(after.player.equippedIndex).toBe(1);
    expect(after.player.reloadRemainingSeconds).toBeUndefined();
    expect(after.player.loadout[0]?.rounds).toBe(3);
  });

  it("lets the switch land first when it is asked for with a reload, so the reload is the new weapon's", () => {
    const reloading = withPlayer(withRounds(withRounds(centred(), 0, 3), 1, 1), {reloadRemainingSeconds: 1});
    const after = step(reloading, {...IDLE, switchTo: 2, reload: true}, TICK);

    expect(after.player.equippedIndex).toBe(1);
    expect(after.player.reloadRemainingSeconds).toBe(MARKSMAN_RIFLE.reloadSeconds);
  });

  /** The world with `rounds` in the magazine of the weapon at `index`. */
  function withRounds(world: World, index: number, rounds: number): World {
    const loadout = world.player.loadout.map((carried, at) => {
      if (at === index) {
        return {...carried, rounds};
      }

      return carried;
    });

    return withPlayer(world, {loadout});
  }

  function withPlayer(world: World, changes: Partial<Player>): World {
    return {...world, player: {...world.player, ...changes}};
  }
});
