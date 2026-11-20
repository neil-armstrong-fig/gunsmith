import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {withPickedUpWeapon} from "@gunsmith/engine/pickup/taking/WithPickedUpWeapon";
import {SUBMACHINE_GUN} from "@gunsmith/engine/weapon/weapons/SubmachineGun";

const player = startingWorld(arenaFrom(["#####", "#...#", "#####"])).player;

it("replaces the weapon in hand, which stays in hand with a full magazine and its reserve", () => {
  const taken = withPickedUpWeapon({...player, equippedIndex: 0}, SUBMACHINE_GUN);

  expect(taken.loadout[0]).toEqual({
    weapon: SUBMACHINE_GUN,
    rounds: SUBMACHINE_GUN.magazineSize,
    reserve: SUBMACHINE_GUN.startingReserve,
  });
  expect(taken.equippedIndex).toBe(0);
});

it("replaces the second weapon when that is the one in hand", () => {
  const taken = withPickedUpWeapon({...player, equippedIndex: 1}, SUBMACHINE_GUN);

  expect(taken.loadout[1]).toEqual({
    weapon: SUBMACHINE_GUN,
    rounds: SUBMACHINE_GUN.magazineSize,
    reserve: SUBMACHINE_GUN.startingReserve,
  });
  expect(taken.equippedIndex).toBe(1);
});

it("leaves the weapon not in hand as it was, rounds and all", () => {
  const spent = {
    ...player,
    equippedIndex: 1,
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

it("keeps the same number of weapons", () => {
  expect(withPickedUpWeapon(player, SUBMACHINE_GUN).loadout).toHaveLength(player.loadout.length);
});
