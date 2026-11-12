import type {GameStateSnapshot} from "@gunsmith/shared/state-hook/types/GameStateSnapshot";

/** A question about how the game stands right now; `waitForGameState` asks it again until the answer is yes. */
export type GameStateCheck = (state: GameStateSnapshot) => boolean;
