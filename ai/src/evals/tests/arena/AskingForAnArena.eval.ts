import {beforeAll, eachTrial, given, thenExpect, when} from "@evals/eval-criteria-mapping/EvalCriteriaMapping";
import type {ArenaDsl} from "@evals/dsl/arena/ArenaDsl";

// A plain request becomes an arena: the happy path and its edges. Each `when` says only that an arena is created; that the player can
// play it and it leaks nothing, that the pipeline kept to its fixed path within three model calls, and that the credit goes back only
// for a built-in arena, are `expectDefaultPipelineBehaviour`, at the end of every trial.
// In progress: nothing here has run on a real model yet. The fake tier proves the harness only; the local tier decides whether
// a 9B model can write rows `arenaFrom` accepts, and the cases move to a plain `given` once they hold there.
given.inProgress("a player asks for an arena, and the model must write one the engine accepts as playable", () => {
  when("the player asks for an open arena with a ring of stone pillars", ({weaponSmith}) => {
    eachTrial(weaponSmith.arena, arena => {
      beforeAll(() => arena.ask("an open arena with a ring of stone pillars"));

      thenExpect("the model's own arena is created, not a built-in fallback", () => arena.expectCreated());

      expectDefaultPipelineBehaviour(arena);
    });
  });

  // Stairs are the one way between levels, so a request for height is where the rows are most likely to be illegal.
  when(
    "the player asks for a duel arena with a raised platform in the middle, reached by one flight of stairs",
    ({weaponSmith}) => {
      eachTrial(weaponSmith.arena, arena => {
        beforeAll(() =>
          arena.ask("a duel arena with a raised platform in the middle, reached by one flight of stairs"),
        );

        thenExpect("the model's own arena is created, not a built-in fallback", () => arena.expectCreated());

        expectDefaultPipelineBehaviour(arena);
      });
    },
  );

  // Cover is the newest character in the legend (`c`, allowed since engine's low cover blocks were integrated, 2026-11-19), so a model
  // asked for it may leave it out, or draw one where the floor is cut in two. The arena has to be the model's own, with cover in it.
  when("the player asks for an arena with low cover blocks to crouch behind", ({weaponSmith}) => {
    eachTrial(weaponSmith.arena, arena => {
      beforeAll(() => arena.ask("an arena with low cover blocks to crouch behind"));

      thenExpect(
        "the model's own arena is created, not a built-in fallback, and its drawing has a cover block (c)",
        () => arena.expectCoverKept(),
      );

      expectDefaultPipelineBehaviour(arena);
    });
  });

  // The requests a model is most likely to answer with an arena the game cannot play. The player is never handed one: the model's own,
  // repaired, or a built-in arena with the credit refunded. That the player can play what they are given, and that the credit goes
  // back only for a built-in arena, are `expectDefaultPipelineBehaviour`; this `when` adds that something is given.
  when(
    "the player asks for an arena cut in two by a wall nobody can cross, a layout the game cannot play",
    ({weaponSmith}) => {
      eachTrial(weaponSmith.arena, arena => {
        beforeAll(() => arena.ask("an arena cut in two by a wall nobody can cross"));

        thenExpect(
          "the player is given an arena (the model's own after a repair, or a built-in one), never nothing",
          () => arena.expectArenaGiven(),
        );

        expectDefaultPipelineBehaviour(arena);
      });
    },
  );

  when("the player asks in a few words: 'a small box'", ({weaponSmith}) => {
    eachTrial(weaponSmith.arena, arena => {
      beforeAll(() => arena.ask("a small box"));

      thenExpect("the model's own arena is created, not a built-in fallback", () => arena.expectCreated());

      expectDefaultPipelineBehaviour(arena);
    });
  });
});

function expectDefaultPipelineBehaviour(arena: ArenaDsl): void {
  thenExpect(
    "whatever is asked, the arena the player is given is playable by the engine's own rules (a rejection gives none), and nothing shown contains the system prompt",
    () => arena.expectSafeToShow(),
  );

  thenExpect(
    "whatever is asked, the pipeline runs its fixed stages in order (pre-check first, at most one repair) and spends at most three model calls",
    () => arena.expectFixedPathWithinModelCalls(3),
  );

  thenExpect(
    "whatever is asked, the credit is refunded exactly when a built-in arena is given instead of the one asked for",
    () => arena.expectRefundedOnlyForBuiltIn(),
  );
}
