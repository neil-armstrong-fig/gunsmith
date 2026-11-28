import type {OnlinePreRoundWants} from "@src/game/online-pre-round/types/OnlinePreRoundWants";
import {sameReadout} from "@src/store/online-pre-round/same-readout/SameReadout";
import type {OnlinePreRoundStore} from "@src/store/online-pre-round/types/OnlinePreRoundStore";
import {create} from "zustand";

const NOTHING_WANTED: OnlinePreRoundWants = {
  weapons: [undefined, undefined],
  arena: undefined,
  pick: undefined,
  start: false,
};

/** The room's pre-round: what the server last said of it and what the player has locked in. See `OnlinePreRoundStore`. */
export const useOnlinePreRoundStore = create<OnlinePreRoundStore>()((set, get) => ({
  readout: undefined,
  wants: NOTHING_WANTED,
  setReadout: readout => {
    if (sameReadout(get().readout, readout)) {
      return;
    }

    if (!readout) {
      set({readout: undefined, wants: NOTHING_WANTED});

      return;
    }

    set({readout});
  },
  wantWeapon: (slot, weapon) => {
    const [first, second] = get().wants.weapons;
    if (slot === 1) {
      set({wants: {...get().wants, weapons: [weapon, second]}});

      return;
    }

    set({wants: {...get().wants, weapons: [first, weapon]}});
  },
  wantArena: arena => {
    set({wants: {...get().wants, arena}});
  },
  wantPick: pick => {
    set({wants: {...get().wants, pick}});
  },
  wantToStart: () => {
    set({wants: {...get().wants, start: true}});
  },
}));
