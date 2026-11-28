import {createArenaModels} from "@gunsmith/ai/adapter/arena/CreateArenaModels";

const options = {apiKey: "a-key-for-a-test-that-calls-nothing"};

it("gives the arena's drawing room for the engine's largest arena and a repair, and its judge as much as the weapon's", () => {
  const models = createArenaModels(options);

  expect([models.generator.maxTokens, models.moderator.maxTokens]).toEqual([4000, 2000]);
});

it("builds every arena model without retries", () => {
  const models = Object.values(createArenaModels(options));

  expect(models.map(model => Reflect.get(model.caller, "maxRetries"))).toEqual([0, 0]);
});
