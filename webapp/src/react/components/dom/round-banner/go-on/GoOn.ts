import type {World} from "@gunsmith/engine/game-loop/types/World";
import {roomOfPage} from "@src/online/RoomOfPage";
import {useAppStore} from "@src/store/app/UseAppStore";
import {useGameStore} from "@src/store/game/UseGameStore";

/**
 * What "Next round" and "Play again" do. In a local game the player puts the world `startAgain` makes in the game store. In an online room
 * the server plays the match, so the player only asks to go on (the loop sends it) and the next round begins when the other player has asked too.
 */
export function goOn(startAgain: () => World): void {
  if (roomOfPage() !== undefined) {
    useAppStore.getState().askForNextRound();

    return;
  }

  useGameStore.getState().setWorld(startAgain());
}
