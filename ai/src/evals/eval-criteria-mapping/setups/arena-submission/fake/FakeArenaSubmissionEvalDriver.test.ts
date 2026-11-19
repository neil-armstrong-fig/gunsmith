import {FakeArenaSubmissionEvalDriver} from "@evals/eval-criteria-mapping/setups/arena-submission/fake/FakeArenaSubmissionEvalDriver";

const FIRST = {kind: "prompt" as const, playerId: "first", prompt: "a ring of pillars around a raised platform"};
const SECOND = {
  kind: "prompt" as const,
  playerId: "second",
  prompt: "a fortress with a raised keep reached by one stair",
};

it("runs the real screening on the fake models and leaves two arena prompts for the players to pick between", async () => {
  const screening = await new FakeArenaSubmissionEvalDriver(undefined).run([FIRST, SECOND]);

  expect(screening).toEqual({status: "players-pick", survivors: [FIRST, SECOND], rejected: [], modelCalls: 2});
});

it("turns away a prompt that is not an arena, and the other goes forward by default", async () => {
  const recipe = {...FIRST, prompt: "give me a recipe for lasagna"};

  const screening = await new FakeArenaSubmissionEvalDriver(undefined).run([recipe, SECOND]);

  expect(screening).toMatchObject({status: "only-submission", survivors: [SECOND], modelCalls: 2});
});

it("knows the built-in arenas of the fake tier", async () => {
  const builtIn = {kind: "built-in" as const, playerId: "second", builtInName: "Duel"};

  const screening = await new FakeArenaSubmissionEvalDriver(undefined).run([FIRST, builtIn]);

  expect(screening).toMatchObject({status: "players-pick", modelCalls: 1});
});

it("runs each screening once, and as many times as a run asks for", () => {
  expect(new FakeArenaSubmissionEvalDriver(undefined).trials).toBe(1);
  expect(new FakeArenaSubmissionEvalDriver("2").trials).toBe(2);
});
