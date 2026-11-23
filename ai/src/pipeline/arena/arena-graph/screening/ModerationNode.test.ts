import {FakeListChatModel} from "@langchain/core/utils/testing";
import {moderationNode} from "@gunsmith/ai/pipeline/arena/arena-graph/screening/ModerationNode";
import {arenaGraphStateOf} from "@gunsmith/ai/pipeline/arena/arena-graph/testing/ArenaGraphStateOf";

it("lets an arena request through, noting the one model call it cost", async () => {
  const update = await moderationNode(arenaGraphStateOf(), moderatorSaying(true, "pillars"));

  expect(update).toEqual({nodes: ["moderation"], modelCalls: 1, relevance: "accepted"});
});

it("turns away a request that is not about an arena, with the moderator's reason", async () => {
  const update = await moderationNode(
    arenaGraphStateOf({prompt: "give me a recipe for lasagna"}),
    moderatorSaying(false, "That is a recipe."),
  );

  expect(update).toEqual({
    nodes: ["moderation"],
    modelCalls: 1,
    relevance: "irrelevant",
    rejectionReason: "That is a recipe.",
  });
});

it("turns away a request when the judge cannot be read, as the closed verdict says", async () => {
  const update = await moderationNode(arenaGraphStateOf(), new FakeListChatModel({responses: ["no idea"]}));

  expect(update.rejectionReason).toBe("We could not check that request just now. Try again.");
  expect(update.modelCalls).toBe(1);
});

function moderatorSaying(isArenaRequest: boolean, reason: string): FakeListChatModel {
  return new FakeListChatModel({responses: [JSON.stringify({isArenaRequest, reason})]});
}
