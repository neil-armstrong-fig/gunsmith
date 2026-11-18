import type {Input} from "@gunsmith/engine/game-loop/types/Input";
import type {Point} from "@gunsmith/engine/geometry/types/Point";

/** An aim that moved by less than this many tiles (on either axis) is not worth a frame: the server would aim the same to the eye. A tunable. */
const AIM_MOVE_WORTH_SENDING = 0.01;

/**
 * Whether `next` differs from `previous` enough that the server must be told. The browser sends an input when it changes, not every
 * step (plus a slow heartbeat), so an idle player costs almost nothing. A reload or a weapon switch is asked once, so it is always a change.
 */
export function inputChanged(previous: Input, next: Input): boolean {
  if (next.reload || next.switchTo !== undefined) {
    return true;
  }
  if (previous.direction.x !== next.direction.x || previous.direction.y !== next.direction.y) {
    return true;
  }
  if (previous.firing !== next.firing || Boolean(previous.crouching) !== Boolean(next.crouching)) {
    return true;
  }

  return aimChanged(previous.aimAt, next.aimAt);
}

function aimChanged(previous: Point | undefined, next: Point | undefined): boolean {
  if (!previous || !next) {
    return previous !== next;
  }

  return (
    Math.abs(previous.x - next.x) >= AIM_MOVE_WORTH_SENDING || Math.abs(previous.y - next.y) >= AIM_MOVE_WORTH_SENDING
  );
}
