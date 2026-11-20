import {RIFLE} from "@gunsmith/engine/weapon/weapons/Rifle";
import {fullCarriedWeapon} from "@src/game/loadout/FullCarriedWeapon";

it("carries the weapon with its magazine and its reserve full", () => {
  expect(fullCarriedWeapon(RIFLE)).toEqual({weapon: RIFLE, rounds: RIFLE.magazineSize, reserve: RIFLE.startingReserve});
});
