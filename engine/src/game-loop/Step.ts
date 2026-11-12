import {advanceBullets} from "@gunsmith/engine/bullet/AdvanceBullets";
import {fireBullet} from "@gunsmith/engine/bullet/FireBullet";
import {aimPlayer} from "@gunsmith/engine/player/AimPlayer";
import {movePlayer} from "@gunsmith/engine/player/MovePlayer";
import type {Player} from "@gunsmith/engine/player/types/Player";
import type {Input} from "@gunsmith/engine/game-loop/types/Input";
import type {World} from "@gunsmith/engine/game-loop/types/World";
import {equippedWeapon} from "@gunsmith/engine/loadout/EquippedWeapon";
import {reloadWeapon} from "@gunsmith/engine/weapon/ReloadWeapon";
import {spendRound} from "@gunsmith/engine/weapon/SpendRound";
import {switchWeapon} from "@gunsmith/engine/loadout/SwitchWeapon";
import {pullTrigger} from "@gunsmith/engine/weapon/TriggerPull";

/**
 * Plays `seconds` of game time and returns the world that results. The same world and input always give the same
 * answer: there is no clock and no randomness in here. The caller steps in small, fixed increments (`pushOutOfWalls`
 * explains why), and the engine caps what an input may ask for, so a client cannot walk faster by asking.
 *
 * In order: the weapon is switched (which cancels a reload), the reload starts or counts down (so a switch and a reload
 * asked for together reload the new weapon), the player walks, turns to the aim, the bullets already flying move on (and
 * hurt any dummy they reach), and then the trigger is pulled, so a shot fired this step starts to move on the next one.
 * A shot spends a round and leaves with the damage and speed of the weapon in hand; a reload that finishes this step
 * lets the weapon fire in the same step.
 */
export function step(world: World, input: Input, seconds: number): World {
  const ready = reloadWeapon(switchWeapon(world.player, input.switchTo), input.reload, seconds);
  const carriedWeapon = equippedWeapon(ready);
  const position = movePlayer(world.arena, ready.position, input.direction, seconds);
  const aim = aimPlayer(ready.aim, position, input.aimAt);
  const trigger = pullTrigger({
    cooldownSeconds: ready.cooldownSeconds,
    firing: input.firing,
    seconds,
    fireIntervalSeconds: carriedWeapon.weapon.fireIntervalSeconds,
    rounds: carriedWeapon.rounds,
    reloading: ready.reloadRemainingSeconds !== undefined,
  });

  const bulletFlight = advanceBullets(world.arena, {bullets: world.bullets, dummies: world.dummies, seconds});
  let bullets = bulletFlight.bullets;
  let player: Player = {...ready, position, aim, cooldownSeconds: trigger.cooldownSeconds};
  if (trigger.fires) {
    bullets = [...bullets, fireBullet(position, aim, carriedWeapon.weapon)];
    player = spendRound(player);
  }

  return {
    ...world,
    player,
    bullets,
    dummies: bulletFlight.dummies,
    elapsedSeconds: world.elapsedSeconds + seconds,
  };
}
