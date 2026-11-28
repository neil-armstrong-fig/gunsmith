import {characterPrecheck} from "@gunsmith/ai/pipeline/shared/precheck/CharacterPrecheck";

const EMPTY_REASON = "Describe the weapon you want.";

it("accepts a short prompt", () => {
  expect(characterPrecheck("a mild rifle", 600, EMPTY_REASON)).toEqual({accepted: true});
});

it("accepts a prompt exactly at the limit", () => {
  expect(characterPrecheck("x".repeat(600), 600, EMPTY_REASON)).toEqual({accepted: true});
});

it("rejects a prompt one character over the limit, and says why in characters", () => {
  const result = characterPrecheck("x".repeat(601), 600, EMPTY_REASON);

  expect(result).toEqual({
    accepted: false,
    reason: "That is too long: it has 601 characters, and the limit is 600. Shorten it.",
  });
});

it("rejects an empty prompt with the reason it is given", () => {
  expect(characterPrecheck("   ", 600, EMPTY_REASON)).toEqual({accepted: false, reason: EMPTY_REASON});
});
