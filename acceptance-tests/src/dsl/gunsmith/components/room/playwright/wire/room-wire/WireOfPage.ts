import type {Page} from "@playwright/test";
import {RoomWire} from "@src/dsl/gunsmith/components/room/playwright/wire/room-wire/RoomWire";

/** Each page's one wire, made the first time any part of the room asks for it and let go with the page. */
const WIRES = new WeakMap<Page, RoomWire>();

/**
 * The wire of `page`: the same one for every `*Playwright` of the room built on that page, so what `room.connection` routes,
 * `room.frames` and `room.smoothness` read. A `*Dsl` may only pass its `Page` on, so this is how the room's members share it.
 */
export function wireOfPage(page: Page): RoomWire {
  const known = WIRES.get(page);
  if (known) {
    return known;
  }

  const roomWire = new RoomWire(page);
  WIRES.set(page, roomWire);

  return roomWire;
}
