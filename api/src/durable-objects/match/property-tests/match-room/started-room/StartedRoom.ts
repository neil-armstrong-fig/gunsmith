import {MatchRoom} from "@src/durable-objects/match/room/MatchRoom";

/** The seed every room of a property run starts its fighters from, so two rooms given the same inputs start, and so play, alike. */
const SAME_START_SEED = 2;

/** A room with both seats taken, so its match has begun, the fighters on the same places in every room. */
export function startedRoom(): MatchRoom {
  const room = new MatchRoom(undefined, undefined, () => SAME_START_SEED);
  room.join();
  room.join();

  return room;
}
