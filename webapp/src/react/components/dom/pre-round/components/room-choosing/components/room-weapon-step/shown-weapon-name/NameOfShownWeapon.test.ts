import {nameOfShownWeapon} from "@src/react/components/dom/pre-round/components/room-choosing/components/room-weapon-step/shown-weapon-name/NameOfShownWeapon";

it("names a built-in by the name its key has in the page's own list", () => {
  expect(nameOfShownWeapon({kind: "builtIn", key: "submachine-gun"})).toBe("Submachine gun");
  expect(nameOfShownWeapon({kind: "builtIn", key: "marksman-rifle"})).toBe("Marksman rifle");
});

it("names a saved weapon by the name it was sent with", () => {
  expect(nameOfShownWeapon({kind: "saved", name: "Sparky"})).toBe("Sparky");
});

it("calls a key the page does not know a weapon", () => {
  expect(nameOfShownWeapon({kind: "builtIn", key: "no-such-weapon"})).toBe("Weapon");
});
