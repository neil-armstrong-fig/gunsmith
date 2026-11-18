import {PaidArenaSubmissionEvalDriver} from "@evals/eval-criteria-mapping/setups/arena-submission/paid/PaidArenaSubmissionEvalDriver";

const FIRST = {kind: "prompt" as const, playerId: "first", prompt: "a ring of pillars around a raised platform"};

it("has no paid tier yet, and says why when a screening is made", () => {
  expect(() => new PaidArenaSubmissionEvalDriver(undefined).run([FIRST])).toThrow("no paid tier yet");
});

it("says so only when a screening is made, so a paid run that never screens is not stopped", () => {
  expect(() => new PaidArenaSubmissionEvalDriver(undefined)).not.toThrow();
});
