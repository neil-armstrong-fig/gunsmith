import {returnAddress} from "@src/router/routes/sign-in/redirect/ReturnAddress";

const SITES = {ALLOWED_ORIGINS: "https://gunsmith.test,https://www.gunsmith.test"};

it("answers the address asked for when its whole origin is allowed, path and query kept", () => {
  expect(returnAddress("https://gunsmith.test/play", SITES)).toBe("https://gunsmith.test/play");
  expect(returnAddress("https://www.gunsmith.test/room?code=ABC#top", SITES)).toBe(
    "https://www.gunsmith.test/room?code=ABC#top",
  );
});

it("answers the address in its normal form", () => {
  expect(returnAddress("https://GUNSMITH.test:443/a/../b", SITES)).toBe("https://gunsmith.test/b");
});

it("answers the front page when nothing is asked for", () => {
  expect(returnAddress(undefined, SITES)).toBe("/");
  expect(returnAddress("", SITES)).toBe("/");
});

it("answers the front page for another site, a look-alike or a login that points elsewhere", () => {
  for (const asked of [
    "https://evil.test/",
    "https://gunsmith.test.evil.test/",
    "https://evilgunsmith.test/",
    "https://gunsmith.test@evil.test/",
    "http://gunsmith.test/",
    "https://gunsmith.test:8443/",
  ]) {
    expect(returnAddress(asked, SITES), asked).toBe("/");
  }
});

it("answers the front page for anything that is not an absolute web address", () => {
  for (const asked of ["//evil.test/", "/play", "javascript:alert(1)", "data:text/html,x", "not a url"]) {
    expect(returnAddress(asked, SITES), asked).toBe("/");
  }
});

it("answers a local page only when the settings say the Worker was started for local use", () => {
  expect(returnAddress("http://localhost:3450/play", SITES)).toBe("/");
  expect(returnAddress("http://localhost:3450/play", {...SITES, ALLOW_LOOPBACK_ORIGINS: "true"})).toBe(
    "http://localhost:3450/play",
  );
});
