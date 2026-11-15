import type {World} from "@gunsmith/engine/game-loop/types/World";
import {levelAt} from "@gunsmith/engine/height/LevelAt";
import {equippedWeapon} from "@gunsmith/engine/loadout/EquippedWeapon";
import {secondsUntilRing} from "@gunsmith/engine/ring/SecondsUntilRing";
import {coneOf} from "@gunsmith/engine/vision/ConeOf";
import {visibleToPlayer} from "@gunsmith/engine/vision/VisibleToPlayer";
import type {GameStateSnapshot} from "@gunsmith/shared/state-hook/types/GameStateSnapshot";
import type {MatchSnapshot} from "@gunsmith/shared/state-hook/types/MatchSnapshot";
import type {OpponentSnapshot} from "@gunsmith/shared/state-hook/types/OpponentSnapshot";
import type {RingSnapshot} from "@gunsmith/shared/state-hook/types/RingSnapshot";

/** A copy of the game as it stands, for the state hook. A copy, so nothing that reads it can change the game. */
export function snapshotOf(world: World): GameStateSnapshot {
  const {position, aim, equippedIndex, reloadRemainingSeconds} = world.player;
  const carried = equippedWeapon(world.player);
  const visible = visibleToPlayer(world);

  return {
    arena: {width: world.arena.width, height: world.arena.height},
    player: {
      x: position.x,
      y: position.y,
      aimDegrees: (Math.atan2(aim.y, aim.x) * 180) / Math.PI,
      level: levelAt(world.arena, position),
      health: world.player.health,
    },
    weapon: {
      slot: equippedIndex + 1,
      rounds: carried.rounds,
      reserve: carried.reserve,
      reloading: reloadRemainingSeconds !== undefined,
    },
    vision: {degrees: carried.weapon.visionDegrees, range: coneOf(world.arena, world.player).range},
    opponent: opponentSnapshotOf(world, visible.opponent),
    round: world.round,
    match: matchSnapshotOf(world),
    ring: ringSnapshotOf(world),
    bullets: world.bullets.map(bullet => ({x: bullet.position.x, y: bullet.position.y})),
    dummies: world.dummies.map((dummy, index) => ({
      x: dummy.position.x,
      y: dummy.position.y,
      health: dummy.health,
      visible: visible.dummies[index] === true,
    })),
    elapsedSeconds: world.elapsedSeconds,
  };
}

function opponentSnapshotOf(world: World, visible: boolean): OpponentSnapshot | undefined {
  const {opponent} = world;
  if (!opponent) {
    return undefined;
  }

  return {
    x: opponent.position.x,
    y: opponent.position.y,
    health: opponent.health,
    rounds: equippedWeapon(opponent).rounds,
    visible,
    behaviour: world.opponentBrain?.state,
  };
}

function matchSnapshotOf(world: World): MatchSnapshot | undefined {
  const {match} = world;
  if (!match) {
    return undefined;
  }

  return {playerWins: match.playerWins, opponentWins: match.opponentWins, round: match.roundNumber};
}

function ringSnapshotOf(world: World): RingSnapshot | undefined {
  const {ring} = world;
  if (!ring) {
    return undefined;
  }

  return {secondsUntilStart: secondsUntilRing(ring)};
}
