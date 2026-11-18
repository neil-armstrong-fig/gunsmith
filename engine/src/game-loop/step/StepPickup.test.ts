import type {Ring} from "@gunsmith/engine/ring/types/Ring";
import {disarmOpponent} from "@gunsmith/engine/opponent/DisarmOpponent";
import {OPPONENT_HEALTH} from "@gunsmith/engine/health/OpponentHealth";
import {step} from "@gunsmith/engine/game-loop/Step";
import type {World} from "@gunsmith/engine/game-loop/types/World";
import {SUBMACHINE_GUN} from "@gunsmith/engine/weapon/weapons/SubmachineGun";
import {MARKSMAN_RIFLE} from "@gunsmith/engine/weapon/weapons/MarksmanRifle";
import {TICK} from "@gunsmith/engine/game-loop/step/testing/Tick";
import {IDLE} from "@gunsmith/engine/game-loop/step/testing/Idle";
import {walking} from "@gunsmith/engine/game-loop/step/testing/Walking";
import {centred} from "@gunsmith/engine/game-loop/step/testing/Centred";

describe("with a pickup lying in the arena", () => {
  const lying = {position: {x: 6.5, y: 4.5}, weapon: SUBMACHINE_GUN};

  it("is taken by the player who walks onto it, who then holds its weapon in the second slot", () => {
    let world: World = {...withPickup(), player: {...withPickup().player, position: {x: 5.0, y: 4.5}}};
    for (let tick = 0; tick < 60; tick++) {
      world = step(world, walking(1, 0), TICK);
    }

    expect(world.pickup).toBeUndefined();
    expect(world.player.loadout[1]?.weapon).toBe(SUBMACHINE_GUN);
    expect(world.player.equippedIndex).toBe(1);
  });

  it("is left lying while nobody is in reach, and stays in the world as it was", () => {
    const world = step(withPickup(), IDLE, TICK);

    expect(world.pickup).toBe(lying);
  });

  it("is taken by the opponent who stands on it", () => {
    const base = withPickup();
    const opponent = {...base.player, position: lying.position, health: OPPONENT_HEALTH};
    const world = step(disarmOpponent({...base, opponent}), IDLE, TICK);

    expect(world.pickup).toBeUndefined();
    expect(world.opponent?.loadout[1]?.weapon).toBe(SUBMACHINE_GUN);
    expect(world.player.loadout[1]?.weapon).toBe(MARKSMAN_RIFLE);
  });

  it("is not taken once the round is over: a frozen world takes nothing", () => {
    const base = withPickup();
    const over: World = {...base, round: "lost", player: {...base.player, position: lying.position}};

    expect(step(over, IDLE, TICK).pickup).toBe(lying);
  });

  it("is not taken by a fighter who falls in the same step", () => {
    const base = withPickup();
    const dying: World = {
      ...base,
      player: {...base.player, position: lying.position, health: 0.001},
      ring: lethalRing(),
    };

    expect(step(dying, IDLE, TICK).pickup).toBe(lying);
  });

  it("is the same from the same world and input, so a replay agrees", () => {
    expect(step(withPickup(), walking(1, 0), TICK)).toEqual(step(withPickup(), walking(1, 0), TICK));
  });

  function withPickup(): World {
    return {...centred(), pickup: lying};
  }
});

/** A ring long since closed, far from the middle, that takes more health a tick than anyone has. */
function lethalRing(): Ring {
  return {
    roundSeconds: 100,
    centre: {x: 14.5, y: 7.5},
    startRadius: 20,
    timing: {startDelaySeconds: 0, closingSeconds: 1, damageScale: 100},
  };
}
