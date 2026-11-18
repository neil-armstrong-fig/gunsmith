import {EvalRun} from "@evals/eval-criteria-mapping/mapping/run/EvalRun";

it("says where `beforeAll` and `thenExpect` belong when no `when` is being defined", () => {
  const run = new EvalRun("fake", undefined);

  expect(() => run.requireWhen("thenExpect")).toThrow("`thenExpect` belongs inside a `when`.");
});

it("hands the `when` being defined to whoever asks, and only while it is being defined", () => {
  const run = new EvalRun("fake", undefined);
  const context = run.beginWhen("they ask for a rifle");

  expect(run.requireWhen("beforeAll")).toBe(context);

  run.endWhen(undefined);

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

it("counts the weapon's trials when a spec file took no DSL at all", () => {
  expect(new EvalRun("local", undefined).trials()).toBe(3);
});

it("counts the trials of the first DSL a spec file took, because each pipeline has its own", () => {
  const run = new EvalRun("local", undefined);
  run.beginWhen("they draw");
  run.endWhen("appearance");

  expect(run.trials()).toBe(1);
});

it("keeps the first DSL a spec file took, and ignores the ones after it", () => {
  const run = new EvalRun("local", undefined);
  run.beginWhen("they draw");
  run.endWhen("appearance");
  run.beginWhen("they ask for a rifle");
  run.endWhen("weaponSmith");

  expect(run.trials()).toBe(1);
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
