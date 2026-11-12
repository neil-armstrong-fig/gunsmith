import {advanceBullets} from "@gunsmith/engine/bullet/AdvanceBullets";
import {fireBullet} from "@gunsmith/engine/bullet/FireBullet";
import {aimPlayer} from "@gunsmith/engine/player/AimPlayer";
import {movePlayer} from "@gunsmith/engine/player/MovePlayer";
import type {Input} from "@gunsmith/engine/game-loop/types/Input";
import type {World} from "@gunsmith/engine/game-loop/types/World";
import {pullTrigger} from "@gunsmith/engine/weapon/TriggerPull";

/**
 * Plays `seconds` of game time and returns the world that results. The same world and input always give the same
 * answer: there is no clock and no randomness in here. The caller steps in small, fixed increments (`pushOutOfWalls`
 * explains why), and the engine caps what an input may ask for, so a client cannot walk faster by asking.
 *
 * In order: the player walks, turns to the aim, the bullets already flying move on (and hurt any dummy they reach), and
 * then the trigger is pulled, so a shot fired this step starts to move on the next one.
 */
export function step(world: World, input: Input, seconds: number): World {
  const position = movePlayer(world.arena, world.player.position, input.direction, seconds);
  const aim = aimPlayer(world.player.aim, position, input.aimAt);
  const trigger = pullTrigger(world.player.cooldownSeconds, input.firing, seconds);

  const bulletFlight = advanceBullets(world.arena, {bullets: world.bullets, dummies: world.dummies, seconds});
  let bullets = bulletFlight.bullets;
  if (trigger.fires) {
    bullets = [...bullets, fireBullet(position, aim)];
  }

  return {
    ...world,
    player: {position, aim, cooldownSeconds: trigger.cooldownSeconds},
    bullets,
    dummies: bulletFlight.dummies,
    elapsedSeconds: world.elapsedSeconds + seconds,
  };
}
