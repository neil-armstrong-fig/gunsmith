import fc from "fast-check";
import {returnAddress} from "@src/router/routes/sign-in/redirect/ReturnAddress";

/**
 * What must hold for any address a page asks to be sent back to (it is read off the query string, so anyone can write it): the
 * answer is the front page or an address on an allowed origin, never anywhere else. Deliberately outside `pnpm checks` (a fresh
 * seed each run); `pnpm test:properties` runs it.
 */
const RUNS = Number(process.env["PROPERTY_TEST_RUNS"] ?? 200);
const SITES = ["https://gunsmith.test", "https://www.gunsmith.test"];
const DEPLOYED = {ALLOWED_ORIGINS: SITES.join(",")};
const LOCAL = {...DEPLOYED, ALLOW_LOOPBACK_ORIGINS: "true"};

it("sends a player only to the front page or an allowed origin, whatever address is asked for", () => {
  fc.assert(
    fc.property(askedAddress(), asked => {
      const address = returnAddress(asked, DEPLOYED);

      if (address !== "/") {
        expect(SITES).toContain(new URL(address).origin);
      }
    }),
    {numRuns: RUNS},
  );
});

it("sends a player started for local use only to the front page, an allowed origin or a plain-http local page", () => {
  fc.assert(
    fc.property(askedAddress(), asked => {
      const address = returnAddress(asked, LOCAL);

      if (address !== "/") {
        const url = new URL(address);
        const isLocalPage = url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname);
        expect(SITES.includes(url.origin) || isLocalPage).toBe(true);
      }
    }),
    {numRuns: RUNS},
  );
});

it("keeps every address on an allowed origin, whatever follows the origin", () => {
  fc.assert(
    fc.property(fc.constantFrom(...SITES), fc.string(), (site, rest) => {
      const address = returnAddress(`${site}/${rest}`, DEPLOYED);

      expect(address === "/" || new URL(address).origin === site).toBe(true);
    }),
    {numRuns: RUNS},
  );
});

function askedAddress(): fc.Arbitrary<string | undefined> {
  const site = fc.constantFrom(...SITES);

  return fc.oneof(
    fc.constant(undefined),
    fc.string(),
    fc.webUrl(),
    fc.tuple(site, fc.string()).map(([origin, tail]) => `${origin}${tail}`),
    fc.tuple(site, fc.domain()).map(([origin, host]) => `${origin}@${host}`),
    fc.tuple(site, fc.domain()).map(([origin, host]) => `${origin}.${host}`),
    fc.domain().map(host => `//${host}/`),
    fc.string().map(rest => `javascript:${rest}`),
    fc
      .tuple(fc.constantFrom("localhost", "127.0.0.1"), fc.nat(65535), fc.string())
      .map(([host, port, rest]) => `http://${host}:${port}${rest}`),
  );
}
