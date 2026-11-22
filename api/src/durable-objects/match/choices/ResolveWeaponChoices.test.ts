import {resolveWeaponChoices} from "@src/durable-objects/match/choices/ResolveWeaponChoices";

it("takes two built-in weapons by key, for a guest and for a signed-in player alike", async () => {
  const choices = [
    {kind: "builtIn", key: "rifle"},
    {kind: "builtIn", key: "submachine-gun"},
  ] as const;

  expect(await resolveWeaponChoices(undefined, choices)).toEqual(choices);
  expect(await resolveWeaponChoices("acct-1", choices)).toEqual(choices);
});

it("refuses the whole pair when one weapon is a saved one a guest named: a guest has no library", async () => {
  const choices = [
    {kind: "builtIn", key: "rifle"},
    {kind: "saved", id: "weapon-1"},
  ] as const;

  expect(await resolveWeaponChoices(undefined, choices)).toBeUndefined();
});
