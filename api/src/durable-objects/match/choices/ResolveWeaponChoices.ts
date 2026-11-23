import {parseStoredWeapon} from "@gunsmith/engine/library-items/ParseStoredWeapon";
import {appearanceSchema} from "@gunsmith/shared/appearance/schema/Appearance";
import {fieldOfPayload} from "@src/durable-objects/match/choices/saved-item/FieldOfPayload";
import {findSavedItem} from "@src/durable-objects/match/choices/saved-item/FindSavedItem";
import type {WeaponChoice} from "@src/durable-objects/match/messages/types/WeaponChoice";
import type {ChosenWeapon} from "@src/durable-objects/match/pre-round/types/ChosenWeapon";
import type {ChosenWeapons} from "@src/durable-objects/match/pre-round/types/ChosenWeapons";

/**
 * The two weapons a seat named, ready for the room, or `undefined` when either cannot be taken (the whole pair is refused, so a seat
 * is never left with half of what it asked for): a built-in as it is, a saved one looked up among the account's own and checked by the
 * engine's stored-weapon parser and the appearance schema. A guest has no library.
 */
export async function resolveWeaponChoices(
  accountId: string | undefined,
  choices: readonly [WeaponChoice, WeaponChoice],
): Promise<ChosenWeapons | undefined> {
  const first = await resolveWeaponChoice(accountId, choices[0]);
  const second = await resolveWeaponChoice(accountId, choices[1]);
  if (!first || !second) {
    return undefined;
  }

  return [first, second];
}

async function resolveWeaponChoice(
  accountId: string | undefined,
  choice: WeaponChoice,
): Promise<ChosenWeapon | undefined> {
  if (choice.kind === "builtIn") {
    return choice;
  }
  if (!accountId) {
    return undefined;
  }

  const item = await findSavedItem(accountId, choice.id, "weapon");
  if (!item) {
    return undefined;
  }

  const weapon = parseStoredWeapon(fieldOfPayload(item.payload, "weapon"));
  const appearance = appearanceSchema.safeParse(fieldOfPayload(item.payload, "appearance"));
  if (!weapon || !appearance.success) {
    return undefined;
  }

  return {kind: "saved", id: item.id, weapon, appearance: appearance.data};
}
