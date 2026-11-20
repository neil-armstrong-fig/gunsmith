import {MatchRoom} from "@src/durable-objects/match/room/MatchRoom";

const SEED = 21;

/**
 * A room with both seats taken, so its match has begun. **The start is pinned** (`SEED`): each round's fair start is drawn from a random
 * seed, so two rooms made to be compared would otherwise begin the fighters in different places.
 */
export function startedRoom(): MatchRoom {
  const room = new MatchRoom({makeSeed: () => SEED, preRoundSeconds: 0});
  room.join();
  room.join();

  return room;
}
