import {FakeListChatModel} from "@langchain/core/utils/testing";
import {screenArenaSubmissions} from "@gunsmith/ai/pipeline/arena-submission/ScreenArenaSubmissions";
import type {ArenaSubmissionDependencies} from "@gunsmith/ai/pipeline/arena-submission/types/ArenaSubmissionDependencies";

const FIRST = {kind: "prompt" as const, playerId: "first", prompt: "an open arena with a ring of stone pillars"};
const SECOND = {
  kind: "prompt" as const,
  playerId: "second",
  prompt: "a fortress with a raised keep reached by one stair",
};
const BUILT_IN = {kind: "built-in" as const, playerId: "second", builtInName: "Open Room"};

function dependencies(...isArenaRequests: boolean[]): ArenaSubmissionDependencies {
  const responses = isArenaRequests.map(isArenaRequest =>
    JSON.stringify({isArenaRequest, reason: isArenaRequest ? "An arena." : "Not an arena."}),
  );

  return {
    moderator: new FakeListChatModel({responses}),
    builtInArenas: [{name: "Open Room", rows: ["#####", "#...#", "#####"]}],
  };
}

it("sends both prompts forward for the players to pick between when both are arenas", async () => {
  const screening = await screenArenaSubmissions({submissions: [FIRST, SECOND]}, dependencies(true, true));

  expect(screening).toEqual({status: "players-pick", survivors: [FIRST, SECOND], rejected: [], modelCalls: 2});
});

it("sends a prompt and a built-in arena forward for the players to pick between", async () => {
  const screening = await screenArenaSubmissions({submissions: [FIRST, BUILT_IN]}, dependencies(true));

  expect(screening).toMatchObject({status: "players-pick", survivors: [FIRST, BUILT_IN], modelCalls: 1});
});

it("sends two built-in arenas forward at no cost", async () => {
  const other = {...BUILT_IN, playerId: "first"};

  const screening = await screenArenaSubmissions({submissions: [other, BUILT_IN]}, dependencies());

  expect(screening).toMatchObject({status: "players-pick", modelCalls: 0});
});

it("lets the one prompt that is an arena go forward by default when the other is not", async () => {
  const screening = await screenArenaSubmissions({submissions: [FIRST, SECOND]}, dependencies(false, true));

  expect(screening).toEqual({
    status: "only-submission",
    survivors: [SECOND],
    rejected: [{playerId: "first", reason: "Not an arena."}],
    modelCalls: 2,
  });
});

it("lets a lone submission go forward by default", async () => {
  const screening = await screenArenaSubmissions({submissions: [SECOND]}, dependencies(true));

  expect(screening).toMatchObject({status: "only-submission", survivors: [SECOND], modelCalls: 1});
});

it("leaves nothing for the players when no submission was made, at no cost", async () => {
  expect(await screenArenaSubmissions({submissions: []}, dependencies())).toEqual({
    status: "none",
    survivors: [],
    rejected: [],
    modelCalls: 0,
  });
});

it("leaves nothing when every submission was turned away", async () => {
  const screening = await screenArenaSubmissions({submissions: [FIRST, SECOND]}, dependencies(false, false));

  expect(screening).toMatchObject({status: "none", survivors: [], modelCalls: 2});
  expect(screening.rejected).toHaveLength(2);
});

it("keeps the order the submissions arrived in", async () => {
  const screening = await screenArenaSubmissions({submissions: [SECOND, FIRST]}, dependencies(true, true));

  expect(screening.survivors).toEqual([SECOND, FIRST]);
});

it("refuses more than two submissions, which a match never has", async () => {
  const third = {...FIRST, playerId: "third"};

  await expect(screenArenaSubmissions({submissions: [FIRST, SECOND, third]}, dependencies())).rejects.toThrow(
    "at most two submissions",
  );
});

it("refuses two submissions from one player, which would make whose arena is picked ambiguous", async () => {
  const again = {...FIRST, prompt: "a maze"};

  await expect(screenArenaSubmissions({submissions: [FIRST, again]}, dependencies())).rejects.toThrow(
    "one submission for each player",
  );
});
