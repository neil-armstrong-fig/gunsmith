import {createHaikuChatModel} from "@gunsmith/ai/adapter/shared/haiku/CreateHaikuChatModel";

const options = {apiKey: "a-key-for-a-test-that-calls-nothing", maxTokens: 1234};

it("never retries a failed call, because a retry no callback can see would hide an attempt from modelCalls and the usage, and could outlast the route's time limit", () => {
  // LangChain keeps the retry count protected on the caller that makes the call, so it is read by name.
  expect(Reflect.get(createHaikuChatModel(options).caller, "maxRetries")).toBe(0);
});

it("is Haiku 5.5, and sets no temperature, which that model refuses", () => {
  const model = createHaikuChatModel(options);

  expect(model.model).toBe("claude-haiku-5-5");
  expect(model.temperature).toBeUndefined();
});

it("limits the answer to the tokens it is given", () => {
  expect(createHaikuChatModel(options).maxTokens).toBe(1234);
});

it("carries the callbacks it is given, and none otherwise", () => {
  const callback = {name: "a-callback"} as never;

  expect(createHaikuChatModel({...options, callbacks: [callback]}).callbacks).toEqual([callback]);
  expect(createHaikuChatModel(options).callbacks).toBeUndefined();
});
