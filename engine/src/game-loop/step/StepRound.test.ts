import {startMatch} from "@gunsmith/engine/match/StartMatch";
import {PLAYER_HEALTH} from "@gunsmith/engine/health/PlayerHealth";
import {OPPONENT_HEALTH} from "@gunsmith/engine/health/OpponentHealth";
import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import {step} from "@gunsmith/engine/game-loop/Step";
import type {World} from "@gunsmith/engine/game-loop/types/World";
import {RIFLE} from "@gunsmith/engine/weapon/weapons/Rifle";
import {arena} from "@gunsmith/engine/game-loop/step/testing/Arena";
import {TICK} from "@gunsmith/engine/game-loop/step/testing/Tick";
import {IDLE} from "@gunsmith/engine/game-loop/step/testing/Idle";
import {EAST} from "@gunsmith/engine/game-loop/step/testing/East";
import {centred} from "@gunsmith/engine/game-loop/step/testing/Centred";
import {firingAt} from "@gunsmith/engine/game-loop/step/testing/FiringAt";
import {shoot} from "@gunsmith/engine/game-loop/step/testing/Shoot";
import {playTicks} from "@gunsmith/engine/game-loop/step/testing/PlayTicks";
import {sparring} from "@gunsmith/engine/game-loop/step/testing/Sparring";
import {opponentOf} from "@gunsmith/engine/game-loop/step/testing/OpponentOf";
import {shotAtPlayer} from "@gunsmith/engine/game-loop/step/testing/ShotAtPlayer";
import {sparringMatch} from "@gunsmith/engine/game-loop/step/testing/SparringMatch";

it("hurts the opponent the player shoots at, by the damage of the weapon", () => {
  const after = shoot(sparring(), 1, 30);

  expect(opponentOf(after).health).toBe(OPPONENT_HEALTH - RIFLE.bulletDamage);
});

it("does not hurt the opponent who is not in the line of fire", () => {
  const aside = startingWorld(arena, [], {x: 11.5, y: 7});

  expect(opponentOf(shoot(aside, 1, 30)).health).toBe(OPPONENT_HEALTH);
});

it("leaves the player unhurt by their own shots", () => {
  expect(shoot(sparring(), 60, 30).player.health).toBe(PLAYER_HEALTH);
});

it("stops the opponent's health at zero", () => {
  const dead = shoot(sparring(), 180, 0);

  expect(opponentOf(dead).health).toBe(0);
});

it("keeps the round playing while the opponent still has health", () => {
  expect(shoot(sparring(), 1, 30).round).toBe("playing");
});

it("wins the round when the opponent runs out of health", () => {
  expect(shoot(sparring(), 180, 0).round).toBe("won");
});

it("hurts the player an opponent's bullet reaches, by that bullet's damage", () => {
  const after = playTicks(shotAtPlayer(100), IDLE, 30);

  expect(after.player.health).toBe(100 - RIFLE.bulletDamage);
  expect(after.bullets).toEqual([]);
});

it("keeps the round playing while the player still has health", () => {
  expect(playTicks(shotAtPlayer(100), IDLE, 30).round).toBe("playing");
});

it("loses the round when the player runs out of health", () => {
  const after = playTicks(shotAtPlayer(RIFLE.bulletDamage), IDLE, 30);

  expect(after.player.health).toBe(0);
  expect(after.round).toBe("lost");
});

it("never ends a round with no opponent in it", () => {
  expect(shoot(centred(), 60, 60).round).toBe("playing");
});

it("freezes the world once the round is over, but lets the clock run", () => {
  const won = shoot(sparring(), 180, 0);
  const after = step(won, {...firingAt(EAST), direction: {x: 0, y: 1}, reload: true, switchTo: 2}, TICK);

  expect(after.player).toEqual(won.player);
  expect(after.bullets).toEqual(won.bullets);
  expect(after.opponent).toEqual(won.opponent);
  expect(after.round).toBe("won");
  expect(after.elapsedSeconds).toBeCloseTo(won.elapsedSeconds + TICK, 9);
});

it("gives the player a round win in the match when the opponent runs out of health", () => {
  expect(shoot(sparringMatch(), 180, 0).match).toEqual({playerWins: 1, opponentWins: 0, roundNumber: 1});
});

it("gives the opponent a round win in the match when the player runs out of health", () => {
  const after = playTicks({...shotAtPlayer(RIFLE.bulletDamage), match: startMatch()}, IDLE, 30);

  expect(after.match).toEqual({playerWins: 0, opponentWins: 1, roundNumber: 1});
});

it("leaves the score alone while the round is still being fought", () => {
  expect(shoot(sparringMatch(), 1, 30).match).toEqual(startMatch());
});

it("scores a round once, however long the finished world goes on being stepped", () => {
  const won = shoot(sparringMatch(), 180, 0);

  expect(playTicks(won, IDLE, 100).match).toEqual({playerWins: 1, opponentWins: 0, roundNumber: 1});
});

it("gives the opponent the round when both fall in the same step", () => {
  const world = shotAtPlayer(RIFLE.bulletDamage);
  const bothFalling: World = {
    ...world,
    opponent: {...opponentOf(world), health: RIFLE.bulletDamage},
    bullets: [
      ...world.bullets,
      {
        position: {x: 9.5, y: 4.5},
        direction: {x: 1, y: 0},
        damage: RIFLE.bulletDamage,
        speed: RIFLE.bulletSpeed,
        shooter: "player",
        level: 0,
        crouching: false,
      },
    ],
    match: startMatch(),
  };

  const after = playTicks(bothFalling, IDLE, 30);

  expect(after.player.health).toBe(0);
  expect(opponentOf(after).health).toBe(0);
  expect(after.match).toEqual({playerWins: 0, opponentWins: 1, roundNumber: 1});
});

it("has no match when it was not given one, whatever happens to the round", () => {
  expect(shoot(sparring(), 180, 0).match).toBeUndefined();
});

it("does not hurt anyone once the round is over, though bullets are still in the air", () => {
  const lost = playTicks(shotAtPlayer(RIFLE.bulletDamage), IDLE, 30);
  const another = {...lost, bullets: [{...shotAtPlayer(100).bullets[0], position: {x: 8.2, y: 4.5}}]} as World;
  const after = playTicks(another, IDLE, 30);

  expect(after.player.health).toBe(0);
  expect(after.bullets).toEqual(another.bullets);
});
