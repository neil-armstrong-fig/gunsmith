import {ringTimingOfPage} from "@src/game/scenario/ring-timing/RingTimingOfPage";

afterEach(() => {
  vi.unstubAllGlobals();
});

it("is the timing the page's query asks for", () => {
  vi.stubGlobal("location", {search: "?scenario=sparring&ringDelay=1&ringClosing=6"});

  expect(ringTimingOfPage()).toEqual({startDelaySeconds: 1, closingSeconds: 6});
});

it("is the same every time, so the next round keeps the ring the page asked for", () => {
  vi.stubGlobal("location", {search: "?ringDelay=4"});

  expect(ringTimingOfPage()).toEqual(ringTimingOfPage());
});

it("is nothing when the query asks for none", () => {
  vi.stubGlobal("location", {search: "?scenario=duel"});

  expect(ringTimingOfPage()).toBeUndefined();
});

it("is nothing outside a browser, where there is no query to read", () => {
  vi.stubGlobal("location", undefined);

  expect(ringTimingOfPage()).toBeUndefined();
});
