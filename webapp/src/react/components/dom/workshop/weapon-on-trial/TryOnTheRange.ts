import type {Weapon} from "@gunsmith/engine/weapon/types/Weapon";
import {returnToPractice} from "@src/react/components/dom/workshop/arena-on-trial/ReturnToPractice";
import {worldWithWeaponOnTrial} from "@src/react/components/dom/workshop/weapon-on-trial/trial-world/WorldWithWeaponOnTrial";
import {useAppStore} from "@src/store/app/UseAppStore";
import {gameState} from "@src/store/game/selectors/game-state/GameState";
import {useGameStore} from "@src/store/game/UseGameStore";

/** What Try it does, on the result card and on the shelf alike: the weapon goes in slot 2 and in hand on the practice range, and the workshop shuts so the player can shoot it. */
export function tryOnTheRange(weapon: Weapon): void {
  returnToPractice();
  useGameStore.getState().setWorld(worldWithWeaponOnTrial(gameState(), weapon));
  useAppStore.getState().closeWorkshop();
}
