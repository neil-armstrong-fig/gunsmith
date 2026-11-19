import {sessionTokenFrom} from "@src/router/routes/shared/session/SessionTokenFrom";

it("finds the session token among other cookies", () => {
  expect(sessionTokenFrom("session=abc123")).toBe("abc123");
  expect(sessionTokenFrom("theme=dark; session=abc123; other=1")).toBe("abc123");
  expect(sessionTokenFrom("  session=abc123  ")).toBe("abc123");
});

it("keeps a token's own equals signs", () => {
  expect(sessionTokenFrom("session=abc=123")).toBe("abc=123");
});

it("finds nothing when there is no cookie, or none called session", () => {
  expect(sessionTokenFrom(undefined)).toBeUndefined();
  expect(sessionTokenFrom("")).toBeUndefined();
  expect(sessionTokenFrom("theme=dark; other=1")).toBeUndefined();
  expect(sessionTokenFrom("session")).toBeUndefined();
  expect(sessionTokenFrom("session=")).toBeUndefined();
});

it("does not take a cookie whose name merely ends or starts with session", () => {
  expect(sessionTokenFrom("notsession=abc123")).toBeUndefined();
  expect(sessionTokenFrom("session2=abc123")).toBeUndefined();
  expect(sessionTokenFrom("xsession=evil; session=real")).toBe("real");
});
