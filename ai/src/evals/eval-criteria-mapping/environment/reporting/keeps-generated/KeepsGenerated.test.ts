import {keepsGenerated} from "@evals/eval-criteria-mapping/environment/reporting/keeps-generated/KeepsGenerated";

it("keeps what its tier's driver keeps by default (the local tier: a real model's work is worth looking at)", () => {
  expect(keepsGenerated(undefined, true)).toBe(true);
});

it("keeps nothing by default where the driver does not (the fake tier's canned answers, the paid tier that costs money)", () => {
  expect(keepsGenerated(undefined, false)).toBe(false);
});

it("keeps when asked to, whatever the default", () => {
  expect(keepsGenerated("1", false)).toBe(true);
});

it("keeps nothing when asked not to, even where it is kept by default", () => {
  expect(keepsGenerated("0", true)).toBe(false);
});

it("ignores a setting that is neither 1 nor 0", () => {
  expect(keepsGenerated("yes", true)).toBe(true);
  expect(keepsGenerated("yes", false)).toBe(false);
});
