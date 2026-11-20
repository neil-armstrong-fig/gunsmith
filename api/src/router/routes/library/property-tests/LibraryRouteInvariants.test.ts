import fc from "fast-check";
import {testAccounts} from "@src/accounts/testing/in-memory/TestAccounts";
import {limitOfKind} from "@src/accounts/limit-of-kind/LimitOfKind";
import type {ItemKind} from "@src/accounts/types/ItemKind";
import {libraryRoute} from "@src/router/routes/library/LibraryRoute";
import {SHELF_LIMITS} from "@src/router/routes/library/limits/ShelfLimits";
import {keepItem} from "@src/router/routes/library/testing/KeepItem";
import type {ModelItem} from "@src/router/routes/library/property-tests/types/ModelItem";
import type {ShelfStep} from "@src/router/routes/library/property-tests/types/ShelfStep";
import type {ShelfAnswer} from "@src/router/routes/library/types/ShelfAnswer";
import {cookieOfPlayer} from "@src/router/routes/shared/fake-accounts/CookieOfPlayer";

/**
 * What must hold for any run of keeping, saving and removing across two accounts, including saves and removals of the other
 * account's items: each call answers what a plain model of the shelf says it must (saved, full, not found), a shelf never holds more
 * than its limits and only its own account's items, and the shelf at the end is exactly the model's. Deliberately outside
 * `pnpm checks` (a fresh seed each run); `pnpm test:properties` runs it.
 */
const RUNS = Number(process.env["PROPERTY_TEST_RUNS"] ?? 100);
const ACCOUNTS = ["acct-1", "acct-2"];

it("answers as a plain model of the shelves does, and never overfills a space or shows another account's item", async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.array(
        fc.record({
          action: fc.constantFrom("keep", "save", "remove"),
          account: fc.integer({min: 0, max: 1}),
          pick: fc.nat(100),
          weapon: fc.boolean(),
        }),
        {minLength: 1, maxLength: 60},
      ),
      async (steps: ShelfStep[]) => {
        testAccounts.reset();
        const items: ModelItem[] = [];

        for (const step of steps) {
          const account = ACCOUNTS[step.account] ?? "acct-1";
          if (step.action === "keep") {
            const item: ModelItem = {
              id: `item-${items.length}`,
              owner: account,
              kind: kindOf(step),
              saved: false,
            };
            await keepItem(account, item.id, item.kind);
            items.push(item);
            continue;
          }

          const item = items[step.pick % Math.max(items.length, 1)];
          if (!item) {
            continue;
          }
          if (step.action === "save") {
            expect((await save(account, item.id)).status).toBe(expectedSave(items, item, account));
            item.saved ||= item.owner === account && expectedSave(items, item, account) === 200;
          } else {
            expect((await remove(account, item.id)).status).toBe(expectedRemove(item, account));
            item.saved = item.saved && item.owner !== account;
          }
        }

        for (const account of ACCOUNTS) {
          const shelf = (await (await get(account)).json()) as ShelfAnswer;
          const mine = items.filter(item => item.owner === account && item.saved);

          expect(shelf.weapons.length).toBeLessThanOrEqual(SHELF_LIMITS.weapons);
          expect(shelf.arenas.length).toBeLessThanOrEqual(SHELF_LIMITS.arenas);
          expect([...shelf.weapons, ...shelf.arenas].map(item => item.id).sort()).toEqual(
            mine.map(item => item.id).sort(),
          );
        }
      },
    ),
    {numRuns: RUNS},
  );
});

function kindOf(step: ShelfStep): ItemKind {
  if (step.weapon) {
    return "weapon";
  }

  return "arena";
}

function expectedRemove(item: ModelItem, account: string): number {
  if (item.owner === account) {
    return 200;
  }

  return 404;
}

function expectedSave(items: ModelItem[], item: ModelItem, account: string): number {
  if (item.owner !== account) {
    return 404;
  }
  if (item.saved) {
    return 200;
  }

  const used = items.filter(other => other.owner === account && other.kind === item.kind && other.saved).length;
  const limit = limitOfKind(SHELF_LIMITS, item.kind);
  if (used >= limit) {
    return 409;
  }

  return 200;
}

async function get(account: string): Promise<Response> {
  return await libraryRoute(
    new Request("https://gunsmith.test/api/library", {headers: {Cookie: cookieOfPlayer(account)}}),
  );
}

async function save(account: string, id: string): Promise<Response> {
  return await libraryRoute(
    new Request("https://gunsmith.test/api/library", {
      method: "POST",
      headers: {Cookie: cookieOfPlayer(account)},
      body: JSON.stringify({id}),
    }),
  );
}

async function remove(account: string, id: string): Promise<Response> {
  return await libraryRoute(
    new Request(`https://gunsmith.test/api/library/${id}`, {
      method: "DELETE",
      headers: {Cookie: cookieOfPlayer(account)},
    }),
  );
}
