import type {RoomLimits} from "@src/dsl/gunsmith/components/room/types/RoomLimits";

/** The seed every spec's room starts its fighters from: in the duel arena the first player on the top row, the second on the bottom row, in sight of each other with a clear line. */
const START_SEED = 21;

/**
 * The page's address for the room `code` names. `limits` are shown on the address as the page passes them on to the room
 * (`?reconnectSeconds=`, `?idleSeconds=`); a limit left out is left off, so the room keeps its own. The time to choose
 * (`?preRoundSeconds=`) and the time the decided arena and weapons are shown (`?revealSeconds=`) are always shown and are **none** unless a spec is about them, so a room begins its match as the second player
 * sits, as it did before there was a pre-round. The start seed is always shown (`?startSeed=`), so no spec depends on a draw: the room's
 * real starts are random. The room offers every built-in arena (`?arenaRotation=off`) unless a spec is about the day's five, so a room
 * with no time to choose is on the Duel whatever the date, and spec runs never count towards the day's arenas. A spec about the ring shows its timing (`?ringDelay=`, `?ringClosing=`) and, when it needs one, its damage (`?ringDamage=`); one that is not meets the real ring,
 * which starts after 45 seconds.
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
  search.set("revealSeconds", String(limits.revealSeconds ?? 0));
  search.set("startSeed", String(limits.startSeed ?? START_SEED));
  if (!limits.daysArenas) {
    search.set("arenaRotation", "off");
  }
  if (limits.ringDelaySeconds !== undefined) {
    search.set("ringDelay", String(limits.ringDelaySeconds));
  }
  if (limits.ringClosingSeconds !== undefined) {
    search.set("ringClosing", String(limits.ringClosingSeconds));
  }
  if (limits.ringDamageScale !== undefined) {
    search.set("ringDamage", String(limits.ringDamageScale));
  }

  return `/?${search.toString()}`;
}
