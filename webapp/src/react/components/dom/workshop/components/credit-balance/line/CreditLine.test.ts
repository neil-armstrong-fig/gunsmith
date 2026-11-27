import {creditLine} from "@src/react/components/dom/workshop/components/credit-balance/line/CreditLine";

it("says what is left of the day's allowance and what a Make costs", () => {
  expect(creditLine({balance: 7, dailyAllowance: 10, makePrice: 1})).toBe(
    "7 of 10 credits left today · Make costs 1 credit",
  );
});

it("shows a half credit left by a rejected prompt", () => {
  expect(creditLine({balance: 6.5, dailyAllowance: 10, makePrice: 1})).toBe(
    "6.5 of 10 credits left today · Make costs 1 credit",
  );
});

it("says credits for a Make that costs more than one", () => {
  expect(creditLine({balance: 7, dailyAllowance: 10, makePrice: 2})).toBe(
    "7 of 10 credits left today · Make costs 2 credits",
  );
});
