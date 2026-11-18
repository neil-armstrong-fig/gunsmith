import type {RoomLimits} from "@src/dsl/gunsmith/components/room/types/RoomLimits";

/**
 * The page's address for the room `code` names. `limits` are shown on the address as the page passes them on to the room
 * (`?reconnectSeconds=`, `?idleSeconds=`); a limit left out is left off, so the room keeps its own.
 */
export function addressOfRoom(code: string, limits: RoomLimits = {}): string {
  const search = new URLSearchParams({room: code});
  if (limits.reconnectSeconds !== undefined) {
    search.set("reconnectSeconds", String(limits.reconnectSeconds));
  }
  if (limits.idleSeconds !== undefined) {
    search.set("idleSeconds", String(limits.idleSeconds));
  }

  return `/?${search.toString()}`;
}
