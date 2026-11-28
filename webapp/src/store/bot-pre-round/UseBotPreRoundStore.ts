import {botPreRoundOfPage} from "@src/game/bot-pre-round/BotPreRoundOfPage";
import type {BotPreRoundPhase} from "@src/store/bot-pre-round/types/BotPreRoundPhase";
import type {BotPreRoundStore} from "@src/store/bot-pre-round/types/BotPreRoundStore";
import {create} from "zustand";

/** The pre-round's store: the weapons and the arena being locked in before a match against the bot. It starts at the choosing when the page asked for the pre-round (`?preRound=1`) and with the match on otherwise. */
export const useBotPreRoundStore = create<BotPreRoundStore>()(set => ({
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

function phaseOfPage(): BotPreRoundPhase {
  if (botPreRoundOfPage()) {
    return "choosing";
  }

  return "fighting";
}
