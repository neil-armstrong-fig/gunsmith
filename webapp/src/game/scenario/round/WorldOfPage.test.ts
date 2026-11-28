import {giveOpponentBrain} from "@gunsmith/engine/opponent/GiveOpponentBrain";
import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import {startMatch} from "@gunsmith/engine/match/StartMatch";
import type {Pickup} from "@gunsmith/engine/pickup/types/Pickup";
import {startPickup} from "@gunsmith/engine/pickup/StartPickup";
import {SUBMACHINE_GUN} from "@gunsmith/engine/weapon/weapons/SubmachineGun";
import {startRing} from "@gunsmith/engine/ring/StartRing";
import {DEFAULT_RING_TIMING} from "@gunsmith/engine/ring/DefaultRingTiming";
import type {Ring} from "@gunsmith/engine/ring/types/Ring";
import type {RingTiming} from "@gunsmith/engine/ring/types/RingTiming";
import {DUEL_ARENA} from "@src/game/scenario/round/world-of-scenario/setups/duel/DuelArena";
import {DUEL_OPPONENT} from "@src/game/scenario/round/world-of-scenario/setups/duel/DuelOpponent";
import {worldOfPage} from "@src/game/scenario/round/WorldOfPage";

afterEach(() => {
  vi.unstubAllGlobals();
});

it("makes the duel the page asks for, with the seed the page asks for", () => {
  vi.stubGlobal("location", {search: "?scenario=duel&seed=5"});

  expect(worldOfPage()).toEqual({
    ...giveOpponentBrain(startingWorld(DUEL_ARENA, [], DUEL_OPPONENT), 5),
    match: startMatch(),
    ring: duelRing(5),
    pickup: duelPickup(5),
  });
});

it("gives the duel the ring timing the page asks for", () => {
  vi.stubGlobal("location", {search: "?scenario=duel&seed=5&ringDelay=3&ringClosing=15"});

  expect(worldOfPage().ring).toEqual(duelRing(5, {startDelaySeconds: 3, closingSeconds: 15}));
});

it("gives sparring a ring only when the page asks for ring timing", () => {
  vi.stubGlobal("location", {search: "?scenario=sparring&seed=5"});
  const quiet = worldOfPage().ring;
  vi.stubGlobal("location", {search: "?scenario=sparring&seed=5&ringDelay=1&ringClosing=6"});

  expect(quiet).toBeUndefined();
  expect(worldOfPage().ring?.timing).toEqual({startDelaySeconds: 1, closingSeconds: 6});
});

it("makes a different match, with a fresh seed, each time the page asks for no seed", () => {
  vi.stubGlobal("location", {search: "?scenario=duel"});
  const seeds = new Set<number | undefined>();
  for (let index = 0; index < 10; index++) {
    seeds.add(worldOfPage().opponentBrain?.seed);
  }

  expect(seeds.size).toBeGreaterThan(5);
});

it("makes the practice range when the page asks for nothing", () => {
  vi.stubGlobal("location", {search: ""});

  expect(worldOfPage().opponent).toBeUndefined();
});

function duelRing(seed: number, timing: RingTiming = DEFAULT_RING_TIMING): Ring {
  const {player} = startingWorld(DUEL_ARENA, [], DUEL_OPPONENT);

  return startRing({arena: DUEL_ARENA, starts: [player.position, DUEL_OPPONENT], seed, timing});
}

function duelPickup(seed: number): Pickup {
  const {player} = startingWorld(DUEL_ARENA, [], DUEL_OPPONENT);

  return startPickup({arena: DUEL_ARENA, starts: [player.position, DUEL_OPPONENT], seed, weapon: SUBMACHINE_GUN});
}
