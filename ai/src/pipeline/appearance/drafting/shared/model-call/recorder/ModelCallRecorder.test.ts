import {AIMessage, HumanMessage} from "@langchain/core/messages";
import type {BaseMessage} from "@langchain/core/messages";
import type {ChatGeneration, LLMResult} from "@langchain/core/outputs";
import {ModelCallRecorder} from "@gunsmith/ai/pipeline/appearance/drafting/shared/model-call/recorder/ModelCallRecorder";

function finished(message: BaseMessage): LLMResult {
  const generation: ChatGeneration = {text: "", message};

  return {generations: [[generation]]};
}

it("records the tokens the model reported and the arguments of its tool call", () => {
  const recorder = new ModelCallRecorder();

  recorder.handleLLMEnd(
    finished(
      new AIMessage({
        content: "",
        tool_calls: [{name: "extract", args: {body: []}, id: "1", type: "tool_call"}],
        usage_metadata: {input_tokens: 11, output_tokens: 22, total_tokens: 33},
      }),
    ),
  );

  expect(recorder.inputTokens).toBe(11);
  expect(recorder.outputTokens).toBe(22);
  expect(recorder.toolCallArguments).toEqual({body: []});
});

it("records nothing when the model reported no usage and made no tool call", () => {
  const recorder = new ModelCallRecorder();

  recorder.handleLLMEnd(finished(new AIMessage({content: "just text"})));

  expect(recorder.inputTokens).toBe(0);
  expect(recorder.outputTokens).toBe(0);
  expect(recorder.toolCallArguments).toBeUndefined();
});

it("ignores a generation that is not a model's message", () => {
  const recorder = new ModelCallRecorder();

  recorder.handleLLMEnd(finished(new HumanMessage("hello")));
  recorder.handleLLMEnd({generations: []});

  expect(recorder.outputTokens).toBe(0);
  expect(recorder.toolCallArguments).toBeUndefined();
});

it("starts with nothing recorded", () => {
  const recorder = new ModelCallRecorder();

  expect([recorder.inputTokens, recorder.outputTokens, recorder.toolCallArguments]).toEqual([0, 0, undefined]);
});
