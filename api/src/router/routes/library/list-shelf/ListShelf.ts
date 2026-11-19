import {savedItemsOfAccount} from "@src/accounts/saved-items-of-account/SavedItemsOfAccount";
import type {SavedItem} from "@src/accounts/types/SavedItem";
import {SHELF_LIMITS} from "@src/router/routes/library/limits/ShelfLimits";
import type {ShelfAnswer} from "@src/router/routes/library/types/ShelfAnswer";
import type {ShelfItemAnswer} from "@src/router/routes/library/types/ShelfItemAnswer";

/**
 * `GET /api/library` for a signed-in account: the shelf's limits and what the account has saved, weapons and arenas apart. Everything
 * comes from the database, kept when the server made it; nothing here was ever sent by the page.
 */
export async function listShelf(accountId: string): Promise<Response> {
  const items = await savedItemsOfAccount(accountId);
  const answer: ShelfAnswer = {
    limits: SHELF_LIMITS,
    weapons: items.filter(item => item.kind === "weapon").map(answerOf),
    arenas: items.filter(item => item.kind === "arena").map(answerOf),
  };

  return Response.json(answer);
}

function answerOf({id, prompt, savedAt, payload}: SavedItem): ShelfItemAnswer {
  const answer: ShelfItemAnswer = {id, prompt, savedAt: savedAt.toISOString()};
  if (typeof payload !== "object" || payload === null) {
    return answer;
  }

  const result = payload as Record<string, unknown>;

  return {...answer, weapon: result.weapon, appearance: result.appearance, arena: result.arena};
}
