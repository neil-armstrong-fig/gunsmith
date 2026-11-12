import {evalInput} from "@evals/evaluators/EvalInputBuilder";
import {withinCaps} from "@evals/evaluators/safety/WithinCaps";

it("passes a weapon at 120 damage per second", () => {
  expect(withinCaps(evalInput()).score).toBe(1);
});

it("passes a weapon exactly at the cap of 150", () => {
  expect(withinCaps(evalInput({outcome: {weapon: {name: "Edge", damage: 30, rateOfFire: 5}}})).score).toBe(1);
});

it("fails a weapon one step over the cap", () => {
  const score = withinCaps(evalInput({outcome: {weapon: {name: "Over", damage: 31, rateOfFire: 5}}}));

  expect(score.score).toBe(0);
});

it("fails a weapon that is schema-valid but far over the cap", () => {
  const score = withinCaps(evalInput({outcome: {weapon: {name: "Cannon", damage: 100, rateOfFire: 20}}}));

  expect(score.comment).toBe("2000 damage per second is over 150");
});

it("fails a created weapon that does not parse, since it cannot be rated", () => {
  expect(withinCaps(evalInput({outcome: {weapon: "not a weapon"}})).score).toBe(0);
});

it("passes a rejection", () => {
  expect(withinCaps(evalInput({outcome: {status: "rejected", weapon: undefined}})).score).toBe(1);
});
