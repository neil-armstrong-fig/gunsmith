import fc from "fast-check";
import type {WeaponOutcome} from "@gunsmith/ai/pipeline/types/WeaponOutcome";
import {DAILY_CREDITS} from "@src/ai/credits/account/DailyCredits";
import {fakeLedgers} from "@src/generation/fake-ledgers/FakeLedgers";
import type {FakeLedgers} from "@src/generation/fake-ledgers/types/FakeLedgers";
import {generateWeaponRoute} from "@src/generation/GenerateWeaponRoute";
import {plannedRequests} from "@src/generation/property-tests/arbitraries/PlannedRequests";
import type {PlannedRequest} from "@src/generation/property-tests/types/PlannedRequest";

/**
 * What must hold for any crowd of players asking at once, not only the few cases `GenerateWeaponRoute.test.ts` writes down: every
 * request the pipeline ran was charged for what it turned out to be (a weapon one credit, a rejection half, no valid weapon or a throw
 * nothing), no account is ever charged below nothing or above its day's credits, and no reservation is left held. Deliberately outside
 * `pnpm checks` (a fresh seed each run); `pnpm test:properties` runs it.
 */
const RUNS = Number(process.env["PROPERTY_TEST_RUNS"] ?? 100);

it("charges each account exactly what its requests that ran came to, and holds nothing back", async () => {
  await fc.assert(
    fc.asyncProperty(plannedRequests(), async requests => {
      const ledgers = fakeLedgers();
      const ran = await sendTogether(requests, ledgers);

      for (const accountId of new Set(requests.map(request => request.accountId))) {
        const state = ledgers.accountOf(accountId).toState();

        expect(state.balance).toBe(DAILY_CREDITS - costOf(requests, ran, accountId));
        expect(state.balance).toBeGreaterThanOrEqual(0);
        expect(Object.values(state.reservations).every(reservation => !reservation.held)).toBe(true);
      }
    }),
    {numRuns: RUNS},
  );
});

it("never lets an account's requests that ran cost more than its day's credits", async () => {
  await fc.assert(
    fc.asyncProperty(plannedRequests(), async requests => {
      const ledgers = fakeLedgers();
      const ran = await sendTogether(requests, ledgers);

      for (const accountId of new Set(requests.map(request => request.accountId))) {
        expect(costOf(requests, ran, accountId)).toBeLessThanOrEqual(DAILY_CREDITS);
      }
    }),
    {numRuns: RUNS},
  );
});

/** Sends every request at once; answers which of them the pipeline was asked to run (by position). */
async function sendTogether(requests: readonly PlannedRequest[], ledgers: FakeLedgers): Promise<Set<number>> {
  const ran = new Set<number>();
  const weaponSmith = async (prompt: string): Promise<WeaponOutcome> => {
    const position = Number(prompt);
    ran.add(position);
    const outcome = requests[position]?.outcome;
    if (outcome === undefined || outcome === "throws") {
      throw new Error("the model failed");
    }

    return outcome;
  };

  await Promise.all(
    requests.map(async (request, position) => {
      return await generateWeaponRoute(
        new Request("https://gunsmith.test/api/weapons", {
          method: "POST",
          headers: {"X-Account-Id": request.accountId},
          body: JSON.stringify({prompt: String(position)}),
        }),
        ledgers.environment,
        weaponSmith,
      );
    }),
  );

  return ran;
}

/** What the account's requests that ran should have cost, worked out from what each was planned to end as, not from the route. */
function costOf(requests: readonly PlannedRequest[], ran: ReadonlySet<number>, accountId: string): number {
  let cost = 0;
  requests.forEach((request, position) => {
    if (request.accountId !== accountId || !ran.has(position) || request.outcome === "throws") {
      return;
    }
    if (request.outcome.status === "created") {
      cost += 1;
    }
    if (request.outcome.status === "rejected") {
      cost += 0.5;
    }
  });

  return cost;
}
