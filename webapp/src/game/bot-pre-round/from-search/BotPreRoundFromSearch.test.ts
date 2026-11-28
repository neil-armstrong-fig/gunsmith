import {botPreRoundFromSearch} from "@src/game/bot-pre-round/from-search/BotPreRoundFromSearch";

it("is asked for by the duel with preRound=1", () => {
  expect(botPreRoundFromSearch("?scenario=duel&preRound=1")).toBe(true);
});

it("is not there for a duel that did not ask", () => {
  expect(botPreRoundFromSearch("?scenario=duel")).toBe(false);
  expect(botPreRoundFromSearch("?scenario=duel&preRound=0")).toBe(false);
});

it("is not there for any other scenario, or an online room", () => {
  expect(botPreRoundFromSearch("?preRound=1")).toBe(false);
  expect(botPreRoundFromSearch("?scenario=sparring&preRound=1")).toBe(false);
  expect(botPreRoundFromSearch("?scenario=duel&room=abc&preRound=1")).toBe(false);
});
