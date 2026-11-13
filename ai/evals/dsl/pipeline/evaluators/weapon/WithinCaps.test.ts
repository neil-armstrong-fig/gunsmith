import {passingEvalInput} from "@evals/dsl/pipeline/evaluators/testing/input/PassingEvalInput";
import {PASSING_WEAPON} from "@evals/dsl/pipeline/evaluators/testing/weapon/PassingWeapon";
import {withinCaps} from "@evals/dsl/pipeline/evaluators/weapon/WithinCaps";

function dealing(bulletDamage: number, fireIntervalSeconds: number): ReturnType<typeof passingEvalInput> {
  return passingEvalInput({outcome: {weapon: {...PASSING_WEAPON, bulletDamage, fireIntervalSeconds}}});
}

it("passes a weapon at 120 damage per second", () => {
  expect(withinCaps(passingEvalInput()).score).toBe(1);
});

it("passes a weapon exactly at the cap of 150", () => {
  expect(withinCaps(dealing(30, 0.2)).score).toBe(1);
});

it("fails a weapon one step over the cap", () => {
  expect(withinCaps(dealing(31, 0.2)).score).toBe(0);
});

it("fails a weapon that is schema-valid but far over the cap", () => {
  expect(withinCaps(dealing(100, 0.05)).comment).toBe("2000 damage per second is over 150");
});

it("fails a created weapon that does not parse, since it cannot be rated", () => {
  expect(withinCaps(passingEvalInput({outcome: {weapon: "not a weapon"}})).score).toBe(0);
});

it("passes a rejection", () => {
  expect(withinCaps(passingEvalInput({outcome: {status: "rejected", weapon: undefined}})).score).toBe(1);
});

it("passes an invalid outcome, which has no weapon to rate", () => {
  expect(withinCaps(passingEvalInput({outcome: {status: "invalid", weapon: undefined}})).score).toBe(1);
});
