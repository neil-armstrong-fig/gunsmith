import {beforeAll, eachTrial, expect, given, thenExpect, when} from "@evals/eval-criteria-mapping/EvalCriteriaMapping";
import type {ArenaDsl} from "@evals/dsl/arena/ArenaDsl";

const WATCHTOWER_REQUEST =
  'A single "watchtower" on each end of the map that goes up to level three with no cover and is effectively a corrador up. The middle of the map has a cover block going through it with a single bridge in the middle that also goes up to level three and back down again';

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

// A plain request becomes an arena: the happy path and its edges. Each `when` says that an arena is created (or answered) and what is
// special to its request (cover, height); that the player can play it and it leaks nothing, that the pipeline kept to its
// fixed path within three model calls, and that no credit goes back for a request that reached the model, are
// `expectDefaultPipelineBehaviour`, at the end of every trial.
// A regression since 2026-11-25: every criterion held in 3 of 3 trials on Haiku 5.5 with the shapes format and its `floor` list
// (`docs/ai-arena-research.md`); the watchtower, which did not, is its own `given` below.
given("a player asks for an arena, and the model must write one the engine accepts as playable", () => {
  when("the player asks for an open arena with a ring of stone pillars", ({weaponSmith}) => {
    eachTrial(weaponSmith.arena, arena => {
      beforeAll(() => arena.ask("an open arena with a ring of stone pillars"));

      thenExpect("the model's own arena is created", () => {
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

        thenExpect("the model's own arena is created", () => {
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

      thenExpect("the model's own arena is created", () => {
        expect(arena.getStatus()).toBe("created");
      });

      thenExpect("its drawing has a cover block (c)", () => {
        expect(arena.getCoverProblems()).toEqual([]);
      });

      expectDefaultPipelineBehaviour(arena);
    });
  });

  // The requests a model is most likely to answer with an arena the game cannot play. The player is never handed one: the model's own,
  // repaired by code or by the model, or no arena and a reason (with no refund: the model was used; the user, 2026-11-21: no built-in arena
  // is given in its place). That the player can play what they are given, and that the credit is not refunded, are
  // `expectDefaultPipelineBehaviour`; this `when` adds that the request is answered.
  when(
    "the player asks for an arena cut in two by a wall nobody can cross, a layout the game cannot play",
    ({weaponSmith}) => {
      eachTrial(weaponSmith.arena, arena => {
        beforeAll(() => arena.ask("an arena cut in two by a wall nobody can cross"));

        thenExpect(
          "the player is given the model's own arena, or told why there is none, never nothing and never a substitute",
          () => {
            expect(arena.getArenaAnsweredProblems()).toEqual([]);
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
  // fake tier answers this one request with such a drawing, so the path to an invalid request (no arena, a reason) stays covered now that a
  // floor cut in two is repaired; on Haiku 5.5 (2026-11-25) the first draft needed the model's repair every time, so the expectation holds for either.
  when("the player asks for an arena that is almost nothing but solid wall", ({weaponSmith}) => {
    eachTrial(weaponSmith.arena, arena => {
      beforeAll(() => arena.ask("an arena that is almost nothing but solid wall"));

      thenExpect(
        "the player is given the model's own arena, or told why there is none, never nothing and never a substitute",
        () => {
          expect(arena.getArenaAnsweredProblems()).toEqual([]);
        },
      );

      expectDefaultPipelineBehaviour(arena);
    });
  });

  when("the player asks in a few words: 'a small box'", ({weaponSmith}) => {
    eachTrial(weaponSmith.arena, arena => {
      beforeAll(() => arena.ask("a small box"));

      thenExpect("the model's own arena is created", () => {
        expect(arena.getStatus()).toBe("created");
      });

      expectDefaultPipelineBehaviour(arena);
    });
  });

  // The largest the engine allows (40 by 30): on Haiku 5.5 rows fell back 3 times in 4 (2026-11-19); shapes and code's repair closed the
  // gap (`docs/ai-arena-research.md`). The fake tier draws its one small arena for any request, so only a paid or local run can fail here.
  when.each(
    LARGE_REQUESTS,
    request => request.when,
    (request, {weaponSmith}) => {
      eachTrial(weaponSmith.arena, arena => {
        beforeAll(() => arena.ask(request.prompt));

        thenExpect("the model's own arena is created", () => {
          expect(arena.getStatus()).toBe("created");
        });

        expectDefaultPipelineBehaviour(arena);
      });
    },
  );
});

// In progress: the height asked for does not hold every time. On Haiku 5.5 (2026-11-25, 3 trials) every arena was created, but one trial's
// towers ended at level one; the other criteria held. It becomes a regression when the towers keep level two in every trial.
given.inProgress(
  "a player asks for an arena built to a height, so the levels asked for must survive the repair",
  () => {
    // A real failure (the user's manual test in the live workshop, 2026-11-21): this request came back as a built-in arena. A 25 by 13
    // hand-drawn version (a low-cover divider with one crossing, two-stage stairs to each tower and to the bridge) passes engine's
    // validation and fair starts, so the layout is possible. The player's words are kept as typed, spelling included.
    when("the player asks for two level-three watchtowers and a bridge over a cover divider", ({weaponSmith}) => {
      eachTrial(weaponSmith.arena, arena => {
        beforeAll(() => arena.ask(WATCHTOWER_REQUEST));

        thenExpect("the model's own arena is created", () => {
          expect(arena.getStatus()).toBe("created");
        });

        // Haiku 5.5 (2026-11-24) drew each tower at level two with one stair from the ground, which climbs two levels, and code's repair then
        // lowered every tower to level one: valid, created, and not what was asked. "Level three" is the third floor, two levels up. Engine's
        // repair now adds a landing between two stairs, and the towers kept level two in 3 of 3 (2026-11-24) but 2 of 3 (2026-11-25).
        thenExpect("the towers keep the height asked for: the arena reaches level two, the third floor", () => {
          expect(arena.getHighestLevel()).toBe(2);
        });

        expectDefaultPipelineBehaviour(arena);
      });
    });
  },
);

// A layout request: the arena must take the outline asked for, which no validity check sees. Probed 2026-11-20 on Haiku 5.5, "a plus sign"
// came back as an open rectangle in 3 of 3 drafts and "an L" had its corner of wall in 1 of 3. Fixed 2026-11-25 by the shapes format's
// `floor` list, which code walls around (`docs/ai-arena-research.md`, "Shape fidelity"): 17 of 18 in the comparison, then 12 of 12 on the
// shipped default at 6 trials, so a regression (the user, 2026-11-25).
given("a player asks for an arena whose outline is not a rectangle, so its walls must make that outline", () => {
  // The border alone only makes a rectangle, so a plus sign is four corners of wall.
  when("the player asks for an arena shaped like a plus sign", ({weaponSmith}) => {
    eachTrial(weaponSmith.arena, arena => {
      beforeAll(() => arena.ask("an arena shaped like a plus sign"));

      thenExpect("the model's own arena is created", () => {
        expect(arena.getStatus()).toBe("created");
      });

      thenExpect("all four of its corners are walled in, as a plus sign's are", () => {
        expect(arena.getWalledCorners()).toBe(4);
      });

      expectDefaultPipelineBehaviour(arena);
    });
  });

  // An L is one corner of wall; two (a Z) or none (a rectangle) is not an L.
  when("the player asks for an L-shaped arena", ({weaponSmith}) => {
    eachTrial(weaponSmith.arena, arena => {
      beforeAll(() => arena.ask("an L-shaped arena"));

      thenExpect("the model's own arena is created", () => {
        expect(arena.getStatus()).toBe("created");
      });

      thenExpect("exactly one of its corners is walled in, as an L's is", () => {
        expect(arena.getWalledCorners()).toBe(1);
      });

      expectDefaultPipelineBehaviour(arena);
    });
  });
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
  // its arena came to, an invalid one included, nothing is refunded. (A request turned away before any model call is the other spec's.)
  thenExpect("whatever is asked, the credit is not refunded, because the model was called", () => {
    expect(arena.wasRefunded()).toBe(false);
  });
}
