import type {RoomWants} from "@src/game/room-pre-round/types/RoomWants";
import {sameReadout} from "@src/store/room-pre-round/same-readout/SameReadout";
import type {RoomPreRoundStore} from "@src/store/room-pre-round/types/RoomPreRoundStore";
import {create} from "zustand";

const NOTHING_WANTED: RoomWants = {weapons: [undefined, undefined], arena: undefined, pick: undefined, start: false};

/** The room's pre-round: what the server last said of it and what the player has locked in. See `RoomPreRoundStore`. */
export const useRoomPreRoundStore = create<RoomPreRoundStore>()((set, get) => ({
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
