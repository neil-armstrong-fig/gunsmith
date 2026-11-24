import {beforeAll, eachTrial, expect, given, thenExpect, when} from "@evals/eval-criteria-mapping/EvalCriteriaMapping";
import type {ArenaDsl} from "@evals/dsl/arena/ArenaDsl";

// RESEARCH (2026-11-22, `docs/ai-arena-research.md`): the requests an arena format is tried on when the player asks for a large arena,
// one format per run (`EVAL_ARENA_FORMAT=shapes`; an edit of a built-in cannot be large, and the coarse grid that tried to close the gap
// was dropped, it did worse), the same requests and trials for each so a later format pairs. 3 of 4 large requests fell back to a built-in
// arena on Haiku (2026-11-19), 1 of 15 with shapes (2026-11-23), the gap this was to close. A large arena must also BE large: without the
// size criterion a format that can only draw a small arena would pass by ignoring the request. Not a regression guard, so in progress.
const LARGE_REQUESTS = [
  {
    when: "the player asks for a huge arena with pillars scattered across it",
    prompt: "a huge arena with pillars scattered across it",
    why: "the plainest large request: many obstacles to place without a row going wrong",
  },
  {
    when: "the player asks for a vast arena with a raised platform in the middle, reached by stairs, and cover around it",
    prompt: "a vast arena with a raised platform in the middle, reached by stairs, and cover around it",
    why: "stairs on a large grid are placed by tile, and cover is the newest character",
  },
  {
    when: "the player asks for a huge open arena with a maze of low walls in one half",
    prompt: "a huge open arena with a maze of low walls in one half",
    why: "many walls, any of which can cut the floor in two",
  },
  {
    when: "the player asks for the full 40 by 30 arena, divided into several rooms by walls with doorways",
    prompt:
      "an arena the full 40 tiles wide and 30 tall, divided into several rooms by walls with doorways between them",
    why: "the 2026-11-19 probe: the maximum size asked outright, where rows fell back and shapes needed a repair and fell back once",
  },
  {
    when: "the player asks for a 40 by 30 open battlefield with scattered cover and a raised platform with stairs",
    prompt: "a 40 by 30 open battlefield with scattered cover and a raised platform with stairs",
    why: "the 2026-11-19 probe: the maximum size asked outright, where shapes was created first time and rows fell back",
  },
];

given.inProgress("a player asks for a large arena, whichever format the model answers in", () => {
  when.each(
    LARGE_REQUESTS,
    request => request.when,
    (request, {weaponSmith}) => {
      eachTrial(weaponSmith.arena, arena => {
        beforeAll(() => arena.ask(request.prompt));

        thenExpect("the model's own arena is created, not a built-in fallback", () => {
          expect(arena.getStatus()).toBe("created");
        });

        thenExpect("the arena is at least 30 tiles wide, so it is the large one that was asked for", () => {
          expect(arena.getSize()?.width).toBeGreaterThanOrEqual(30);
        });

        thenExpect("the arena is at least 20 tiles tall, so it is the large one that was asked for", () => {
          expect(arena.getSize()?.height).toBeGreaterThanOrEqual(20);
        });

        expectDefaultPipelineBehaviour(arena);
      });
    },
  );
});

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

  thenExpect(
    "whatever is asked, the credit is refunded exactly when a built-in arena is given instead of the one asked for",
    () => {
      expect(arena.wasRefunded()).toBe(arena.getStatus() === "builtIn");
    },
  );
}
