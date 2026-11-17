import type {Player} from "@gunsmith/engine/player/types/Player";
import {equippedWeapon} from "@gunsmith/engine/loadout/EquippedWeapon";
import type {CarriedWeapon} from "@gunsmith/engine/loadout/types/CarriedWeapon";
import {MARKSMAN_RIFLE} from "@gunsmith/engine/weapon/weapons/MarksmanRifle";
import {RIFLE} from "@gunsmith/engine/weapon/weapons/Rifle";

const FIRST: CarriedWeapon = {weapon: RIFLE, rounds: 3, reserve: 4};
const SECOND: CarriedWeapon = {weapon: MARKSMAN_RIFLE, rounds: 1, reserve: 2};

it("is the first weapon when the player holds slot 1", () => {
  expect(equippedWeapon(playerHolding(0))).toBe(FIRST);
});

it("is the second weapon when the player holds slot 2", () => {
  expect(equippedWeapon(playerHolding(1))).toBe(SECOND);
});

it("fails loudly when the player holds a slot they do not carry", () => {
  expect(() => equippedWeapon(playerHolding(2))).toThrow("The player has no weapon in slot 3.");
});

function playerHolding(equippedIndex: number): Player {
  return {
    position: {x: 1.5, y: 1.5},
    aim: {x: 1, y: 0},
    cooldownSeconds: 0,
    loadout: [FIRST, SECOND],
    equippedIndex,
    crouching: false,
    health: 100,
  };
}
