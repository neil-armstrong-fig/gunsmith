import {beforeAll, eachTrial, given, thenExpect, when} from "@evals/eval-criteria-mapping/EvalCriteriaMapping";
import type {ArenaSubmissionDsl} from "@evals/dsl/arena-submission/ArenaSubmissionDsl";

// Both players put an arena forward, and the players pick between them (`docs/game-design.md`): screening only checks that each is
// a request for an arena, or a built-in one that exists, and leaves both for the players. Nothing here says which is better. That each
// survivor is a submission that was made, word for word, that screening cost at most a moderation call for each prompt, and that
// nothing leaks, are `expectDefaultPipelineBehaviour`, at the end of every trial.
// In progress: the fake moderator approves any prompt it was not told about; whether a real model approves real arena prompts is for
// the local tier.
given.inProgress("both players submit an arena that screening accepts, so the players pick between them", () => {
  when("player 1 and player 2 each describe an arena", ({weaponSmith}) => {
    eachTrial(weaponSmith.arenaSubmission, arenaSubmission => {
      beforeAll(() =>
        arenaSubmission.askWithPrompts({
          player1: "an open arena with a ring of stone pillars",
          player2: "a fortress with a raised keep reached by one stair",
        }),
      );

      thenExpect("screening leaves both submissions, for the players to pick between", () =>
        arenaSubmission.expectPlayersPick(),
      );

      expectDefaultPipelineBehaviour(arenaSubmission);
    });
  });

  // That the built-in arena costs no model call is a criterion of `expectDefaultPipelineBehaviour` (at most one moderation call per prompt, none for a built-in);
  // this `when` only states that both survive.
  when("player 1 describes an arena and player 2 names the built-in arena 'Duel'", ({weaponSmith}) => {
    eachTrial(weaponSmith.arenaSubmission, arenaSubmission => {
      beforeAll(() =>
        arenaSubmission.askWithPromptAndBuiltIn({
          player1: "a courtyard split by a low wall, with crates to hide behind",
          player2: "Duel",
        }),
      );

      thenExpect("screening leaves both submissions, for the players to pick between", () =>
        arenaSubmission.expectPlayersPick(),
      );

      expectDefaultPipelineBehaviour(arenaSubmission);
    });
  });
});

function expectDefaultPipelineBehaviour(arenaSubmission: ArenaSubmissionDsl): void {
  thenExpect(
    "whatever is submitted, only submissions that were made go forward, word for word and never twice, and what is left (none, one by default, or two to pick between) follows how many survived",
    () => arenaSubmission.expectSurvivorsAreSubmissions(),
  );

  thenExpect(
    "whatever is submitted, screening spends at most one model call on each prompt and none on a built-in arena",
    () => arenaSubmission.expectWithinModelCalls(),
  );

  thenExpect(
    "whatever is submitted, no rejection reason shown to the players repeats a whole prompt or built-in name, and nothing shown contains the system prompt",
    () => arenaSubmission.expectSafeToShow(),
  );
}
