import {isTrustedOrigin} from "@src/router/routes/shared/origin/IsTrustedOrigin";

const SITE = {ALLOWED_ORIGINS: "https://gunsmith.test,https://www.gunsmith.test"};

describe("a Worker that lists only its sites", () => {
  it("trusts an origin on the list", () => {
    expect(isTrustedOrigin("https://gunsmith.test", SITE)).toBe(true);
    expect(isTrustedOrigin("https://www.gunsmith.test", SITE)).toBe(true);
  });

  it("tolerates spaces and empty entries in the list", () => {
    const settings = {ALLOWED_ORIGINS: " https://gunsmith.test , ,https://www.gunsmith.test,"};

    expect(isTrustedOrigin("https://gunsmith.test", settings)).toBe(true);
    expect(isTrustedOrigin("https://www.gunsmith.test", settings)).toBe(true);
  });

  it("trusts no one when it has no origin to look at", () => {
    expect(isTrustedOrigin(undefined, SITE)).toBe(false);
    expect(isTrustedOrigin("", SITE)).toBe(false);
  });

  it("trusts no one when the list is empty", () => {
    expect(isTrustedOrigin("https://gunsmith.test", {ALLOWED_ORIGINS: ""})).toBe(false);
  });

  it("matches the whole origin, never a prefix or a look-alike", () => {
    expect(isTrustedOrigin("https://gunsmith.test.evil.test", SITE)).toBe(false);
    expect(isTrustedOrigin("https://evilgunsmith.test", SITE)).toBe(false);
    expect(isTrustedOrigin("http://gunsmith.test", SITE)).toBe(false);
    expect(isTrustedOrigin("https://gunsmith.test:8443", SITE)).toBe(false);
    expect(isTrustedOrigin("https://gunsmith.test/", SITE)).toBe(false);
    expect(isTrustedOrigin("https://gunsmith.test@evil.test", SITE)).toBe(false);
  });

  it("does not trust a local page unless the Worker was started for local use", () => {
    expect(isTrustedOrigin("http://localhost:3450", SITE)).toBe(false);
    expect(isTrustedOrigin("http://127.0.0.1:3107", SITE)).toBe(false);
    expect(isTrustedOrigin("http://localhost:3450", {...SITE, ALLOW_LOOPBACK_ORIGINS: "false"})).toBe(false);
  });
});

describe("a Worker started for local use", () => {
  const local = {...SITE, ALLOW_LOOPBACK_ORIGINS: "true"};

  it("trusts a page on localhost or 127.0.0.1 at any port", () => {
    expect(isTrustedOrigin("http://localhost:3450", local)).toBe(true);
    expect(isTrustedOrigin("http://127.0.0.1:3107", local)).toBe(true);
    expect(isTrustedOrigin("http://localhost", local)).toBe(true);
  });

  it("still trusts the listed sites", () => {
    expect(isTrustedOrigin("https://gunsmith.test", local)).toBe(true);
  });

  it("trusts no other host, scheme or look-alike", () => {
    expect(isTrustedOrigin("https://localhost:3450", local)).toBe(false);
    expect(isTrustedOrigin("http://localhost.evil.test:3450", local)).toBe(false);
    expect(isTrustedOrigin("http://evillocalhost:3450", local)).toBe(false);
    expect(isTrustedOrigin("http://evil.test:3450", local)).toBe(false);
    expect(isTrustedOrigin("http://localhost:3450@evil.test", local)).toBe(false);
    expect(isTrustedOrigin("http://localhost:3450/", local)).toBe(false);
    expect(isTrustedOrigin("http://0.0.0.0:3450", local)).toBe(false);
  });
});
