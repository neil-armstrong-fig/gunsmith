import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import {engine} from "@gunsmith/engine/Engine";
import {useAppStore} from "@src/store/app/UseAppStore";
import {gameState} from "@src/store/game/selectors/game-state/GameState";
import {useGameStore} from "@src/store/game/UseGameStore";
import {useArenaWorkshopStore} from "@src/store/workshop/arena/UseArenaWorkshopStore";

export function walkTheArena(arena: Arena): void {
  const tile = arena.solid.findIndex((solid, index) => !solid && arena.stairs[index] === undefined);
  if (tile === -1) return;

  const store = useArenaWorkshopStore.getState();
  const current = gameState();
  if (store.practiceWorld === undefined) {
    store.setPracticeWorld(current);
  }

  const world = engine.startingWorld(arena);
  const position = {x: (tile % arena.width) + 0.5, y: Math.floor(tile / arena.width) + 0.5};
  useGameStore.getState().setWorld({
    ...world,
    player: {...world.player, position, loadout: current.player.loadout, equippedIndex: current.player.equippedIndex},
  });
  useAppStore.getState().closeWorkshop();
}
