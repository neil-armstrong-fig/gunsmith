import type {Step} from "@src/match/property-tests/match-room/arbitraries/types/Step";
import {SEATS} from "@src/match/property-tests/match-room/step-checks/Seats";
import {startedRoom} from "@src/match/property-tests/match-room/started-room/StartedRoom";
import {playStep} from "@src/match/property-tests/match-room/step-checks/PlayStep";

/** Every field a snapshot may carry. Anything else (a dummy, the opponent's brain, the combat events) is the server's alone and must never be sent. */
const ALLOWED_SNAPSHOT_FIELDS = [
  "kind",
  "player",
  "opponent",
  "bullets",
  "pickup",
  "ring",
  "match",
  "round",
  "elapsedSeconds",
  "ack",
  "ready",
];

/** Whatever `plan` asks and plays, what each seat is sent carries only the fields it may know. */
export function expectOnlyAllowedFields(plan: Step[]): void {
  const room = startedRoom();
  for (const step of plan) {
    playStep(room, step, {first: undefined, second: undefined});
  }

  for (const seat of SEATS) {
    const sent = JSON.parse(JSON.stringify(room.snapshotFor(seat))) as Record<string, unknown>;

    for (const field of Object.keys(sent)) {
      expect(ALLOWED_SNAPSHOT_FIELDS).toContain(field);
    }
  }
}
