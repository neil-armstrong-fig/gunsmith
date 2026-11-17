import {builtInArenaFor} from "@gunsmith/ai/pipeline/arena/arena-graph/fallback/choice/BuiltInArenaFor";
import type {ArenaDrawing} from "@gunsmith/ai/pipeline/arena/types/ArenaDrawing";

const ROWS = ["#####", "#...#", "#####"];
const FIRST: ArenaDrawing = {name: "First", rows: ROWS};
const SECOND: ArenaDrawing = {name: "Second", rows: ROWS};

it("gives the only built-in arena there is", () => {
  expect(builtInArenaFor("anything", [FIRST])).toBe(FIRST);
});

it("gives the same arena for the same words, every time", () => {
  const pool = [FIRST, SECOND];

  expect(builtInArenaFor("a maze of pillars", pool)).toBe(builtInArenaFor("a maze of pillars", pool));
});

it("spreads different words over the pool", () => {
  const pool = [FIRST, SECOND];

  expect(builtInArenaFor("a", pool)).toBe(SECOND);
  expect(builtInArenaFor("b", pool)).toBe(FIRST);
});

it("reads a character outside the basic plane as one character", () => {
  expect(builtInArenaFor("😀", [FIRST, SECOND])).toBe(FIRST);
});

it("throws, naming the cause, when there is no built-in arena at all", () => {
  expect(() => builtInArenaFor("a box", [])).toThrow("no built-in arena to fall back to");
});
