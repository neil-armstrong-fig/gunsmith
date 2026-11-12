import {parseEvalTier} from "@evals/models/ParseEvalTier";

it("reads each of the three tiers", () => {
  expect(parseEvalTier("fake")).toBe("fake");
  expect(parseEvalTier("local")).toBe("local");
  expect(parseEvalTier("paid")).toBe("paid");
});

it("defaults to the local tier when nothing is set", () => {
  expect(parseEvalTier(undefined)).toBe("local");
});

it("falls back to the local tier, not the paid one, for a value it does not know", () => {
  expect(parseEvalTier("haiku")).toBe("local");
  expect(parseEvalTier("")).toBe("local");
});
