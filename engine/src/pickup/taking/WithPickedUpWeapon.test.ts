import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {withPickedUpWeapon} from "@gunsmith/engine/pickup/taking/WithPickedUpWeapon";
import {SUBMACHINE_GUN} from "@gunsmith/engine/weapon/weapons/SubmachineGun";

const player = startingWorld(arenaFrom(["#####", "#...#", "#####"])).player;

it("puts the weapon in the second slot, in hand, with a full magazine and its reserve", () => {
  const taken = withPickedUpWeapon(player, SUBMACHINE_GUN);

  expect(taken.loadout[1]).toEqual({
    weapon: SUBMACHINE_GUN,
    rounds: SUBMACHINE_GUN.magazineSize,
    reserve: SUBMACHINE_GUN.startingReserve,
  });
  expect(taken.equippedIndex).toBe(1);
});

it("leaves the first slot as it was, rounds and all", () => {
  const spent = {
    ...player,
    loadout: [
      {...(player.loadout[0] ?? {weapon: SUBMACHINE_GUN, reserve: 0}), rounds: 3, reserve: 7},
      ...player.loadout.slice(1),
    ],
  };

  expect(withPickedUpWeapon(spent, SUBMACHINE_GUN).loadout[0]).toEqual(spent.loadout[0]);
});

it("cancels a reload in progress and leaves the cool-down and health alone", () => {
  const busy = {...player, reloadRemainingSeconds: 1, cooldownSeconds: 0.1, health: 40};
  const taken = withPickedUpWeapon(busy, SUBMACHINE_GUN);

  expect(taken.reloadRemainingSeconds).toBeUndefined();
  expect(taken.cooldownSeconds).toBe(0.1);
  expect(taken.health).toBe(40);
});

it("replaces the second slot even when the first weapon is in hand", () => {
  expect(withPickedUpWeapon({...player, equippedIndex: 0}, SUBMACHINE_GUN).loadout).toHaveLength(2);
});
