import type {Coming} from "@src/durable-objects/match/property-tests/match-room/arbitraries/types/Coming";
import type {SeatedPeople} from "@src/durable-objects/match/property-tests/match-room/score-checks/types/SeatedPeople";

const STEPS_PER_SECOND = 60;

/** Has `coming` happen to the room: a seat's person leaves, returns, asks to go on or asks for something, or `seconds` of game time pass. `seq` numbers an ask. */
export function makeComingHappen({room, tokens}: SeatedPeople, coming: Coming, seq: number): void {
  if (coming.kind === "leave") {
    room.leave(coming.seat);
  }
  if (coming.kind === "return") {
    room.reconnect(tokens[coming.seat]);
  }
  if (coming.kind === "ready") {
    room.ready(coming.seat);
  }
  if (coming.kind === "ask") {
    room.setInput(coming.seat, {direction: {x: coming.walking ? 1 : 0, y: 0}, firing: false, reload: false}, seq);
  }
  if (coming.kind === "wait") {
    room.tick(coming.seconds * STEPS_PER_SECOND);
  }
}
