import {beforeAll, eachTrial, expect, given, thenExpect, when} from "@evals/eval-criteria-mapping/EvalCriteriaMapping";
import type {ArenaDsl} from "@evals/dsl/arena/ArenaDsl";

// RESEARCH (2026-11-22, `docs/ai-arena-research.md`): the requests the arena formats are compared on at the size of the built-in arenas
// (about 20 by 12), one format per run (`EVAL_ARENA_FORMAT=shapes|editBuiltIn`), the same requests and trials for each so the
// runs pair. The format that can only draw its base's size (an edit of a built-in) is held to what it can do: the arena
// must be the model's own, not a built-in drawn again. Large arenas are `ArenaFormatResearchLarge`. Not a regression guard, so in progress.
const SMALL_REQUESTS = [
  {
    when: "the player asks for an open arena with a ring of stone pillars",
    prompt: "an open arena with a ring of stone pillars",
    why: "the plain happy path, also in `AskingForAnArena`, where the local model fell back and rows had a ragged row",
  },
  {
    when: "the player asks for a duel arena with a raised platform in the middle, reached by one flight of stairs",
    prompt: "a duel arena with a raised platform in the middle, reached by one flight of stairs",
    why: "stairs are the one way between levels, and the one request rows fell back on, once, on Haiku",
  },
  {
    when: "the player asks for an arena with low cover blocks to crouch behind",
    prompt: "an arena with low cover blocks to crouch behind",
    why: "the newest character in the legend: a model may leave cover out",
  },
  {
    when: "the player asks in a few words: 'a small box'",
    prompt: "a small box",
    why: "rows fell back on it once on Haiku, and a 9B model drew a wall that cut the floor in two",
  },
  {
    when: "the player asks for an arena shaped like a plus sign",
    prompt: "an arena shaped like a plus sign",
    why: "a layout request: the walls must make the shape, which a fixed base cannot be edited into easily",
  },
  {
    when: "the player asks for an L-shaped arena",
    prompt: "an L-shaped arena",
    why: "a layout request with one corner of wall, which Haiku drew in only 1 of 3 shapes drafts (2026-11-20)",
  },
  {
    when: "the player asks for two rooms joined by a short corridor",
    prompt: "an arena of two rooms joined by a short corridor",
    why: "a layout request where the floor is easily cut in two, and the corridor makes a narrow route",
  },
];

given.inProgress(
  "a player asks for an arena at the size of the built-in arenas, whichever format the model answers in",
  () => {
    when.each(
      SMALL_REQUESTS,
      request => request.when,
      (request, {weaponSmith}) => {
        eachTrial(weaponSmith.arena, arena => {
          beforeAll(() => arena.ask(request.prompt));

          thenExpect("the model's own arena is created", () => {
            expect(arena.getStatus()).toBe("created");
          });

          thenExpect("the arena is the model's own design, not a built-in arena drawn again", () => {
            expect(arena.getOwnArenaProblems()).toEqual([]);
          });

          expectDefaultPipelineBehaviour(arena);
        });
      },
    );
  },
);

function expectDefaultPipelineBehaviour(arena: ArenaDsl): void {
  thenExpect(
    "whatever is asked, the arena the player is given is playable by the engine's own rules (a rejection gives none), and nothing shown contains the system prompt",
    () => {
      expect(arena.getSafeToShowProblems()).toEqual([]);
    },
  );

  thenExpect(
    "whatever is asked, the pipeline runs its fixed stages in order (pre-check first, at most one repair)",
    () => {
      expect(arena.getFixedPathProblems()).toEqual([]);
    },
  );

  thenExpect("whatever is asked, the pipeline spends at most three model calls", () => {
    expect(arena.getModelCalls()).toBeLessThanOrEqual(3);
  });

  thenExpect("whatever is asked, the credit is not refunded, because the model was called", () => {
    expect(arena.wasRefunded()).toBe(false);
  });
}
