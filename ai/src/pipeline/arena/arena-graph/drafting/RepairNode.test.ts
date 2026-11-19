import {FakeListChatModel} from "@langchain/core/utils/testing";
import {repairNode} from "@gunsmith/ai/pipeline/arena/arena-graph/drafting/RepairNode";
import {arenaGraphStateOf} from "@gunsmith/ai/pipeline/arena/arena-graph/testing/ArenaGraphStateOf";

const ARENA = {name: "Box", rows: ["#####", "#...#", "#####"]};

it("keeps the second answer as the draft, spends the one repair and notes the model call", async () => {
  const generator = new FakeListChatModel({responses: [JSON.stringify(ARENA)]});

  const update = await repairNode(arenaGraphStateOf({draft: {name: "B"}, errors: ["name: too short"]}), generator);

  expect(update).toEqual({draft: ARENA, repaired: true, nodes: ["repair"], modelCalls: 1});
});

it("hands the model the faults and the first answer", async () => {
  const generator = new FakeListChatModel({responses: [JSON.stringify(ARENA)]});
  const invoke = vi.spyOn(generator, "invoke");

  await repairNode(arenaGraphStateOf({draft: {name: "B"}, errors: ["name: too short"]}), generator);

  const text = JSON.stringify(invoke.mock.calls[0]?.[0]);
  expect(text).toContain("- name: too short");
  expect(text).toContain('{\\"name\\":\\"B\\"}');
});

it("asks the model again in shapes when the format is shapes", async () => {
  const generator = new FakeListChatModel({responses: [JSON.stringify({name: "Box", width: 10, height: 5})]});
  const invoke = vi.spyOn(generator, "invoke");

  await repairNode(arenaGraphStateOf({draft: {name: "B"}, errors: ["width: too small"]}), generator, "shapes");

  expect(JSON.stringify(invoke.mock.calls[0]?.[0])).toContain("walls: a list of wall rectangles");
});
