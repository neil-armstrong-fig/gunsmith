import {takeDamage} from "@gunsmith/engine/health/TakeDamage";

it("takes the damage off the health", () => {
  expect(takeDamage(100, 25)).toBe(75);
});

it("leaves the health alone when there is no damage", () => {
  expect(takeDamage(60, 0)).toBe(60);
});

it("stops at zero rather than going below it", () => {
  expect(takeDamage(20, 25)).toBe(0);
});

it("reaches exactly zero when the damage matches the health", () => {
  expect(takeDamage(25, 25)).toBe(0);
});
