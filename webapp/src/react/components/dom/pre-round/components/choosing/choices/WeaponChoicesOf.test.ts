import {RIFLE} from "@gunsmith/engine/weapon/weapons/Rifle";
import {weaponChoicesOf} from "@src/react/components/dom/pre-round/components/choosing/choices/WeaponChoicesOf";

it("offers the three built-in weapons when nothing is saved", () => {
  expect(weaponChoicesOf([]).map(choice => choice.weapon.identity?.name)).toEqual([
    "Rifle",
    "Marksman rifle",
    "Submachine gun",
  ]);
});

it("offers the saved weapons after the built-ins, in the order they were saved, each under its shelf id", () => {
  const first = {...RIFLE, identity: {key: "made", name: "First made"}};
  const second = {...RIFLE, identity: {key: "made", name: "Second made"}};

  const choices = weaponChoicesOf([
    {id: "a", prompt: "one", weapon: first},
    {id: "b", prompt: "two", weapon: second},
  ]);

  expect(choices.slice(3)).toEqual([
    {id: "a", weapon: first},
    {id: "b", weapon: second},
  ]);
});
