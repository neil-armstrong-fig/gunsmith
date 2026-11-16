import type {World} from "@gunsmith/engine/game-loop/types/World";
import {RIFLE} from "@gunsmith/engine/weapon/weapons/Rifle";
import {sparring} from "@gunsmith/engine/game-loop/step/testing/Sparring";

// An opponent's bullet is on the row of the player, two tiles to the east and flying west.
export function shotAtPlayer(playerHealth: number): World {
  const world = sparring();
  const bullet = {
    position: {x: 9.5, y: 4.5},
    direction: {x: -1, y: 0},
    damage: RIFLE.bulletDamage,
    speed: RIFLE.bulletSpeed,
    shooter: "opponent",
    level: 0,
  } as const;

  return {...world, player: {...world.player, health: playerHealth}, bullets: [bullet]};
}
