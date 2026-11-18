import {DslError} from "@evals/dsl/shared/errors/DslError";

it("says what was being attempted, then why it failed, in one sentence", () => {
  const error = new DslError(
    "Expected a weapon to be created",
    new Error("outcomeMatches: failed in 1 of 3 trials: expected created, got invalid"),
  );

  expect(error.message).toBe(
    "Expected a weapon to be created: outcomeMatches: failed in 1 of 3 trials: expected created, got invalid",
  );
});

it("is named for what it is, so a report shows it", () => {
  expect(new DslError("Expected anything", new Error("no")).name).toBe("DslError");
});

it("keeps the error it wraps as its cause", () => {
  const cause = new Error("connection refused");

  expect(new DslError("Failed to ask", cause).cause).toBe(cause);
});

it("carries the wrapped error's stack, so the real place of the failure is not lost", () => {
  const cause = new Error("connection refused");

  expect(new DslError("Failed to ask", cause).stack).toContain(`Caused by: ${cause.stack}`);
});

it("copes with something thrown that is not an Error", () => {
  expect(new DslError("Failed to ask", "plain text").message).toBe("Failed to ask: plain text");
});
