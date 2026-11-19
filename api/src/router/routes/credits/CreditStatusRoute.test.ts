import {CREDIT_PRICES} from "@src/durable-objects/credit-ledger/account/CreditPrices";
import {DAILY_CREDITS} from "@src/durable-objects/credit-ledger/account/DailyCredits";
import {creditStatusRoute} from "@src/router/routes/credits/CreditStatusRoute";
import {fakeLedgers} from "@src/router/routes/shared/fake-ledgers/FakeLedgers";

it("answers the balance, the daily allowance and the prices of a new account", async () => {
  const ledgers = fakeLedgers();
  const response = await creditStatusRoute(get(), ledgers.environment);

  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({
    balance: DAILY_CREDITS,
    dailyAllowance: DAILY_CREDITS,
    prices: {weapon: CREDIT_PRICES.weapon, rejected: CREDIT_PRICES.rejected},
    aiOn: true,
  });
});

it("answers the balance after credits have been taken", async () => {
  const ledgers = fakeLedgers();
  ledgers.accountOf("acct-1").reserve("earlier-1", "weapon", Date.now());
  ledgers.accountOf("acct-1").reserve("earlier-2", "rejected", Date.now());

  const response = await creditStatusRoute(get(), ledgers.environment);

  expect(await response.json()).toMatchObject({balance: DAILY_CREDITS - 1.5});
});

it("answers the balance of the account named, not another's", async () => {
  const ledgers = fakeLedgers();
  ledgers.accountOf("acct-2").reserve("earlier", "weapon", Date.now());

  const untouched = await creditStatusRoute(get("acct-1"), ledgers.environment);
  const spent = await creditStatusRoute(get("acct-2"), ledgers.environment);

  expect(await untouched.json()).toMatchObject({balance: DAILY_CREDITS});
  expect(await spent.json()).toMatchObject({balance: DAILY_CREDITS - 1});
});

it("says when AI is off and when it returns", async () => {
  const returnsAt = Date.UTC(2026, 11, 1);
  const ledgers = fakeLedgers({aiOn: false, returnsAt});

  const response = await creditStatusRoute(get(), ledgers.environment);

  expect(response.status).toBe(200);
  expect(await response.json()).toMatchObject({aiOn: false, returnsAt});
});

it("only reads: it reserves, settles and refunds nothing", async () => {
  const ledgers = fakeLedgers();

  await creditStatusRoute(get(), ledgers.environment);

  expect(ledgers.calls).toEqual(["status", "balance"]);
});

it("answers 401 without an account and reads nothing", async () => {
  const ledgers = fakeLedgers();
  const response = await creditStatusRoute(getWithoutAccount(), ledgers.environment);

  expect(response.status).toBe(401);
  expect(await response.json()).toEqual({error: "account-required"});
  expect(ledgers.calls).toEqual([]);
});

it("answers 405 for anything but GET, naming GET as allowed", async () => {
  const ledgers = fakeLedgers();
  const response = await creditStatusRoute(
    new Request("https://gunsmith.test/api/credits", {method: "POST", headers: {"X-Account-Id": "acct-1"}}),
    ledgers.environment,
  );

  expect(response.status).toBe(405);
  expect(response.headers.get("Allow")).toBe("GET");
  expect(ledgers.calls).toEqual([]);
});

function get(accountId = "acct-1"): Request {
  return new Request("https://gunsmith.test/api/credits", {headers: {"X-Account-Id": accountId}});
}

function getWithoutAccount(): Request {
  return new Request("https://gunsmith.test/api/credits");
}
