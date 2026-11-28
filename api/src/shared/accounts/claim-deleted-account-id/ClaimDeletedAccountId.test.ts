import {claimDeletedAccountId} from "@src/shared/accounts/claim-deleted-account-id/ClaimDeletedAccountId";
import {insertDeletedAccount} from "@src/shared/accounts/testing/local-database/InsertDeletedAccount";
import {rowsOf} from "@src/shared/accounts/testing/local-database/RowsOf";
import {useLocalDatabase} from "@src/shared/accounts/testing/local-database/UseLocalDatabase";

vi.unmock("@src/shared/accounts/claim-deleted-account-id/ClaimDeletedAccountId");

const NOW = new Date("2026-11-19T12:00:00Z");
const emptyDatabase = useLocalDatabase();

it("answers the credit id of a record still kept and deletes the record", async () => {
  const database = await emptyDatabase();
  await insertDeletedAccount(database, {
    subjectDigest: "digest-1",
    creditAccountId: "acct-1",
    keepUntilSeconds: secondsAfterNow(60),
  });

  expect(await claimDeletedAccountId("digest-1", NOW)).toBe("acct-1");
  expect(await rowsOf(database, "SELECT * FROM deleted_accounts")).toEqual([]);
});

it("answers nothing, and leaves the record for the sweep, once its time has come", async () => {
  const database = await emptyDatabase();
  await insertDeletedAccount(database, {
    subjectDigest: "digest-1",
    creditAccountId: "acct-1",
    keepUntilSeconds: secondsAfterNow(0),
  });

  expect(await claimDeletedAccountId("digest-1", NOW)).toBeUndefined();
  expect(await rowsOf(database, "SELECT credit_account_id FROM deleted_accounts")).toEqual([
    {credit_account_id: "acct-1"},
  ]);
});

it("answers nothing for a digest it does not hold, and leaves another person's record", async () => {
  const database = await emptyDatabase();
  await insertDeletedAccount(database, {
    subjectDigest: "digest-1",
    creditAccountId: "acct-1",
    keepUntilSeconds: secondsAfterNow(60),
  });

  expect(await claimDeletedAccountId("digest-2", NOW)).toBeUndefined();
  expect(await rowsOf(database, "SELECT credit_account_id FROM deleted_accounts")).toEqual([
    {credit_account_id: "acct-1"},
  ]);
});

function secondsAfterNow(seconds: number): number {
  return NOW.getTime() / 1000 + seconds;
}
