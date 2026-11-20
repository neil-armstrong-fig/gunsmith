import {preRoundFromSearch} from "@src/game/pre-round/from-search/PreRoundFromSearch";

it("is asked for by the duel with preRound=1", () => {
  expect(preRoundFromSearch("?scenario=duel&preRound=1")).toBe(true);
});

it("is not there for a duel that did not ask", () => {
  expect(preRoundFromSearch("?scenario=duel")).toBe(false);
  expect(preRoundFromSearch("?scenario=duel&preRound=0")).toBe(false);
});

it("is not there for any other scenario, or an online room", () => {
  expect(preRoundFromSearch("?preRound=1")).toBe(false);
  expect(preRoundFromSearch("?scenario=sparring&preRound=1")).toBe(false);
  expect(preRoundFromSearch("?scenario=duel&room=abc&preRound=1")).toBe(false);
});
