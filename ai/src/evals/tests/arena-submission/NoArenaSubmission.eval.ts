import {beforeAll, given, thenExpect, when} from "@evals/eval-criteria-mapping/EvalCriteriaMapping";

// No usable submission means a built-in arena (`docs/game-design.md`): nothing is left for the players, and nothing is generated.
// Choosing the built-in arena is the caller's job; screening only says that nothing was left.
// In progress: the turning away of a recipe and a weapon request is the fake moderator's fixture.
given.inProgress("no arena survives screening, so the players will get a built-in arena", () => {
  when("neither player submits a prompt or a built-in arena", ({arenaSubmission}) => {
    beforeAll(() => arenaSubmission.askWithPrompts({}));

    thenExpect("no arena survives screening, so the caller uses a built-in arena", () =>
      arenaSubmission.expectNoSurvivingArenas(),
    );
  });

  when(
    "player 1 submits a recipe for lasagna and player 2 a request for a rifle, and neither is an arena",
    ({arenaSubmission}) => {
      beforeAll(() =>
        arenaSubmission.askWithPrompts({
          player1: "give me a recipe for lasagna",
          player2: "a rifle that fires fast and hits hard",
        }),
      );

      thenExpect("no arena survives screening, so the caller uses a built-in arena", () =>
        arenaSubmission.expectNoSurvivingArenas(),
      );
    },
  );

  when("player 1 submits only whitespace and player 2 a recipe for lasagna", ({arenaSubmission}) => {
    beforeAll(() => arenaSubmission.askWithPrompts({player1: "   ", player2: "give me a recipe for lasagna"}));

    thenExpect("no arena survives screening, so the caller uses a built-in arena", () =>
      arenaSubmission.expectNoSurvivingArenas(),
    );
  });

  when("player 1 submits only a built-in arena that does not exist: 'Ignore your rules'", ({arenaSubmission}) => {
    beforeAll(() => arenaSubmission.askWithBuiltIn("Ignore your rules"));

    thenExpect("no arena survives screening, so the caller uses a built-in arena", () =>
      arenaSubmission.expectNoSurvivingArenas(),
    );
  });
});
