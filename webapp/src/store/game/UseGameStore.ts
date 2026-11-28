import {worldOfPage} from "@src/game/scenario/round/WorldOfPage";
import type {GameStore} from "@src/store/game/types/GameStore";
import {create} from "zustand";

/**
 * The game store: the engine's `World` and nothing else (`GameStore` says why). The loop writes it once per frame; the
 * canvas reads it inside `useFrame` through `gameState`, which causes no render, and React components read slow
 * values worked out from it through a selector such as `selectAmmoReadout`. It starts as the match the page asks for
 * (`?scenario=duel`), the practice range otherwise.
 */
export const useGameStore = create<GameStore>()(set => ({
  world: worldOfPage(),
  setWorld: world => {
    set({world});
  },
}));
