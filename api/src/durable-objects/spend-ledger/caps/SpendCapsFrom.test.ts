import {spendCapsFrom} from "@src/durable-objects/spend-ledger/caps/SpendCapsFrom";
import {SPEND_CAPS} from "@src/durable-objects/spend-ledger/meter/SpendCaps";

it("keeps the approved ceilings when no cap is set", () => {
  expect(spendCapsFrom({})).toEqual(SPEND_CAPS);
});

it("lowers each cap to the value set for it, independently", () => {
  expect(spendCapsFrom({daily: "5000"})).toEqual({
    dailyMicrodollars: 5_000,
    monthlyMicrodollars: SPEND_CAPS.monthlyMicrodollars,
  });
  expect(spendCapsFrom({monthly: "250000"})).toEqual({
    dailyMicrodollars: SPEND_CAPS.dailyMicrodollars,
    monthlyMicrodollars: 250_000,
  });
  expect(spendCapsFrom({daily: "5000", monthly: "250000"})).toEqual({
    dailyMicrodollars: 5_000,
    monthlyMicrodollars: 250_000,
  });
});

it("accepts a cap of zero, which pauses every request", () => {
  expect(spendCapsFrom({daily: "0", monthly: "0"})).toEqual({dailyMicrodollars: 0, monthlyMicrodollars: 0});
});

it("accepts a value equal to the approved ceiling", () => {
  expect(spendCapsFrom({daily: String(SPEND_CAPS.dailyMicrodollars)}).dailyMicrodollars).toBe(
    SPEND_CAPS.dailyMicrodollars,
  );
});

it("never raises a cap above its approved ceiling", () => {
  const raised = spendCapsFrom({
    daily: String(SPEND_CAPS.dailyMicrodollars + 1),
    monthly: String(SPEND_CAPS.monthlyMicrodollars * 10),
  });

  expect(raised).toEqual(SPEND_CAPS);
});

it.each([
  "",
  " ",
  "abc",
  "-1",
  "1.5",
  "1e3",
  "0x10",
  "5000 ",
  " 5000",
  "+5000",
  "Infinity",
  "NaN",
  "99999999999999999999",
])("keeps the ceiling for the value %j, which is not a whole number of microdollars", value => {
  expect(spendCapsFrom({daily: value, monthly: value})).toEqual(SPEND_CAPS);
});
