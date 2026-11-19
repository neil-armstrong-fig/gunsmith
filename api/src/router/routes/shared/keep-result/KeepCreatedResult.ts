import {keepGeneratedItem} from "@src/accounts/keep-generated-item/KeepGeneratedItem";
import type {ItemKind} from "@src/accounts/types/ItemKind";
import {failureAnswer} from "@src/router/routes/shared/time-limit/FailureAnswer";
import type {CreditReservation} from "@src/router/routes/shared/types/CreditReservation";

/**
 * Keeps what a generation request made under a fresh id, so the library can later lift it out by that id alone (the page never sends a
 * weapon or arena back). Answers the id. **If keeping fails the player has nothing to save, so the credit is given back** and the
 * answer is the failure to send (502): the route returns it as it is. Spend is the route's: the model calls were made.
 */
export async function keepCreatedResult(
  {accountId, credits, key, prompt}: CreditReservation,
  kind: ItemKind,
  payload: unknown,
): Promise<string | Response> {
  const id = crypto.randomUUID();
  try {
    await keepGeneratedItem({id, userId: accountId, kind, prompt, payload, now: new Date()});
  } catch (error) {
    await credits.refund(key);

    return failureAnswer(error);
  }

  return id;
}
