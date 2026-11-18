import {parseForfeitLimits} from "@src/match/forfeit-limits/ParseForfeitLimits";
import {DEFAULT_FORFEIT_LIMITS} from "@src/match/room/DefaultForfeitLimits";
import type {ForfeitLimits} from "@src/match/room/types/ForfeitLimits";

it("gives the real limits when the page asks for none", () => {
  expect(limitsOf("")).toEqual(DEFAULT_FORFEIT_LIMITS);
  expect(limitsOf("room=ABCD")).toEqual(DEFAULT_FORFEIT_LIMITS);
});

it("shortens each limit as asked, on its own", () => {
  expect(limitsOf("reconnectSeconds=2")).toEqual({
    reconnectSeconds: 2,
    idleSeconds: DEFAULT_FORFEIT_LIMITS.idleSeconds,
  });
  expect(limitsOf("idleSeconds=3")).toEqual({
    reconnectSeconds: DEFAULT_FORFEIT_LIMITS.reconnectSeconds,
    idleSeconds: 3,
  });
  expect(limitsOf("reconnectSeconds=2&idleSeconds=3")).toEqual({reconnectSeconds: 2, idleSeconds: 3});
});

it("takes a fraction of a second", () => {
  expect(limitsOf("reconnectSeconds=1.5").reconnectSeconds).toBe(1.5);
});

it("never waits longer than the real limits, however much a page asks for", () => {
  expect(limitsOf("reconnectSeconds=300&idleSeconds=9999")).toEqual(DEFAULT_FORFEIT_LIMITS);
});

it("never waits less than a second, so a page cannot forfeit a player at once", () => {
  expect(limitsOf("reconnectSeconds=0&idleSeconds=0.2")).toEqual({reconnectSeconds: 1, idleSeconds: 1});
  expect(limitsOf("reconnectSeconds=-5").reconnectSeconds).toBe(1);
});

it("ignores what is not a number", () => {
  expect(limitsOf("reconnectSeconds=soon&idleSeconds=")).toEqual(DEFAULT_FORFEIT_LIMITS);
  expect(limitsOf("reconnectSeconds=NaN&idleSeconds=Infinity")).toEqual(DEFAULT_FORFEIT_LIMITS);
  expect(limitsOf("reconnectSeconds=2abc")).toEqual(DEFAULT_FORFEIT_LIMITS);
});

function limitsOf(query: string): ForfeitLimits {
  return parseForfeitLimits(new URLSearchParams(query));
}
