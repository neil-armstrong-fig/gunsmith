import {DEFAULT_PRE_ROUND_SECONDS} from "@src/durable-objects/match/pre-round/DefaultPreRoundSeconds";
import {parsePreRoundSeconds} from "@src/durable-objects/match/pre-round-seconds/ParsePreRoundSeconds";

it("gives the real time when the page asks for none", () => {
  expect(secondsOf("")).toBe(DEFAULT_PRE_ROUND_SECONDS);
  expect(secondsOf("room=ABCD")).toBe(DEFAULT_PRE_ROUND_SECONDS);
});

it("shortens the time as asked, and takes a fraction of a second", () => {
  expect(secondsOf("preRoundSeconds=5")).toBe(5);
  expect(secondsOf("preRoundSeconds=1.5")).toBe(1.5);
});

it("takes none at all: the match begins on the defaults at once", () => {
  expect(secondsOf("preRoundSeconds=0")).toBe(0);
});

it("never lengthens the time", () => {
  expect(secondsOf(`preRoundSeconds=${DEFAULT_PRE_ROUND_SECONDS + 1}`)).toBe(DEFAULT_PRE_ROUND_SECONDS);
});

it("takes a negative time for none", () => {
  expect(secondsOf("preRoundSeconds=-4")).toBe(0);
});

it("gives the real time for anything that is not a number", () => {
  expect(secondsOf("preRoundSeconds=")).toBe(DEFAULT_PRE_ROUND_SECONDS);
  expect(secondsOf("preRoundSeconds=soon")).toBe(DEFAULT_PRE_ROUND_SECONDS);
  expect(secondsOf("preRoundSeconds=Infinity")).toBe(DEFAULT_PRE_ROUND_SECONDS);
});

function secondsOf(query: string): number {
  return parsePreRoundSeconds(new URLSearchParams(query));
}
