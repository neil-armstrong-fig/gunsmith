import type {Input} from "@gunsmith/engine/game-loop/types/Input";

export function walking(x: number, y: number): Input {
  return {direction: {x, y}, firing: false, reload: false};
}
