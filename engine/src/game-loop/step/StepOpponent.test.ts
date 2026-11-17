import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {giveOpponentBrain} from "@gunsmith/engine/opponent/GiveOpponentBrain";
import {PLAYER_HEALTH} from "@gunsmith/engine/health/PlayerHealth";
import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import {step} from "@gunsmith/engine/game-loop/Step";
import type {World} from "@gunsmith/engine/game-loop/types/World";
import {RIFLE} from "@gunsmith/engine/weapon/weapons/Rifle";
import {SUBMACHINE_GUN} from "@gunsmith/engine/weapon/weapons/SubmachineGun";
import {arena} from "@gunsmith/engine/game-loop/step/testing/Arena";
import {TICK} from "@gunsmith/engine/game-loop/step/testing/Tick";
import {IDLE} from "@gunsmith/engine/game-loop/step/testing/Idle";
import {upstairs} from "@gunsmith/engine/game-loop/step/testing/Upstairs";
import {playTicks} from "@gunsmith/engine/game-loop/step/testing/PlayTicks";
import {opponentOf} from "@gunsmith/engine/game-loop/step/testing/OpponentOf";

describe("with a seeded opponent", () => {
  const wallInTheMiddle = ["###############", ...Array.from({length: 7}, () => "#.....#.......#"), "###############"];

  it("plays the opponent by its brain, and carries the brain it comes to on in the world", () => {
    const world = duel();
    const after = step(world, IDLE, TICK);

    expect(world.opponentBrain?.state).toBe("wander");
    expect(after.opponentBrain?.state).toBe("engage");
    expect(after.opponentBrain?.seenSeconds).toBeCloseTo(TICK, 9);
  });

  it("leaves an opponent with no brain where it stands, without firing: a still target", () => {
    const still = startingWorld(arena, [], {x: 11.5, y: 4.5});
    const after = playTicks(still, IDLE, 300);

    expect(opponentOf(after).position).toEqual({x: 11.5, y: 4.5});
    expect(after.bullets).toEqual([]);
    expect(after.opponentBrain).toBeUndefined();
    expect(after.player.health).toBe(PLAYER_HEALTH);
  });

  it("steps the same world to the same next world", () => {
    expect(step(duel(7), IDLE, TICK)).toEqual(step(duel(7), IDLE, TICK));
  });

  it("lets different seeds play a match out differently", () => {
    const positions = new Set<string>();
    for (let seed = 1; seed <= 6; seed++) {
      const after = playTicks(duel(seed), IDLE, 120);
      positions.add(`${opponentOf(after).position.x.toFixed(3)},${opponentOf(after).position.y.toFixed(3)}`);
    }

    expect(positions.size).toBeGreaterThan(1);
  });

  it("has the opponent open fire, with a bullet marked as its own, once its reaction time has passed", () => {
    const bullet = untilFound(duel(), 120, world => world.bullets.find(candidate => candidate.shooter === "opponent"));

    expect(bullet?.shooter).toBe("opponent");
  });

  it("fires the opponent's bullet at the level of the ground it stands on", () => {
    const bullet = untilFound({...duel(), arena: upstairs}, 120, world => {
      return world.bullets.find(candidate => candidate.shooter === "opponent");
    });

    expect(bullet?.level).toBe(1);
  });

  it("does not have the opponent fire in its first moments, while it still reacts", () => {
    expect(playTicks(duel(), IDLE, 20).bullets).toEqual([]);
  });

  it("spends a round of the opponent's own for each shot it fires, and none of the player's", () => {
    const spent = untilFound(duel(), 240, world => {
      const rounds = opponentOf(world).loadout[0]?.rounds;
      if (rounds !== undefined && rounds < RIFLE.magazineSize) {
        return world;
      }

      return undefined;
    });

    expect(spent?.player.loadout[0]?.rounds).toBe(RIFLE.magazineSize);
  });

  it("has the opponent hold its fire when a wall stands between it and the player, however long it wanders", () => {
    const world = duel();
    const behindWall = {
      ...world,
      player: {...world.player, position: {x: 1.5, y: 4.5}},
      arena: arenaFrom(wallInTheMiddle),
    };

    expect(untilFound(behindWall, 900, after => after.bullets[0])).toBeUndefined();
  });

  it("hurts a player who stands still in front of the opponent", () => {
    const after = playTicks(duel(), IDLE, 600);

    expect(after.player.health).toBeLessThan(PLAYER_HEALTH);
  });

  it("loses the round for a player who stands still long enough", () => {
    const lost = untilFound(duel(), 3600, world => {
      if (world.round === "lost") {
        return world;
      }

      return undefined;
    });

    expect(lost?.player.health).toBe(0);
  });

  it("has the opponent reload when it has run dry", () => {
    const world = duel();
    const dry = {
      ...world,
      opponent: {...opponentOf(world), loadout: opponentOf(world).loadout.map(carried => ({...carried, rounds: 0}))},
    };

    expect(opponentOf(step(dry, IDLE, TICK)).reloadRemainingSeconds).toBeDefined();
  });

  it("does not let the opponent fire while it reloads", () => {
    const world = duel();
    const dry = {
      ...world,
      opponent: {...opponentOf(world), loadout: opponentOf(world).loadout.map(carried => ({...carried, rounds: 0}))},
    };

    expect(step(dry, IDLE, TICK).bullets).toEqual([]);
  });

  // The same, with the opponent armed as it starts a match, and with a brain to play it by.
  it("sends the opponent to the weapon lying near it, in sight of the player, without firing on the way, and it takes it", () => {
    const lying = {position: {x: 12.5, y: 7.5}, weapon: SUBMACHINE_GUN};
    const taken = untilFound({...duel(), pickup: lying}, 600, world => {
      if (world.pickup === undefined) {
        return world;
      }

      return undefined;
    });

    expect(taken?.opponent?.loadout[1]?.weapon).toBe(SUBMACHINE_GUN);
    expect(taken?.player.health).toBe(PLAYER_HEALTH);
  });

  it("leaves the weapon lying while the player is nearer to it than the opponent is, and the opponent fights", () => {
    const lying = {position: {x: 3.5, y: 4.5}, weapon: SUBMACHINE_GUN};
    const after = playTicks({...duel(), pickup: lying}, IDLE, 60);

    expect(after.pickup).toBe(lying);
    expect(after.opponentBrain?.state).toBe("engage");
  });

  function duel(seed = 1): World {
    return giveOpponentBrain(startingWorld(arena, [], {x: 11.5, y: 4.5}), seed);
  }

  // Plays ticks, standing still, until `found` returns something or `limit` ticks pass.
  function untilFound<Found>(
    world: World,
    limit: number,
    found: (world: World) => Found | undefined,
  ): Found | undefined {
    let current = world;
    for (let tick = 0; tick < limit; tick++) {
      current = step(current, IDLE, TICK);
      const result = found(current);
      if (result !== undefined) {
        return result;
      }
    }

    return undefined;
  }
});
