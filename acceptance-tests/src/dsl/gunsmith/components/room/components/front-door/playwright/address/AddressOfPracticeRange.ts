import {addressOfRoom} from "@src/dsl/gunsmith/components/room/playwright/address/AddressOfRoom";
import type {RoomLimits} from "@src/dsl/gunsmith/components/room/types/RoomLimits";

/**
 * The practice range's page with the room's limits on its address, as a room's own page would have them. The front door passes the page's own
 * query on to the room it makes or joins, so a room reached from here begins its match as the second player sits, with the seed and the
 * limits a spec asked for, exactly as `addressOfRoom` does for a spec that goes straight to a room.
 */
export function addressOfPracticeRange(limits: RoomLimits = {}): string {
  const search = new URLSearchParams(addressOfRoom("none", limits).split("?")[1]);
  search.delete("room");

  return `/?${search.toString()}`;
}
