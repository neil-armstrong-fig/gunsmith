import type {ArenaChoice} from "@src/durable-objects/match/messages/types/ArenaChoice";
import type {ChosenArena} from "@src/durable-objects/match/pre-round/types/ChosenArena";

/**
 * The arena a seat named, ready for the room: a built-in as it is, or one of the account's own saved arenas looked up and checked.
 * `undefined` when it cannot be taken: a guest has no library, and a saved arena that is not the account's own, or not one the engine
 * would play, is no arena. Saved arenas are not readable until the engine's stored-arena parser reaches this branch (HANDOFF), so for now
 * a saved choice is refused for everyone.
 */
export async function resolveArenaChoice(
  accountId: string | undefined,
  choice: ArenaChoice,
): Promise<ChosenArena | undefined> {
  if (choice.kind === "builtIn") {
    return choice;
  }
  if (!accountId) {
    return undefined;
  }

  return await Promise.resolve(undefined);
}
