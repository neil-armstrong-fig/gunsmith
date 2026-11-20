import {beforeAll, eachTrial, expect, given, thenExpect, when} from "@evals/eval-criteria-mapping/EvalCriteriaMapping";
import type {ArenaDsl} from "@evals/dsl/arena/ArenaDsl";

const LARGE_REQUESTS = [
  {
    when: "the player asks for the largest arena, with walled rooms, pillar rings, cover and a platform reached by stairs",
    prompt:
      "the largest arena allowed, 40 columns wide and 30 rows tall, with several walled rooms joined by doorways, rings of pillars, low cover blocks, and a raised platform reached by stairs",
    why: "a full 40 by 30 drawing with every kind of shape at once is where a model's counting and its design are most likely to fail",
  },
  {
    when: "the player asks for a huge open battlefield scattered with cover",
    prompt: "a huge open battlefield, as wide and as tall as you may make it, scattered with cover",
    why: "a plain request for the biggest size, with nothing to place but cover",
  },
];

// A plain request becomes an arena: the happy path and its edges. Each `when` says only that an arena is created; that the player can
// play it and it leaks nothing, that the pipeline kept to its fixed path within three model calls, and that the credit goes back only
// for a built-in arena, are `expectDefaultPipelineBehaviour`, at the end of every trial.
// In progress: nothing here has run on a real model yet. The fake tier proves the harness only; the local tier decides whether
// a 9B model can write rows `arenaFrom` accepts, and the cases move to a plain `given` once they hold there.
given.inProgress("a player asks for an arena, and the model must write one the engine accepts as playable", () => {
  when("the player asks for an open arena with a ring of stone pillars", ({weaponSmith}) => {
    eachTrial(weaponSmith.arena, arena => {
      beforeAll(() => arena.ask("an open arena with a ring of stone pillars"));

      thenExpect("the model's own arena is created, not a built-in fallback", () => {
        expect(arena.getStatus()).toBe("created");
      });

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

        thenExpect("the model's own arena is created, not a built-in fallback", () => {
          expect(arena.getStatus()).toBe("created");
        });

        expectDefaultPipelineBehaviour(arena);
      });
    },
  );

  // Cover is the newest character in the legend (`c`, allowed since engine's low cover blocks were integrated, 2026-11-19), so a model
  // asked for it may leave it out, or draw one where the floor is cut in two. The arena has to be the model's own, with cover in it.
  when("the player asks for an arena with low cover blocks to crouch behind", ({weaponSmith}) => {
    eachTrial(weaponSmith.arena, arena => {
      beforeAll(() => arena.ask("an arena with low cover blocks to crouch behind"));

      thenExpect("the model's own arena is created, not a built-in fallback", () => {
        expect(arena.getStatus()).toBe("created");
      });

      thenExpect("its drawing has a cover block (c)", () => {
        expect(arena.getCoverProblems()).toEqual([]);
      });

      expectDefaultPipelineBehaviour(arena);
    });
  });

  // The requests a model is most likely to answer with an arena the game cannot play. The player is never handed one: the model's own,
  // repaired by code or by the model, or a built-in arena (with no refund: the model was used). That the player can play what they are given, and that
  // the credit is not refunded, are `expectDefaultPipelineBehaviour`; this `when` adds that something is given.
  when(
    "the player asks for an arena cut in two by a wall nobody can cross, a layout the game cannot play",
    ({weaponSmith}) => {
      eachTrial(weaponSmith.arena, arena => {
        beforeAll(() => arena.ask("an arena cut in two by a wall nobody can cross"));

        thenExpect(
          "the player is given an arena (the model's own after a repair, or a built-in one), never nothing",
          () => {
            expect(arena.getArenaGivenProblems()).toEqual([]);
          },
        );

        // Probed 2026-11-20 on Haiku 5.5: the model's own repair fixed none of 7 sealed rooms, and code's repair (`repairArena`, which
        // opens a door through the wall) fixed every one, so a floor cut in two is code's to mend and never costs a second model call.
        thenExpect("code mends the floor, so the model's own arena is created with no repair call", () => {
          expect(arena.getStatus()).toBe("created");
          expect(arena.getModelCalls()).toBeLessThanOrEqual(2);
        });

        expectDefaultPipelineBehaviour(arena);
      });
    },
  );

  // What code's repair cannot mend is a drawing with almost no floor: it can open a door and wall in a sliver, but it cannot make floor. The
  // fake tier answers this one request with such a drawing, so the path to a built-in arena stays covered now that a floor cut in two is
  // repaired; whether a real model draws it is for the local and paid tiers, so the expectation holds for either.
  when("the player asks for an arena that is almost nothing but solid wall", ({weaponSmith}) => {
    eachTrial(weaponSmith.arena, arena => {
      beforeAll(() => arena.ask("an arena that is almost nothing but solid wall"));

      thenExpect(
        "the player is given an arena (the model's own after a repair, or a built-in one), never nothing",
        () => {
          expect(arena.getArenaGivenProblems()).toEqual([]);
        },
      );

      expectDefaultPipelineBehaviour(arena);
    });
  });

  when("the player asks in a few words: 'a small box'", ({weaponSmith}) => {
    eachTrial(weaponSmith.arena, arena => {
      beforeAll(() => arena.ask("a small box"));

      thenExpect("the model's own arena is created, not a built-in fallback", () => {
        expect(arena.getStatus()).toBe("created");
      });

      expectDefaultPipelineBehaviour(arena);
    });
  });

  // The largest the engine allows (40 by 30): on Haiku 5.5 one run of each format (2026-11-19) fell back 3 times in 4, which is the gap
  // the format comparison (`docs/ai-arena-research.md`) is meant to close. The fake tier draws its one small arena for any request, so
  // only a paid or local run can fail here.
  when.each(
    LARGE_REQUESTS,
    request => request.when,
    (request, {weaponSmith}) => {
      eachTrial(weaponSmith.arena, arena => {
        beforeAll(() => arena.ask(request.prompt));

        thenExpect("the model's own arena is created, not a built-in fallback", () => {
          expect(arena.getStatus()).toBe("created");
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

  // Every request in this spec is an arena request that passes the pre-check, so each one reaches the model and is paid for: whatever
  // its arena came to, a built-in one included, nothing is refunded. (A request turned away before any model call is the other spec's.)
  thenExpect("whatever is asked, the credit is not refunded, because the model was called", () => {
    expect(arena.wasRefunded()).toBe(false);
  });
}
