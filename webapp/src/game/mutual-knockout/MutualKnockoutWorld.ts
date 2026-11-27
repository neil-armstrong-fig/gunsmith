import type {Bullet} from "@gunsmith/engine/bullet/types/Bullet";
import type {Shooter} from "@gunsmith/engine/bullet/types/Shooter";
import {engine} from "@gunsmith/engine/Engine";
import type {World} from "@gunsmith/engine/game-loop/types/World";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {startMatch} from "@gunsmith/engine/match/StartMatch";
import {disarmOpponent} from "@gunsmith/engine/opponent/DisarmOpponent";
import {RIFLE} from "@gunsmith/engine/weapon/weapons/Rifle";
import {DUEL_ARENA} from "@src/game/duel/DuelArena";
import {DUEL_OPPONENT} from "@src/game/duel/DuelOpponent";

/** How far from its target each shot starts: inside a step's flight, outside the fighter's body, so both land in the first step. */
const SHOT_GAP_TILES = 0.6;

/**
 * The mutual knockout: the duel's arena and fighters as the first round of a match, with no ring and nothing lying about, the
 * opponent standing still and unarmed, and one rifle shot in the air from each fighter at the other, each landing in the first
 * step and each enough to bring its target down. Both fall together, so the round is drawn and nobody scores (`decideRound`). The next
 * round is the ordinary duel with the score kept.
 */
export function mutualKnockoutWorld(): World {
  const standing = disarmOpponent(engine.startingWorld(DUEL_ARENA, [], DUEL_OPPONENT));
  const {player, opponent} = standing;
  if (!opponent) {
    throw new Error("The mutual knockout needs an opponent.");
  }

  return {
    ...standing,
    player: {...player, health: RIFLE.bulletDamage},
    opponent: {...opponent, health: RIFLE.bulletDamage},
    bullets: [
      shotFrom({x: opponent.position.x - SHOT_GAP_TILES, y: opponent.position.y}, "player"),
      shotFrom({x: player.position.x + SHOT_GAP_TILES, y: player.position.y}, "opponent"),
    ],
    match: startMatch(),
  };
}

/** A rifle shot at `position`, flying toward the other fighter along the row they share: east from the player's side, west from the opponent's. */
function shotFrom(position: Point, shooter: Shooter): Bullet {
  return {
    position,
    direction: directionOf(shooter),
    damage: RIFLE.bulletDamage,
    speed: RIFLE.bulletSpeed,
    shooter,
    level: 0,
    crouching: false,
    floor: 0,
  };
}

function directionOf(shooter: Shooter): Point {
  if (shooter === "player") {
    return {x: 1, y: 0};
  }

  return {x: -1, y: 0};
}
