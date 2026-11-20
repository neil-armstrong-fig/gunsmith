import {RIFLE} from "@gunsmith/engine/weapon/weapons/Rifle";
import {shelfWeaponsOfPersisted} from "@src/store/shelf/browser-storage/ShelfWeaponsOfPersisted";

const KEPT = {id: "a", prompt: "a rifle", weapon: RIFLE};

it("gives the weapons of what persist read back", () => {
  expect(shelfWeaponsOfPersisted({weapons: [KEPT]})).toEqual([KEPT]);
});

it("leaves out a weapon that does not parse and keeps the rest", () => {
  expect(shelfWeaponsOfPersisted({weapons: [{id: "b", prompt: "x"}, KEPT]})).toEqual([KEPT]);
});

it.each([undefined, 7, "shelf", [KEPT], {}, {weapons: "none"}])("is an empty shelf for %j", persisted => {
  expect(shelfWeaponsOfPersisted(persisted)).toEqual([]);
});
