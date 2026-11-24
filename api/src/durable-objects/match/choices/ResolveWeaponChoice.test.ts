import {resolveWeaponChoice} from "@src/durable-objects/match/choices/ResolveWeaponChoice";

it("takes a built-in weapon by key, for a guest and for a signed-in player alike", async () => {
  const choice = {kind: "builtIn", key: "submachine-gun"} as const;

  expect(await resolveWeaponChoice(undefined, choice)).toEqual(choice);
  expect(await resolveWeaponChoice("acct-1", choice)).toEqual(choice);
});

it("refuses a saved weapon a guest named: a guest has no library", async () => {
  expect(await resolveWeaponChoice(undefined, {kind: "saved", id: "weapon-1"})).toBeUndefined();
});
