import {FakeListChatModel} from "@langchain/core/utils/testing";
import {generateNode} from "@gunsmith/ai/pipeline/arena/arena-graph/drafting/GenerateNode";
import {arenaGraphStateOf} from "@gunsmith/ai/pipeline/arena/arena-graph/testing/ArenaGraphStateOf";

const ARENA = {name: "Box", rows: ["#####", "#...#", "#####"]};

it("keeps what the model wrote as the draft, unchecked, and notes the one model call", async () => {
  const generator = new FakeListChatModel({responses: [JSON.stringify(ARENA)]});

  expect(await generateNode(arenaGraphStateOf(), generator, "rows")).toEqual({
    draft: ARENA,
    nodes: ["generate"],
    modelCalls: 1,
  });
});

it("still counts the call when the model gave no answer", async () => {
  const generator = new FakeListChatModel({responses: ["{}"]});
  vi.spyOn(generator, "invoke").mockRejectedValue(new Error("down"));

  expect(await generateNode(arenaGraphStateOf(), generator, "rows")).toEqual({
    draft: undefined,
    nodes: ["generate"],
    modelCalls: 1,
  });
});

it("asks the model for shapes when the format is shapes", async () => {
  const generator = new FakeListChatModel({responses: [JSON.stringify({name: "Box", width: 10, height: 5})]});
  const invoke = vi.spyOn(generator, "invoke");

  await generateNode(arenaGraphStateOf(), generator, "shapes");

  expect(JSON.stringify(invoke.mock.calls[0]?.[0])).toContain("walls: a list of wall rectangles");
});
