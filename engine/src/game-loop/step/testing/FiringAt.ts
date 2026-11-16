import type {Point} from "@gunsmith/engine/geometry/types/Point";
import type {Input} from "@gunsmith/engine/game-loop/types/Input";
import {IDLE} from "@gunsmith/engine/game-loop/step/testing/Idle";

export function firingAt(target: Point): Input {
  return {...IDLE, aimAt: target, firing: true};
}
