import {botGameAddressOf} from "@src/react/components/dom/game-menu/bot-game-address/BotGameAddressOf";

it("opens the duel behind its pre-round, a new random duel when the page asked for no seed", () => {
  expect(botGameAddressOf("?menu=0")).toBe("/?scenario=duel&preRound=1");
  expect(botGameAddressOf("")).toBe("/?scenario=duel&preRound=1");
});

it("keeps the seed the page asked for, so the same address plays the same duel", () => {
  expect(botGameAddressOf("?menu=0&seed=2")).toBe("/?scenario=duel&preRound=1&seed=2");
});

it("drops a seed that is not one, as the duel would ignore it", () => {
  expect(botGameAddressOf("?seed=two")).toBe("/?scenario=duel&preRound=1");
  expect(botGameAddressOf("?seed=1.5")).toBe("/?scenario=duel&preRound=1");
});
