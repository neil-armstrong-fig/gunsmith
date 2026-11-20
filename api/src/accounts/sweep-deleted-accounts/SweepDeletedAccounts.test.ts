import {insertDeletedAccount} from "@src/accounts/testing/local-database/InsertDeletedAccount";
import {rowsOf} from "@src/accounts/testing/local-database/RowsOf";
import {useLocalDatabase} from "@src/accounts/testing/local-database/UseLocalDatabase";
import {sweepDeletedAccounts} from "@src/accounts/sweep-deleted-accounts/SweepDeletedAccounts";

vi.unmock("@src/accounts/sweep-deleted-accounts/SweepDeletedAccounts");

const NOW = new Date("2026-11-19T12:00:00Z");
const emptyDatabase = useLocalDatabase();

it("deletes the records whose time has come, answering their credit ids, and keeps the others", async () => {
  const database = await emptyDatabase();
  await insertDeletedAccount(database, {
    subjectDigest: "digest-1",
    creditAccountId: "acct-1",
    keepUntilSeconds: secondsAfterNow(-60),
  });
  await insertDeletedAccount(database, {
    subjectDigest: "digest-2",
    creditAccountId: "acct-2",
    keepUntilSeconds: secondsAfterNow(0),
  });
  await insertDeletedAccount(database, {
    subjectDigest: "digest-3",
    creditAccountId: "acct-3",
    keepUntilSeconds: secondsAfterNow(1),
  });

  expect((await sweepDeletedAccounts(NOW)).sort()).toEqual(["acct-1", "acct-2"]);
  expect(await rowsOf(database, "SELECT credit_account_id FROM deleted_accounts")).toEqual([
    {credit_account_id: "acct-3"},
  ]);
});

it("answers nothing when nothing has expired", async () => {
  const database = await emptyDatabase();
  await insertDeletedAccount(database, {
    subjectDigest: "digest-1",
    creditAccountId: "acct-1",
    keepUntilSeconds: secondsAfterNow(60),
  });

  expect(await sweepDeletedAccounts(NOW)).toEqual([]);
});

function secondsAfterNow(seconds: number): number {
  return NOW.getTime() / 1000 + seconds;
}
