import {tokenPrecheck} from "@gunsmith/ai/pipeline/prompt-screening/precheck/TokenPrecheck";

it("accepts a short prompt", () => {
  expect(tokenPrecheck("a mild rifle", 150)).toEqual({accepted: true});
});

it("accepts a prompt exactly at the limit", () => {
  expect(tokenPrecheck("x".repeat(600), 150)).toEqual({accepted: true});
});

it("rejects a prompt one character over the limit, and says why", () => {
  const result = tokenPrecheck("x".repeat(601), 150);

  expect(result).toEqual({
    accepted: false,
    reason: "That is too long: about 151 tokens, and the limit is 150. Shorten it.",
  });
});

it("rejects an empty prompt", () => {
  expect(tokenPrecheck("   ", 150)).toEqual({accepted: false, reason: "Describe the weapon you want."});
});
