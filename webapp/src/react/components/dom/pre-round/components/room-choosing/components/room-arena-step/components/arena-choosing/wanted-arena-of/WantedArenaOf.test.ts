import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import type {OfferedArena} from "@src/game/pre-round/types/OfferedArena";
import {wantedArenaOf} from "@src/react/components/dom/pre-round/components/room-choosing/components/room-arena-step/components/arena-choosing/wanted-arena-of/WantedArenaOf";

const rows = ["####", "#..#", "####"];
const duel: OfferedArena = {id: "built-in:Duel", name: "Duel", arena: arenaFrom(rows)};
const foundry: OfferedArena = {id: "arena-from-the-library", name: "Foundry", arena: arenaFrom(rows)};
const saved = [{id: "arena-from-the-library", name: "Foundry", rows, prompt: "a wide yard"}];

it("names a built-in by its name when nothing is saved", () => {
  expect(wantedArenaOf(duel, [])).toEqual({kind: "builtIn", name: "Duel"});
});

it("names a saved arena by its library id, never its name", () => {
  expect(wantedArenaOf(foundry, saved)).toEqual({kind: "saved", id: "arena-from-the-library"});
});

it("names a built-in by its name even when the player has saved arenas", () => {
  expect(wantedArenaOf(duel, saved)).toEqual({kind: "builtIn", name: "Duel"});
});

it("keeps a saved arena named like a built-in its own: it is told apart by its id", () => {
  const sameName: OfferedArena = {id: "arena-from-the-library", name: "Duel", arena: arenaFrom(rows)};

  expect(wantedArenaOf(sameName, saved)).toEqual({kind: "saved", id: "arena-from-the-library"});
});
