import type {Step} from "@src/durable-objects/match/property-tests/match-room/arbitraries/types/Step";
import {SEATS} from "@src/durable-objects/match/property-tests/match-room/step-checks/Seats";
import {startedRoom} from "@src/durable-objects/match/property-tests/match-room/started-room/StartedRoom";
import {playStep} from "@src/durable-objects/match/property-tests/match-room/step-checks/PlayStep";

/** Every field a snapshot may carry. Anything else (a dummy, the opponent's brain) is the server's alone and must never be sent. */
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
  "events",
  "ack",
  "ready",
];

/** Every kind of event a seat may be told of itself, and the keys of the one that is about the other fighter: a sound heard says which way and roughly how loud, no more. */
const ALLOWED_EVENT_KINDS = ["fireRefused", "damageTaken", "hitLanded", "pickupTaken", "heard"];
const HEARD_EVENT_KEYS = ["kind", "loudness", "sector", "sound"];

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

    expectOnlyAllowedEvents(sent["events"]);
  }
}

function expectOnlyAllowedEvents(events: unknown): void {
  if (!Array.isArray(events)) {
    return;
  }

  for (const event of events as Record<string, unknown>[]) {
    expect(ALLOWED_EVENT_KINDS).toContain(event["kind"]);
    if (event["kind"] === "heard") {
      expect(Object.keys(event).sort()).toEqual(HEARD_EVENT_KEYS);
    }
  }
}
