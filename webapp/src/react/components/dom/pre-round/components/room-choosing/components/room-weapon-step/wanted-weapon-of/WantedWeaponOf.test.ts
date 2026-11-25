import type {Weapon} from "@gunsmith/engine/weapon/types/Weapon";
import {wantedWeaponOf} from "@src/react/components/dom/pre-round/components/room-choosing/components/room-weapon-step/wanted-weapon-of/WantedWeaponOf";

const weapon = {} as Weapon;
const saved = [
  {id: "weapon-from-the-library", prompt: "a mint coil", weapon},
  {id: "another-weapon", prompt: "a long gun", weapon},
];

it("names a built-in by its key when nothing is saved", () => {
  expect(wantedWeaponOf("submachine-gun", [])).toEqual({kind: "builtIn", key: "submachine-gun"});
});

it("names a saved weapon by its library id", () => {
  expect(wantedWeaponOf("another-weapon", saved)).toEqual({kind: "saved", id: "another-weapon"});
});

it("names a built-in by its key even when the player has saved weapons", () => {
  expect(wantedWeaponOf("rifle", saved)).toEqual({kind: "builtIn", key: "rifle"});
});

it("treats an id the library no longer holds as a built-in's key, for the server to refuse", () => {
  expect(wantedWeaponOf("weapon-that-was-deleted", saved)).toEqual({kind: "builtIn", key: "weapon-that-was-deleted"});
});
