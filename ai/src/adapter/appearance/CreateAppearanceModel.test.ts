import {createAppearanceModel} from "@gunsmith/ai/adapter/appearance/CreateAppearanceModel";

const options = {apiKey: "a-key-for-a-test-that-calls-nothing"};

it("gives the drawing room for a long weapon and a repair of it", () => {
  expect(createAppearanceModel(options).maxTokens).toBe(3000);
});

it("builds the drawing's model without retries", () => {
  expect(Reflect.get(createAppearanceModel(options).caller, "maxRetries")).toBe(0);
});
