import type {ArenaPipelineDriver} from "@evals/dsl/arena/types/ArenaPipelineDriver";
import {ArenaDsl} from "@evals/dsl/arena/ArenaDsl";

interface ScriptedArenaDriver extends ArenaPipelineDriver {
  prompts: string[];
}

it("names its domain and the trials its driver runs", () => {
  const dsl = new ArenaDsl(scriptedDriver(3));

  expect(dsl.domain).toBe("arena");
  expect(dsl.trials).toBe(3);
});

it("hands a trial a DSL that asks once, on the same driver, whatever the run's trial count", async () => {
  const driver = scriptedDriver(3);
  const dsl = new ArenaDsl(driver);
  const firstTrial = dsl.forTrial();
  const secondTrial = dsl.forTrial();

  await firstTrial.ask("a maze");
  await secondTrial.ask("a yard");

  expect(firstTrial.trials).toBe(1);
  expect(driver.prompts).toEqual(["a maze", "a yard"]);
});

function scriptedDriver(trials: number): ScriptedArenaDriver {
  const prompts: string[] = [];

  return {
    trials,
    prompts,
    run: prompt => {
      prompts.push(prompt);

      return Promise.resolve({status: "rejected", refunded: false, nodes: [], modelCalls: 0});
    },
  };
}
