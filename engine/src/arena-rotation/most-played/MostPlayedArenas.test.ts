import {mostPlayedArenas} from "@gunsmith/engine/arena-rotation/most-played/MostPlayedArenas";

const POOL = ["a", "b", "c", "d", "e", "f"];

it("lists yesterday's most played first", () => {
  const plays = [
    {arena: "d", day: 9, count: 4},
    {arena: "b", day: 9, count: 3},
    {arena: "e", day: 9, count: 1},
  ];

  expect(mostPlayedArenas({day: 10, arenas: POOL, plays}, 2)).toEqual(["d", "b"]);
});

it("counts only yesterday: nothing earlier, nothing on the day asked for or after it", () => {
  const plays = [
    {arena: "a", day: 8, count: 99},
    {arena: "e", day: 10, count: 99},
    {arena: "f", day: 11, count: 99},
    {arena: "c", day: 9, count: 1},
  ];

  expect(mostPlayedArenas({day: 10, arenas: POOL, plays}, 2)).toEqual(["c"]);
});

it("keeps nothing when nothing was played yesterday", () => {
  expect(mostPlayedArenas({day: 10, arenas: POOL, plays: []}, 2)).toEqual([]);
});

it("adds up an arena's plays of the day", () => {
  const plays = [
    {arena: "e", day: 9, count: 2},
    {arena: "e", day: 9, count: 2},
    {arena: "b", day: 9, count: 3},
  ];

  expect(mostPlayedArenas({day: 10, arenas: POOL, plays}, 1)).toEqual(["e"]);
});

it("breaks a tie by the pool's order", () => {
  const plays = [
    {arena: "f", day: 9, count: 4},
    {arena: "c", day: 9, count: 4},
    {arena: "e", day: 9, count: 4},
  ];

  expect(mostPlayedArenas({day: 10, arenas: POOL, plays}, 2)).toEqual(["c", "e"]);
});

it("leaves out an arena that is not in the pool", () => {
  expect(mostPlayedArenas({day: 10, arenas: POOL, plays: [{arena: "z", day: 9, count: 50}]}, 1)).toEqual([]);
});
