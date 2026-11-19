import type {WeaponPipelineDriver} from "@evals/dsl/weapon/types/WeaponPipelineDriver";
import {PASSING_WEAPON} from "@evals/dsl/weapon/pipeline/evaluators/testing/weapon/PassingWeapon";
import {WeaponDsl} from "@evals/dsl/weapon/WeaponDsl";
import type {WeaponOutcome} from "@gunsmith/ai/pipeline/types/WeaponOutcome";

interface ScriptedWeaponDriver extends WeaponPipelineDriver {
  prompts: string[];
}

const REJECTED: WeaponOutcome = {status: "rejected", nodes: [], modelCalls: 0};
const CREATED: WeaponOutcome = {status: "created", weapon: PASSING_WEAPON, nodes: [], modelCalls: 3};

it("names its domain and the trials its driver runs", () => {
  const dsl = new WeaponDsl(scriptedDriver(3));

  expect(dsl.domain).toBe("weapon");
  expect(dsl.trials).toBe(3);
});

it("hands a trial a DSL that asks once, on the same driver, whatever the run's trial count", async () => {
  const driver = scriptedDriver(3);
  const dsl = new WeaponDsl(driver);
  const firstTrial = dsl.forTrial();
  const secondTrial = dsl.forTrial();

  await firstTrial.ask("a rifle");
  await secondTrial.ask("a pistol");

  expect(firstTrial.trials).toBe(1);
  expect(driver.prompts).toEqual(["a rifle", "a pistol"]);
});

it("reads the status of the one answer a trial holds", async () => {
  const trial = new WeaponDsl(scriptedDriver(1, CREATED)).forTrial();

  await trial.ask("a rifle");

  expect(trial.getStatus()).toBe("created");
});

it("reads the damage per second of the weapon that was created", async () => {
  const trial = new WeaponDsl(scriptedDriver(1, CREATED)).forTrial();

  await trial.ask("a rifle");

  expect(trial.getDamagePerSecond()).toBe(120);
});

it("has no damage per second to read when no weapon was created, and says so", async () => {
  const trial = new WeaponDsl(scriptedDriver(1, REJECTED)).forTrial();

  await trial.ask("a haiku");

  expect(() => trial.getDamagePerSecond()).toThrow("Expected to read the damage per second of the weapon");
});

it("refuses a reading before anything was asked", () => {
  expect(() => new WeaponDsl(scriptedDriver(1)).forTrial().getStatus()).toThrow(
    "Expected to read the status of the request",
  );
});

function scriptedDriver(trials: number, outcome: WeaponOutcome = REJECTED): ScriptedWeaponDriver {
  const prompts: string[] = [];

  return {
    trials,
    prompts,
    run: prompt => {
      prompts.push(prompt);

      return Promise.resolve(outcome);
    },
  };
}
