import type {WeaponChoice} from "@src/durable-objects/match/messages/types/WeaponChoice";
import type {ChosenWeapon} from "@src/durable-objects/match/pre-round/types/ChosenWeapon";

/**
 * The weapon a seat named, ready for the room, or `undefined` when it cannot be taken: a built-in as it is, a saved one looked up among
 * the account's own and checked. A guest has no library. Saved weapons are not readable until the engine's stored-weapon parser reaches
 * this branch (HANDOFF), so for now a saved choice is refused for everyone.
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

  return await Promise.resolve(undefined);
}
