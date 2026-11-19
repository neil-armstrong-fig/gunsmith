import {CREDIT_PRICES} from "@src/durable-objects/credit-ledger/account/CreditPrices";
import {DAILY_CREDITS} from "@src/durable-objects/credit-ledger/account/DailyCredits";
import type {CreditStatus} from "@src/router/routes/credits/types/CreditStatus";
import type {ApiEnvironment} from "@src/env/types/ApiEnvironment";
import {parseAccountId} from "@src/router/routes/shared/account-id/ParseAccountId";

/**
 * `GET /api/credits` with an `X-Account-Id` (the same stand-in for the session as `POST /api/weapons`): what the selection panel
 * shows, the account's balance ("7 of 10 today"), the prices and whether AI is on. **Only a read**: it reserves, settles and refunds
 * nothing and calls no model, so it costs the player and the budget nothing. Guards in order, each reading nothing: the method (405),
 * the account (401). The balance is as of now, so a new UTC day shows the full allowance.
 */
export async function creditStatusRoute(request: Request, env: ApiEnvironment): Promise<Response> {
  if (request.method !== "GET") {
    return Response.json({error: "method-not-allowed"}, {status: 405, headers: {Allow: "GET"}});
  }

  const accountId = parseAccountId(request.headers.get("X-Account-Id") ?? undefined);
  if (!accountId) {
    return Response.json({error: "account-required"}, {status: 401});
  }

  const aiStatus = await env.SPEND.getByName("spend").status();
  const balance = await env.CREDITS.getByName(accountId).balance();
  const status: CreditStatus = {
    balance,
    dailyAllowance: DAILY_CREDITS,
    prices: {weapon: CREDIT_PRICES.weapon, rejected: CREDIT_PRICES.rejected},
    aiOn: aiStatus.on,
    returnsAt: aiStatus.returnsAt,
  };

  return Response.json(status);
}
