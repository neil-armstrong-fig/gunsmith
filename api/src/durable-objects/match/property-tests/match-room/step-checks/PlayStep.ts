import type {MatchRoom} from "@src/durable-objects/match/room/MatchRoom";
import type {Step} from "@src/durable-objects/match/property-tests/match-room/arbitraries/types/Step";
import {heldFor} from "@src/durable-objects/match/property-tests/match-room/step-checks/play-step/HeldFor";
import type {ReachedAcks} from "@src/durable-objects/match/property-tests/match-room/step-checks/types/ReachedAcks";

/** Plays one step on the room, and says where each seat's input count should stand after it, worked out here from the step alone. */
export function playStep(room: MatchRoom, step: Step, reached: ReachedAcks): ReachedAcks {
  if (step.kind === "tick") {
    room.tick(step.steps);

    return {first: heldFor(reached.first, step.steps), second: heldFor(reached.second, step.steps)};
  }

  room.setInput(step.seat, step.input, step.seq);
  const before = reached[step.seat];
  if (before && step.seq < before.seq) {
    return reached;
  }

  return {...reached, [step.seat]: {seq: step.seq, held: 0}};
}
