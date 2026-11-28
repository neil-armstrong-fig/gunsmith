import {eraseExpiredCredits} from "@src/shared/account-retention/EraseExpiredCredits";
import {insertDeletedAccount} from "@src/shared/accounts/testing/local-database/InsertDeletedAccount";
import {rowsOf} from "@src/shared/accounts/testing/local-database/RowsOf";
import {useLocalDatabase} from "@src/shared/accounts/testing/local-database/UseLocalDatabase";
import {DAILY_CREDITS} from "@src/durable-objects/credit-ledger/account/DailyCredits";
import {fakeLedgers} from "@src/router/routes/shared/fake-ledgers/FakeLedgers";

vi.unmock("@src/shared/accounts/sweep-deleted-accounts/SweepDeletedAccounts");

const SWEEP_TIME = new Date("2026-11-20T04:00:00Z");
const emptyDatabase = useLocalDatabase();

it("erases only expired credits and leaves a repeated sweep with nothing to erase", async () => {
  const database = await emptyDatabase();
  const ledgers = fakeLedgers();
  const cutoffSeconds = SWEEP_TIME.getTime() / 1000;
  for (const [creditAccountId, keepUntilSeconds] of [
    ["expired", cutoffSeconds - 1],
    ["due", cutoffSeconds],
    ["unexpired", cutoffSeconds + 1],
  ] as const) {
    await insertDeletedAccount(database, {
      subjectDigest: `digest-${creditAccountId}`,
      creditAccountId,
      keepUntilSeconds,
    });
    ledgers.accountOf(creditAccountId).reserve("earlier", "weapon", SWEEP_TIME.getTime());
  }

  await eraseExpiredCredits(SWEEP_TIME);
  await eraseExpiredCredits(SWEEP_TIME);

  expect(await rowsOf(database, "SELECT credit_account_id FROM deleted_accounts")).toEqual([
    {credit_account_id: "unexpired"},
  ]);
  expect(ledgers.calls).toEqual(["erase", "erase"]);
  expect(ledgers.accountOf("expired").balance(SWEEP_TIME.getTime())).toBe(DAILY_CREDITS);
  expect(ledgers.accountOf("due").balance(SWEEP_TIME.getTime())).toBe(DAILY_CREDITS);
  expect(ledgers.accountOf("unexpired").balance(SWEEP_TIME.getTime())).toBe(DAILY_CREDITS - 1);
});
