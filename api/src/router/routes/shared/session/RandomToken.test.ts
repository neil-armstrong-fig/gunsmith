import {randomToken} from "@src/router/routes/shared/session/RandomToken";

it("is 256 bits as 43 characters of unpadded base64url", () => {
  expect(randomToken()).toMatch(/^[A-Za-z0-9_-]{43}$/);
});

it("is different every time", () => {
  const tokens = new Set(Array.from({length: 500}, () => randomToken()));

  expect(tokens.size).toBe(500);
});
