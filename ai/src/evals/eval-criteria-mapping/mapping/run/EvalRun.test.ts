import {EvalRun} from "@evals/eval-criteria-mapping/mapping/run/EvalRun";

it("says where `beforeAll` and `thenExpect` belong when no `when` is being defined", () => {
  const run = new EvalRun("fake", undefined);

  expect(() => run.requireWhen("thenExpect")).toThrow("`thenExpect` belongs inside a `when`.");
});

it("hands the `when` being defined to whoever asks, and only while it is being defined", () => {
  const run = new EvalRun("fake", undefined);
  const context = run.beginWhen("they ask for a rifle");

  expect(run.requireWhen("beforeAll")).toBe(context);

  run.noteTrialDomain("weapon");
  run.endWhen();

  expect(() => run.requireWhen("beforeAll")).toThrow("belongs inside a `when`");
});

it("gives a `when` the given it is defined in, and that given's suite", () => {
  const run = new EvalRun("fake", undefined);
  run.beginGiven("a player asks for a weapon", "inProgress");

  expect(run.beginWhen("they ask for a rifle")).toEqual({
    given: "a player asks for a weapon",
    description: "they ask for a rifle",
    suite: "inProgress",
  });
});

it("gives a `when` the suite of the latest given, not of an earlier one", () => {
  const run = new EvalRun("fake", undefined);
  run.beginGiven("a feature still climbing", "inProgress");
  run.beginGiven("a feature that holds", "regression");

  expect(run.beginWhen("they ask").suite).toBe("regression");
});

it("says a `when` must run its trials in scopes of their own, when it ends without having done so", () => {
  const run = new EvalRun("fake", undefined);
  run.beginWhen("they ask for a rifle");

  expect(() => run.endWhen()).toThrow("Run each trial of this `when` in a scope of its own");
});

it("counts the weapon's trials when a spec file ran no trials at all", () => {
  expect(new EvalRun("local", undefined).trials()).toBe(3);
});

it("runs every case as many times as the run asks for", () => {
  expect(new EvalRun("fake", "4").trials()).toBe(4);
});

it("sums up what was recorded for one spec file, named after the file", () => {
  const run = new EvalRun("fake", undefined);
  run.record({given: "a given", when: "a when", then: "a then", suite: "regression", passed: true});

  const summary = run.resultsRun("/work/src/evals/tests/weapon/AskingForAWeapon.eval.ts");

  expect(summary).toMatchObject({
    spec: "AskingForAWeapon",
    tier: "fake",
    trials: 1,
    results: [{given: "a given", when: "a when", then: "a then", suite: "regression", passed: true}],
  });
  expect(summary.ranAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
});

it("counts the trials of the first domain a spec file ran trials for, and ignores the ones after it", () => {
  const run = new EvalRun("local", undefined);
  run.noteTrialDomain("appearance");
  run.noteTrialDomain("weapon");

  expect(run.trials()).toBe(1);
});

it("knows when a `when` is being defined inside a trial's scope, and leaves it afterwards", () => {
  const run = new EvalRun("fake", undefined);
  const when = run.beginWhen("they ask for a rifle");
  const inside: boolean[] = [];

  run.runInScope(when, () => inside.push(run.isInTrial()));

  expect(inside).toEqual([true]);
  expect(run.isInTrial()).toBe(false);
});

it("brings back the `when` a scope is defined for, because a scope is defined after the `when` that holds it was", () => {
  const run = new EvalRun("fake", undefined);
  const when = run.beginWhen("they ask for a rifle");
  run.noteTrialDomain("weapon");
  run.endWhen();
  let inside: unknown;

  run.runInScope(when, () => {
    inside = run.requireWhen("thenExpect");
  });

  expect(inside).toBe(when);
  expect(() => run.requireWhen("thenExpect")).toThrow("belongs inside a `when`");
});

it("names a nested `when` under the `when` it sits in", () => {
  const run = new EvalRun("fake", undefined);
  run.beginGiven("a player asks", "inProgress");
  const outer = run.beginWhen("they ask for a rifle");

  expect(run.nestedWhen(outer, "the weapon is rated")).toEqual({
    given: "a player asks",
    description: "they ask for a rifle › the weapon is rated",
    suite: "inProgress",
  });
});

it("folds the rows each trial wrote into one row per criterion when it sums up the file", () => {
  const run = new EvalRun("fake", undefined);
  const row = {given: "a given", when: "a when", then: "a then", suite: "regression" as const};
  run.record({...row, passed: true});
  run.record({...row, passed: false, comment: "expected created, got rejected"});

  expect(run.resultsRun(undefined).results).toEqual([
    {...row, passed: false, comment: "failed in 1 of 2 trials: expected created, got rejected"},
  ]);
});
