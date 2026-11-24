import {parseStoredArena} from "@gunsmith/engine/library-items/ParseStoredArena";
import type {ArenaChoice} from "@src/durable-objects/match/messages/types/ArenaChoice";
import {fieldOfPayload} from "@src/durable-objects/match/choices/saved-item/FieldOfPayload";
import {findSavedItem} from "@src/durable-objects/match/choices/saved-item/FindSavedItem";
import type {ChosenArena} from "@src/durable-objects/match/pre-round/types/ChosenArena";

/**
 * The arena a seat named, ready for the room: a built-in as it is, or one of the account's own saved arenas looked up on its shelf
 * and checked by the engine's stored-arena parser. `undefined` when it cannot be taken: a guest has no library, and a saved arena
 * that is not the account's own (or not saved, or not an arena) or not one the engine would play is no arena.
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

  const item = await findSavedItem(accountId, choice.id, "arena");
  if (!item) {
    return undefined;
  }

  const stored = parseStoredArena(fieldOfPayload(item.payload, "arena"));
  if (!stored) {
    return undefined;
  }

  return {kind: "saved", id: item.id, arena: {name: stored.name, rows: stored.rows}};
}
