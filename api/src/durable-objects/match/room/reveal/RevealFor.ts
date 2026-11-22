import type {Seat} from "@gunsmith/engine/seat/types/Seat";
import type {ChosenWeapon} from "@src/durable-objects/match/pre-round/types/ChosenWeapon";
import type {ChosenWeapons} from "@src/durable-objects/match/pre-round/types/ChosenWeapons";
import type {RevealedWeapon} from "@src/durable-objects/match/room/types/RevealedWeapon";
import type {RevealMessage} from "@src/durable-objects/match/room/types/RevealMessage";

const OTHER_SEAT: Record<Seat, Seat> = {first: "second", second: "first"};

/** The reveal `seat` is told: what each seat carries, with every saved weapon's numbers and drawing and no id. */
export function revealFor(seat: Seat, chosen: Record<Seat, ChosenWeapons>): RevealMessage {
  return {kind: "reveal", weapons: {own: revealedPair(chosen[seat]), opponent: revealedPair(chosen[OTHER_SEAT[seat]])}};
}

function revealedPair(pair: ChosenWeapons): readonly [RevealedWeapon, RevealedWeapon] {
  return [revealed(pair[0]), revealed(pair[1])];
}

function revealed(choice: ChosenWeapon): RevealedWeapon {
  if (choice.kind === "builtIn") {
    return {kind: "builtIn", key: choice.key};
  }

  return {kind: "saved", weapon: choice.weapon, appearance: choice.appearance};
}
