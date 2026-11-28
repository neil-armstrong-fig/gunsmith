import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {DUEL_BUILT_IN_ARENA} from "@gunsmith/engine/arena/built-in/DuelBuiltInArena";
import {FAIR_DUEL_BUILT_IN_ARENA} from "@gunsmith/engine/arena/built-in/FairDuelBuiltInArena";
import {duelWorldOn} from "@src/game/scenario/round/DuelWorldOn";

const DUEL = arenaFrom(DUEL_BUILT_IN_ARENA.rows);
const FAIR_DUEL = arenaFrom(FAIR_DUEL_BUILT_IN_ARENA.rows);

it("is the first round of a best-of-three on the arena it was given", () => {
  for (const arena of [DUEL, FAIR_DUEL]) {
    const world = duelWorldOn(arena, 4);

    expect(world.arena).toBe(arena);
    expect(world.match).toEqual({playerWins: 0, opponentWins: 0, roundNumber: 1});
  }
});

it("has an opponent with a brain, a ring and a weapon lying about", () => {
  const world = duelWorldOn(DUEL, 4);

  expect(world.opponentBrain).toBeDefined();
  expect(world.ring).toBeDefined();
  expect(world.pickup).toBeDefined();
});

it("starts the fighters on different places, and differently for a different seed", () => {
  const arena = FAIR_DUEL;
  const places = new Set<string>();
  for (let seed = 1; seed <= 20; seed++) {
    const world = duelWorldOn(arena, seed);

    expect(world.player.position).not.toEqual(world.opponent?.position);
    places.add(JSON.stringify(world.player.position));
  }

  expect(places.size).toBeGreaterThan(1);
});

it("is the same world for the same seed", () => {
  const arena = FAIR_DUEL;

  expect(duelWorldOn(arena, 9)).toEqual(duelWorldOn(arena, 9));
});

it("keeps the ring timing it was given", () => {
  const arena = DUEL;

  expect(duelWorldOn(arena, 4, {startDelaySeconds: 1, closingSeconds: 2}).ring).not.toEqual(duelWorldOn(arena, 4).ring);
});
