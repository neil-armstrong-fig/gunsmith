import {rememberedChoicesOfPersisted} from "@src/store/pre-round-choices/browser-storage/RememberedChoicesOfPersisted";

const KEPT = {firstWeaponId: "rifle", secondWeaponId: "marksman-rifle", arenaId: "built-in:Duel"};

it("gives the three ids that were kept", () => {
  expect(rememberedChoicesOfPersisted(KEPT)).toEqual(KEPT);
});

it("drops anything beyond the three ids", () => {
  expect(rememberedChoicesOfPersisted({...KEPT, extra: 1})).toEqual(KEPT);
});

it("gives nothing when an id is missing or not text", () => {
  expect(rememberedChoicesOfPersisted({...KEPT, arenaId: undefined})).toBeUndefined();
  expect(rememberedChoicesOfPersisted({...KEPT, firstWeaponId: 3})).toBeUndefined();
});

it("gives nothing for what is not choices at all", () => {
  expect(rememberedChoicesOfPersisted(undefined)).toBeUndefined();
  expect(rememberedChoicesOfPersisted("rifle")).toBeUndefined();
  expect(rememberedChoicesOfPersisted(null)).toBeUndefined();
});
