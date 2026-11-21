import {preRoundOfPage} from "@src/game/pre-round/PreRoundOfPage";
import type {PreRoundPhase} from "@src/store/pre-round/types/PreRoundPhase";
import type {PreRoundStore} from "@src/store/pre-round/types/PreRoundStore";
import {create} from "zustand";

/** The pre-round's store: the weapons and the arena being locked in before a match against the bot. It starts at the choosing when the page asked for the pre-round (`?preRound=1`) and with the match on otherwise. */
export const usePreRoundStore = create<PreRoundStore>()(set => ({
  phase: phaseOfPage(),
  picks: undefined,
  arena: undefined,
  lockIn: (picks, arena) => {
    set({phase: "revealed", picks, arena});
  },
  startMatch: () => {
    set({phase: "fighting"});
  },
  restart: () => {
    set({phase: phaseOfPage(), picks: undefined, arena: undefined});
  },
}));

function phaseOfPage(): PreRoundPhase {
  if (preRoundOfPage()) {
    return "choosing";
  }

  return "fighting";
}
