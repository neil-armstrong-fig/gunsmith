import {MARKSMAN_RIFLE} from "@gunsmith/engine/weapon/weapons/MarksmanRifle";
import {SUBMACHINE_GUN} from "@gunsmith/engine/weapon/weapons/SubmachineGun";
import {standInWeaponFor} from "@src/react/components/dom/workshop/components/weapon-prompt/stand-in/StandInWeaponFor";

it("makes a long-range weapon from a prompt about a sniper, with the marksman rifle's numbers", () => {
  const weapon = standInWeaponFor("a long range sniper rifle");

  expect(weapon.bulletDamage).toBe(MARKSMAN_RIFLE.bulletDamage);
  expect(weapon.identity?.key).toBe("marksman-rifle");
});

it("makes a fast weapon from a prompt about a submachine gun", () => {
  const weapon = standInWeaponFor("a fast little submachine gun");

  expect(weapon.fireIntervalSeconds).toBe(SUBMACHINE_GUN.fireIntervalSeconds);
  expect(weapon.identity?.key).toBe("submachine-gun");
});

it("makes the rifle from any other prompt", () => {
  expect(standInWeaponFor("something reliable").identity?.key).toBe("rifle");
});

it("takes the long-range reading when a prompt is both long-range and fast", () => {
  expect(standInWeaponFor("a fast sniper").identity?.key).toBe("marksman-rifle");
});

it("names the weapon as a stand-in", () => {
  expect(standInWeaponFor("a fast little submachine gun").identity?.name).toBe("Stand-in Submachine gun");
});
