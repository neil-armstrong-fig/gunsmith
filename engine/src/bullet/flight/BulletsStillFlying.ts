import type {Bullet} from "@gunsmith/engine/bullet/types/Bullet";
import type {Meeting} from "@gunsmith/engine/bullet/types/Meeting";

/** The bullets that met nothing, each moved on along its direction by `seconds` at its own speed. Every other bullet is gone. */
export function bulletsStillFlying(meetings: readonly Meeting[], seconds: number): Bullet[] {
  return meetings.filter(meeting => meeting.contact === "none").map(meeting => movedOn(meeting.bullet, seconds));
}

function movedOn(bullet: Bullet, seconds: number): Bullet {
  const distance = bullet.speed * seconds;

  return {
    ...bullet,
    position: {
      x: bullet.position.x + bullet.direction.x * distance,
      y: bullet.position.y + bullet.direction.y * distance,
    },
  };
}
