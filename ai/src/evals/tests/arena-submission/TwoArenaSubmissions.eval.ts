import {beforeAll, given, thenExpect, when} from "@evals/eval-criteria-mapping/EvalCriteriaMapping";

// Both players put an arena forward, and the players pick between them (`docs/game-design.md`): screening only checks that each is
// a request for an arena, or a built-in one that exists, and leaves both for the players. Nothing here says which is better. That each
// survivor is a submission that was made, word for word, that screening cost at most a moderation call for each prompt, and that
// nothing leaks, are the DSL's standing criteria, which the mapping adds under every `when`.
// In progress: the fake moderator approves any prompt it was not told about; whether a real model approves real arena prompts is for
// the local tier.
given.inProgress("both players submit an arena that screening accepts, so the players pick between them", () => {
  when("player 1 and player 2 each describe an arena", ({arenaSubmission}) => {
    beforeAll(() =>
      arenaSubmission.askWithPrompts({
        player1: "an open arena with a ring of stone pillars",
        player2: "a fortress with a raised keep reached by one stair",
      }),
    );

    thenExpect("screening leaves both submissions, for the players to pick between", () =>
      arenaSubmission.expectPlayersPick(),
    );
  });

  // That the built-in arena costs no model call is the standing cost criterion (at most one moderation call per prompt, none for a built-in);
  // this `when` only states that both survive.
  when("player 1 describes an arena and player 2 names the built-in arena 'Duel'", ({arenaSubmission}) => {
    beforeAll(() =>
      arenaSubmission.askWithPromptAndBuiltIn({
        player1: "a courtyard split by a low wall, with crates to hide behind",
        player2: "Duel",
      }),
    );

    thenExpect("screening leaves both submissions, for the players to pick between", () =>
      arenaSubmission.expectPlayersPick(),
    );
  });
});
