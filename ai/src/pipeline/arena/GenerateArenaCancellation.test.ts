import {FakeListChatModel} from "@langchain/core/utils/testing";
import {generateArena} from "@gunsmith/ai/pipeline/arena/GenerateArena";
import type {ArenaPipelineDependencies} from "@gunsmith/ai/pipeline/arena/types/ArenaPipelineDependencies";
import {watchSignals} from "@gunsmith/ai/pipeline/testing/WatchSignals";

const ROOM = {name: "Plain Room", rows: ["##########", "#........#", "#........#", "#........#", "##########"]};

it("starts no stage after the request is cancelled, and never answers as if it had finished", async () => {
  const controller = new AbortController();
  const dependencies = fakeDependencies();
  const moderatorSignals = watchSignals(dependencies.moderator, () => controller.abort());
  const generatorSignals = watchSignals(dependencies.generator);

  const request = generateArena({prompt: "a plain room", signal: controller.signal}, dependencies);

  await expect(request).rejects.toThrow();
  expect(moderatorSignals).toHaveLength(1);
  expect(generatorSignals).toHaveLength(0);
});

it.each(["moderator", "generator"] as const)(
  "tells the %s's model call to stop when the request is cancelled during it",
  async stage => {
    const controller = new AbortController();
    const dependencies = fakeDependencies();
    let abortedInFlight: boolean | undefined;
    const signals = watchSignals(dependencies[stage], () => {
      controller.abort();
      abortedInFlight = signals.at(-1)?.aborted;
    });

    await expect(generateArena({prompt: "a plain room", signal: controller.signal}, dependencies)).rejects.toThrow();

    expect(abortedInFlight).toBe(true);
  },
);

it("makes the same two calls and answers as before when no signal is given", async () => {
  const outcome = await generateArena({prompt: "a plain room"}, fakeDependencies());

  expect(outcome.status).toBe("created");
  expect(outcome.modelCalls).toBe(2);
});

function fakeDependencies(): ArenaPipelineDependencies {
  return {
    generator: new FakeListChatModel({responses: [JSON.stringify(ROOM)]}),
    moderator: new FakeListChatModel({responses: [JSON.stringify({isArenaRequest: true, reason: "a room"})]}),
    format: "rows",
    builtInArenas: [ROOM],
  };
}
