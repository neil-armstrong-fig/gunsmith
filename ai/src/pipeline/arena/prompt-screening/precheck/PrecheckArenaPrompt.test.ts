import {precheckArenaPrompt} from "@gunsmith/ai/pipeline/arena/prompt-screening/precheck/PrecheckArenaPrompt";

it("accepts an ordinary arena prompt", () => {
  expect(precheckArenaPrompt("an arena with pillars")).toEqual({accepted: true});
});

it("accepts a prompt exactly at the arena limit of 250 tokens", () => {
  expect(precheckArenaPrompt("x".repeat(1000))).toEqual({accepted: true});
});

it("turns away a prompt one character over the limit, saying how long it is", () => {
  expect(precheckArenaPrompt("x".repeat(1001))).toEqual({
    accepted: false,
    reason: "That is too long: about 251 tokens, and the limit is 250. Shorten it.",
  });
});

it("turns away an empty prompt in the arena's own words", () => {
  expect(precheckArenaPrompt("  ")).toEqual({accepted: false, reason: "Describe the arena you want."});
});
