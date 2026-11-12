import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import {PRACTICE_ARENA} from "@src/game/practice/PracticeArena";
import {PRACTICE_DUMMIES} from "@src/game/practice/PracticeDummies";
import type {GameStore} from "@src/store/game/types/GameStore";
import {create} from "zustand";

/**
 * The game store: the engine's `World` and nothing else (`GameStore` says why). The loop writes it once per frame; the
 * canvas reads it inside `useFrame` through `gameState`, which causes no render, and React components read slow
 * values worked out from it through a selector such as `selectAmmoReadout`. It starts as the practice match.
 */
export const useGameStore = create<GameStore>()(set => ({
  world: startingWorld(PRACTICE_ARENA, PRACTICE_DUMMIES),
  setWorld: world => {
    set({world});
  },
}));
