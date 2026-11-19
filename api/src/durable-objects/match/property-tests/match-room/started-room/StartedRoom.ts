import {MatchRoom} from "@src/durable-objects/match/room/MatchRoom";

/** A room with both seats taken, so its match has begun. */
export function startedRoom(): MatchRoom {
  const room = new MatchRoom();
  room.join();
  room.join();

  return room;
}
