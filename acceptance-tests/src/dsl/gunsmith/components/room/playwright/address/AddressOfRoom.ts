import type {RoomLimits} from "@src/dsl/gunsmith/components/room/types/RoomLimits";

/** The seed every spec's room starts its fighters from: in the duel arena the first player on the top row, the second on the bottom row, in sight of each other with a clear line. */
const START_SEED = 21;

/**
 * The page's address for the room `code` names. `limits` are shown on the address as the page passes them on to the room
 * (`?reconnectSeconds=`, `?idleSeconds=`); a limit left out is left off, so the room keeps its own. The time to choose
 * (`?preRoundSeconds=`) is always shown and is **none** unless a spec is about choosing, so a room begins its match as the second player
 * sits, as it did before there was a pre-round. The start seed is always shown (`?startSeed=`), so no spec depends on a draw: the room's
 * real starts are random.
 */
export function addressOfRoom(code: string, limits: RoomLimits = {}): string {
  const search = new URLSearchParams({room: code});
  if (limits.reconnectSeconds !== undefined) {
    search.set("reconnectSeconds", String(limits.reconnectSeconds));
  }
  if (limits.idleSeconds !== undefined) {
    search.set("idleSeconds", String(limits.idleSeconds));
  }

  search.set("preRoundSeconds", String(limits.preRoundSeconds ?? 0));
  search.set("startSeed", String(START_SEED));

  return `/?${search.toString()}`;
}
