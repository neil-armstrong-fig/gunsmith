import {arenaOutcomeFromState} from "@gunsmith/ai/pipeline/arena/graph/outcome/ArenaOutcomeFromState";
import {arenaSmithGraph} from "@gunsmith/ai/studio/ArenaSmithGraph";

it("is the real arena pipeline's topology, with its five steps", () => {
  const stepIds = Object.keys(arenaSmithGraph.getGraph().nodes).filter(id => !id.startsWith("__"));

  expect(stepIds.sort()).toEqual(["generate", "moderation", "precheck", "repair", "validate"]);
});

it("makes an arena on canned models, with no key and no network", async () => {
  const state = await arenaSmithGraph.invoke({prompt: "a yard with a raised platform"});
  const outcome = arenaOutcomeFromState(state);

  expect(outcome.status).toBe("created");
  expect(outcome.nodes).toEqual(["precheck", "moderation", "generate", "validate"]);
  expect(outcome.modelCalls).toBe(2);
});
