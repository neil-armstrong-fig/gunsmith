import {FakeListChatModel} from "@langchain/core/utils/testing";
import {weaponGraphStateOf} from "@gunsmith/ai/pipeline/weapon-graph/testing/WeaponGraphStateOf";
import {moderationNode} from "@gunsmith/ai/pipeline/weapon-graph/screening/ModerationNode";

function moderatorSaying(isWeaponRequest: boolean, reason: string): FakeListChatModel {
  return new FakeListChatModel({responses: [JSON.stringify({isWeaponRequest, reason})]});
}

it("lets a weapon request through, noting the one model call it cost", async () => {
  const update = await moderationNode(weaponGraphStateOf(), moderatorSaying(true, "a gun"));

  expect(update).toEqual({nodes: ["moderation"], modelCalls: 1});
});

it("turns away a request that is not about a weapon, with the moderator's reason", async () => {
  const update = await moderationNode(
    weaponGraphStateOf({prompt: "give me a recipe for lasagna"}),
    moderatorSaying(false, "That is a recipe."),
  );

  expect(update).toEqual({nodes: ["moderation"], modelCalls: 1, rejectionReason: "That is a recipe."});
});
