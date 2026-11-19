import fc from "fast-check";
import type {ArenaOutcome} from "@gunsmith/ai/pipeline/arena/types/ArenaOutcome";
import {DAILY_CREDITS} from "@src/durable-objects/credit-ledger/account/DailyCredits";
import {fakeLedgers} from "@src/router/routes/shared/fake-ledgers/FakeLedgers";
import type {FakeLedgers} from "@src/router/routes/shared/fake-ledgers/types/FakeLedgers";
import {generateArenaRoute} from "@src/router/routes/arenas/GenerateArenaRoute";
import {plannedArenaRequests} from "@src/router/routes/arenas/property-tests/arbitraries/PlannedArenaRequests";
import type {PlannedArenaRequest} from "@src/router/routes/arenas/property-tests/types/PlannedArenaRequest";

/**
 * What must hold for any crowd of players asking at once, not only the few cases `GenerateArenaRoute.test.ts` writes down: every
 * request the pipeline ran was charged for what it turned out to be (an arena one credit, a rejection half, a built-in arena or a throw
 * nothing), no account is ever charged below nothing or above its day's credits, and no reservation is left held. Deliberately outside
 * `pnpm checks` (a fresh seed each run); `pnpm test:properties` runs it.
 */
const RUNS = Number(process.env["PROPERTY_TEST_RUNS"] ?? 100);

it("charges each account exactly what its arena requests that ran came to, and holds nothing back", async () => {
  await fc.assert(
    fc.asyncProperty(plannedArenaRequests(), async requests => {
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

it("never lets an account's arena requests that ran cost more than its day's credits", async () => {
  await fc.assert(
    fc.asyncProperty(plannedArenaRequests(), async requests => {
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
async function sendTogether(requests: readonly PlannedArenaRequest[], ledgers: FakeLedgers): Promise<Set<number>> {
  const ran = new Set<number>();
  const arenaSmith = async (prompt: string): Promise<ArenaOutcome> => {
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
      return await generateArenaRoute(
        new Request("https://gunsmith.test/api/arenas", {
          method: "POST",
          headers: {"X-Account-Id": request.accountId},
          body: JSON.stringify({prompt: String(position)}),
        }),
        ledgers.environment,
        arenaSmith,
      );
    }),
  );

  return ran;
}

/** What the account's requests that ran should have cost, worked out from what each was planned to end as, not from the route. */
function costOf(requests: readonly PlannedArenaRequest[], ran: ReadonlySet<number>, accountId: string): number {
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
