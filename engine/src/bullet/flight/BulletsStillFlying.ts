import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import {raisedFloor} from "@gunsmith/engine/bullet/flight/raised-floor/RaisedFloor";
import type {Bullet} from "@gunsmith/engine/bullet/types/Bullet";
import type {Meeting} from "@gunsmith/engine/bullet/types/Meeting";

/**
 * The bullets that met nothing, each moved on along its direction by `seconds` at its own speed, its floor raised by the ground
 * it passed up onto (`raisedFloor`). Every other bullet is gone.
 */
export function bulletsStillFlying(arena: Arena, meetings: readonly Meeting[], seconds: number): Bullet[] {
  return meetings.filter(meeting => meeting.contact === "none").map(meeting => movedOn(arena, meeting.bullet, seconds));
}

function movedOn(arena: Arena, bullet: Bullet, seconds: number): Bullet {
  const distance = bullet.speed * seconds;

  return {
    ...bullet,
    position: {
      x: bullet.position.x + bullet.direction.x * distance,
      y: bullet.position.y + bullet.direction.y * distance,
    },
    floor: raisedFloor(arena, bullet, distance),
  };
}
