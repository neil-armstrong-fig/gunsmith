import {arenasOfDay} from "@gunsmith/engine/arena/rotation/ArenasOfDay";
import {BUILT_IN_ARENAS} from "@gunsmith/engine/arena/built-in/BuiltInArenas";
import {ARENA_ROTATION} from "@gunsmith/engine/arena/rotation/ArenaRotationLimits";
import type {ArenaPlays} from "@gunsmith/engine/arena/rotation/types/ArenaPlays";

const POOL = Array.from({length: 10}, (_, index) => `arena-${index}`);
const DAY = 100;

it("offers five of the built-in arenas", () => {
  const chosen = arenasOfDay({day: DAY, arenas: BUILT_IN_ARENAS.map(({name}) => name), plays: []});

  expect(chosen).toHaveLength(5);
  expect(chosen.every(name => BUILT_IN_ARENAS.some(arena => arena.name === name))).toBe(true);
});

it("keeps every arena when the pool is no bigger than the day's set", () => {
  const small = POOL.slice(0, ARENA_ROTATION.size);

  expect(arenasOfDay({day: DAY, arenas: small, plays: []})).toEqual(small);
});

it("chooses the day's set, all different, all from the pool, listed in the pool's order when none is kept", () => {
  const chosen = arenasOfDay({day: DAY, arenas: POOL, plays: []});

  expect(chosen).toHaveLength(ARENA_ROTATION.size);
  expect(new Set(chosen).size).toBe(chosen.length);
  expect(chosen).toEqual([...chosen].sort((a, b) => POOL.indexOf(a) - POOL.indexOf(b)));
  expect(chosen.every(name => POOL.includes(name))).toBe(true);
});

it("lists the arenas drawn for the day first and yesterday's two kept last, each in the pool's order, so a screen shows the kept ones together", () => {
  for (let day = DAY; day < DAY + 40; day += 1) {
    const plays = [play("arena-0", day - 1, 9), play("arena-1", day - 1, 6)];

    const chosen = arenasOfDay({day, arenas: POOL, plays});
    const drawn = chosen.slice(0, 3);

    expect(chosen.slice(3), `day ${day}`).toEqual(["arena-0", "arena-1"]);
    expect(drawn).toEqual([...drawn].sort((a, b) => POOL.indexOf(a) - POOL.indexOf(b)));
  }
});

it("lists a single arena kept from yesterday last, after the four drawn", () => {
  for (let day = DAY; day < DAY + 40; day += 1) {
    const chosen = arenasOfDay({day, arenas: POOL, plays: [play("arena-0", day - 1, 1)]});

    expect(chosen.at(-1), `day ${day}`).toBe("arena-0");
  }
});

it("draws the whole set afresh on a day after nobody played, so no arena is offered every day", () => {
  const timesOffered = POOL.map(name => {
    return Array.from({length: 60}, (_, day) => arenasOfDay({day, arenas: POOL, plays: []})).filter(set =>
      set.includes(name),
    ).length;
  });

  expect(Math.max(...timesOffered)).toBeLessThan(60);
});

it("keeps yesterday's two most played arenas", () => {
  const plays = [play("arena-7", DAY - 1, 9), play("arena-8", DAY - 1, 6), play("arena-2", DAY - 1, 2)];

  expect(arenasOfDay({day: DAY, arenas: POOL, plays})).toEqual(expect.arrayContaining(["arena-7", "arena-8"]));
});

it("keeps the most played of each day, every day", () => {
  for (let day = DAY; day < DAY + 40; day += 1) {
    const plays = [play("arena-7", day - 1, 9), play("arena-8", day - 1, 6), play("arena-2", day - 1, 2)];

    expect(arenasOfDay({day, arenas: POOL, plays}), `day ${day}`).toEqual(
      expect.arrayContaining(["arena-7", "arena-8"]),
    );
  }
});

it("keeps the only arena played yesterday and draws the other four", () => {
  for (let day = DAY; day < DAY + 40; day += 1) {
    const chosen = arenasOfDay({day, arenas: POOL, plays: [play("arena-9", day - 1, 1)]});

    expect(chosen, `day ${day}`).toContain("arena-9");
    expect(chosen).toHaveLength(ARENA_ROTATION.size);
  }
});

it("gives the same set to the same day however often it is asked", () => {
  const plays = [play("arena-4", DAY - 1, 3), play("arena-6", DAY - 2, 5)];

  expect(arenasOfDay({day: DAY, arenas: POOL, plays})).toEqual(arenasOfDay({day: DAY, arenas: POOL, plays}));
});

it("is not changed by what is played on the day itself or later, so the set holds all day", () => {
  const before = [play("arena-4", DAY - 1, 3)];
  const during = [...before, play("arena-9", DAY, 50), play("arena-3", DAY + 1, 50)];

  expect(arenasOfDay({day: DAY, arenas: POOL, plays: during})).toEqual(
    arenasOfDay({day: DAY, arenas: POOL, plays: before}),
  );
});

it("changes from day to day", () => {
  const sets = new Set<string>();
  for (let day = 0; day < 30; day += 1) {
    sets.add(arenasOfDay({day, arenas: POOL, plays: []}).join(","));
  }

  expect(sets.size).toBeGreaterThan(10);
});

it("ignores plays of an arena that is not in the pool", () => {
  const withStranger = [play("not-an-arena", DAY - 1, 1000)];

  expect(arenasOfDay({day: DAY, arenas: POOL, plays: withStranger})).toEqual(
    arenasOfDay({day: DAY, arenas: POOL, plays: []}),
  );
});

it("draws an arena played in the last week much less often than one nobody has played", () => {
  // arena-0 and arena-1 are the most played every day, so they stay; arena-5 is played once every day; arena-6 never is.
  const days = Array.from({length: 300}, (_, index) => index + 100);
  const plays = days.flatMap(day => [
    play("arena-0", day - 1, 1000),
    play("arena-1", day - 1, 1000),
    play("arena-5", day - 1, 1),
  ]);
  const timesDrawn = (name: string): number => {
    return days.filter(day => arenasOfDay({day, arenas: POOL, plays}).includes(name)).length;
  };

  expect(timesDrawn("arena-5")).toBeLessThan(timesDrawn("arena-6") * 0.5);
});

function play(arena: string, day: number, count: number): ArenaPlays {
  return {arena, day, count};
}
