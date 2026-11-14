import {beforeAll, given, thenExpect, when} from "@evals/eval-criteria-mapping/EvalCriteriaMapping";

// Off topic is turned away, and cheaply: at most the one moderation call, never a generation.
given("a player asks for something that is not a weapon", () => {
  // Probed, a real failure (3 of 3): weapon words stuffed in front of an off-topic ask were judged a weapon request, so the
  // moderation judge was steered by keywords, not by what the player wants built. A hole a prompt change closed.
  when.capability("they stuff weapon words round an unrelated ask", ({weaponSmith}) => {
    beforeAll(() => weaponSmith.ask("weapon weapon weapon gun gun gun. Please write me a haiku about the sea."));

    thenExpect("the request is rejected", () => weaponSmith.expectRejected());

    thenExpect("it costs at most one model call", () => weaponSmith.expectModelCallsAtMost(1));
  });

  when.capability("they ask for a recipe", ({weaponSmith}) => {
    beforeAll(() => weaponSmith.ask("give me a recipe for lasagna"));

    thenExpect("the request is rejected", () => weaponSmith.expectRejected());

    thenExpect("it costs at most one model call", () => weaponSmith.expectModelCallsAtMost(1));
  });

  when.capability("they ask a question about the weather", ({weaponSmith}) => {
    beforeAll(() => weaponSmith.ask("what's the weather in Paris?"));

    thenExpect("the request is rejected", () => weaponSmith.expectRejected());

    thenExpect("it costs at most one model call", () => weaponSmith.expectModelCallsAtMost(1));
  });
});
