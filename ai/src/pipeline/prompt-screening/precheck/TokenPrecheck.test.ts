import {tokenPrecheck} from "@gunsmith/ai/pipeline/prompt-screening/precheck/TokenPrecheck";

const EMPTY_REASON = "Describe the weapon you want.";

it("accepts a short prompt", () => {
  expect(tokenPrecheck("a mild rifle", 150, EMPTY_REASON)).toEqual({accepted: true});
});

it("accepts a prompt exactly at the limit", () => {
  expect(tokenPrecheck("x".repeat(600), 150, EMPTY_REASON)).toEqual({accepted: true});
});

it("rejects a prompt one character over the limit, and says why", () => {
  const result = tokenPrecheck("x".repeat(601), 150, EMPTY_REASON);

  expect(result).toEqual({
    accepted: false,
    reason: "That is too long: about 151 tokens, and the limit is 150. Shorten it.",
  });
});

it("rejects an empty prompt with the reason it is given", () => {
  expect(tokenPrecheck("   ", 150, EMPTY_REASON)).toEqual({accepted: false, reason: EMPTY_REASON});
});
