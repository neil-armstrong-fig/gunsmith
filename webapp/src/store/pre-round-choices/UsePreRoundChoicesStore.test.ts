import {usePreRoundChoicesStore} from "@src/store/pre-round-choices/UsePreRoundChoicesStore";

const CHOICES = {firstWeaponId: "submachine-gun", secondWeaponId: "rifle", arenaId: "built-in:Fair duel"};

beforeEach(() => {
  usePreRoundChoicesStore.setState(usePreRoundChoicesStore.getInitialState(), true);
});

it("holds the three remembered ids and the one action that sets them, and nothing else, so adding state is a deliberate edit", () => {
  expect(Object.keys(usePreRoundChoicesStore.getState()).sort()).toEqual([
    "arenaId",
    "firstWeaponId",
    "remember",
    "secondWeaponId",
  ]);
});

it("remembers nothing before the first lock in", () => {
  expect(usePreRoundChoicesStore.getState().firstWeaponId).toBeUndefined();
  expect(usePreRoundChoicesStore.getState().secondWeaponId).toBeUndefined();
  expect(usePreRoundChoicesStore.getState().arenaId).toBeUndefined();
});

it("remembers the weapon for each slot and the arena it is given", () => {
  usePreRoundChoicesStore.getState().remember(CHOICES);

  expect(usePreRoundChoicesStore.getState()).toMatchObject(CHOICES);
});

it("keeps only the last choices", () => {
  usePreRoundChoicesStore.getState().remember(CHOICES);
  usePreRoundChoicesStore.getState().remember({...CHOICES, arenaId: "built-in:Duel"});

  expect(usePreRoundChoicesStore.getState().arenaId).toBe("built-in:Duel");
});
