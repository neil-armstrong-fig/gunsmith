import {WeaponDsl} from "@evals/dsl/weapon/WeaponDsl";
import {EvalRun} from "@evals/eval-criteria-mapping/mapping/run/EvalRun";
import {defineTrials} from "@evals/eval-criteria-mapping/mapping/trial/DefineTrials";
import type {WeaponOutcome} from "@gunsmith/ai/pipeline/weapon/types/WeaponOutcome";

// A run whose weapon driver answers differently every time it is asked, so a trial that shared another's DSL would show it.
// The scopes are defined at the top level of this file, as a spec defines them, and what they saw is checked after they ran.
const run = new EvalRun("fake", "3");
const seen: {answers: string[]; dsls: WeaponDsl[]} = {answers: [], dsls: []};
let asked = 0;
const dsl = new WeaponDsl({
  trials: 3,
  run: () => {
    asked += 1;

    return Promise.resolve(outcome(statusOfRequest(asked)));
  },
});

run.beginGiven("a player asks", "regression");
run.beginWhen("they ask for a rifle");

describe("the scopes of three trials", () => {
  defineTrials(run, dsl, weapon => {
    seen.dsls.push(weapon);

    beforeAll(() => weapon.ask("a rifle"));

    it("holds the answer of its own trial", () => {
      seen.answers.push(weapon.getStatus());
    });
  });
});

describe("what the scopes did", () => {
  it("gave each trial its own answer", () => {
    expect(seen.answers).toEqual(["created", "rejected", "invalid"]);
  });

  it("gave each trial a DSL of its own, and not the one it was given", () => {
    expect(new Set(seen.dsls).size).toBe(3);
    expect(seen.dsls).not.toContain(dsl);
  });

  it("asked the driver once for each trial", () => {
    expect(asked).toBe(3);
  });

  it("left the run outside a trial scope, with the domain noted for the file's trial count", () => {
    expect(run.isInTrial()).toBe(false);
    expect(run.trials()).toBe(3);
  });
});

function outcome(status: WeaponOutcome["status"]): WeaponOutcome {
  return {status, nodes: [], modelCalls: 0};
}

function statusOfRequest(request: number): WeaponOutcome["status"] {
  if (request === 1) {
    return "created";
  }

  if (request === 2) {
    return "rejected";
  }

  return "invalid";
}
