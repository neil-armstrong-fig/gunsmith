import {RIFLE} from "@gunsmith/engine/weapon/weapons/Rifle";
import {SUBMACHINE_GUN} from "@gunsmith/engine/weapon/weapons/SubmachineGun";
import {shelfWeaponsFrom} from "@src/store/shelf/browser-storage/shelf-weapons-from/ShelfWeaponsFrom";

it("gives back the weapons that went through JSON, in order", () => {
  const weapons = [
    {id: "a", prompt: "a rifle", weapon: RIFLE},
    {id: "b", prompt: "a fast one", weapon: SUBMACHINE_GUN},
  ];

  expect(shelfWeaponsFrom(JSON.parse(JSON.stringify(weapons)))).toEqual(weapons);
});

it.each([undefined, 7, "shelf", {id: "a"}])("gives an empty shelf for %j, which is no list", raw => {
  expect(shelfWeaponsFrom(raw)).toEqual([]);
});

it("drops an item with no weapon, no prompt or no id, and keeps the rest", () => {
  const good = {id: "a", prompt: "a rifle", weapon: RIFLE};

  expect(
    shelfWeaponsFrom([
      {id: "b", prompt: "a rifle"},
      {id: "c", weapon: RIFLE},
      {prompt: "a rifle", weapon: RIFLE},
      {id: 4, prompt: "a rifle", weapon: RIFLE},
      {id: "d", prompt: "a rifle", weapon: {...RIFLE, magazineSize: 0}},
      "nothing",
      good,
    ]),
  ).toEqual([good]);
});

it("drops a second item with an id already seen, so one id is one weapon", () => {
  const first = {id: "a", prompt: "first", weapon: RIFLE};

  expect(shelfWeaponsFrom([first, {id: "a", prompt: "second", weapon: SUBMACHINE_GUN}])).toEqual([first]);
});

it("keeps an empty prompt, since a weapon can be made from no words in the stand-in's view", () => {
  expect(shelfWeaponsFrom([{id: "a", prompt: "", weapon: RIFLE}])).toHaveLength(1);
});
