import {chooseStartingPlaces} from "@gunsmith/engine/arena-symmetry/ChooseStartingPlaces";
import {startAtPlaces} from "@gunsmith/engine/arena-symmetry/StartAtPlaces";
import {disarmOpponent} from "@gunsmith/engine/opponent/DisarmOpponent";
import {giveOpponentBrain} from "@gunsmith/engine/opponent/GiveOpponentBrain";
import {engine} from "@gunsmith/engine/Engine";
import type {World} from "@gunsmith/engine/game-loop/types/World";
import {startPickup} from "@gunsmith/engine/pickup/StartPickup";
import type {Pickup} from "@gunsmith/engine/pickup/types/Pickup";
import {startMatch} from "@gunsmith/engine/match/StartMatch";
import {startRing} from "@gunsmith/engine/ring/StartRing";
import {DEFAULT_RING_TIMING} from "@gunsmith/engine/ring/DefaultRingTiming";
import type {Ring} from "@gunsmith/engine/ring/types/Ring";
import type {RingTiming} from "@gunsmith/engine/ring/types/RingTiming";
import {SUBMACHINE_GUN} from "@gunsmith/engine/weapon/weapons/SubmachineGun";
import {DUEL_ARENA} from "@src/game/duel/DuelArena";
import {DUEL_OPPONENT} from "@src/game/duel/DuelOpponent";
import {FAIR_DUEL_ARENA} from "@src/game/fair-duel/FairDuelArena";
import {HEIGHTS_ARENA} from "@src/game/heights/HeightsArena";
import {HEIGHTS_DUMMIES} from "@src/game/heights/HeightsDummies";
import {OVERLOOK_OPPONENT} from "@src/game/overlook/OverlookOpponent";
import {OVERLOOK_PLAYER} from "@src/game/overlook/OverlookPlayer";
import {PICKUP_RACE_PICKUP} from "@src/game/pickup-race/PickupRacePickup";
import {PRACTICE_ARENA} from "@src/game/practice/PracticeArena";
import {PRACTICE_DUMMIES} from "@src/game/practice/PracticeDummies";
import {TERRACED_ARENA} from "@src/game/terraced/TerracedArena";
import {TERRACED_OPPONENT} from "@src/game/terraced/TerracedOpponent";
import {terrainPreview} from "@src/game/terrain-preview/TerrainPreview";
import type {Scenario} from "@src/game/scenario/types/Scenario";

/**
 * A fresh game for the scenario: the practice range has its dummies and no opponent, the duel has an opponent with a
 * brain that draws its choices from `seed`, and no dummies, and is the first round of a best-of-three with a ring
 * counting down to its start (the only scenario that is a match, and the only one that always has a ring), and sparring is
 * the duel with an opponent who has no brain and cannot shoot, so it stands and takes it, in one round with no score, and the
 * heights arena is the player and a dummy on each level, with one stair up to a platform, and the terraced duel is the duel's opponent
 * on low ground below a platform where the player starts, in one round (no score) with a ring, and the overlook is the same arena the
 * other way round, the opponent on the platform and the player on the low ground in its sight, in one round with no ring, and the pickup race is the
 * duel's arena and fighters in one round with no ring, with the weapon lying close to the opponent and far from the player.
 *
 * The duel and sparring also have a weapon lying between the fighters (`pickupOf`), drawn from `seed`.
 *
 * The ring closes on a point drawn from `seed`, and keeps `ringTiming` when the page asked for one (`?ringDelay=`,
 * `?ringClosing=`), otherwise the game's own. Sparring has a ring only when the page asks for ring timing, so a spec can watch
 * the ring alone hurt a fighter who stands still; the practice range and the heights arena never have one.
 */
export function worldOfScenario(scenario: Scenario, seed: number, ringTiming?: RingTiming): World {
  if (scenario === "room") {
    return engine.startingWorld(DUEL_ARENA);
  }

  if (scenario === "duel") {
    const world = giveOpponentBrain(engine.startingWorld(DUEL_ARENA, [], DUEL_OPPONENT), seed);

    return {
      ...world,
      match: startMatch(),
      ring: ringOf(world, seed, ringTiming ?? DEFAULT_RING_TIMING),
      pickup: pickupOf(world, seed),
    };
  }

  if (scenario === "sparring") {
    const standing = engine.startingWorld(DUEL_ARENA, [], DUEL_OPPONENT);
    const world = {...disarmOpponent(standing), pickup: pickupOf(standing, seed)};
    if (!ringTiming) {
      return world;
    }

    return {...world, ring: ringOf(world, seed, ringTiming)};
  }

  if (scenario === "terraced") {
    const world = giveOpponentBrain(engine.startingWorld(TERRACED_ARENA, [], TERRACED_OPPONENT), seed);

    return {...world, ring: ringOf(world, seed, ringTiming ?? DEFAULT_RING_TIMING)};
  }

  if (scenario === "overlook") {
    const world = giveOpponentBrain(engine.startingWorld(TERRACED_ARENA, [], OVERLOOK_OPPONENT), seed);

    return {...world, player: {...world.player, position: OVERLOOK_PLAYER}};
  }

  if (scenario === "pickup-race") {
    const world = giveOpponentBrain(engine.startingWorld(DUEL_ARENA, [], DUEL_OPPONENT), seed);

    return {...world, pickup: {position: PICKUP_RACE_PICKUP, weapon: SUBMACHINE_GUN}};
  }

  if (scenario === "fair-duel") {
    return fairDuelOf(seed, ringTiming ?? DEFAULT_RING_TIMING);
  }

  if (scenario === "heights") {
    return engine.startingWorld(HEIGHTS_ARENA, HEIGHTS_DUMMIES);
  }

  if (scenario === "terrain") {
    return terrainPreview();
  }

  return engine.startingWorld(PRACTICE_ARENA, PRACTICE_DUMMIES);
}

/**
 * The fair duel: the fighters on a matching pair of places drawn from `seed`, the opponent's brain, a ring and a weapon lying in
 * the arena, in one round. The arena is drawn to have such places (`BuiltInArenas.test.ts`), so none is a mistake in the drawing.
 */
function fairDuelOf(seed: number, ringTiming: RingTiming): World {
  const places = chooseStartingPlaces(FAIR_DUEL_ARENA, seed);
  if (!places) {
    throw new Error("The fair duel's arena has no matching pair of starting places.");
  }

  const world = giveOpponentBrain(
    startAtPlaces(engine.startingWorld(FAIR_DUEL_ARENA, [], places.opponent), places),
    seed,
  );

  return {...world, ring: ringOf(world, seed, ringTiming), pickup: pickupOf(world, seed)};
}

/** The ring for a world that has an opponent: it closes on ground both fighters can walk to from where they start. */
function ringOf(world: World, seed: number, timing: RingTiming): Ring {
  const starts = [world.player.position];
  if (world.opponent) {
    starts.push(world.opponent.position);
  }

  return startRing({arena: world.arena, starts, seed, timing});
}

/** The weapon lying in the arena for a world that has an opponent: as far from one fighter as the other by the way they would walk, drawn from `seed`. */
function pickupOf(world: World, seed: number): Pickup {
  const starts = [world.player.position];
  if (world.opponent) {
    starts.push(world.opponent.position);
  }

  return startPickup({arena: world.arena, starts, seed, weapon: SUBMACHINE_GUN});
}
