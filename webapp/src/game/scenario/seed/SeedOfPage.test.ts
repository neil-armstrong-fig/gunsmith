import {seedOfPage} from "@src/game/scenario/seed/SeedOfPage";

afterEach(() => {
  vi.unstubAllGlobals();
});

it("is the seed the page's query asks for", () => {
  vi.stubGlobal("location", {search: "?scenario=duel&seed=1234"});

  expect(seedOfPage()).toBe(1234);
});

it("is the same every time when the query asks for one, so a match can be replayed", () => {
  vi.stubGlobal("location", {search: "?seed=99"});

  expect(seedOfPage()).toBe(seedOfPage());
});

it("is a fresh whole number each time when the query asks for none", () => {
  vi.stubGlobal("location", {search: ""});
  const seeds = new Set<number>();
  for (let index = 0; index < 20; index++) {
    const seed = seedOfPage();
    seeds.add(seed);

    expect(Number.isInteger(seed)).toBe(true);
  }

  expect(seeds.size).toBeGreaterThan(15);
});

it("is still a whole number outside a browser, where there is no query to read", () => {
  vi.stubGlobal("location", undefined);

  expect(Number.isInteger(seedOfPage())).toBe(true);
});
