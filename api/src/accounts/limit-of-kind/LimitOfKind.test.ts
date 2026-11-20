import {limitOfKind} from "@src/accounts/limit-of-kind/LimitOfKind";

const LIMITS = {weapons: 8, arenas: 3};

it("gives the weapon limit for a weapon", () => {
  expect(limitOfKind(LIMITS, "weapon")).toBe(8);
});

it("gives the arena limit for an arena", () => {
  expect(limitOfKind(LIMITS, "arena")).toBe(3);
});
