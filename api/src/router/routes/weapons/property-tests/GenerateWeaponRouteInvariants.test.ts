import fc from "fast-check";
import type {WeaponOutcome} from "@gunsmith/ai/pipeline/types/WeaponOutcome";
import {DAILY_CREDITS} from "@src/durable-objects/credit-ledger/account/DailyCredits";
import {settledWeaponSpend} from "@src/durable-objects/spend-ledger/estimate/weapon/SettledWeaponSpend";
import {WEAPON_SPEND} from "@src/durable-objects/spend-ledger/estimate/weapon/WeaponSpend";
import {SPEND_CAPS} from "@src/durable-objects/spend-ledger/meter/SpendCaps";
import {fakeLedgers} from "@src/router/routes/shared/fake-ledgers/FakeLedgers";
import {generateWeaponRoute} from "@src/router/routes/weapons/GenerateWeaponRoute";
import {plannedRequests} from "@src/router/routes/weapons/property-tests/arbitraries/PlannedRequests";
import type {PlannedRequest} from "@src/router/routes/weapons/property-tests/types/PlannedRequest";
import {cookieOfPlayer} from "@src/router/routes/shared/fake-accounts/CookieOfPlayer";
import {runWeaponPipeline} from "@src/router/routes/weapons/pipeline/RunWeaponPipeline";

/**
 * What must hold for any crowd of players asking at once, not only the few cases `GenerateWeaponRoute.test.ts` writes down: every
 * request the pipeline ran was charged for what it turned out to be (a weapon one credit, a rejection half, no valid weapon or a throw
 * nothing), no account is ever charged below nothing or above its day's credits, and no reservation is left held. The global spend is
 * settled at what the requests that ran came to (a throw at its whole reservation), never passes the daily cap whatever room is left
 * under it, and a request turned away for the cap costs its account nothing. Deliberately outside
 * `pnpm checks` (a fresh seed each run); `pnpm test:properties` runs it.
 */
const RUNS = Number(process.env["PROPERTY_TEST_RUNS"] ?? 100);

it("charges each account exactly what its requests that ran came to, and holds nothing back", async () => {
  await fc.assert(
    fc.asyncProperty(plannedRequests(), async requests => {
      const ledgers = fakeLedgers();
      const ran = await sendTogether(requests);

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
      fakeLedgers();
      const ran = await sendTogether(requests);

      for (const accountId of new Set(requests.map(request => request.accountId))) {
        expect(costOf(requests, ran, accountId)).toBeLessThanOrEqual(DAILY_CREDITS);
      }
    }),
    {numRuns: RUNS},
  );
});

it("settles the global spend at what the requests that ran came to, holding nothing back", async () => {
  await fc.assert(
    fc.asyncProperty(plannedRequests(), async requests => {
      const ledgers = fakeLedgers();
      const ran = await sendTogether(requests);

      expect(ledgers.spendMeter.spentThisMonth()).toBe(spendOf(requests, ran));
      expect(Object.values(ledgers.spendMeter.toState().reservations).every(reservation => !reservation.held)).toBe(
        true,
      );
    }),
    {numRuns: RUNS},
  );
});

it("never lets the global spend pass the daily cap, and charges no credit for a request turned away for it", async () => {
  await fc.assert(
    fc.asyncProperty(plannedRequests(), fc.integer({min: 0, max: 40}), async (requests, requestsOfRoom) => {
      const ledgers = fakeLedgers();
      const earlierSpend = SPEND_CAPS.dailyMicrodollars - requestsOfRoom * WEAPON_SPEND.reservedMicrodollars;
      ledgers.spendMeter.reserve("earlier", earlierSpend, Date.now());
      ledgers.spendMeter.settle("earlier", earlierSpend, Date.now());

      const ran = await sendTogether(requests);

      expect(ledgers.spendMeter.spentThisMonth()).toBeLessThanOrEqual(SPEND_CAPS.dailyMicrodollars);
      expect(ledgers.spendMeter.spentThisMonth()).toBe(earlierSpend + spendOf(requests, ran));
      if (requestsOfRoom === 0) {
        expect(ran.size).toBe(0);
      }
      for (const accountId of new Set(requests.map(request => request.accountId))) {
        expect(ledgers.accountOf(accountId).balance(Date.now())).toBe(DAILY_CREDITS - costOf(requests, ran, accountId));
      }
    }),
    {numRuns: RUNS},
  );
});

/** Sends every request at once; answers which of them the pipeline was asked to run (by position). */
async function sendTogether(requests: readonly PlannedRequest[]): Promise<Set<number>> {
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
  vi.mocked(runWeaponPipeline).mockImplementation(weaponSmith);

  await Promise.all(
    requests.map(async (request, position) => {
      return await generateWeaponRoute(
        new Request("https://gunsmith.test/api/weapons", {
          method: "POST",
          headers: {Cookie: cookieOfPlayer(request.accountId)},
          body: JSON.stringify({prompt: String(position)}),
        }),
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

/** What the requests that ran should have added to the global spend, worked out from what each was planned to end as, not from the route. */
function spendOf(requests: readonly PlannedRequest[], ran: ReadonlySet<number>): number {
  let spend = 0;
  requests.forEach((request, position) => {
    if (!ran.has(position)) {
      return;
    }
    if (request.outcome === "throws") {
      spend += WEAPON_SPEND.reservedMicrodollars;

      return;
    }

    spend += settledWeaponSpend(request.outcome);
  });

  return spend;
}
