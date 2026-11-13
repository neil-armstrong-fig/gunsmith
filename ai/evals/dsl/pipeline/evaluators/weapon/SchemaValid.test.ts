import {schemaValid} from "@evals/dsl/pipeline/evaluators/weapon/SchemaValid";
import {passingEvalInput} from "@evals/dsl/pipeline/evaluators/testing/input/PassingEvalInput";
import {PASSING_WEAPON} from "@evals/dsl/pipeline/evaluators/testing/weapon/PassingWeapon";

it("passes a weapon that parses", () => {
  expect(schemaValid(passingEvalInput()).score).toBe(1);
});

it("fails a weapon with a missing field", () => {
  const {reloadSeconds: _reloadSeconds, ...withoutReload} = PASSING_WEAPON;

  expect(schemaValid(passingEvalInput({outcome: {weapon: withoutReload}})).score).toBe(0);
});

it("fails a weapon whose stat is out of the schema's range", () => {
  const score = schemaValid(passingEvalInput({outcome: {weapon: {...PASSING_WEAPON, bulletDamage: 1000}}}));

  expect(score.score).toBe(0);
});

it("fails a weapon with a field the schema does not have", () => {
  const score = schemaValid(passingEvalInput({outcome: {weapon: {...PASSING_WEAPON, rateOfFire: 500}}}));

  expect(score.score).toBe(0);
});

it("passes a rejection, which has no weapon to parse", () => {
  expect(schemaValid(passingEvalInput({outcome: {status: "rejected", weapon: undefined}})).score).toBe(1);
});

it("passes an invalid outcome, which has no weapon to parse", () => {
  expect(schemaValid(passingEvalInput({outcome: {status: "invalid", weapon: undefined}})).score).toBe(1);
});

it("says which field is wrong and why, as one sentence rather than a dump of the parser's report", () => {
  const score = schemaValid(passingEvalInput({outcome: {weapon: {...PASSING_WEAPON, bulletDamage: 1000}}}));

  expect(score.comment).toBe("bulletDamage: Too big: expected number to be <=100");
});

it("names every field that is wrong", () => {
  const score = schemaValid(
    passingEvalInput({outcome: {weapon: {...PASSING_WEAPON, bulletDamage: 1000, reloadSeconds: 99}}}),
  );

  expect(score.comment).toBe(
    "bulletDamage: Too big: expected number to be <=100; reloadSeconds: Too big: expected number to be <=5",
  );
});
