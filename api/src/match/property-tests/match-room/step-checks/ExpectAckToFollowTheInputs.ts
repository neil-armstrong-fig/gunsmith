import type {Step} from "@src/match/property-tests/match-room/arbitraries/types/Step";
import {SEATS} from "@src/match/property-tests/match-room/step-checks/Seats";
import {startedRoom} from "@src/match/property-tests/match-room/started-room/StartedRoom";
import {playStep} from "@src/match/property-tests/match-room/step-checks/PlayStep";
import type {ReachedAcks} from "@src/match/property-tests/match-room/step-checks/types/ReachedAcks";

/** After every step of `plan`, each seat is told the newest input it has sent and how many steps have been played with it. */
export function expectAckToFollowTheInputs(plan: Step[]): void {
  const room = startedRoom();
  let reached: ReachedAcks = {first: undefined, second: undefined};

  for (const step of plan) {
    reached = playStep(room, step, reached);

    for (const seat of SEATS) {
      expect(room.snapshotFor(seat)?.ack).toEqual(reached[seat]);
    }
  }
}
