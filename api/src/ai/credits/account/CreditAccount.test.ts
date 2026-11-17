import {CreditAccount} from "@src/ai/credits/account/CreditAccount";
import {DAILY_CREDITS} from "@src/ai/credits/account/DailyCredits";

const NOON = Date.UTC(2026, 10, 17, 12);
const LAST_MILLISECOND_OF_THE_DAY = Date.UTC(2026, 10, 17, 23, 59, 59, 999);
const MIDNIGHT = Date.UTC(2026, 10, 18);

it("starts a new account with the daily credits", () => {
  const account = new CreditAccount();

  expect(account.balance(NOON)).toBe(DAILY_CREDITS);
});

it("refuses a request once the credits are spent, and takes nothing for it", () => {
  const account = new CreditAccount();
  for (let spent = 0; spent < DAILY_CREDITS; spent++) {
    account.reserve(`request-${spent}`, "weapon", NOON);
  }

  expect(account.reserve("one-too-many", "weapon", NOON)).toBe("insufficient");
  expect(account.balance(NOON)).toBe(0);
});

it("lets exactly one of two requests for the last credit reserve it", () => {
  const account = accountWithOneCredit();

  const outcomes = [account.reserve("first", "weapon", NOON), account.reserve("second", "arena", NOON)];

  expect(outcomes).toEqual(["reserved", "insufficient"]);
  expect(account.balance(NOON)).toBe(0);
});

it("takes one credit for a weapon, an arena or an edit", () => {
  const account = new CreditAccount();

  account.reserve("weapon", "weapon", NOON);
  account.reserve("arena", "arena", NOON);
  account.reserve("edit", "edit", NOON);

  expect(account.balance(NOON)).toBe(DAILY_CREDITS - 3);
});

it("charges a retried request only once", () => {
  const account = new CreditAccount();

  account.reserve("same-request", "weapon", NOON);
  account.reserve("same-request", "weapon", NOON);

  expect(account.balance(NOON)).toBe(DAILY_CREDITS - 1);
});

it("refunds a request that timed out, exactly once", () => {
  const account = new CreditAccount();
  account.reserve("timed-out", "weapon", NOON);

  account.refund("timed-out", NOON);
  account.refund("timed-out", NOON);

  expect(account.balance(NOON)).toBe(DAILY_CREDITS);
});

it("ignores a refund for a request it never reserved", () => {
  const account = new CreditAccount();

  account.refund("never-seen", NOON);

  expect(account.balance(NOON)).toBe(DAILY_CREDITS);
});

it("charges half a credit for a rejected prompt, the rest returned", () => {
  const account = new CreditAccount();
  account.reserve("rejected", "weapon", NOON);

  account.settle("rejected", "rejected", NOON);

  expect(account.balance(NOON)).toBe(DAILY_CREDITS - 0.5);
});

it("charges nothing for reusing a saved item, even with no credits left", () => {
  const account = new CreditAccount();
  for (let spent = 0; spent < DAILY_CREDITS; spent++) {
    account.reserve(`request-${spent}`, "weapon", NOON);
  }

  expect(account.reserve("reuse", "reuse", NOON)).toBe("reserved");
  expect(account.balance(NOON)).toBe(0);
});

it("settles a request once: a second settle changes nothing", () => {
  const account = new CreditAccount();
  account.reserve("rejected", "weapon", NOON);

  account.settle("rejected", "rejected", NOON);
  account.settle("rejected", "reuse", NOON);

  expect(account.balance(NOON)).toBe(DAILY_CREDITS - 0.5);
});

it("does not settle a request that was already refunded", () => {
  const account = new CreditAccount();
  account.reserve("timed-out", "weapon", NOON);
  account.refund("timed-out", NOON);

  account.settle("timed-out", "weapon", NOON);

  expect(account.balance(NOON)).toBe(DAILY_CREDITS);
});

it("does not refund a request that was already settled", () => {
  const account = new CreditAccount();
  account.reserve("rejected", "weapon", NOON);
  account.settle("rejected", "rejected", NOON);

  account.refund("rejected", NOON);

  expect(account.balance(NOON)).toBe(DAILY_CREDITS - 0.5);
});

it("gives the daily credits back at 00:00 UTC, not a millisecond before", () => {
  const account = new CreditAccount();
  for (let spent = 0; spent < DAILY_CREDITS; spent++) {
    account.reserve(`request-${spent}`, "weapon", NOON);
  }

  expect(account.balance(LAST_MILLISECOND_OF_THE_DAY)).toBe(0);
  expect(account.balance(MIDNIGHT)).toBe(DAILY_CREDITS);
});

it("does not let a refund from yesterday lift today's credits above the daily amount", () => {
  const account = new CreditAccount();
  account.reserve("late", "weapon", LAST_MILLISECOND_OF_THE_DAY);

  account.refund("late", MIDNIGHT);

  expect(account.balance(MIDNIGHT)).toBe(DAILY_CREDITS);
});

it("keeps its credits and its reserved requests when rebuilt from its saved state", () => {
  const account = new CreditAccount();
  account.reserve("before-eviction", "weapon", NOON);

  const rebuilt = new CreditAccount(account.toState());
  rebuilt.reserve("before-eviction", "weapon", NOON);

  expect(rebuilt.balance(NOON)).toBe(DAILY_CREDITS - 1);
});

function accountWithOneCredit(): CreditAccount {
  const account = new CreditAccount();
  for (let spent = 1; spent < DAILY_CREDITS; spent++) {
    account.reserve(`earlier-${spent}`, "weapon", NOON);
  }

  return account;
}
