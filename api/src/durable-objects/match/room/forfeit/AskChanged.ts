import type {Input} from "@gunsmith/engine/game-loop/types/Input";
import type {Point} from "@gunsmith/engine/geometry/types/Point";

/** An aim that moves by less than this many tiles (on either axis) is the same aim: the browser does not send it either (`webapp/src/online/prediction/changes/InputChanged`). */
const AIM_MOVE_WORTH_NOTING = 0.01;

/**
 * Whether `input` asks for something new beside what the seat last asked for (`before`): a new direction, the trigger or the crouch key
 * going down or up, the aim moving, a reload or a weapon switch (each is asked once). The same ask sent again, which is what the browser's
 * heartbeat does, is not new, so it is no sign that the person is there.
 */
export function askChanged(before: Input, input: Input): boolean {
  if (input.reload || input.switchTo !== undefined) {
    return true;
  }
  if (before.direction.x !== input.direction.x || before.direction.y !== input.direction.y) {
    return true;
  }
  if (before.firing !== input.firing || Boolean(before.crouching) !== Boolean(input.crouching)) {
    return true;
  }

  return aimChanged(before.aimAt, input.aimAt);
}

function aimChanged(before: Point | undefined, now: Point | undefined): boolean {
  if (!before || !now) {
    return before !== now;
  }

  return Math.abs(before.x - now.x) >= AIM_MOVE_WORTH_NOTING || Math.abs(before.y - now.y) >= AIM_MOVE_WORTH_NOTING;
}
