import type {Bullet} from "@gunsmith/engine/bullet/types/Bullet";
import type {Shooter} from "@gunsmith/engine/bullet/types/Shooter";
import type {ShotRequest} from "@gunsmith/engine/bullet/types/ShotRequest";
import {PLAYER_RADIUS} from "@gunsmith/engine/player/PlayerRadius";

/** How far past the edge of the shooter's circle a bullet starts, so it never begins inside the one who fired it. */
const MUZZLE_GAP = 0.1;

/** A new bullet leaving `shooter`, who is facing `aim`, from `weapon`: it has that weapon's damage and speed, the level of the shooter's eye and their stance. */
export function fireBullet(shooter: Shooter, shot: ShotRequest): Bullet {
  const {from, aim, weapon, level, crouching} = shot;
  const distance = PLAYER_RADIUS + MUZZLE_GAP;

  return {
    position: {x: from.x + aim.x * distance, y: from.y + aim.y * distance},
    direction: {x: aim.x, y: aim.y},
    damage: weapon.bulletDamage,
    speed: weapon.bulletSpeed,
    shooter,
    level,
    crouching,
  };
}
