import {FakeListChatModel} from "@langchain/core/utils/testing";
import {generateNode} from "@gunsmith/ai/pipeline/arena/arena-graph/drafting/GenerateNode";
import {arenaGraphStateOf} from "@gunsmith/ai/pipeline/arena/arena-graph/testing/ArenaGraphStateOf";

const ARENA = {name: "Box", rows: ["#####", "#...#", "#####"]};

it("keeps what the model wrote as the draft, unchecked, and notes the one model call", async () => {
  const generator = new FakeListChatModel({responses: [JSON.stringify(ARENA)]});

  expect(await generateNode(arenaGraphStateOf(), generator)).toEqual({
    draft: ARENA,
    nodes: ["generate"],
    modelCalls: 1,
  });
});

it("still counts the call when the model gave no answer", async () => {
  const generator = new FakeListChatModel({responses: ["{}"]});
  vi.spyOn(generator, "invoke").mockRejectedValue(new Error("down"));

  expect(await generateNode(arenaGraphStateOf(), generator)).toEqual({
    draft: undefined,
    nodes: ["generate"],
    modelCalls: 1,
  });
});
