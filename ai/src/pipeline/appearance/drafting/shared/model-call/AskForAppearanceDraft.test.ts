import {HumanMessage} from "@langchain/core/messages";
import {askForAppearanceDraft} from "@gunsmith/ai/pipeline/appearance/drafting/shared/model-call/AskForAppearanceDraft";
import {ToolCallingFakeModel} from "@gunsmith/ai/pipeline/appearance/testing/ToolCallingFakeModel";

const USAGE = {inputTokens: 120, outputTokens: 340};

it("returns what the model wrote and what the call cost", async () => {
  const model = new ToolCallingFakeModel({answers: [{body: [], version: 1}], usage: USAGE});

  const reply = await askForAppearanceDraft([new HumanMessage("draw")], model);

  expect(reply).toEqual({answer: {body: [], version: 1}, usage: USAGE});
});

it("sends the messages it was given, as they are", async () => {
  const model = new ToolCallingFakeModel({answers: [{body: []}]});
  const messages = [new HumanMessage("one"), new HumanMessage("two")];

  await askForAppearanceDraft(messages, model);

  expect(model.seen).toEqual([messages]);
});

it("keeps what the model wrote when it is the wrong type for the loose schema, so the strict check can say what is wrong", async () => {
  const model = new ToolCallingFakeModel({answers: [{body: 5, version: 1}], usage: USAGE});

  const reply = await askForAppearanceDraft([new HumanMessage("draw")], model);

  expect(reply).toEqual({answer: {body: 5, version: 1}, usage: USAGE});
});

it("keeps what the model wrote when it adds fields the schema does not name", async () => {
  const model = new ToolCallingFakeModel({answers: [{body: [], glow: 9}]});

  const reply = await askForAppearanceDraft([new HumanMessage("draw")], model);

  expect(reply.answer).toEqual({body: [], glow: 9});
});

it("answers nothing, but still reports the cost, when the model makes no tool call", async () => {
  const model = new ToolCallingFakeModel({answers: [undefined], usage: USAGE});

  const reply = await askForAppearanceDraft([new HumanMessage("draw")], model);

  expect(reply).toEqual({answer: undefined, usage: USAGE});
});
