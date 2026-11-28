import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {FAIR_DUEL_BUILT_IN_ARENA} from "@gunsmith/engine/arena/built-in/FairDuelBuiltInArena";
import {giveOpponentBrain} from "@gunsmith/engine/opponent/GiveOpponentBrain";
import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import type {Pickup} from "@gunsmith/engine/pickup/types/Pickup";
import {startPickup} from "@gunsmith/engine/pickup/StartPickup";
import {SUBMACHINE_GUN} from "@gunsmith/engine/weapon/weapons/SubmachineGun";
import {startRing} from "@gunsmith/engine/ring/StartRing";
import {DEFAULT_RING_TIMING} from "@gunsmith/engine/ring/DefaultRingTiming";
import type {Ring} from "@gunsmith/engine/ring/types/Ring";
import type {RingTiming} from "@gunsmith/engine/ring/types/RingTiming";
import {DUEL_ARENA} from "@src/game/scenario/round/world-of-scenario/setups/duel/DuelArena";
import {DUEL_OPPONENT} from "@src/game/scenario/round/world-of-scenario/setups/duel/DuelOpponent";
import {duelWorldOn} from "@src/game/scenario/round/DuelWorldOn";
import {nextRoundOfPage} from "@src/game/scenario/round/NextRoundOfPage";

beforeEach(() => {
  vi.stubGlobal("location", {search: "?scenario=duel&seed=5"});
});

afterEach(() => {
  vi.unstubAllGlobals();
});

it("makes a fresh duel round with the opponent's seed moved on by one", () => {
  const world = nextRoundOfPage({playerWins: 0, opponentWins: 1, roundNumber: 1});

  expect(world).toEqual({
    ...giveOpponentBrain(startingWorld(DUEL_ARENA, [], DUEL_OPPONENT), 6),
    match: {playerWins: 0, opponentWins: 1, roundNumber: 2},
    ring: duelRing(6),
    pickup: duelPickup(6),
  });
});

it("draws the ring's centre from that moved-on seed, so each round closes on a new place", () => {
  const first = nextRoundOfPage({playerWins: 0, opponentWins: 1, roundNumber: 1});
  const centres = new Set<string>();
  for (let roundNumber = 1; roundNumber <= 12; roundNumber++) {
    centres.add(JSON.stringify(nextRoundOfPage({playerWins: 0, opponentWins: 0, roundNumber}).ring?.centre));
  }

  expect(first.ring?.centre).toEqual(duelRing(6).centre);
  expect(centres.size).toBeGreaterThan(3);
});

it("keeps the ring timing the page asked for, in every round", () => {
  vi.stubGlobal("location", {search: "?scenario=duel&seed=5&ringDelay=2&ringClosing=9"});
  const world = nextRoundOfPage({playerWins: 0, opponentWins: 1, roundNumber: 1});

  expect(world.ring).toEqual(duelRing(6, {startDelaySeconds: 2, closingSeconds: 9}));
});

it("keeps the score and goes up one round", () => {
  const world = nextRoundOfPage({playerWins: 1, opponentWins: 1, roundNumber: 2});

  expect(world.match).toEqual({playerWins: 1, opponentWins: 1, roundNumber: 3});
});

it("moves the seed on by a round each time, so a match replays exactly from its seed", () => {
  expect(nextRoundOfPage({playerWins: 1, opponentWins: 0, roundNumber: 2}).opponentBrain?.seed).toBe(7);
});

it("puts both fighters back at full health and full magazines", () => {
  const world = nextRoundOfPage({playerWins: 0, opponentWins: 1, roundNumber: 1});
  const fresh = startingWorld(DUEL_ARENA, [], DUEL_OPPONENT);

  expect(world.player).toEqual(fresh.player);
  expect(world.opponent).toEqual(fresh.opponent);
  expect(world.round).toBe("playing");
  expect(world.bullets).toEqual([]);
});

it("carries the weapons a player locked in at the pre-round into the round, the opponent keeping its own", () => {
  const picks = {first: SUBMACHINE_GUN, second: SUBMACHINE_GUN};
  const world = nextRoundOfPage({playerWins: 0, opponentWins: 1, roundNumber: 1}, picks);
  const plain = nextRoundOfPage({playerWins: 0, opponentWins: 1, roundNumber: 1});

  expect(world.player.loadout.map(carried => carried.weapon)).toEqual([SUBMACHINE_GUN, SUBMACHINE_GUN]);
  expect(world.opponent).toEqual(plain.opponent);
});

function duelRing(seed: number, timing: RingTiming = DEFAULT_RING_TIMING): Ring {
  const {player} = startingWorld(DUEL_ARENA, [], DUEL_OPPONENT);

  return startRing({arena: DUEL_ARENA, starts: [player.position, DUEL_OPPONENT], seed, timing});
}

function duelPickup(seed: number): Pickup {
  const {player} = startingWorld(DUEL_ARENA, [], DUEL_OPPONENT);

  return startPickup({arena: DUEL_ARENA, starts: [player.position, DUEL_OPPONENT], seed, weapon: SUBMACHINE_GUN});
}

it("is a round on the arena the pre-round settled on, with the score kept and the opponent's seed moved on", () => {
  const arena = arenaFrom(FAIR_DUEL_BUILT_IN_ARENA.rows);

  const world = nextRoundOfPage({playerWins: 1, opponentWins: 0, roundNumber: 1}, undefined, arena);

  expect(world).toEqual({...duelWorldOn(arena, 6), match: {playerWins: 1, opponentWins: 0, roundNumber: 2}});
});
