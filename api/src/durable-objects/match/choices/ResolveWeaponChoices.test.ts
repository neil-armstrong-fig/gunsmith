import {RIFLE} from "@gunsmith/engine/weapon/weapons/Rifle";
import {fallbackAppearance} from "@gunsmith/shared/appearance/fallback/FallbackAppearance";
import {resolveWeaponChoices} from "@src/durable-objects/match/choices/ResolveWeaponChoices";
import {keepItemFor} from "@src/durable-objects/match/choices/saved-item/testing/KeepItemFor";
import {saveItemFor} from "@src/durable-objects/match/choices/saved-item/testing/SaveItemFor";

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

it("takes the signed-in player's own saved weapons, each with its id, the engine's weapon and its drawing", async () => {
  await saveItemFor({accountId: "acct-1", id: "weapon-1", kind: "weapon", payload: storedWeapon("Zapper")});
  await saveItemFor({accountId: "acct-1", id: "weapon-2", kind: "weapon", payload: storedWeapon("Thumper")});

  const chosen = await resolveWeaponChoices("acct-1", [
    {kind: "saved", id: "weapon-1"},
    {kind: "builtIn", key: "rifle"},
  ]);

  expect(chosen).toEqual([
    {
      kind: "saved",
      id: "weapon-1",
      weapon: {
        identity: {key: "saved", name: "Zapper"},
        ...statsOf(RIFLE),
        visionDegrees: RIFLE.visionDegrees,
        visionRange: RIFLE.visionRange,
      },
      appearance: fallbackAppearance(),
    },
    {kind: "builtIn", key: "rifle"},
  ]);
});

it("takes two saved weapons", async () => {
  await saveItemFor({accountId: "acct-1", id: "weapon-1", kind: "weapon", payload: storedWeapon("Zapper")});
  await saveItemFor({accountId: "acct-1", id: "weapon-2", kind: "weapon", payload: storedWeapon("Thumper")});

  const chosen = await resolveWeaponChoices("acct-1", [
    {kind: "saved", id: "weapon-1"},
    {kind: "saved", id: "weapon-2"},
  ]);

  expect(chosen?.map(weapon => weapon.kind === "saved" && weapon.weapon.identity?.name)).toEqual(["Zapper", "Thumper"]);
});

it("refuses the whole pair when one weapon is another account's, however good the other is", async () => {
  await saveItemFor({accountId: "acct-1", id: "weapon-1", kind: "weapon", payload: storedWeapon("Zapper")});
  await saveItemFor({accountId: "acct-2", id: "weapon-2", kind: "weapon", payload: storedWeapon("Thumper")});

  const choices = [
    {kind: "saved", id: "weapon-1"},
    {kind: "saved", id: "weapon-2"},
  ] as const;

  expect(await resolveWeaponChoices("acct-1", choices)).toBeUndefined();
});

it("refuses a weapon the account kept but never saved, an unknown id and the id of a saved arena", async () => {
  await keepItemFor({accountId: "acct-1", id: "kept", kind: "weapon", payload: storedWeapon("Zapper")});
  await saveItemFor({accountId: "acct-1", id: "arena-1", kind: "arena", payload: storedWeapon("Zapper")});

  for (const id of ["kept", "nothing", "arena-1"]) {
    expect(
      await resolveWeaponChoices("acct-1", [
        {kind: "builtIn", key: "rifle"},
        {kind: "saved", id},
      ]),
    ).toBeUndefined();
  }
});

it("refuses a saved weapon the engine would not equip, a drawing the schema refuses, or a payload that is not a weapon", async () => {
  await saveItemFor({
    accountId: "acct-1",
    id: "strong",
    kind: "weapon",
    payload: {...storedWeapon("Strong"), weapon: {...statsOf(RIFLE), name: "Strong", bulletDamage: 9999}},
  });
  await saveItemFor({
    accountId: "acct-1",
    id: "plain",
    kind: "weapon",
    payload: {...storedWeapon("Plain"), appearance: {shapes: ["a"]}},
  });
  await saveItemFor({
    accountId: "acct-1",
    id: "no-drawing",
    kind: "weapon",
    payload: {weapon: {...statsOf(RIFLE), name: "Bare"}},
  });
  await saveItemFor({accountId: "acct-1", id: "text", kind: "weapon", payload: "not an object"});
  await saveItemFor({accountId: "acct-1", id: "null", kind: "weapon", payload: null});

  for (const id of ["strong", "plain", "no-drawing", "text", "null"]) {
    expect(
      await resolveWeaponChoices("acct-1", [
        {kind: "saved", id},
        {kind: "builtIn", key: "rifle"},
      ]),
    ).toBeUndefined();
  }
});

function storedWeapon(name: string): Record<string, unknown> {
  return {weapon: {...statsOf(RIFLE), name}, appearance: fallbackAppearance()};
}

function statsOf(weapon: typeof RIFLE): Record<string, number> {
  const {fireIntervalSeconds, bulletDamage, bulletSpeed, magazineSize, reloadSeconds, startingReserve} = weapon;

  return {fireIntervalSeconds, bulletDamage, bulletSpeed, magazineSize, reloadSeconds, startingReserve};
}
