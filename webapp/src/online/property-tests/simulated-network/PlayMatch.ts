import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import {stepFighters} from "@gunsmith/engine/game-loop/StepFighters";
import type {Input} from "@gunsmith/engine/game-loop/types/Input";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {viewOfSeat} from "@gunsmith/engine/seat/ViewOfSeat";
import type {InputAck} from "@gunsmith/shared/online/types/InputAck";
import {OnlineMatch} from "@src/online/OnlineMatch";
import {LoopbackSocket} from "@src/online/property-tests/simulated-network/LoopbackSocket";
import type {Delivery} from "@src/online/property-tests/simulated-network/types/Delivery";
import type {MatchOutcome} from "@src/online/property-tests/simulated-network/types/MatchOutcome";
import type {MatchPlan} from "@src/online/property-tests/simulated-network/types/MatchPlan";
import type {FrameToSend} from "@src/online/property-tests/simulated-network/types/FrameToSend";
import {TICK_SECONDS} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/clock/TickSeconds";

const OTHER_FIGHTER_AT = {x: 12.5, y: 5.5};

const IDLE: Input = {direction: {x: 0, y: 0}, firing: false, reload: false};

/**
 * Plays a whole match between a real `OnlineMatch` and a server modelled on the real one (`api/`'s `MatchRoom`), with the engine's own step
 * as the match and a network that holds every frame up by the plan's delays, in order. Each step: the browser plays its input and sends
 * what it sends; the frames due reach the server, which plays the input it last received and counts the steps played with it; the server
 * writes a snapshot on every `snapshotEvery`th step; the snapshots due reach the browser. Alongside it plays the same inputs with no
 * network at all (`ideal`), the answer a prediction should reach. The other fighter stands still and is not told of.
 */
export function playMatch(plan: MatchPlan): MatchOutcome {
  const arena = arenaFrom(plan.arenaRows);
  const socket = new LoopbackSocket();
  const match = new OnlineMatch(socket);
  socket.deliver(JSON.stringify({kind: "joined", seat: "first", arena: plan.arenaRows}));

  let server = startingWorld(arena, [], OTHER_FIGHTER_AT);
  let ideal = startingWorld(arena, [], OTHER_FIGHTER_AT);
  let asked = IDLE;
  let ack: InputAck | undefined;
  let framesSent = 0;
  let snapshotsSent = 0;
  const upstream: Delivery[] = [];
  const downstream: Delivery[] = [];
  const shown: Point[] = [];
  const idealPositions: Point[] = [];

  for (let step = 0; step < plan.inputs.length + plan.settleSteps; step += 1) {
    const input = plan.inputs[step] ?? IDLE;

    match.step(input);
    for (const text of socket.takeSent()) {
      enqueue(upstream, {text, sentAtStep: step, index: framesSent, delays: plan.upstreamDelays});
      framesSent += 1;
    }
    ideal = stepFighters(ideal, {first: input, second: IDLE}, TICK_SECONDS);

    for (const frame of due(upstream, step)) {
      const {seq, ...received} = JSON.parse(frame.text) as {seq: number} & Input;
      asked = received;
      ack = {seq, held: 0};
    }
    server = stepFighters(server, {first: asked, second: IDLE}, TICK_SECONDS);
    if (ack) {
      ack = {...ack, held: ack.held + 1};
    }

    if (step % plan.snapshotEvery === 0) {
      const snapshot = JSON.stringify({kind: "snapshot", ...viewOfSeat(server, "first"), ack});
      enqueue(downstream, {text: snapshot, sentAtStep: step, index: snapshotsSent, delays: plan.downstreamDelays});
      snapshotsSent += 1;
    }
    for (const frame of due(downstream, step)) {
      socket.deliver(frame.text);
    }

    const world = match.worldToShow(0);
    if (world) {
      shown.push(world.player.position);
      idealPositions.push(ideal.player.position);
    }
  }

  return {shown, ideal: idealPositions, serverFinal: server.player.position, framesSent};
}

function enqueue(line: Delivery[], frame: FrameToSend): void {
  const delay = frame.delays[Math.min(frame.index, frame.delays.length - 1)] ?? 0;
  const previous = line.at(-1)?.arrivesAtStep ?? 0;

  line.push({text: frame.text, arrivesAtStep: Math.max(frame.sentAtStep + delay, previous)});
}

/** The frames that arrive by `step`, taken off the line in the order they were sent. */
function due(line: Delivery[], step: number): Delivery[] {
  const arrived: Delivery[] = [];
  while (line[0] && line[0].arrivesAtStep <= step) {
    const next = line.shift();
    if (next) {
      arrived.push(next);
    }
  }

  return arrived;
}
