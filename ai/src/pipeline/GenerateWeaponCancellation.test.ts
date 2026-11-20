import {FakeListChatModel} from "@langchain/core/utils/testing";
import {generateWeapon} from "@gunsmith/ai/pipeline/GenerateWeapon";
import {passingAppearance} from "@gunsmith/ai/pipeline/appearance/testing/PassingAppearance";
import {ToolCallingFakeModel} from "@gunsmith/ai/pipeline/appearance/testing/ToolCallingFakeModel";
import {watchSignals} from "@gunsmith/ai/pipeline/testing/WatchSignals";
import type {WeaponPipelineDependencies} from "@gunsmith/ai/pipeline/types/WeaponPipelineDependencies";

const RIFLE = {
  name: "Proof Rifle",
  bulletDamage: 24,
  fireIntervalSeconds: 0.2,
  bulletSpeed: 20,
  magazineSize: 12,
  reloadSeconds: 1.5,
  startingReserve: 36,
};

it("starts no stage after the request is cancelled, and never answers as if it had finished", async () => {
  const controller = new AbortController();
  const dependencies = fakeDependencies();
  const moderatorSignals = watchSignals(dependencies.moderator, () => controller.abort());
  const generatorSignals = watchSignals(dependencies.generator);
  const appearanceSignals = watchSignals(dependencies.appearanceGenerator);

  const request = generateWeapon({prompt: "a mild rifle", signal: controller.signal}, dependencies);

  await expect(request).rejects.toThrow();
  expect(moderatorSignals).toHaveLength(1);
  expect(generatorSignals).toHaveLength(0);
  expect(appearanceSignals).toHaveLength(0);
});

it.each(["moderator", "generator", "appearanceGenerator"] as const)(
  "tells the %s's model call to stop when the request is cancelled during it",
  async stage => {
    const controller = new AbortController();
    const dependencies = fakeDependencies();
    let abortedInFlight: boolean | undefined;
    const signals = watchSignals(dependencies[stage], () => {
      controller.abort();
      abortedInFlight = signals.at(-1)?.aborted;
    });

    await expect(generateWeapon({prompt: "a mild rifle", signal: controller.signal}, dependencies)).rejects.toThrow();

    expect(abortedInFlight).toBe(true);
  },
);

it("makes the same three calls and answers as before when no signal is given", async () => {
  const outcome = await generateWeapon({prompt: "a mild rifle"}, fakeDependencies());

  expect(outcome.status).toBe("created");
  expect(outcome.modelCalls).toBe(3);
});

function fakeDependencies(): WeaponPipelineDependencies {
  return {
    moderator: new FakeListChatModel({responses: [JSON.stringify({isWeaponRequest: true, reason: "a gun"})]}),
    generator: new FakeListChatModel({responses: [JSON.stringify(RIFLE)]}),
    appearanceGenerator: new ToolCallingFakeModel({answers: [passingAppearance()]}),
  };
}
