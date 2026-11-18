import type {Player} from "@gunsmith/engine/player/types/Player";
import type {BlendRequest} from "@src/online/interpolation/blend/types/BlendRequest";

/**
 * A fighter part of the way from one snapshot's state to the next: the place by a straight line, the aim by the shorter way round. What
 * cannot be blended (health, weapons, stance) is the earlier snapshot's until the later one's time comes.
 */
export function blendFighters(request: BlendRequest): Player {
  const {from, to, share} = request;
  const turn = shortestTurn(Math.atan2(from.aim.y, from.aim.x), Math.atan2(to.aim.y, to.aim.x));
  const heading = Math.atan2(from.aim.y, from.aim.x) + turn * share;

  return {
    ...from,
    position: {
      x: from.position.x + (to.position.x - from.position.x) * share,
      y: from.position.y + (to.position.y - from.position.y) * share,
    },
    aim: {x: Math.cos(heading), y: Math.sin(heading)},
  };
}

/** The angle to add to `from` to reach `to` by the shorter way round, in radians, between minus and plus half a turn. */
function shortestTurn(from: number, to: number): number {
  const turn = (to - from) % (2 * Math.PI);
  if (turn > Math.PI) {
    return turn - 2 * Math.PI;
  }
  if (turn < -Math.PI) {
    return turn + 2 * Math.PI;
  }

  return turn;
}
