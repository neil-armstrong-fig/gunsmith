import {weaponOutcomeFromState} from "@gunsmith/ai/pipeline/weapon/graph/outcome/WeaponOutcomeFromState";
import {weaponSmithGraph} from "@gunsmith/ai/studio/WeaponSmithGraph";

it("is the real weapon pipeline's topology, with its eight steps", () => {
  const stepIds = Object.keys(weaponSmithGraph.getGraph().nodes).filter(id => !id.startsWith("__"));

  expect(stepIds.sort()).toEqual([
    "balance",
    "draw",
    "generate",
    "moderation",
    "precheck",
    "rate",
    "repair",
    "validate",
  ]);
});

it("creates and draws a weapon on canned models, with no key and no network", async () => {
  const state = await weaponSmithGraph.invoke({prompt: "a mild rifle"});
  const outcome = weaponOutcomeFromState(state);

  expect(outcome.status).toBe("created");
  expect(outcome.nodes).toEqual([
    "precheck",
    "moderation",
    "generate",
    "validate",
    "balance",
    "rate",
    "appearance.generate",
    "appearance.fix",
    "appearance.validate",
  ]);
  expect(outcome.modelCalls).toBe(3);
});
