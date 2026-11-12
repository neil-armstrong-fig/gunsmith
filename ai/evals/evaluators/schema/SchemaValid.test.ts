import {schemaValid} from "@evals/evaluators/schema/SchemaValid";
import {evalInput} from "@evals/evaluators/EvalInputBuilder";
import {PASSING_WEAPON} from "@evals/evaluators/fixtures/PassingWeapon";

it("passes a weapon that parses", () => {
  expect(schemaValid(evalInput()).score).toBe(1);
});

it("fails a weapon with a missing field", () => {
  const {reloadSeconds: _reloadSeconds, ...withoutReload} = PASSING_WEAPON;

  expect(schemaValid(evalInput({outcome: {weapon: withoutReload}})).score).toBe(0);
});

it("fails a weapon whose stat is out of the schema's range", () => {
  const score = schemaValid(evalInput({outcome: {weapon: {...PASSING_WEAPON, bulletDamage: 1000}}}));

  expect(score.score).toBe(0);
});

it("fails a weapon with a field the schema does not have", () => {
  const score = schemaValid(evalInput({outcome: {weapon: {...PASSING_WEAPON, rateOfFire: 500}}}));

  expect(score.score).toBe(0);
});

it("passes a rejection, which has no weapon to parse", () => {
  expect(schemaValid(evalInput({outcome: {status: "rejected", weapon: undefined}})).score).toBe(1);
});

it("passes an invalid outcome, which has no weapon to parse", () => {
  expect(schemaValid(evalInput({outcome: {status: "invalid", weapon: undefined}})).score).toBe(1);
});
