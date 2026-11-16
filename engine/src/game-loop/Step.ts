import {advanceBullets} from "@gunsmith/engine/bullet/AdvanceBullets";
import type {Bullet} from "@gunsmith/engine/bullet/types/Bullet";
import {prepareFighter} from "@gunsmith/engine/game-loop/fighter/PrepareFighter";
import {shootFighter} from "@gunsmith/engine/game-loop/fighter/ShootFighter";
import type {Input} from "@gunsmith/engine/game-loop/types/Input";
import type {World} from "@gunsmith/engine/game-loop/types/World";
import {takeDamage} from "@gunsmith/engine/health/TakeDamage";
import {scoreRound} from "@gunsmith/engine/match/ScoreRound";
import {takePickup} from "@gunsmith/engine/pickup/TakePickup";
import {thinkOpponent} from "@gunsmith/engine/opponent/ThinkOpponent";
import type {Player} from "@gunsmith/engine/player/types/Player";
import {advanceRing} from "@gunsmith/engine/ring/AdvanceRing";
import {ringDamageOver} from "@gunsmith/engine/ring/damage/RingDamageOver";
import type {Ring} from "@gunsmith/engine/ring/types/Ring";
import {decideRound} from "@gunsmith/engine/round/DecideRound";

/**
 * Plays `seconds` of game time and returns the world that results. The same world and input always give the same
 * answer: there is no clock and no randomness in here. The caller steps in small, fixed increments (`pushOutOfWalls`
 * explains why), and the engine caps what an input may ask for, so a client cannot walk faster by asking.
 *
 * In order: each fighter, the player by `input` and the opponent (if there is one) by what its brain asks for
 * (`thinkOpponent`, which also gives the brain it carries into the next step), plays their own part by the same rules (`prepareFighter`: switch weapon, reload, walk, turn, judge
 * the trigger). Then the bullets already flying move on, hurting any dummy or fighter they reach, and then the triggers
 * are let go, so a shot fired this step starts to move on the next one. A shot spends a round and leaves with the damage
 * and speed of the weapon in hand; a reload that finishes this step lets the weapon fire in the same step. When either
 * side is out of health the round is decided and, in a match, scored once (the frozen world below never scores it again);
 * after that the world is frozen and only the clock runs. A world with a ring runs the ring's own clock on by `seconds`
 * in each step that is fought, so it stops with the round, unlike `elapsedSeconds`, and a fighter outside the ring, as it
 * stands at the end of the step, loses health to it with any bullet damage, before the round is decided; the practice
 * dummies and the bullets in the air are not hurt by it. Last, a fighter with health left who stands within reach of the
 * pickup lying in the arena takes it (`takePickup`), and a frozen world takes nothing.
 */
export function step(world: World, input: Input, seconds: number): World {
  if (world.round !== "playing") {
    return {...world, elapsedSeconds: world.elapsedSeconds + seconds};
  }

  const playerTurn = prepareFighter({arena: world.arena, fighter: world.player, input, seconds});
  const opponentDecision = thinkOpponent(world, seconds);
  const opponentTurn =
    world.opponent &&
    prepareFighter({arena: world.arena, fighter: world.opponent, input: opponentDecision.input, seconds});

  const bulletFlight = advanceBullets(world.arena, {
    bullets: world.bullets,
    dummies: world.dummies,
    playerPosition: playerTurn.fighter.position,
    opponentPosition: opponentTurn?.fighter.position,
    seconds,
  });

  const playerShot = shootFighter(world.arena, "player", playerTurn);
  const opponentShot = opponentTurn && shootFighter(world.arena, "opponent", opponentTurn);
  const bullets: Bullet[] = [...bulletFlight.bullets];
  for (const shot of [playerShot, opponentShot]) {
    if (shot?.bullet) {
      bullets.push(shot.bullet);
    }
  }

  const ring = world.ring && advanceRing(world.ring, seconds);
  const player = hurt(playerShot.fighter, bulletFlight.playerDamage + ringDamageTo(ring, playerShot.fighter, seconds));
  const opponent =
    opponentShot &&
    hurt(opponentShot.fighter, bulletFlight.opponentDamage + ringDamageTo(ring, opponentShot.fighter, seconds));

  const round = decideRound({playerHealth: player.health, opponentHealth: opponent?.health});
  const taking = takePickup(world.pickup, {player, opponent});

  return {
    ...world,
    player: taking.player,
    opponent: taking.opponent,
    pickup: taking.pickup,
    opponentBrain: opponentDecision.brain,
    bullets,
    dummies: bulletFlight.dummies,
    elapsedSeconds: world.elapsedSeconds + seconds,
    round,
    match: world.match && scoreRound(world.match, round),
    ring,
  };
}

/** What the ring, as it stands at the end of this step, takes off a fighter: nothing when the world has no ring. */
function ringDamageTo(ring: Ring | undefined, fighter: Player, seconds: number): number {
  if (!ring) {
    return 0;
  }

  return ringDamageOver(ring, fighter.position, seconds);
}

function hurt(fighter: Player, damage: number): Player {
  return {...fighter, health: takeDamage(fighter.health, damage)};
}
