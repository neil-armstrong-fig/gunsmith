import type {Bullet} from "@gunsmith/engine/bullet/types/Bullet";
import type {World} from "@gunsmith/engine/game-loop/types/World";
import type {Match} from "@gunsmith/engine/match/types/Match";
import type {RoundState} from "@gunsmith/engine/round/types/RoundState";

/**
 * The world as the second fighter would see it were it the player: the two fighters swapped, each bullet belonging to the
 * other side, the score and the round's outcome turned round. Nothing is added or removed, so any rule written for the
 * player (sight, above all) holds for the second seat unchanged. A world with no opponent has no second seat and is
 * returned as it is. What happened to each fighter (`events` and `opponentEvents`) goes with them, so the second seat's
 * events are the player's; the opponent's brain is not the second's and is dropped.
 */
export function mirrorSeats(world: World): World {
  const {opponent} = world;
  if (!opponent) {
    return world;
  }

  return {
    ...world,
    player: opponent,
    opponent: world.player,
    opponentBrain: undefined,
    bullets: world.bullets.map(mirrorBullet),
    round: mirrorRound(world.round),
    match: world.match && mirrorMatch(world.match),
    events: world.opponentEvents,
    opponentEvents: world.events,
    footstep: world.opponentFootstep,
    opponentFootstep: world.footstep,
  };
}

function mirrorBullet(bullet: Bullet): Bullet {
  return {...bullet, shooter: bullet.shooter === "player" ? "opponent" : "player"};
}

/** A won round is the other seat's loss and the reverse; a round still being fought or drawn is the same for both. */
function mirrorRound(round: RoundState): RoundState {
  if (round === "won") {
    return "lost";
  }
  if (round === "lost") {
    return "won";
  }

  return round;
}

function mirrorMatch(match: Match): Match {
  return {...match, playerWins: match.opponentWins, opponentWins: match.playerWins};
}
