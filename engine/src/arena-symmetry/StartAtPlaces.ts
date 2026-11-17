import type {StartingPlaces} from "@gunsmith/engine/arena-symmetry/types/StartingPlaces";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {World} from "@gunsmith/engine/game-loop/types/World";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import type {Player} from "@gunsmith/engine/player/types/Player";

/**
 * The world with the player and the opponent stood on their starting places, each facing the middle of the arena. A half turn
 * takes one place onto the other and turns "towards the middle" into its opposite, so the two face each other's way round and
 * neither is turned towards a wall the other is not. A world with no opponent has only the player placed. Nothing else changes,
 * and the world it is given is not touched.
 */
export function startAtPlaces(world: World, places: StartingPlaces): World {
  const {opponent} = world;
  if (!opponent) {
    return {...world, player: placedAt(world.player, places.player, world.arena)};
  }

  return {
    ...world,
    player: placedAt(world.player, places.player, world.arena),
    opponent: placedAt(opponent, places.opponent, world.arena),
  };
}

function placedAt(fighter: Player, position: Point, arena: Arena): Player {
  const towardsMiddle = {x: arena.width / 2 - position.x, y: arena.height / 2 - position.y};
  const distance = Math.hypot(towardsMiddle.x, towardsMiddle.y);

  return {...fighter, position, aim: {x: towardsMiddle.x / distance, y: towardsMiddle.y / distance}};
}
