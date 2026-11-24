import {DEFAULT_REVEAL_SECONDS} from "@src/durable-objects/match/pre-round/DefaultRevealSeconds";
import {parseRevealSeconds} from "@src/durable-objects/match/reveal-seconds/ParseRevealSeconds";

it("gives the real time when the page asks for none", () => {
  expect(secondsOf("")).toBe(DEFAULT_REVEAL_SECONDS);
  expect(secondsOf("room=ABCD")).toBe(DEFAULT_REVEAL_SECONDS);
});

it("shortens the time as asked, and takes a fraction of a second", () => {
  expect(secondsOf("revealSeconds=5")).toBe(5);
  expect(secondsOf("revealSeconds=1.5")).toBe(1.5);
});

it("takes none at all: the match begins as soon as the pre-round is decided", () => {
  expect(secondsOf("revealSeconds=0")).toBe(0);
});

it("never lengthens the time", () => {
  expect(secondsOf(`revealSeconds=${DEFAULT_REVEAL_SECONDS + 1}`)).toBe(DEFAULT_REVEAL_SECONDS);
});

it("takes a negative time for none", () => {
  expect(secondsOf("revealSeconds=-4")).toBe(0);
});

it("gives the real time for anything that is not a number", () => {
  expect(secondsOf("revealSeconds=")).toBe(DEFAULT_REVEAL_SECONDS);
  expect(secondsOf("revealSeconds=soon")).toBe(DEFAULT_REVEAL_SECONDS);
  expect(secondsOf("revealSeconds=Infinity")).toBe(DEFAULT_REVEAL_SECONDS);
});

function secondsOf(query: string): number {
  return parseRevealSeconds(new URLSearchParams(query));
}
