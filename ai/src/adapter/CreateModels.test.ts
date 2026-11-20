import {createArenaModels} from "@gunsmith/ai/adapter/CreateArenaModels";
import {createWeaponModels} from "@gunsmith/ai/adapter/CreateWeaponModels";

const options = {apiKey: "a-key-for-a-test-that-calls-nothing"};

it("gives the weapon's writer and judge room for a tool call, and the drawing more", () => {
  const models = createWeaponModels(options);

  expect([models.generator.maxTokens, models.moderator.maxTokens, models.appearanceGenerator.maxTokens]).toEqual([
    2000, 2000, 3000,
  ]);
});

it("gives the arena's drawing room for the engine's largest arena and a repair, and its judge as much as the weapon's", () => {
  const models = createArenaModels(options);

  expect([models.generator.maxTokens, models.moderator.maxTokens]).toEqual([4000, 2000]);
});

it("builds every model without retries, whichever pipeline it is for", () => {
  const weapon = Object.values(createWeaponModels(options));
  const arena = Object.values(createArenaModels(options));

  expect([...weapon, ...arena].map(model => Reflect.get(model.caller, "maxRetries"))).toEqual([0, 0, 0, 0, 0]);
});
