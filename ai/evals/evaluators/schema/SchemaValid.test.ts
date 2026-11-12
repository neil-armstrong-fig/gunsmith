import {schemaValid} from "@evals/evaluators/schema/SchemaValid";
import {evalInput} from "@evals/evaluators/EvalInputBuilder";

it("passes a weapon that parses", () => {
  expect(schemaValid(evalInput()).score).toBe(1);
});

it("fails a weapon with a missing field", () => {
  const score = schemaValid(evalInput({outcome: {weapon: {name: "Proof Rifle", damage: 20}}}));

  expect(score.score).toBe(0);
});

it("fails a weapon whose stat is out of the schema's range", () => {
  const score = schemaValid(evalInput({outcome: {weapon: {name: "Proof Rifle", damage: 1000, rateOfFire: 6}}}));

  expect(score.score).toBe(0);
});

it("passes a rejection, which has no weapon to parse", () => {
  expect(schemaValid(evalInput({outcome: {status: "rejected", weapon: undefined}})).score).toBe(1);
});
