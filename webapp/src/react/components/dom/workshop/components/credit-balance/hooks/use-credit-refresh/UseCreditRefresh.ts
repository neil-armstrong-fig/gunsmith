import {accountUrl} from "@src/account/AccountUrl";
import {useAccountLibraryStore} from "@src/store/account-library/UseAccountLibraryStore";
import {useCreditsStore} from "@src/store/credits/UseCreditsStore";
import {useArenaWorkshopStore} from "@src/store/workshop/arena/UseArenaWorkshopStore";
import {useWorkshopStore} from "@src/store/workshop/UseWorkshopStore";
import {useEffect} from "react";

/** Reads a signed-in player's credits when the workshop opens and again each time a weapon or an arena Make ends, whatever it cost. */
export function useCreditRefresh(): void {
  const signedIn = useAccountLibraryStore(state => state.session === "signed-in");
  const makingWeapon = useWorkshopStore(state => state.making);
  const makingArena = useArenaWorkshopStore(state => state.making);

  useEffect(() => {
    if (signedIn && !makingWeapon && !makingArena) {
      void useCreditsStore.getState().load(accountUrl("/api/credits"));
    }
  }, [signedIn, makingWeapon, makingArena]);
}
