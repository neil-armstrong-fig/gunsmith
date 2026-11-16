import type {Ring} from "@gunsmith/engine/ring/types/Ring";
import {MAXIMUM_RING_DAMAGE_PER_SECOND} from "@gunsmith/engine/ring/damage/rate/MaximumRingDamage";
import {DUMMY_HEALTH} from "@gunsmith/engine/dummy/DummyHealth";
import {PLAYER_HEALTH} from "@gunsmith/engine/health/PlayerHealth";
import {OPPONENT_HEALTH} from "@gunsmith/engine/health/OpponentHealth";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import {step} from "@gunsmith/engine/game-loop/Step";
import type {World} from "@gunsmith/engine/game-loop/types/World";
import {RIFLE} from "@gunsmith/engine/weapon/weapons/Rifle";
import {arena} from "@gunsmith/engine/game-loop/step/testing/Arena";
import {TICK} from "@gunsmith/engine/game-loop/step/testing/Tick";
import {IDLE} from "@gunsmith/engine/game-loop/step/testing/Idle";
import {centred} from "@gunsmith/engine/game-loop/step/testing/Centred";
import {playTicks} from "@gunsmith/engine/game-loop/step/testing/PlayTicks";
import {sparring} from "@gunsmith/engine/game-loop/step/testing/Sparring";
import {opponentOf} from "@gunsmith/engine/game-loop/step/testing/OpponentOf";
import {shotAtPlayer} from "@gunsmith/engine/game-loop/step/testing/ShotAtPlayer";
import {sparringMatch} from "@gunsmith/engine/game-loop/step/testing/SparringMatch";

describe("with a closing ring", () => {
  // The ring: its clock runs while the round is fought, and whoever stands outside it loses health.
  const RING_TIMING = {startDelaySeconds: 10, closingSeconds: 20};

  const PLAYER_AT = {x: 7.5, y: 4.5};

  const OPPONENT_AT = {x: 11.5, y: 4.5};

  const FAR_CORNER = {x: 1.5, y: 1.5};

  // A ring closed to its final size and hurting at its worst: only the ground within two tiles of its centre is safe.
  const CLOSED = 100;

  it("runs the ring's clock on by the seconds stepped while the round is being fought", () => {
    const after = step(withRing(centred(), ringOn(PLAYER_AT, 2)), IDLE, 0.5);

    expect(after.ring?.roundSeconds).toBe(2.5);
  });

  it("stops the ring's clock once the round is decided, though the world's own clock runs on", () => {
    const ring = ringOn(PLAYER_AT, 0);
    const lost = playTicks({...shotAtPlayer(RIFLE.bulletDamage), ring}, IDLE, 30);
    const later = playTicks(lost, IDLE, 60);

    expect(lost.round).toBe("lost");
    expect(later.elapsedSeconds).toBeGreaterThan(lost.elapsedSeconds);
    expect(later.ring).toEqual(lost.ring);
  });

  it("has no ring when it was not given one", () => {
    expect(playTicks(centred(), IDLE, 10).ring).toBeUndefined();
  });

  it("takes the ring's damage off a player outside it, at the rate the ring has", () => {
    const after = step(withRing(centred(), ringOn(FAR_CORNER, CLOSED)), IDLE, TICK);

    expect(after.player.health).toBeCloseTo(PLAYER_HEALTH - MAXIMUM_RING_DAMAGE_PER_SECOND * TICK, 9);
  });

  it("takes nothing off a player inside it", () => {
    const after = step(withRing(centred(), ringOn(PLAYER_AT, CLOSED)), IDLE, TICK);

    expect(after.player.health).toBe(PLAYER_HEALTH);
  });

  it("takes nothing off anyone before the ring starts, wherever they stand", () => {
    const after = step(withRing(sparring(), ringOn(FAR_CORNER, 0)), IDLE, TICK);

    expect(after.player.health).toBe(PLAYER_HEALTH);
    expect(opponentOf(after).health).toBe(OPPONENT_HEALTH);
  });

  it("uses the rate the ring has at the end of the step, not the one it began with", () => {
    const atTheStart = ringOn(FAR_CORNER, RING_TIMING.startDelaySeconds);
    const after = step(withRing(centred(), {...atTheStart, startRadius: 1}), IDLE, TICK);

    expect(after.player.health).toBeLessThan(PLAYER_HEALTH);
  });

  it("takes the ring's damage off the opponent too, when it is the one outside", () => {
    const after = step(withRing(sparring(), ringOn(PLAYER_AT, CLOSED)), IDLE, TICK);

    expect(opponentOf(after).health).toBeCloseTo(OPPONENT_HEALTH - MAXIMUM_RING_DAMAGE_PER_SECOND * TICK, 9);
    expect(after.player.health).toBe(PLAYER_HEALTH);
  });

  it("takes nothing off an opponent inside it", () => {
    const after = step(withRing(sparring(), ringOn(OPPONENT_AT, CLOSED)), IDLE, TICK);

    expect(opponentOf(after).health).toBe(OPPONENT_HEALTH);
  });

  it("loses the round for a player the ring takes the last health from", () => {
    const dying = {...centred(), player: {...centred().player, health: 0.1}};
    const after = step(withRing(dying, ringOn(FAR_CORNER, CLOSED)), IDLE, TICK);

    expect(after.player.health).toBe(0);
    expect(after.round).toBe("lost");
  });

  it("wins the round for the player when the ring takes the opponent's last health", () => {
    const world = sparring();
    const dying = {...world, opponent: {...opponentOf(world), health: 0.1}};
    const after = step(withRing(dying, ringOn(PLAYER_AT, CLOSED)), IDLE, TICK);

    expect(after.round).toBe("won");
  });

  it("loses the round when the ring takes both fighters' last health in one step, as any simultaneous kill does", () => {
    const world = sparring();
    const dying = {...world, player: {...world.player, health: 0.1}, opponent: {...opponentOf(world), health: 0.1}};
    const after = step(withRing(dying, ringOn(FAR_CORNER, CLOSED)), IDLE, TICK);

    expect(after.round).toBe("lost");
  });

  it("scores a round the ring decides, once, as any other round", () => {
    const world = sparringMatch();
    const dying = {...world, opponent: {...opponentOf(world), health: 0.1}};
    const after = step(withRing(dying, ringOn(PLAYER_AT, CLOSED)), IDLE, TICK);

    expect(after.match).toEqual({playerWins: 1, opponentWins: 0, roundNumber: 1});
  });

  it("does not hurt anyone once the round is over, though the ring is closed on the other side of the arena", () => {
    const lost = playTicks({...shotAtPlayer(RIFLE.bulletDamage), ring: ringOn(OPPONENT_AT, CLOSED)}, IDLE, 30);
    const later = playTicks(lost, IDLE, 60);

    expect(lost.round).toBe("lost");
    expect(opponentOf(later).health).toBe(opponentOf(lost).health);
  });

  it("leaves the practice dummies and the bullets in the air alone: the ring hurts fighters only", () => {
    const ranged = startingWorld(arena, [FAR_CORNER]);
    const after = step(withRing(ranged, ringOn(PLAYER_AT, CLOSED)), IDLE, TICK);

    expect(after.dummies[0]?.health).toBe(DUMMY_HEALTH);
  });

  function ringOn(centre: Point, roundSeconds: number): Ring {
    return {roundSeconds, centre, startRadius: 12, timing: RING_TIMING};
  }

  function withRing(world: World, ring: Ring): World {
    return {...world, ring};
  }
});
