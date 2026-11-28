import type {WantedPick} from "@src/game/online-pre-round/types/WantedPick";
import type {SeatPick} from "@src/online/types/pre-round/SeatPick";

/** What the server calls a pick the player wants: their own arena or the other's is named by the seat that put it forward. Nothing for an arena pick while the browser does not yet know its seat. */
export function seatPickOf(pick: WantedPick, seat: "first" | "second" | undefined): SeatPick | undefined {
  if (pick === "random" || pick === "nothing") {
    return {kind: pick};
  }

  if (!seat) {
    return undefined;
  }

  if (pick === "mine") {
    return {kind: "arena", seat};
  }

  return {kind: "arena", seat: seat === "first" ? "second" : "first"};
}
