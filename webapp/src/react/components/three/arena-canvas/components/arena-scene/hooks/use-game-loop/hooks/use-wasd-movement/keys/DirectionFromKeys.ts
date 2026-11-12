import type {Direction} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/hooks/use-wasd-movement/types/Direction";

/** Turns the held WASD keys (as `KeyboardEvent.code`s) into a heading, so a diagonal is no faster than a straight line. */
export function directionFromKeys(heldKeys: ReadonlySet<string>): Direction {
  const x = axis(heldKeys.has("KeyD"), heldKeys.has("KeyA"));
  const y = axis(heldKeys.has("KeyW"), heldKeys.has("KeyS"));
  const length = Math.hypot(x, y);
  if (length === 0) {
    return {x: 0, y: 0};
  }

  return {x: x / length, y: y / length};
}

function axis(positive: boolean, negative: boolean): number {
  if (positive === negative) {
    return 0;
  }

  if (positive) {
    return 1;
  }

  return -1;
}
