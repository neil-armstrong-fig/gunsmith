import {advanceBullets} from "@gunsmith/engine/bullet/AdvanceBullets";
import type {Bullet} from "@gunsmith/engine/bullet/types/Bullet";
import {eventsOfStep} from "@gunsmith/engine/combat-events/EventsOfStep";
import {prepareFighter} from "@gunsmith/engine/game-loop/fighter/PrepareFighter";
import {shootFighter} from "@gunsmith/engine/game-loop/fighter/ShootFighter";
import type {Play} from "@gunsmith/engine/game-loop/types/Play";
import type {World} from "@gunsmith/engine/game-loop/types/World";
import {visibleHitsOf} from "@gunsmith/engine/game-loop/visible-hits/VisibleHitsOf";
import {takeDamage} from "@gunsmith/engine/health/TakeDamage";
import {scoreRound} from "@gunsmith/engine/match/ScoreRound";
import {mirrorSeats} from "@gunsmith/engine/seat/mirroring/MirrorSeats";
import type {NoiseRequest} from "@gunsmith/engine/game-loop/fighter/types/NoiseRequest";
import {heardInStep} from "@gunsmith/engine/sound/HeardInStep";
import {footstepOf} from "@gunsmith/engine/sound/footsteps/FootstepOf";
import type {NoiseOfFighter} from "@gunsmith/engine/sound/types/NoiseOfFighter";
import {rememberShot} from "@gunsmith/engine/opponent/RememberShot";
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
 * world takes nothing. A bullet of the player's that hurt the opponent leaves its brain the place the player stood
 * (`rememberShot`), so a shooter it cannot see is searched for next step; the ring never does. The world also carries what happened to the player in this step alone, including what a bullet and the
 * ring each took from their health and visible hits (`eventsOfStep`, `visibleHitsOf`), so a frozen world and the step after it carry none; the opponent's turn never
 * enters it.
 */
export function playStep(world: World, play: Play, seconds: number): World {
  if (world.round !== "playing") {
    return {...world, elapsedSeconds: world.elapsedSeconds + seconds, events: undefined, opponentEvents: undefined};
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
    playerCrouching: playerTurn.fighter.crouching,
    opponentCrouching: opponentTurn?.fighter.crouching,
    seconds,
  });

  const visibleHits = visibleHitsOf(
    {...world, player: playerTurn.fighter, opponent: opponentTurn?.fighter},
    bulletFlight.playerHits,
  );

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
  const opponentRingDamage = opponentShot ? ringDamageTo(ring, opponentShot.fighter, seconds) : 0;
  const opponent = opponentShot && hurt(opponentShot.fighter, bulletFlight.opponentDamage + opponentRingDamage);

  const round = decideRound({playerHealth: player.health, opponentHealth: opponent?.health});
  const taking = takePickup(world.pickup, {player, opponent});
  const footstep = footstepOf({
    before: world.player.position,
    after: playerTurn.fighter.position,
    crouching: playerTurn.fighter.crouching,
    previous: world.footstep,
    seconds,
  });
  const opponentFootstep =
    world.opponent &&
    opponentTurn &&
    footstepOf({
      before: world.opponent.position,
      after: opponentTurn.fighter.position,
      crouching: opponentTurn.fighter.crouching,
      previous: world.opponentFootstep,
      seconds,
    });

  const playerNoise = noiseOf({
    shot: playerShot,
    footfall: footstep?.landed === true,
    tookPickupAt: taking.playerTookPickup ? world.pickup?.position : undefined,
  });
  const opponentNoise =
    opponentShot &&
    noiseOf({
      shot: opponentShot,
      footfall: opponentFootstep?.landed === true,
      tookPickupAt: taking.opponentTookPickup ? world.pickup?.position : undefined,
    });

  return {
    ...world,
    player: taking.player,
    opponent: taking.opponent,
    pickup: taking.pickup,
    opponentBrain: rememberShot(opponentDecision.brain, {
      bulletDamage: bulletFlight.opponentDamage,
      from: playerTurn.fighter.position,
    }),
    bullets,
    dummies: bulletFlight.dummies,
    elapsedSeconds: world.elapsedSeconds + seconds,
    round,
    match: world.match && scoreRound(world.match, round),
    ring,
    footstep,
    opponentFootstep,
    events: eventsOfStep({
      playerTurn,
      damage: {health: playerShot.fighter.health, bullet: bulletFlight.playerDamage, ring: playerRingDamage},
      visibleHits,
      playerTookPickup: taking.playerTookPickup,
      footfall: playerNoise.footfall,
      heard: opponentNoise ? heardInStep(playerShot.fighter.position, opponentNoise) : [],
    }),
    opponentEvents:
      opponentTurn &&
      opponentShot &&
      eventsOfStep({
        playerTurn: opponentTurn,
        damage: {health: opponentShot.fighter.health, bullet: bulletFlight.opponentDamage, ring: opponentRingDamage},
        visibleHits: visibleHitsOf(
          mirrorSeats({...world, player: playerTurn.fighter, opponent: opponentTurn.fighter}),
          bulletFlight.opponentHits,
        ),
        playerTookPickup: taking.opponentTookPickup,
        footfall: opponentFootstep?.landed === true,
        heard: heardInStep(opponentShot.fighter.position, playerNoise),
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

/** What a fighter's step made that the other fighter may hear: a shot that left the weapon, a foot coming down, a weapon taken. */
function noiseOf({shot, footfall, tookPickupAt}: NoiseRequest): NoiseOfFighter {
  return {position: shot.fighter.position, shot: shot.bullet !== undefined, footfall, tookPickupAt};
}
