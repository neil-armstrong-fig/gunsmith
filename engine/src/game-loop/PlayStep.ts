import {advanceBullets} from "@gunsmith/engine/bullet/AdvanceBullets";
import type {Bullet} from "@gunsmith/engine/bullet/types/Bullet";
import {eventsOfStep} from "@gunsmith/engine/combat-events/EventsOfStep";
import {prepareFighter} from "@gunsmith/engine/game-loop/fighter/PrepareFighter";
import {shootFighter} from "@gunsmith/engine/game-loop/fighter/ShootFighter";
import type {Play} from "@gunsmith/engine/game-loop/types/Play";
import type {World} from "@gunsmith/engine/game-loop/types/World";
import {takeDamage} from "@gunsmith/engine/health/TakeDamage";
import {scoreRound} from "@gunsmith/engine/match/ScoreRound";
import {takePickup} from "@gunsmith/engine/pickup/TakePickup";
import type {Player} from "@gunsmith/engine/player/types/Player";
import {advanceRing} from "@gunsmith/engine/ring/AdvanceRing";
import {ringDamageOver} from "@gunsmith/engine/ring/damage/RingDamageOver";
import type {Ring} from "@gunsmith/engine/ring/types/Ring";
import {decideRound} from "@gunsmith/engine/round/DecideRound";

/**
 * Plays `seconds` of game time, the one step both `step` (the opponent is a brain) and `stepFighters` (the opponent is a
 * person) are made of, and returns the world that results. It is the whole of the step's rules; the two callers differ only
 * in `play.chooseOpponent`, how the opponent's input is chosen. The same world and play always give the same answer.
 *
 * In order: each fighter, the player by `play.input` and the opponent (if there is one) by what `play.chooseOpponent` gives
 * (which also gives the brain it carries into the next step), plays their own part by the same rules (`prepareFighter`:
 * switch weapon, reload, walk, turn, judge the trigger). Then the bullets already flying move on, hurting any dummy or
 * fighter they reach, and then the triggers are let go, so a shot fired this step starts to move on the next one. A shot
 * spends a round and leaves with the damage and speed of the weapon in hand; a reload that finishes this step lets the
 * weapon fire in the same step. When either side is out of health the round is decided and, in a match, scored once (the
 * frozen world below never scores it again); after that the world is frozen and only the clock runs. A world with a ring
 * runs the ring's own clock on by `seconds` in each step that is fought, so it stops with the round, unlike
 * `elapsedSeconds`, and a fighter outside the ring, as it stands at the end of the step, loses health to it with any
 * bullet damage, before the round is decided; the practice dummies and the bullets in the air are not hurt by it. Last, a
 * fighter with health left who stands within reach of the pickup lying in the arena takes it (`takePickup`), and a frozen
 * world takes nothing. The world also carries what happened to the player in this step alone, including what a bullet and the
 * ring each took from their health (`eventsOfStep`), so a frozen world and the step after it carry none; the opponent's turn never
 * enters it.
 */
export function playStep(world: World, play: Play, seconds: number): World {
  if (world.round !== "playing") {
    return {...world, elapsedSeconds: world.elapsedSeconds + seconds, events: undefined};
  }

  const playerTurn = prepareFighter({arena: world.arena, fighter: world.player, input: play.input, seconds});
  const opponentDecision = play.chooseOpponent(world, seconds);
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
  const playerRingDamage = ringDamageTo(ring, playerShot.fighter, seconds);
  const player = hurt(playerShot.fighter, bulletFlight.playerDamage + playerRingDamage);
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
    events: eventsOfStep({
      playerTurn,
      damage: {health: playerShot.fighter.health, bullet: bulletFlight.playerDamage, ring: playerRingDamage},
    }),
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
