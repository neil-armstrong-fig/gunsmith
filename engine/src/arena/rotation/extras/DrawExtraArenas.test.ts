import {drawExtraArenas} from "@gunsmith/engine/arena/rotation/extras/DrawExtraArenas";
import type {ArenaPlays} from "@gunsmith/engine/arena/rotation/types/ArenaPlays";

const POOL = ["a", "b", "c", "d", "e", "f", "g", "h"];

it("draws the number asked for, all different, only from the arenas not already kept", () => {
  for (let day = 0; day < 40; day += 1) {
    const drawn = drawExtraArenas({day, arenas: POOL, plays: []}, {kept: ["a", "b"], count: 3});

    expect(drawn, `day ${day}`).toHaveLength(3);
    expect(new Set(drawn).size).toBe(3);
    expect(drawn.some(name => name === "a" || name === "b")).toBe(false);
  }
});

it("draws the same arenas for the same day", () => {
  const first = drawExtraArenas({day: 7, arenas: POOL, plays: []}, {kept: ["a"], count: 3});

  expect(drawExtraArenas({day: 7, arenas: POOL, plays: []}, {kept: ["a"], count: 3})).toEqual(first);
});

it("draws every arena left when fewer are left than asked for", () => {
  expect(drawExtraArenas({day: 7, arenas: ["a", "b", "c"], plays: []}, {kept: ["a"], count: 3}).sort()).toEqual([
    "b",
    "c",
  ]);
});

it("draws an arena played yesterday less often than one never played", () => {
  const days = Array.from({length: 400}, (_, index) => index + 100);
  const plays = days.map(day => ({arena: "c", day: day - 1, count: 1}));
  const timesDrawn = (name: string): number => {
    return days.filter(day => drawExtraArenas({day, arenas: POOL, plays}, {kept: ["a", "b"], count: 2}).includes(name))
      .length;
  };

  expect(timesDrawn("c")).toBeLessThan(timesDrawn("e") * 0.6);
});

it("counts a play exactly seven days before the day as recent, and one eight days before as not", () => {
  const days = Array.from({length: 200}, (_, index) => index + 100);
  const drawnOn = (day: number, plays: readonly ArenaPlays[]): string[] => {
    return drawExtraArenas({day, arenas: POOL, plays}, {kept: ["a", "b"], count: 2});
  };

  expect(
    days.every(day => drawnOn(day, [{arena: "c", day: day - 8, count: 9}]).join() === drawnOn(day, []).join()),
  ).toBe(true);
  expect(
    days.some(day => drawnOn(day, [{arena: "c", day: day - 7, count: 9}]).join() !== drawnOn(day, []).join()),
  ).toBe(true);
});
