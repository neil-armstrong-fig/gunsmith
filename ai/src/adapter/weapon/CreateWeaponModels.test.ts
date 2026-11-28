import {createWeaponModels} from "@gunsmith/ai/adapter/weapon/CreateWeaponModels";

const options = {apiKey: "a-key-for-a-test-that-calls-nothing"};

it("gives the weapon's writer and judge room for a tool call, and the drawing more", () => {
  const models = createWeaponModels(options);

  expect([models.generator.maxTokens, models.moderator.maxTokens, models.appearanceGenerator.maxTokens]).toEqual([
    2000, 2000, 3000,
  ]);
});

it("builds every weapon model without retries", () => {
  const models = Object.values(createWeaponModels(options));

  expect(models.map(model => Reflect.get(model.caller, "maxRetries"))).toEqual([0, 0, 0]);
});
