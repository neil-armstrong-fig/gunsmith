import {testAccounts} from "@src/accounts/testing/in-memory/TestAccounts";
import {workerEnvironment} from "@src/env/WorkerEnvironment";
import {deleteAccountRoute} from "@src/router/routes/account/DeleteAccountRoute";
import {DELETED_ACCOUNT_RETENTION_DAYS} from "@src/router/routes/account/retention/DeletedAccountRetention";
import {DAILY_CREDITS} from "@src/durable-objects/credit-ledger/account/DailyCredits";
import {fakeLedgers} from "@src/router/routes/shared/fake-ledgers/FakeLedgers";
import {signInPlayer} from "@src/router/routes/shared/fake-accounts/SignInPlayer";
import {keepAndSaveItem} from "@src/router/routes/library/testing/KeepAndSaveItem";
import {accountOfRequest} from "@src/router/routes/shared/session/AccountOfRequest";
import {subjectDigest} from "@src/router/routes/shared/subject-digest/SubjectDigest";
import type {CreditLedger} from "@src/durable-objects/credit-ledger/CreditLedger";

const CLEARED = "session=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax";
const NOW = new Date("2026-11-19T12:00:00Z");
const A_DAY_MILLISECONDS = 24 * 60 * 60 * 1000;
const RETENTION_MILLISECONDS = DELETED_ACCOUNT_RETENTION_DAYS * A_DAY_MILLISECONDS;

beforeEach(() => {
  vi.useFakeTimers({toFake: ["Date"]});
  vi.setSystemTime(NOW);
  workerEnvironment.ACCOUNT_DIGEST_KEY = "test-digest-key";
});

afterEach(() => {
  vi.useRealTimers();
});

it("removes the account, its sessions and its kept items and signs the browser out", async () => {
  fakeLedgers();
  const player = await signInPlayer();
  const otherSession = await signInPlayer();
  await keepAndSaveItem({accountId: player.account.id, id: "weapon-1", kind: "weapon", savedAt: NOW});

  const response = await deleteAccountRoute(deletion(player.cookie));

  expect(response.status).toBe(204);
  expect(response.headers.getSetCookie()).toEqual([CLEARED]);
  expect(await accountOfRequest(deletion(player.cookie))).toBeUndefined();
  expect(await testAccounts.savedItemsOfAccount(player.account.id)).toEqual([]);
  expect(await accountOfRequest(deletion(otherSession.cookie))).toEqual(otherSession.account);
});

it("keeps the credits: it never erases the ledger of the account it removes, so deleting does not reset the allowance", async () => {
  const ledgers = fakeLedgers();
  const player = await signInPlayer();
  ledgers.accountOf(player.account.id).reserve("earlier-1", "weapon", Date.now());

  await deleteAccountRoute(deletion(player.cookie));

  expect(ledgers.calls).toEqual([]);
  expect(ledgers.accountOf(player.account.id).balance(Date.now())).toBe(DAILY_CREDITS - 1);
});

it("remembers the person by a keyed digest for the retention time, handing the same credit id to their next sign-in", async () => {
  fakeLedgers();
  const player = await signInPlayer();
  const digest = await subjectDigest(subjectOf(player.account.id));

  await deleteAccountRoute(deletion(player.cookie));

  expect(
    await testAccounts.claimDeletedAccountId(digest, new Date(NOW.getTime() + RETENTION_MILLISECONDS - 1000)),
  ).toBe(player.account.id);
});

it("forgets the person once the retention time has come, and not a moment before", async () => {
  fakeLedgers();
  const early = await signInPlayer();
  const late = await signInPlayer();
  await deleteAccountRoute(deletion(early.cookie));
  await deleteAccountRoute(deletion(late.cookie));

  const justBefore = new Date(NOW.getTime() + RETENTION_MILLISECONDS - 1000);
  const dueAt = new Date(NOW.getTime() + RETENTION_MILLISECONDS);

  expect(await testAccounts.sweepDeletedAccounts(justBefore)).toEqual([]);
  expect((await testAccounts.sweepDeletedAccounts(dueAt)).sort()).toEqual([early.account.id, late.account.id].sort());
});

it("erases the credits of earlier deletions whose retention has run out, and no one else's", async () => {
  const ledgers = fakeLedgers();
  const kept = await signInPlayer();
  const expired = await signInPlayer();
  ledgers.accountOf(expired.account.id).reserve("earlier-1", "weapon", Date.now());
  ledgers.accountOf(kept.account.id).reserve("earlier-2", "weapon", Date.now());
  await testAccounts.removeAccount(expired.account.id, {
    subjectDigest,
    keepUntil: new Date(NOW.getTime() - 1000),
  });
  const leaving = await signInPlayer();

  await deleteAccountRoute(deletion(leaving.cookie));

  expect(ledgers.calls).toEqual(["erase"]);
  expect(ledgers.accountOf(expired.account.id).balance(Date.now())).toBe(DAILY_CREDITS);
  expect(ledgers.accountOf(kept.account.id).balance(Date.now())).toBe(DAILY_CREDITS - 1);
});

it("still answers 204, and logs one closed event, when an expired record's credits cannot be erased", async () => {
  fakeLedgers();
  useLedgerThatCannotErase();
  const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  const expired = await signInPlayer();
  await testAccounts.removeAccount(expired.account.id, {
    subjectDigest,
    keepUntil: new Date(NOW.getTime() - 1000),
  });
  const leaving = await signInPlayer();

  const response = await deleteAccountRoute(deletion(leaving.cookie));

  expect(response.status).toBe(204);
  expect(response.headers.getSetCookie()).toEqual([CLEARED]);
  expect(warn).toHaveBeenCalledTimes(1);
  const logged = String(warn.mock.calls[0]?.[0]);
  expect(JSON.parse(logged)).toEqual({route: "account", outcome: "credits-not-erased", error: "TypeError"});
  expect(logged).not.toContain(expired.account.id);
  expect(logged).not.toContain("the object is down");
});

it("erases every expired ledger it can even when one cannot be erased, with a closed event for the one that failed", async () => {
  fakeLedgers();
  const erased: string[] = [];
  const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  const first = await signInPlayer();
  const second = await signInPlayer();
  for (const expired of [first, second]) {
    await testAccounts.removeAccount(expired.account.id, {
      subjectDigest,
      keepUntil: new Date(NOW.getTime() - 1000),
    });
  }
  workerEnvironment.CREDITS = {
    getByName: (name: string) => ({
      erase: async (): Promise<void> => {
        if (name === first.account.id) {
          throw new TypeError("the object is down");
        }
        erased.push(name);
      },
    }),
  } as unknown as DurableObjectNamespace<CreditLedger>;
  const leaving = await signInPlayer();

  const response = await deleteAccountRoute(deletion(leaving.cookie));

  expect(response.status).toBe(204);
  expect(erased).toEqual([second.account.id]);
  expect(warn).toHaveBeenCalledTimes(1);
});

it("answers 500 and keeps the session and the record unwritten, so the player can try again, when the database cannot remove the account", async () => {
  fakeLedgers();
  const player = await signInPlayer();
  vi.spyOn(testAccounts, "removeAccount").mockRejectedValue(new TypeError("D1 is down"));

  const response = await deleteAccountRoute(deletion(player.cookie));

  expect(response.status).toBe(500);
  expect(await response.json()).toEqual({error: "account-deletion-failed"});
  expect(response.headers.getSetCookie()).toEqual([]);
  expect(await accountOfRequest(deletion(player.cookie))).toEqual(player.account);
});

it("answers 503 and removes nothing when there is no key to make the digest with", async () => {
  fakeLedgers();
  const player = await signInPlayer();
  Reflect.deleteProperty(workerEnvironment, "ACCOUNT_DIGEST_KEY");
  const removal = vi.spyOn(testAccounts, "removeAccount");

  const response = await deleteAccountRoute(deletion(player.cookie));

  expect(response.status).toBe(503);
  expect(await response.json()).toEqual({error: "deletion-unavailable"});
  expect(response.headers.getSetCookie()).toEqual([]);
  expect(removal).not.toHaveBeenCalled();
  expect(await accountOfRequest(deletion(player.cookie))).toEqual(player.account);
});

it("answers 401 and removes nothing for a request with no cookie", async () => {
  const ledgers = fakeLedgers();
  const removal = vi.spyOn(testAccounts, "removeAccount");

  const response = await deleteAccountRoute(deletion());

  expect(response.status).toBe(401);
  expect(await response.json()).toEqual({error: "account-required"});
  expect(removal).not.toHaveBeenCalled();
  expect(ledgers.calls).toEqual([]);
});

it("answers 401 for a cookie that names no live session, and for an expired one", async () => {
  const ledgers = fakeLedgers();
  const expired = await signInPlayer({expiresAt: new Date(NOW.getTime() - 1000)});
  const removal = vi.spyOn(testAccounts, "removeAccount");

  const forged = await deleteAccountRoute(deletion("session=not-a-real-token"));
  const late = await deleteAccountRoute(deletion(expired.cookie));

  expect(forged.status).toBe(401);
  expect(late.status).toBe(401);
  expect(removal).not.toHaveBeenCalled();
  expect(ledgers.calls).toEqual([]);
});

it("refuses any way of asking but DELETE, even from a signed-in player", async () => {
  const ledgers = fakeLedgers();
  const player = await signInPlayer();
  const removal = vi.spyOn(testAccounts, "removeAccount");

  const response = await deleteAccountRoute(
    new Request("https://gunsmith.test/api/account", {method: "POST", headers: {Cookie: player.cookie}}),
  );

  expect(response.status).toBe(405);
  expect(response.headers.get("Allow")).toBe("DELETE");
  expect(removal).not.toHaveBeenCalled();
  expect(ledgers.calls).toEqual([]);
});

function subjectOf(accountId: string): string {
  return `google-${accountId}`;
}

function deletion(cookie?: string): Request {
  const headers = new Headers();
  if (cookie) {
    headers.set("Cookie", cookie);
  }

  return new Request("https://gunsmith.test/api/account", {method: "DELETE", headers});
}

function useLedgerThatCannotErase(): void {
  workerEnvironment.CREDITS = {
    getByName: () => ({
      erase: async (): Promise<void> => {
        throw new TypeError("the object is down");
      },
    }),
  } as unknown as DurableObjectNamespace<CreditLedger>;
}
