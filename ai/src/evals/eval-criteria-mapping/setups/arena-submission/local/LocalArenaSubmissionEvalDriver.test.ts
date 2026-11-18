import {LocalArenaSubmissionEvalDriver} from "@evals/eval-criteria-mapping/setups/arena-submission/local/LocalArenaSubmissionEvalDriver";

it("runs each screening three times, because a local model is free but not fully repeatable, unless a run asks for fewer", () => {
  expect(new LocalArenaSubmissionEvalDriver(undefined).trials).toBe(3);
  expect(new LocalArenaSubmissionEvalDriver("1").trials).toBe(1);
});
