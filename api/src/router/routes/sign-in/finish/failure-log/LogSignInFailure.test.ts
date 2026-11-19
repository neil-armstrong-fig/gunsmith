import {logSignInFailure} from "@src/router/routes/sign-in/finish/failure-log/LogSignInFailure";

let warn: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
});

it("says the route and the outcome, once", () => {
  logSignInFailure("state-mismatch");

  expect(warn).toHaveBeenCalledTimes(1);
  expect(JSON.parse(String(warn.mock.calls[0]?.[0]))).toEqual({
    route: "auth/google/callback",
    outcome: "state-mismatch",
  });
});

it("adds the class of the error, never its message or what it carried", () => {
  logSignInFailure("failed", new TypeError("D1 said secret-code-1 for secret-sub-1"));

  const logged = String(warn.mock.calls[0]?.[0]);
  expect(JSON.parse(logged)).toEqual({route: "auth/google/callback", outcome: "failed", error: "TypeError"});
  expect(logged).not.toContain("secret");
});

it("adds nothing for a thrown value that is not an error", () => {
  logSignInFailure("failed", "a string with secret-code-1");

  expect(String(warn.mock.calls[0]?.[0])).not.toContain("secret");
  expect(JSON.parse(String(warn.mock.calls[0]?.[0]))).toEqual({route: "auth/google/callback", outcome: "failed"});
});
