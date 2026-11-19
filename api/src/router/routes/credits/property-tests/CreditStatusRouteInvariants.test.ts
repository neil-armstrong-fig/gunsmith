import fc from "fast-check";
import {DAILY_CREDITS} from "@src/durable-objects/credit-ledger/account/DailyCredits";
import type {CreditKind} from "@src/durable-objects/credit-ledger/types/CreditKind";
import {creditStatusRoute} from "@src/router/routes/credits/CreditStatusRoute";
import {fakeLedgers} from "@src/router/routes/shared/fake-ledgers/FakeLedgers";

/**
 * What must hold however often, and for whichever accounts, the panel asks: a read answers each account's own balance, changes
 * nothing (the balances are what they were, and the only calls to the ledgers are the two reads), and so costs nobody a credit.
 * Deliberately outside `pnpm checks` (a fresh seed each run); `pnpm test:properties` runs it.
 */
const RUNS = Number(process.env["PROPERTY_TEST_RUNS"] ?? 100);
const SPENDING: CreditKind[] = ["weapon", "rejected"];

it("answers each account's own balance and leaves every balance as it was, however often it is asked", async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.array(fc.constantFrom("acct-1", "acct-2", "acct-3"), {minLength: 1, maxLength: 30}),
      fc.array(fc.constantFrom(...SPENDING), {maxLength: 8}),
      async (askers, spendings) => {
        const ledgers = fakeLedgers();
        spendings.forEach((kind, index) => ledgers.accountOf("acct-1").reserve(`earlier-${index}`, kind, Date.now()));
        const before = ["acct-1", "acct-2", "acct-3"].map(id => ledgers.accountOf(id).balance(Date.now()));
        ledgers.calls.length = 0;

        for (const accountId of askers) {
          const response = await creditStatusRoute(read(accountId), ledgers.environment);
          const body: unknown = await response.json();

          expect(body).toMatchObject({balance: ledgers.accountOf(accountId).balance(Date.now())});
        }

        const after = ["acct-1", "acct-2", "acct-3"].map(id => ledgers.accountOf(id).balance(Date.now()));
        expect(after).toEqual(before);
        expect(before.every(balance => balance <= DAILY_CREDITS)).toBe(true);
        expect(new Set(ledgers.calls)).toEqual(new Set(["status", "balance"]));
      },
    ),
    {numRuns: RUNS},
  );
});

function read(accountId: string): Request {
  return new Request("https://gunsmith.test/api/credits", {headers: {"X-Account-Id": accountId}});
}
