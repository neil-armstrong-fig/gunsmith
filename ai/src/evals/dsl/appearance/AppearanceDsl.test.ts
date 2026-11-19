import type {AppearanceDriver} from "@evals/dsl/appearance/types/AppearanceDriver";
import {AppearanceDsl} from "@evals/dsl/appearance/AppearanceDsl";
import {passingAppearanceOutcome} from "@evals/dsl/appearance/pipeline/evaluators/testing/PassingAppearanceOutcome";

interface ScriptedAppearanceDriver extends AppearanceDriver {
  prompts: string[];
}

it("names its domain and the trials its driver runs", () => {
  const dsl = new AppearanceDsl(scriptedDriver(3));

  expect(dsl.domain).toBe("appearance");
  expect(dsl.trials).toBe(3);
});

it("hands a trial a DSL that asks once, on the same driver, whatever the run's trial count", async () => {
  const driver = scriptedDriver(3);
  const dsl = new AppearanceDsl(driver);
  const firstTrial = dsl.forTrial();
  const secondTrial = dsl.forTrial();

  await firstTrial.ask("a rifle");
  await secondTrial.ask("a pistol");

  expect(firstTrial.trials).toBe(1);
  expect(driver.prompts).toEqual(["a rifle", "a pistol"]);
});

function scriptedDriver(trials: number): ScriptedAppearanceDriver {
  const prompts: string[] = [];

  return {
    trials,
    prompts,
    run: prompt => {
      prompts.push(prompt);

      return Promise.resolve(passingAppearanceOutcome());
    },
  };
}
