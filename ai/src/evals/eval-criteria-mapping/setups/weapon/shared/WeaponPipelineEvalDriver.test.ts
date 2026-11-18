import type {WeaponOutcome} from "@gunsmith/ai/pipeline/types/WeaponOutcome";
import type {WeaponPipelineDependencies} from "@gunsmith/ai/pipeline/types/WeaponPipelineDependencies";
import {FakeWeaponPipelineEvalDriver} from "@evals/eval-criteria-mapping/setups/weapon/fake/FakeWeaponPipelineEvalDriver";
import type {WeaponPipelineRun} from "@evals/eval-criteria-mapping/setups/weapon/shared/types/WeaponPipelineRun";

it("builds its models on the first request and not before, so a run that never asks for a weapon needs none", async () => {
  const driver = new RecordingWeaponDriver();
  expect(driver.events).toEqual([]);

  await driver.run("a mild rifle");
  await driver.run("a mild pistol");

  expect(driver.events.filter(event => event === "models")).toEqual(["models"]);
});

it("has its models before it hands a request to its tier's way of running it, as the paid tier needs its key first", async () => {
  const driver = new RecordingWeaponDriver();

  await driver.run("a mild rifle");

  expect(driver.events).toEqual(["models", "through"]);
});

it("hands the request on unchanged unless its tier says otherwise", async () => {
  const outcome = await new FakeWeaponPipelineEvalDriver(undefined).run("   ");

  expect(outcome).toMatchObject({status: "rejected", modelCalls: 0});
});

class RecordingWeaponDriver extends FakeWeaponPipelineEvalDriver {
  readonly events: string[] = [];

  constructor() {
    super(undefined);
  }

  protected override createModels(): WeaponPipelineDependencies {
    this.events.push("models");

    return super.createModels();
  }

  protected override runThrough(prompt: string, pipeline: WeaponPipelineRun): Promise<WeaponOutcome> {
    this.events.push("through");

    return super.runThrough(prompt, pipeline);
  }
}
