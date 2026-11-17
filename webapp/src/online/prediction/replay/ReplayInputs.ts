import type {World} from "@gunsmith/engine/game-loop/types/World";
import {stepFighters} from "@gunsmith/engine/game-loop/StepFighters";
import type {Input} from "@gunsmith/engine/game-loop/types/Input";
import type {Player} from "@gunsmith/engine/player/types/Player";
import {TICK_SECONDS} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/clock/TickSeconds";
import type {ReplayRequest} from "@src/online/prediction/replay/types/ReplayRequest";

const STILL: Input = {direction: {x: 0, y: 0}, firing: false, reload: false};

/**
 * Where the fighter stands, faces and crouches after `inputs` are played on them, one engine step each, by the same walls, speed caps and
 * turning as the server plays them. Only that is predicted: the shot, the reload and the weapon switch are the server's to decide, so the
 * loadout, cooldown and health come back as given. There is no one else in the arena: the other fighter is drawn from what the server sent,
 * never stepped here.
 */
export function replayInputs(request: ReplayRequest): Player {
  const {arena, player, inputs} = request;
  let world: World = {arena, player, bullets: [], dummies: [], elapsedSeconds: 0, round: "playing"};

  for (const input of inputs) {
    world = stepFighters(world, {first: input, second: STILL}, TICK_SECONDS);
  }

  return {...player, position: world.player.position, aim: world.player.aim, crouching: world.player.crouching};
}
