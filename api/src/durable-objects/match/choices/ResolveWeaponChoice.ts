import {parseStoredWeapon} from "@gunsmith/engine/library-items/ParseStoredWeapon";
import {appearanceSchema} from "@gunsmith/shared/appearance/schema/Appearance";
import {fieldOfPayload} from "@src/durable-objects/match/choices/saved-item/FieldOfPayload";
import {findSavedItem} from "@src/durable-objects/match/choices/saved-item/FindSavedItem";
import type {WeaponChoice} from "@src/durable-objects/match/messages/types/WeaponChoice";
import type {ChosenWeapon} from "@src/durable-objects/match/pre-round/types/ChosenWeapon";

/**
 * The weapon a seat named for one slot, ready for the room, or `undefined` when it cannot be taken: a built-in as it is, a saved one looked up
 * among the account's own and checked by the engine's stored-weapon parser and the appearance schema. A guest has no library. The weapons of a
 * seat are taken one at a time, since the second is named only once the first is locked in.
 */
export async function resolveWeaponChoice(
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
