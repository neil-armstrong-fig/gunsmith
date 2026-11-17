import {beforeAll, given, thenExpect, when} from "@evals/eval-criteria-mapping/EvalCriteriaMapping";

// A plain request becomes an arena: the happy path and its edges. Each `when` says only that an arena is created; that the player can
// play it and it leaks nothing, that the pipeline kept to its fixed path within three model calls, and that the credit goes back only
// for a built-in arena, are the DSL's standing criteria, which the mapping adds under every `when`.
// In progress: nothing here has run on a real model yet. The fake tier proves the harness only; the local tier decides whether
// a 9B model can write rows `arenaFrom` accepts, and the cases move to a plain `given` once they hold there.
given.inProgress("a player asks for an arena", () => {
  when("they ask for a plain arena with pillars", ({arena}) => {
    beforeAll(() => arena.ask("an open arena with a ring of stone pillars"));

    thenExpect("an arena is created", () => arena.expectCreated());
  });

  // Stairs are the one way between levels, so a request for height is where the rows are most likely to be illegal.
  when("they ask for two levels joined by a stair", ({arena}) => {
    beforeAll(() => arena.ask("a duel arena with a raised platform in the middle, reached by one flight of stairs"));

    thenExpect("an arena is created", () => arena.expectCreated());
  });

  // The requests a model is most likely to answer with an arena the game cannot play. The player is never handed one: the model's own,
  // repaired, or a built-in arena with the credit refunded. That the player can play what they are given, and that the credit goes
  // back only for a built-in arena, are the standing criteria; this `when` adds that something is given.
  when("they ask for a layout the game cannot play", ({arena}) => {
    beforeAll(() => arena.ask("an arena cut in two by a wall nobody can cross"));

    thenExpect("an arena is given", () => arena.expectArenaGiven());
  });

  when("they ask in a few words", ({arena}) => {
    beforeAll(() => arena.ask("a small box"));

    thenExpect("an arena is created", () => arena.expectCreated());
  });
});
