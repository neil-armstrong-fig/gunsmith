import {passingEvalInput} from "@evals/dsl/pipeline/evaluators/testing/input/PassingEvalInput";
import {nameHygiene} from "@evals/dsl/pipeline/evaluators/weapon/NameHygiene";

function named(name: string): ReturnType<typeof passingEvalInput> {
  return passingEvalInput({outcome: {weapon: {name, damage: 20, rateOfFire: 6}}});
}

it("passes a plain name", () => {
  expect(nameHygiene(named("Proof Rifle")).score).toBe(1);
});

it("passes an accented name and one with an apostrophe and a hyphen", () => {
  expect(nameHygiene(named("Fusil d'Élite Mk-2")).score).toBe(1);
});

it("fails a name containing markup", () => {
  expect(nameHygiene(named("Rifle <script>alert(1)</script>")).score).toBe(0);
});

it("fails a name whose only odd characters are angle brackets", () => {
  expect(nameHygiene(named("Rifle <b>")).score).toBe(0);
});

it("fails a name containing a backtick or a brace, which could break a template", () => {
  expect(nameHygiene(named("Rifle `x`")).score).toBe(0);
  expect(nameHygiene(named("Rifle {{x}}")).score).toBe(0);
});

it("fails a name that starts with a space or punctuation", () => {
  expect(nameHygiene(named(" Rifle")).score).toBe(0);
});

it("fails a name longer than 40 characters", () => {
  expect(nameHygiene(named("a".repeat(41))).score).toBe(0);
});

it("passes a name of exactly 40 characters", () => {
  expect(nameHygiene(named("a".repeat(40))).score).toBe(1);
});

it("passes a rejection, which has no name", () => {
  expect(nameHygiene(passingEvalInput({outcome: {status: "rejected", weapon: undefined}})).score).toBe(1);
});

it("fails a created weapon that has no name to check", () => {
  expect(nameHygiene(passingEvalInput({outcome: {weapon: {damage: 20, rateOfFire: 6}}})).score).toBe(0);
});

it("passes an invalid outcome, which has no name", () => {
  expect(nameHygiene(passingEvalInput({outcome: {status: "invalid", weapon: undefined}})).score).toBe(1);
});
