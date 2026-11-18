import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import type {Input} from "@gunsmith/engine/game-loop/types/Input";
import {PLAYER_SPEED} from "@gunsmith/engine/player/walking/PlayerSpeed";
import {replayInputs} from "@src/online/prediction/replay/ReplayInputs";

const ARENA = arenaFrom(["########", "#......#", "#......#", "#......#", "#......#", "########"]);
const PLAYER = startingWorld(ARENA).player;
const IDLE: Input = {direction: {x: 0, y: 0}, firing: false, reload: false};
const STEP_SECONDS = 1 / 60;

function times(count: number, input: Input): Input[] {
  return Array.from({length: count}, () => input);
}

it("leaves the player where they are when no input is replayed", () => {
  expect(replayInputs({arena: ARENA, player: PLAYER, inputs: []})).toEqual(PLAYER);
});

it("walks the player as the engine would, one step per input", () => {
  const walking = replayInputs({arena: ARENA, player: PLAYER, inputs: times(6, {...IDLE, direction: {x: 0, y: 1}})});

  expect(walking.position.y - PLAYER.position.y).toBeCloseTo(6 * STEP_SECONDS * PLAYER_SPEED, 6);
  expect(walking.position.x).toBe(PLAYER.position.x);
});

it("stops a player at a wall, as the engine does", () => {
  const walking = replayInputs({arena: ARENA, player: PLAYER, inputs: times(600, {...IDLE, direction: {x: 0, y: 1}})});

  expect(walking.position.y).toBeLessThan(5);
});

it("turns the player to face what they aim at and crouches them when they ask", () => {
  const turned = replayInputs({
    arena: ARENA,
    player: PLAYER,
    inputs: [{...IDLE, aimAt: {x: PLAYER.position.x, y: PLAYER.position.y + 2}, crouching: true}],
  });

  expect(turned.aim).toEqual({x: 0, y: 1});
  expect(turned.crouching).toBe(true);
});

it("does not predict what the server alone decides: a shot, a reload or a weapon switch changes nothing but the walk", () => {
  const asked = replayInputs({
    arena: ARENA,
    player: PLAYER,
    inputs: [{...IDLE, firing: true, reload: true, switchTo: 2}],
  });

  expect(asked.loadout).toEqual(PLAYER.loadout);
  expect(asked.equippedIndex).toBe(PLAYER.equippedIndex);
  expect(asked.cooldownSeconds).toBe(PLAYER.cooldownSeconds);
  expect(asked.health).toBe(PLAYER.health);
});
