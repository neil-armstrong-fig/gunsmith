import {passesLuhn} from "@gunsmith/ai/privacy/payment-card/PassesLuhn";

it.each(["4111111111111111", "5555555555554444", "378282246310005"])("accepts the test card number %s", digits => {
  expect(passesLuhn(digits)).toBe(true);
});

it.each(["4111111111111112", "1234567890123456", "378282246310006"])(
  "refuses %s, whose check digit is wrong",
  digits => {
    expect(passesLuhn(digits)).toBe(false);
  },
);
