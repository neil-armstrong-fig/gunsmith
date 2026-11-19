import {parseAccountId} from "@src/generation/account-id/ParseAccountId";

it("reads an opaque account id", () => {
  expect(parseAccountId("acct_7-Z")).toBe("acct_7-Z");
});

it("has no account when the header is missing or empty", () => {
  expect(parseAccountId(undefined)).toBeUndefined();
  expect(parseAccountId("")).toBeUndefined();
});

it("refuses an id with characters that are not letters, digits, underscore or dash", () => {
  expect(parseAccountId("a b")).toBeUndefined();
  expect(parseAccountId("a/b")).toBeUndefined();
  expect(parseAccountId("a\nb")).toBeUndefined();
});

it("refuses an id over 64 characters and takes one of exactly 64", () => {
  expect(parseAccountId("a".repeat(64))).toBe("a".repeat(64));
  expect(parseAccountId("a".repeat(65))).toBeUndefined();
});
