import {arenaChoicesOf} from "@src/react/components/dom/pre-round/components/choosing/choices/ArenaChoicesOf";

const POND = {id: "saved-1", name: "Pond", prompt: "a pond", rows: ["#####", "#...#", "#...#", "#...#", "#####"]};

it("offers the built-in arenas first, the Duel at the head, when nothing is saved", () => {
  expect(arenaChoicesOf([]).map(choice => choice.name)).toEqual(["Duel", "Fair duel"]);
});

it("offers every saved arena after the built-ins, in the order saved, by its saved id", () => {
  const choices = arenaChoicesOf([POND, {...POND, id: "saved-2", name: "Bridge"}]);

  expect(choices.map(choice => choice.name)).toEqual(["Duel", "Fair duel", "Pond", "Bridge"]);
  expect(choices.slice(2).map(choice => choice.id)).toEqual(["saved-1", "saved-2"]);
});

it("draws a saved arena from its rows", () => {
  const pond = arenaChoicesOf([POND])[2];

  expect({width: pond?.arena.width, height: pond?.arena.height}).toEqual({width: 5, height: 5});
});

it("tells a saved arena named like a built-in from the built-in", () => {
  const choices = arenaChoicesOf([{...POND, name: "Duel"}]);

  expect(new Set(choices.map(choice => choice.id)).size).toBe(3);
});
