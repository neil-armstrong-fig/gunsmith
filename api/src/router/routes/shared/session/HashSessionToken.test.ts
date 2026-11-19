import {hashSessionToken} from "@src/router/routes/shared/session/HashSessionToken";

it("is the SHA-256 of the token in lowercase hex (FIPS 180-2's own example)", async () => {
  expect(await hashSessionToken("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
});

it("gives different tokens different hashes, and never the token back", async () => {
  const first = await hashSessionToken("token-1");
  const second = await hashSessionToken("token-2");

  expect(first).not.toBe(second);
  expect(first).toMatch(/^[0-9a-f]{64}$/);
  expect(first).not.toContain("token-1");
});
