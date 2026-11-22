import type {WeaponChoice} from "@src/durable-objects/match/messages/types/WeaponChoice";
import type {ChosenWeapon} from "@src/durable-objects/match/pre-round/types/ChosenWeapon";
import type {ChosenWeapons} from "@src/durable-objects/match/pre-round/types/ChosenWeapons";

/**
 * The two weapons a seat named, ready for the room, or `undefined` when either cannot be taken (the whole pair is refused, so a seat
 * is never left with half of what it asked for): a built-in as it is, a saved one looked up among the account's own and checked. A guest
 * has no library. Saved weapons are not readable until the engine's stored-weapon parser reaches this branch (HANDOFF), so for now a
 * saved choice is refused for everyone.
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

  return await Promise.resolve(undefined);
}
