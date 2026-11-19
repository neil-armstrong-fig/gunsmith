import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import {stepFighters} from "@gunsmith/engine/game-loop/StepFighters";
import type {FighterInputs} from "@gunsmith/engine/game-loop/types/FighterInputs";
import type {Input} from "@gunsmith/engine/game-loop/types/Input";
import type {World} from "@gunsmith/engine/game-loop/types/World";
import {IDLE} from "@gunsmith/engine/game-loop/step/testing/Idle";
import {opponentOf} from "@gunsmith/engine/game-loop/step/testing/OpponentOf";
import {TICK} from "@gunsmith/engine/game-loop/step/testing/Tick";
import {OPPONENT_HEALTH} from "@gunsmith/engine/health/OpponentHealth";
import {PLAYER_HEALTH} from "@gunsmith/engine/health/PlayerHealth";

// Low ground, three rows (centres 1.5, 2.5, 3.5): the middle row has a cover block at x 6, the others are open. The player
// is the first fighter and the opponent the second, each held still and aiming at the other, one of them firing.
const arena = arenaFrom(["#############", "#...........#", "#.....c.....#", "#...........#", "#############"]);
const BEHIND_THE_BLOCK_ROW = 2.5;
const OPEN_ROW = 3.5;
const HALF_A_SECOND_OF_TICKS = 30;
const STANDING = false;
const CROUCHED = true;

describe("when the player shoots", () => {
  // The player fires from the west side of the block at the opponent just east of it.
  const PLAYER_SHOOTS: Shooting = {firstAt: 3.5, secondAt: 7.5, shooter: "first"};

  it("passes a standing player's shot over a crouched opponent with a cover block right beside them", () => {
    const after = fight({...PLAYER_SHOOTS, row: BEHIND_THE_BLOCK_ROW, firingStance: STANDING, targetStance: CROUCHED});

    expect(opponentOf(after).health).toBe(OPPONENT_HEALTH);
  });

  it("hurts a standing opponent with a cover block beside them, and a crouched one in the open", () => {
    const standing = fight({
      ...PLAYER_SHOOTS,
      row: BEHIND_THE_BLOCK_ROW,
      firingStance: STANDING,
      targetStance: STANDING,
    });
    const inTheOpen = fight({...PLAYER_SHOOTS, row: OPEN_ROW, firingStance: STANDING, targetStance: CROUCHED});

    expect(opponentOf(standing).health).toBeLessThan(OPPONENT_HEALTH);
    expect(opponentOf(inTheOpen).health).toBeLessThan(OPPONENT_HEALTH);
  });

  it("stops a crouched player's shot at the block before a standing opponent behind it", () => {
    const after = fight({...PLAYER_SHOOTS, row: BEHIND_THE_BLOCK_ROW, firingStance: CROUCHED, targetStance: STANDING});

    expect(opponentOf(after).health).toBe(OPPONENT_HEALTH);
  });
});

describe("when the opponent shoots", () => {
  // The opponent fires from the east side of the block at the player just west of it.
  const OPPONENT_SHOOTS: Shooting = {firstAt: 5.5, secondAt: 9.5, shooter: "second"};

  it("passes the opponent's shot over a crouched player with a cover block right beside them", () => {
    const after = fight({
      ...OPPONENT_SHOOTS,
      row: BEHIND_THE_BLOCK_ROW,
      firingStance: STANDING,
      targetStance: CROUCHED,
    });

    expect(after.player.health).toBe(PLAYER_HEALTH);
  });

  it("hurts a standing player with a cover block beside them, and a crouched one in the open", () => {
    const standing = fight({
      ...OPPONENT_SHOOTS,
      row: BEHIND_THE_BLOCK_ROW,
      firingStance: STANDING,
      targetStance: STANDING,
    });
    const inTheOpen = fight({...OPPONENT_SHOOTS, row: OPEN_ROW, firingStance: STANDING, targetStance: CROUCHED});

    expect(standing.player.health).toBeLessThan(PLAYER_HEALTH);
    expect(inTheOpen.player.health).toBeLessThan(PLAYER_HEALTH);
  });

  it("stops the opponent's crouched shot at the block before a standing player behind it", () => {
    const after = fight({
      ...OPPONENT_SHOOTS,
      row: BEHIND_THE_BLOCK_ROW,
      firingStance: CROUCHED,
      targetStance: STANDING,
    });

    expect(after.player.health).toBe(PLAYER_HEALTH);
  });
});

interface Shooting {
  /** Where the first fighter (the player) stands along the row. */
  firstAt: number;
  /** Where the second fighter (the opponent) stands along the row. */
  secondAt: number;
  /** Which of them fires; the other holds still, aiming back. */
  shooter: "first" | "second";
}

interface Fight extends Shooting {
  row: number;
  /** Whether the one firing crouches. */
  firingStance: boolean;
  /** Whether the one fired at crouches. */
  targetStance: boolean;
}
function fight(request: Fight): World {
  const {row, firstAt, secondAt, shooter, firingStance, targetStance} = request;
  const world = startingWorld(arena, [], {x: secondAt, y: row});
  const placed: World = {...world, player: {...world.player, position: {x: firstAt, y: row}}};
  const firing: Input = {...IDLE, firing: true, crouching: firingStance};
  const waiting: Input = {...IDLE, crouching: targetStance};
  const aimedAtSecond = {...firing, aimAt: {x: secondAt, y: row}};
  const aimedAtFirst = {...firing, aimAt: {x: firstAt, y: row}};
  const inputs: FighterInputs = {first: waiting, second: aimedAtFirst};
  if (shooter === "first") {
    inputs.first = aimedAtSecond;
    inputs.second = waiting;
  }

  let later = placed;
  for (let tick = 0; tick < HALF_A_SECOND_OF_TICKS; tick += 1) {
    later = stepFighters(later, inputs, TICK);
  }

  return later;
}
