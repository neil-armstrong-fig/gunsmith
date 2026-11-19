import {DAILY_CREDITS} from "@src/durable-objects/credit-ledger/account/DailyCredits";
import {CREDIT_PRICES} from "@src/durable-objects/credit-ledger/account/CreditPrices";
import {fakeCreditLedger} from "@src/router/routes/shared/fake-ledgers/credit/FakeCreditLedger";

it("gives an erased account its daily credits back and forgets its reservations", async () => {
  const calls: string[] = [];
  const ledger = fakeCreditLedger(calls);
  const account = ledger.namespace.getByName("account-1");
  await account.reserve("request-1", "weapon");

  await account.erase();

  expect(await account.balance()).toBe(DAILY_CREDITS);
  await account.reserve("request-1", "weapon");
  expect(await account.balance()).toBe(DAILY_CREDITS - CREDIT_PRICES.weapon);
});

it("erases only the account it is asked about", async () => {
  const ledger = fakeCreditLedger([]);
  await ledger.namespace.getByName("account-1").reserve("request-1", "weapon");
  await ledger.namespace.getByName("account-2").reserve("request-2", "weapon");

  await ledger.namespace.getByName("account-1").erase();

  expect(await ledger.namespace.getByName("account-2").balance()).toBe(DAILY_CREDITS - CREDIT_PRICES.weapon);
});

it("erases an account that never existed without complaint", async () => {
  const ledger = fakeCreditLedger([]);

  await ledger.namespace.getByName("never-seen").erase();

  expect(await ledger.namespace.getByName("never-seen").balance()).toBe(DAILY_CREDITS);
});

it("records the erase among the calls a route made", async () => {
  const calls: string[] = [];
  const ledger = fakeCreditLedger(calls);

  await ledger.namespace.getByName("account-1").erase();

  expect(calls).toEqual(["erase"]);
});
