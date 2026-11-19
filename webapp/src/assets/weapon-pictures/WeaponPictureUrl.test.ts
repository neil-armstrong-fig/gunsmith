import {weaponPictureUrl} from "@src/assets/weapon-pictures/WeaponPictureUrl";

it("finds the drawing of each built-in weapon by its identity key", () => {
  expect(weaponPictureUrl("rifle")).toBe("/assets/sprites/sprite-rifle-default.svg");
  expect(weaponPictureUrl("marksman-rifle")).toBe("/assets/sprites/sprite-marksman-rifle.svg");
  expect(weaponPictureUrl("submachine-gun")).toBe("/assets/sprites/sprite-submachine-gun.svg");
});

it("has no picture for a weapon art has not drawn, or for none", () => {
  expect(weaponPictureUrl("lantern")).toBeUndefined();
  expect(weaponPictureUrl(undefined)).toBeUndefined();
});
