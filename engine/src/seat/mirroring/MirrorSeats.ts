import type {Bullet} from "@gunsmith/engine/bullet/types/Bullet";
import type {World} from "@gunsmith/engine/game-loop/types/World";
import type {Match} from "@gunsmith/engine/match/types/Match";
import type {RoundState} from "@gunsmith/engine/round/types/RoundState";

/**
 * The world as the second fighter would see it were it the player: the two fighters swapped, each bullet belonging to the
 * other side, the score and the round's outcome turned round. Nothing is added or removed, so any rule written for the
 * player (sight, above all) holds for the second seat unchanged. A world with no opponent has no second seat and is
 * returned as it is. What happened to the first fighter (`events`) and the opponent's brain are not the second's, so
 * they are dropped.
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
    events: undefined,
  };
}

function mirrorBullet(bullet: Bullet): Bullet {
  return {...bullet, shooter: bullet.shooter === "player" ? "opponent" : "player"};
}

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
